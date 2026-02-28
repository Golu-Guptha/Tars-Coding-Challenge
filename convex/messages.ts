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

        const currentUser = await ctx.db
            .query("users")
            .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
            .unique();
        if (!currentUser) return [];

        // Get other members' lastReadTime for read receipts
        const members = await ctx.db
            .query("conversationMembers")
            .withIndex("by_conversation", (q) => q.eq("conversationId", args.conversationId))
            .collect();
        const otherMembers = members.filter((m) => m.userId !== currentUser._id);
        const otherReadTimes = otherMembers
            .map((m) => m.lastReadTime ?? 0)
            .filter((t) => t > 0);

        const presences = await ctx.db.query("presence").collect();

        const messages = await ctx.db
            .query("messages")
            .withIndex("by_conversation", (q) =>
                q.eq("conversationId", args.conversationId)
            )
            .collect();

        return await Promise.all(
            messages.map(async (message) => {
                const sender = await ctx.db.get(message.senderId);

                const reactions = await ctx.db
                    .query("reactions")
                    .withIndex("by_message", (q) => q.eq("messageId", message._id))
                    .collect();

                const emojiMap = new Map<string, string[]>();
                for (const r of reactions) {
                    const existing = emojiMap.get(r.emoji) ?? [];
                    existing.push(r.userId);
                    emojiMap.set(r.emoji, existing);
                }
                const reactionList = Array.from(emojiMap.entries()).map(
                    ([emoji, userIds]) => ({ emoji, count: userIds.length, userIds })
                );

                // Read status: blue tick only when ALL other members have read
                const isOwnMessage = message.senderId === currentUser._id;
                let status: "sent" | "delivered" | "read" = "sent";
                if (isOwnMessage && otherMembers.length > 0) {
                    // ALL other members must have read for blue tick
                    const allRead = otherMembers.every((m) => {
                        const readTime = m.lastReadTime ?? 0;
                        return readTime >= message._creationTime;
                    });
                    if (allRead) {
                        status = "read";
                    } else {
                        // Delivered if ANY member has been online since message was sent
                        const anyoneDelivered = otherMembers.some((m) => {
                            const p = presences.find((presence) => presence.userId === m.userId);
                            return p && p.lastSeen >= message._creationTime;
                        });
                        if (anyoneDelivered) status = "delivered";
                    }
                }

                return {
                    ...message,
                    sender,
                    reactions: reactionList,
                    status,
                };
            })
        );
    },
});
