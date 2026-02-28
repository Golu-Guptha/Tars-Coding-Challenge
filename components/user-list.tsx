"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { useRouter } from "next/navigation";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search, UserPlus, MessageSquare, ArrowLeft } from "lucide-react";

export function UserList({ onClose }: { onClose?: () => void }) {
    const [search, setSearch] = useState("");
    const users = useQuery(api.users.getAll);
    const getOrCreate = useMutation(api.conversations.getOrCreate);
    const router = useRouter();

    const filteredUsers = users?.filter((user) =>
        user.name.toLowerCase().includes(search.toLowerCase())
    );

    const handleUserClick = async (userId: Id<"users">) => {
        const conversationId = await getOrCreate({ otherUserId: userId });
        router.push(`/chat/${conversationId}`);
        onClose?.();
    };

    return (
        <div className="flex flex-col h-full">
            <div className="p-4 border-b border-gray-800">
                <h2 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                    {onClose && (
                        <button
                            onClick={onClose}
                            className="p-1 -ml-1 rounded-lg hover:bg-gray-800 text-gray-400 hover:text-white transition-colors"
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </button>
                    )}
                    <UserPlus className="w-5 h-5 text-violet-400" />
                    Find Users
                </h2>
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <Input
                        placeholder="Search by name..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-9 bg-gray-800/50 border-gray-700 text-white placeholder:text-gray-500 focus-visible:ring-violet-500"
                    />
                </div>
            </div>

            <ScrollArea className="flex-1">
                <div className="p-2">
                    {filteredUsers === undefined ? (
                        // Loading state
                        <div className="space-y-2 p-2">
                            {[...Array(5)].map((_, i) => (
                                <div key={i} className="flex items-center gap-3 p-3 animate-pulse">
                                    <div className="w-10 h-10 rounded-full bg-gray-800" />
                                    <div className="flex-1 space-y-2">
                                        <div className="h-4 w-24 bg-gray-800 rounded" />
                                        <div className="h-3 w-32 bg-gray-800/50 rounded" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : filteredUsers.length === 0 ? (
                        // Empty state
                        <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                            <div className="w-12 h-12 rounded-xl bg-gray-800/50 flex items-center justify-center mb-3">
                                <Search className="w-6 h-6 text-gray-600" />
                            </div>
                            <p className="text-gray-400 text-sm">
                                {search
                                    ? `No users found for "${search}"`
                                    : "No other users have signed up yet"}
                            </p>
                            {search && (
                                <p className="text-gray-500 text-xs mt-1">
                                    Try a different search term
                                </p>
                            )}
                        </div>
                    ) : (
                        // User list
                        filteredUsers.map((user) => (
                            <button
                                key={user._id}
                                onClick={() => handleUserClick(user._id)}
                                className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-800/50 transition-all duration-200 group"
                            >
                                <Avatar className="w-10 h-10 ring-2 ring-transparent group-hover:ring-violet-500/30 transition-all">
                                    <AvatarImage src={user.imageUrl} />
                                    <AvatarFallback className="bg-gradient-to-br from-violet-600 to-indigo-600 text-white text-sm font-medium">
                                        {user.name?.charAt(0)?.toUpperCase()}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="flex-1 text-left">
                                    <p className="text-sm font-medium text-white group-hover:text-violet-300 transition-colors">
                                        {user.name}
                                    </p>
                                    <p className="text-xs text-gray-500">{user.email}</p>
                                </div>
                                <MessageSquare className="w-4 h-4 text-gray-600 group-hover:text-violet-400 transition-colors" />
                            </button>
                        ))
                    )}
                </div>
            </ScrollArea>
        </div>
    );
}
