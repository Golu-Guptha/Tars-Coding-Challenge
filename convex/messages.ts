import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const send = mutation({
    args: {
        conversationId: v.id("conversations"),
        body: v.string(),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Not authenticated");

        const currentUser = await ctx.db
            .query("users")
            .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
            .unique();
        if (!currentUser) throw new Error("User not found");

        // Verify user is a member of this conversation
        const membership = await ctx.db
            .query("conversationMembers")
            .withIndex("by_conv_user", (q) =>
                q
                    .eq("conversationId", args.conversationId)
                    .eq("userId", currentUser._id)
            )
            .unique();
        if (!membership) throw new Error("Not a member of this conversation");

        const messageId = await ctx.db.insert("messages", {
            conversationId: args.conversationId,
            senderId: currentUser._id,
            body: args.body,
            deleted: false,
        });

        // Update conversation with last message info
        await ctx.db.patch(args.conversationId, {
            lastMessageId: messageId,
            lastMessageTime: Date.now(),
        });

        // Clear typing indicator
        const typingRecord = await ctx.db
            .query("typing")
            .withIndex("by_conv_user", (q) =>
                q
                    .eq("conversationId", args.conversationId)
                    .eq("userId", currentUser._id)
            )
            .unique();
        if (typingRecord) {
            await ctx.db.patch(typingRecord._id, {
                isTyping: false,
                updatedAt: Date.now(),
            });
        }

        return messageId;
    },
});

export const list = query({
    args: { conversationId: v.id("conversations") },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) return [];

        const messages = await ctx.db
            .query("messages")
            .withIndex("by_conversation", (q) =>
                q.eq("conversationId", args.conversationId)
            )
            .collect();

        return await Promise.all(
            messages.map(async (message) => {
                const sender = await ctx.db.get(message.senderId);
                return {
                    ...message,
                    sender,
                };
            })
        );
    },
});
