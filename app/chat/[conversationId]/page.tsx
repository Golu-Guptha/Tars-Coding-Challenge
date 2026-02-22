"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { use } from "react";
import { MessageSquare } from "lucide-react";

export default function ConversationPage({
    params,
}: {
    params: Promise<{ conversationId: string }>;
}) {
    const { conversationId } = use(params);
    const conversation = useQuery(api.conversations.get, {
        conversationId: conversationId as Id<"conversations">,
    });

    if (!conversation) {
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
            <div className="h-16 border-b border-gray-800 bg-gray-900/50 flex items-center px-4 gap-3 shrink-0">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center text-white text-sm font-medium">
                    {otherUser?.name?.charAt(0)?.toUpperCase() ?? "?"}
                </div>
                <div>
                    <p className="text-sm font-semibold text-white">
                        {conversation.isGroup
                            ? conversation.groupName
                            : otherUser?.name ?? "Unknown"}
                    </p>
                </div>
            </div>

            {/* Messages area - placeholder for Step 3 */}
            <div className="flex-1 flex items-center justify-center">
                <div className="text-center space-y-3 p-8">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-500/10 to-indigo-500/10 flex items-center justify-center mx-auto border border-violet-500/20">
                        <MessageSquare className="w-7 h-7 text-violet-400" />
                    </div>
                    <div>
                        <p className="text-gray-300 font-medium">
                            Start your conversation with {otherUser?.name ?? "this user"}
                        </p>
                        <p className="text-gray-500 text-sm mt-1">
                            Messages will appear here in real-time
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
