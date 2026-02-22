import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const store = mutation({
    args: {},
    handler: async (ctx) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) {
            throw new Error("Not authenticated");
        }

        // Check if user already exists
        const existingUser = await ctx.db
            .query("users")
            .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
            .unique();

        if (existingUser) {
            // Update existing user if name/image changed
            if (
                existingUser.name !== identity.name ||
                existingUser.imageUrl !== identity.pictureUrl ||
                existingUser.email !== identity.email
            ) {
                await ctx.db.patch(existingUser._id, {
                    name: identity.name ?? "Unknown",
                    email: identity.email ?? "",
                    imageUrl: identity.pictureUrl,
                });
            }
            return existingUser._id;
        }

        // Create new user
        const userId = await ctx.db.insert("users", {
            clerkId: identity.subject,
            name: identity.name ?? "Unknown",
            email: identity.email ?? "",
            imageUrl: identity.pictureUrl,
        });

        return userId;
    },
});

export const getAll = query({
    args: {},
    handler: async (ctx) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) return [];

        const users = await ctx.db.query("users").collect();
        return users.filter((u) => u.clerkId !== identity.subject);
    },
});

export const getCurrentUser = query({
    args: {},
    handler: async (ctx) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) return null;

        return await ctx.db
            .query("users")
            .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
            .unique();
    },
});

export const getById = query({
    args: { userId: v.id("users") },
    handler: async (ctx, args) => {
        return await ctx.db.get(args.userId);
    },
});
