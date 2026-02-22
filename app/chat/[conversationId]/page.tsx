"use client";

import { useQuery } from "convex/react";
import { useRouter } from "next/navigation";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { use } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MessageList, MessageInput } from "@/components/message-area";
import { ArrowLeft } from "lucide-react";

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

    const otherUser = conversation.otherMembers?.[0];

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
                <Avatar className="w-8 h-8">
                    <AvatarImage src={otherUser?.imageUrl} />
                    <AvatarFallback className="bg-gradient-to-br from-violet-600 to-indigo-600 text-white text-xs font-medium">
                        {otherUser?.name?.charAt(0)?.toUpperCase() ?? "?"}
                    </AvatarFallback>
                </Avatar>
                <div>
                    <p className="text-sm font-semibold text-white">
                        {conversation.isGroup
                            ? conversation.groupName
                            : otherUser?.name ?? "Unknown"}
                    </p>
                </div>
            </div>

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
