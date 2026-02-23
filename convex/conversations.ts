import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const getOrCreate = mutation({
    args: { otherUserId: v.id("users") },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Not authenticated");

        const currentUser = await ctx.db
            .query("users")
            .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
            .unique();
        if (!currentUser) throw new Error("User not found");

        // Check if conversation already exists between these two users
        const myMemberships = await ctx.db
            .query("conversationMembers")
            .withIndex("by_user", (q) => q.eq("userId", currentUser._id))
            .collect();

        for (const membership of myMemberships) {
            const conversation = await ctx.db.get(membership.conversationId);
            if (!conversation || conversation.isGroup) continue;

            const otherMembership = await ctx.db
                .query("conversationMembers")
                .withIndex("by_conv_user", (q) =>
                    q
                        .eq("conversationId", membership.conversationId)
                        .eq("userId", args.otherUserId)
                )
                .unique();

            if (otherMembership) {
                return membership.conversationId;
            }
        }

        // Create new conversation
        const conversationId = await ctx.db.insert("conversations", {
            isGroup: false,
        });

        await ctx.db.insert("conversationMembers", {
            conversationId,
            userId: currentUser._id,
        });

        await ctx.db.insert("conversationMembers", {
            conversationId,
            userId: args.otherUserId,
        });

        return conversationId;
    },
});

export const list = query({
    args: {},
    handler: async (ctx) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) return [];

        const currentUser = await ctx.db
            .query("users")
            .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
            .unique();
        if (!currentUser) return [];

        const memberships = await ctx.db
            .query("conversationMembers")
            .withIndex("by_user", (q) => q.eq("userId", currentUser._id))
            .collect();

        const conversations = await Promise.all(
            memberships.map(async (membership) => {
                const conversation = await ctx.db.get(membership.conversationId);
                if (!conversation) return null;

                const members = await ctx.db
                    .query("conversationMembers")
                    .withIndex("by_conversation", (q) =>
                        q.eq("conversationId", conversation._id)
                    )
                    .collect();

                const otherMembers = await Promise.all(
                    members
                        .filter((m) => m.userId !== currentUser._id)
                        .map(async (m) => await ctx.db.get(m.userId))
                );

                let lastMessage = null;
                if (conversation.lastMessageId) {
                    lastMessage = await ctx.db.get(conversation.lastMessageId);
                }

                // Calculate unread count
                const lastReadTime = membership.lastReadTime ?? 0;
                const allMessages = await ctx.db
                    .query("messages")
                    .withIndex("by_conversation", (q) =>
                        q.eq("conversationId", conversation._id)
                    )
                    .collect();
                const unreadCount = allMessages.filter(
                    (m) =>
                        m.senderId !== currentUser._id &&
                        m._creationTime > lastReadTime
                ).length;

                return {
                    ...conversation,
                    otherMembers: otherMembers.filter(Boolean),
                    lastMessage,
                    myMembership: membership,
                    unreadCount,
                };
            })
        );

        return conversations
            .filter(Boolean)
            .sort(
                (a, b) =>
                    (b!.lastMessageTime ?? b!._creationTime) -
                    (a!.lastMessageTime ?? a!._creationTime)
            );
    },
});

export const get = query({
    args: { conversationId: v.id("conversations") },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) return null;

        const currentUser = await ctx.db
            .query("users")
            .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
            .unique();
        if (!currentUser) return null;

        const conversation = await ctx.db.get(args.conversationId);
        if (!conversation) return null;

        const members = await ctx.db
            .query("conversationMembers")
            .withIndex("by_conversation", (q) =>
                q.eq("conversationId", args.conversationId)
            )
            .collect();

        const otherMembers = await Promise.all(
            members
                .filter((m) => m.userId !== currentUser._id)
                .map(async (m) => await ctx.db.get(m.userId))
        );

        return {
            ...conversation,
            otherMembers: otherMembers.filter(Boolean),
        };
    },
});

export const markRead = mutation({
    args: { conversationId: v.id("conversations") },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) return;

        const currentUser = await ctx.db
            .query("users")
            .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
            .unique();
        if (!currentUser) return;

        const membership = await ctx.db
            .query("conversationMembers")
            .withIndex("by_conv_user", (q) =>
                q
                    .eq("conversationId", args.conversationId)
                    .eq("userId", currentUser._id)
            )
            .unique();

        if (membership) {
            await ctx.db.patch(membership._id, {
                lastReadTime: Date.now(),
            });
        }
    },
});
