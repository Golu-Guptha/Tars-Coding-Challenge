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

export const remove = mutation({
    args: { messageId: v.id("messages") },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Not authenticated");

        const currentUser = await ctx.db
            .query("users")
            .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
            .unique();
        if (!currentUser) throw new Error("User not found");

        const message = await ctx.db.get(args.messageId);
        if (!message) throw new Error("Message not found");

        // Only the sender can delete their own message
        if (message.senderId !== currentUser._id) {
            throw new Error("You can only delete your own messages");
        }

        await ctx.db.patch(args.messageId, {
            deleted: true,
            body: "",
        });
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

                // Get reactions for this message
                const reactions = await ctx.db
                    .query("reactions")
                    .withIndex("by_message", (q) => q.eq("messageId", message._id))
                    .collect();

                // Group reactions by emoji as array (emojis can't be Convex field names)
                const emojiMap = new Map<string, string[]>();
                for (const r of reactions) {
                    const existing = emojiMap.get(r.emoji) ?? [];
                    existing.push(r.userId);
                    emojiMap.set(r.emoji, existing);
                }
                const reactionList = Array.from(emojiMap.entries()).map(
                    ([emoji, userIds]) => ({ emoji, count: userIds.length, userIds })
                );

                return {
                    ...message,
                    sender,
                    reactions: reactionList,
                };
            })
        );
    },
});
