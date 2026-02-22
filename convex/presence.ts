import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const heartbeat = mutation({
    args: {},
    handler: async (ctx) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) return;

        const user = await ctx.db
            .query("users")
            .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
            .unique();
        if (!user) return;

        const existing = await ctx.db
            .query("presence")
            .withIndex("by_user", (q) => q.eq("userId", user._id))
            .unique();

        if (existing) {
            await ctx.db.patch(existing._id, {
                online: true,
                lastSeen: Date.now(),
            });
        } else {
            await ctx.db.insert("presence", {
                userId: user._id,
                online: true,
                lastSeen: Date.now(),
            });
        }
    },
});

export const setOffline = mutation({
    args: {},
    handler: async (ctx) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) return;

        const user = await ctx.db
            .query("users")
            .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
            .unique();
        if (!user) return;

        const existing = await ctx.db
            .query("presence")
            .withIndex("by_user", (q) => q.eq("userId", user._id))
            .unique();

        if (existing) {
            await ctx.db.patch(existing._id, {
                online: false,
                lastSeen: Date.now(),
            });
        }
    },
});

export const getByUserId = query({
    args: { userId: v.id("users") },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("presence")
            .withIndex("by_user", (q) => q.eq("userId", args.userId))
            .unique();
    },
});

export const getAll = query({
    args: {},
    handler: async (ctx) => {
        return await ctx.db.query("presence").collect();
    },
});
