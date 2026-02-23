import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const setTyping = mutation({
    args: {
        conversationId: v.id("conversations"),
        isTyping: v.boolean(),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) return;

        const user = await ctx.db
            .query("users")
            .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
            .unique();
        if (!user) return;

        const existing = await ctx.db
            .query("typing")
            .withIndex("by_conv_user", (q) =>
                q
                    .eq("conversationId", args.conversationId)
                    .eq("userId", user._id)
            )
            .unique();

        if (existing) {
            await ctx.db.patch(existing._id, {
                isTyping: args.isTyping,
                updatedAt: Date.now(),
            });
        } else {
            await ctx.db.insert("typing", {
                conversationId: args.conversationId,
                userId: user._id,
                isTyping: args.isTyping,
                updatedAt: Date.now(),
            });
        }
    },
});

export const getTyping = query({
    args: { conversationId: v.id("conversations") },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) return [];

        const user = await ctx.db
            .query("users")
            .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
            .unique();
        if (!user) return [];

        const typingRecords = await ctx.db
            .query("typing")
            .withIndex("by_conv", (q) => q.eq("conversationId", args.conversationId))
            .collect();

        const now = Date.now();
        const activeTypers = typingRecords.filter(
            (t) =>
                t.isTyping &&
                t.userId !== user._id &&
                now - t.updatedAt < 3000 // stale after 3 seconds
        );

        const users = await Promise.all(
            activeTypers.map(async (t) => await ctx.db.get(t.userId))
        );

        return users.filter(Boolean);
    },
});

export const getAllActive = query({
    args: {},
    handler: async (ctx) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) return [];

        const user = await ctx.db
            .query("users")
            .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
            .unique();
        if (!user) return [];

        const allTyping = await ctx.db.query("typing").collect();

        const now = Date.now();
        return allTyping.filter(
            (t) =>
                t.isTyping &&
                t.userId !== user._id &&
                now - t.updatedAt < 3000
        );
    },
});
