import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
    users: defineTable({
        clerkId: v.string(),
        name: v.string(),
        email: v.string(),
        imageUrl: v.optional(v.string()),
    }).index("by_clerkId", ["clerkId"]),

    conversations: defineTable({
        isGroup: v.boolean(),
        groupName: v.optional(v.string()),
        groupImage: v.optional(v.string()),
        lastMessageId: v.optional(v.id("messages")),
        lastMessageTime: v.optional(v.number()),
    }),

    conversationMembers: defineTable({
        conversationId: v.id("conversations"),
        userId: v.id("users"),
        lastReadTime: v.optional(v.number()),
    })
        .index("by_conversation", ["conversationId"])
        .index("by_user", ["userId"])
        .index("by_conv_user", ["conversationId", "userId"]),

    messages: defineTable({
        conversationId: v.id("conversations"),
        senderId: v.id("users"),
        body: v.string(),
        deleted: v.optional(v.boolean()),
    }).index("by_conversation", ["conversationId"]),

    presence: defineTable({
        userId: v.id("users"),
        online: v.boolean(),
        lastSeen: v.number(),
    }).index("by_user", ["userId"]),

    typing: defineTable({
        conversationId: v.id("conversations"),
        userId: v.id("users"),
        isTyping: v.boolean(),
        updatedAt: v.number(),
    })
        .index("by_conv", ["conversationId"])
        .index("by_conv_user", ["conversationId", "userId"]),

    reactions: defineTable({
        messageId: v.id("messages"),
        userId: v.id("users"),
        emoji: v.string(),
    })
        .index("by_message", ["messageId"])
        .index("by_msg_user_emoji", ["messageId", "userId", "emoji"]),
});
