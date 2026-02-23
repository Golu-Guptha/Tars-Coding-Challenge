"use client";

import { useQuery } from "convex/react";
import { useRouter, usePathname } from "next/navigation";
import { api } from "@/convex/_generated/api";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageSquarePlus, MessagesSquare, Users } from "lucide-react";
import { useState } from "react";
import { UserList } from "@/components/user-list";
import { CreateGroupDialog } from "@/components/create-group-dialog";

export function Sidebar() {
    const conversations = useQuery(api.conversations.list);
    const presenceData = useQuery(api.presence.getAll);
    const allTyping = useQuery(api.typing.getAllActive);
    const router = useRouter();
    const pathname = usePathname();
    const [showUsers, setShowUsers] = useState(false);
    const [showGroupDialog, setShowGroupDialog] = useState(false);

    const isUserOnline = (userId: string) => {
        if (!presenceData) return false;
        const presence = presenceData.find((p) => p.userId === userId);
        if (!presence) return false;
        return presence.online && Date.now() - presence.lastSeen < 60000;
    };

    const getTypingText = (conversationId: string) => {
        if (!allTyping) return null;
        const typers = allTyping.filter(
            (t) => t.conversationId === conversationId
        );
        if (typers.length === 0) return null;
        return "typing...";
    };

    return (
        <>
            <div className="w-full md:w-80 lg:w-96 border-r border-gray-800 bg-gray-900/50 flex flex-col h-full">
                {/* Header */}
                <div className="p-4 border-b border-gray-800 flex items-center justify-between shrink-0">
                    <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                        <MessagesSquare className="w-5 h-5 text-violet-400" />
                        Chats
                    </h2>
                    <div className="flex gap-1">
                        <button
                            onClick={() => setShowGroupDialog(true)}
                            className="p-2 rounded-lg hover:bg-gray-800 transition-colors text-gray-400 hover:text-violet-400"
                            title="Create group chat"
                        >
                            <Users className="w-5 h-5" />
                        </button>
                        <button
                            onClick={() => setShowUsers(!showUsers)}
                            className="p-2 rounded-lg hover:bg-gray-800 transition-colors text-gray-400 hover:text-violet-400"
                            title="New conversation"
                        >
                            <MessageSquarePlus className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {showUsers ? (
                    <UserList onClose={() => setShowUsers(false)} />
                ) : (
                    <ScrollArea className="flex-1">
                        <div className="p-2">
                            {conversations === undefined ? (
                                <div className="space-y-2 p-2">
                                    {[...Array(4)].map((_, i) => (
                                        <div key={i} className="flex items-center gap-3 p-3 animate-pulse">
                                            <div className="w-10 h-10 rounded-full bg-gray-800" />
                                            <div className="flex-1 space-y-2">
                                                <div className="h-4 w-28 bg-gray-800 rounded" />
                                                <div className="h-3 w-40 bg-gray-800/50 rounded" />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : conversations.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-500/10 to-indigo-500/10 flex items-center justify-center mb-4 border border-violet-500/20">
                                        <MessageSquarePlus className="w-7 h-7 text-violet-400" />
                                    </div>
                                    <p className="text-gray-300 font-medium text-sm">
                                        No conversations yet
                                    </p>
                                    <p className="text-gray-500 text-xs mt-1 max-w-[200px]">
                                        Click the + button to start a DM or the group icon to create a group
                                    </p>
                                </div>
                            ) : (
                                conversations.map((conv) => {
                                    if (!conv) return null;
                                    const otherUser = conv.otherMembers?.[0];
                                    const isActive = pathname === `/chat/${conv._id}`;
                                    const online = !conv.isGroup && otherUser ? isUserOnline(otherUser._id) : false;
                                    const typingText = getTypingText(conv._id);

                                    // Group avatar text
                                    const avatarText = conv.isGroup
                                        ? conv.groupName?.charAt(0)?.toUpperCase() ?? "G"
                                        : otherUser?.name?.charAt(0)?.toUpperCase() ?? "?";

                                    const displayName = conv.isGroup
                                        ? conv.groupName ?? "Group"
                                        : otherUser?.name ?? "Unknown";

                                    return (
                                        <button
                                            key={conv._id}
                                            onClick={() => router.push(`/chat/${conv._id}`)}
                                            className={`w-full flex items-center gap-3 p-3 rounded-lg transition-all duration-200 group ${isActive
                                                    ? "bg-violet-500/10 border border-violet-500/20"
                                                    : "hover:bg-gray-800/50"
                                                }`}
                                        >
                                            <div className="relative shrink-0">
                                                <Avatar className="w-10 h-10">
                                                    {!conv.isGroup && otherUser?.imageUrl ? (
                                                        <AvatarImage src={otherUser.imageUrl} />
                                                    ) : null}
                                                    <AvatarFallback
                                                        className={`text-white text-sm font-medium ${conv.isGroup
                                                                ? "bg-gradient-to-br from-emerald-600 to-teal-600"
                                                                : "bg-gradient-to-br from-violet-600 to-indigo-600"
                                                            }`}
                                                    >
                                                        {avatarText}
                                                    </AvatarFallback>
                                                </Avatar>
                                                {online && (
                                                    <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-gray-900 rounded-full" />
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0 text-left">
                                                <div className="flex items-center gap-1.5">
                                                    <p
                                                        className={`text-sm font-medium truncate ${isActive ? "text-violet-300" : "text-white"
                                                            }`}
                                                    >
                                                        {displayName}
                                                    </p>
                                                    {conv.isGroup && (
                                                        <Users className="w-3 h-3 text-gray-500 shrink-0" />
                                                    )}
                                                </div>
                                                {typingText ? (
                                                    <p className="text-xs text-violet-400 truncate italic">
                                                        {typingText}
                                                    </p>
                                                ) : (
                                                    <p className="text-xs text-gray-500 truncate">
                                                        {conv.lastMessage
                                                            ? conv.lastMessage.deleted
                                                                ? "This message was deleted"
                                                                : conv.lastMessage.body
                                                            : "No messages yet"}
                                                    </p>
                                                )}
                                            </div>
                                            {/* Unread badge */}
                                            {conv.unreadCount > 0 && !isActive && (
                                                <span className="shrink-0 min-w-[20px] h-5 px-1.5 rounded-full bg-violet-600 text-white text-xs font-semibold flex items-center justify-center">
                                                    {conv.unreadCount}
                                                </span>
                                            )}
                                        </button>
                                    );
                                })
                            )}
                        </div>
                    </ScrollArea>
                )}
            </div>

            {/* Group creation dialog */}
            <CreateGroupDialog
                open={showGroupDialog}
                onClose={() => setShowGroupDialog(false)}
            />
        </>
    );
}
