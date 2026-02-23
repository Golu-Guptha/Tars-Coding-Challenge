"use client";

import { useQuery, useMutation } from "convex/react";
import { useRouter } from "next/navigation";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { use, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MessageList, MessageInput } from "@/components/message-area";
import { ArrowLeft, Users } from "lucide-react";

export default function ConversationPage({
    params,
}: {
    params: Promise<{ conversationId: string }>;
}) {
    const { conversationId } = use(params);
    const router = useRouter();
    const conversation = useQuery(api.conversations.get, {
        conversationId: conversationId as Id<"conversations">,
    });
    const currentUser = useQuery(api.users.getCurrentUser);
    const typingUsers = useQuery(api.typing.getTyping, {
        conversationId: conversationId as Id<"conversations">,
    });
    const markRead = useMutation(api.conversations.markRead);

    // For 1-on-1 chats, get presence of the other user
    const otherUser = !conversation?.isGroup
        ? conversation?.otherMembers?.[0]
        : null;
    const presence = useQuery(
        api.presence.getByUserId,
        otherUser ? { userId: otherUser._id } : "skip"
    );
    const isOnline =
        presence?.online && Date.now() - presence.lastSeen < 60000;

    useEffect(() => {
        if (conversationId) {
            markRead({ conversationId: conversationId as Id<"conversations"> });
        }
    }, [conversationId, markRead, conversation?.lastMessageTime]);

    if (!conversation || !currentUser) {
        return (
            <div className="h-full flex items-center justify-center">
                <div className="animate-pulse flex flex-col items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-gray-800" />
                    <div className="h-4 w-32 bg-gray-800 rounded" />
                </div>
            </div>
        );
    }

    // Display name and avatar logic
    const displayName = conversation.isGroup
        ? conversation.groupName ?? "Group"
        : otherUser?.name ?? "Unknown";

    const memberCount = conversation.otherMembers
        ? conversation.otherMembers.length + 1
        : 0;

    // Status text
    const statusText = typingUsers && typingUsers.length > 0
        ? `${typingUsers.map((u) => u?.name).join(", ")} typing...`
        : conversation.isGroup
            ? `${memberCount} members`
            : isOnline
                ? "online"
                : "offline";

    return (
        <div className="h-full flex flex-col">
            {/* Chat Header */}
            <div className="h-14 border-b border-gray-800 bg-gray-900/50 flex items-center px-4 gap-3 shrink-0">
                <button
                    onClick={() => router.push("/chat")}
                    className="md:hidden p-1.5 -ml-1 rounded-lg hover:bg-gray-800 transition-colors text-gray-400 hover:text-white"
                >
                    <ArrowLeft className="w-5 h-5" />
                </button>
                <div className="relative">
                    <Avatar className="w-8 h-8">
                        {!conversation.isGroup && otherUser?.imageUrl ? (
                            <AvatarImage src={otherUser.imageUrl} />
                        ) : null}
                        <AvatarFallback
                            className={`text-white text-xs font-medium ${conversation.isGroup
                                    ? "bg-gradient-to-br from-emerald-600 to-teal-600"
                                    : "bg-gradient-to-br from-violet-600 to-indigo-600"
                                }`}
                        >
                            {conversation.isGroup
                                ? conversation.groupName?.charAt(0)?.toUpperCase() ?? "G"
                                : otherUser?.name?.charAt(0)?.toUpperCase() ?? "?"}
                        </AvatarFallback>
                    </Avatar>
                    {!conversation.isGroup && isOnline && (
                        <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-gray-900 rounded-full" />
                    )}
                </div>
                <div>
                    <div className="flex items-center gap-1.5">
                        <p className="text-sm font-semibold text-white">{displayName}</p>
                        {conversation.isGroup && (
                            <Users className="w-3.5 h-3.5 text-gray-500" />
                        )}
                    </div>
                    <p className="text-xs text-gray-500">{statusText}</p>
                </div>
            </div>

            {/* Typing indicator bar */}
            {typingUsers && typingUsers.length > 0 && (
                <div className="px-4 py-1.5 flex items-center gap-2 text-xs text-gray-400 bg-gray-900/30">
                    <div className="flex gap-0.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-bounce" style={{ animationDelay: "0ms" }} />
                        <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-bounce" style={{ animationDelay: "150ms" }} />
                        <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-bounce" style={{ animationDelay: "300ms" }} />
                    </div>
                    <span>
                        {typingUsers.map((u) => u?.name).join(", ")} is typing...
                    </span>
                </div>
            )}

            {/* Messages */}
            <MessageList
                conversationId={conversationId as Id<"conversations">}
                currentUserId={currentUser._id}
            />

            {/* Input */}
            <MessageInput
                conversationId={conversationId as Id<"conversations">}
            />
        </div>
    );
}
