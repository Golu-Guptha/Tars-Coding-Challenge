import { mutation } from "./_generated/server";
import { v } from "convex/values";

export const toggle = mutation({
    args: {
        messageId: v.id("messages"),
        emoji: v.string(),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Not authenticated");

        const currentUser = await ctx.db
            .query("users")
            .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
            .unique();
        if (!currentUser) throw new Error("User not found");

        // Check if reaction already exists
        const existing = await ctx.db
            .query("reactions")
            .withIndex("by_msg_user_emoji", (q) =>
                q
                    .eq("messageId", args.messageId)
                    .eq("userId", currentUser._id)
                    .eq("emoji", args.emoji)
            )
            .unique();

        if (existing) {
            // Remove reaction (toggle off)
            await ctx.db.delete(existing._id);
        } else {
            // Add reaction (toggle on)
            await ctx.db.insert("reactions", {
                messageId: args.messageId,
                userId: currentUser._id,
                emoji: args.emoji,
            });
        }
    },
});
