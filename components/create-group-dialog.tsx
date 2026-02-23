"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { useRouter } from "next/navigation";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Users, X, Check, Search } from "lucide-react";

interface CreateGroupDialogProps {
    open: boolean;
    onClose: () => void;
}

export function CreateGroupDialog({ open, onClose }: CreateGroupDialogProps) {
    const [groupName, setGroupName] = useState("");
    const [search, setSearch] = useState("");
    const [selectedUsers, setSelectedUsers] = useState<Id<"users">[]>([]);
    const users = useQuery(api.users.getAll);
    const createGroup = useMutation(api.conversations.createGroup);
    const router = useRouter();

    if (!open) return null;

    const filteredUsers = users?.filter((user) =>
        user.name.toLowerCase().includes(search.toLowerCase())
    );

    const toggleUser = (userId: Id<"users">) => {
        setSelectedUsers((prev) =>
            prev.includes(userId)
                ? prev.filter((id) => id !== userId)
                : [...prev, userId]
        );
    };

    const handleCreate = async () => {
        if (!groupName.trim() || selectedUsers.length < 2) return;
        const conversationId = await createGroup({
            name: groupName.trim(),
            memberIds: selectedUsers,
        });
        setGroupName("");
        setSelectedUsers([]);
        setSearch("");
        onClose();
        router.push(`/chat/${conversationId}`);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <div className="bg-gray-900 border border-gray-800 rounded-2xl w-full max-w-md mx-4 overflow-hidden shadow-2xl">
                {/* Header */}
                <div className="p-4 border-b border-gray-800 flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                        <Users className="w-5 h-5 text-violet-400" />
                        Create Group Chat
                    </h3>
                    <button
                        onClick={onClose}
                        className="p-1.5 rounded-lg hover:bg-gray-800 text-gray-400 hover:text-white transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Group name input */}
                <div className="p-4 border-b border-gray-800">
                    <Input
                        placeholder="Group name..."
                        value={groupName}
                        onChange={(e) => setGroupName(e.target.value)}
                        className="bg-gray-800/50 border-gray-700 text-white placeholder:text-gray-500 focus-visible:ring-violet-500"
                    />
                </div>

                {/* Selected users chips */}
                {selectedUsers.length > 0 && (
                    <div className="px-4 pt-3 flex flex-wrap gap-1.5">
                        {selectedUsers.map((userId) => {
                            const user = users?.find((u) => u._id === userId);
                            return (
                                <span
                                    key={userId}
                                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-violet-600/20 border border-violet-500/30 text-violet-300 text-xs"
                                >
                                    {user?.name}
                                    <button
                                        onClick={() => toggleUser(userId)}
                                        className="hover:text-white transition-colors"
                                    >
                                        <X className="w-3 h-3" />
                                    </button>
                                </span>
                            );
                        })}
                    </div>
                )}

                {/* Search */}
                <div className="p-4 pb-2">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                        <Input
                            placeholder="Search users..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-9 bg-gray-800/50 border-gray-700 text-white placeholder:text-gray-500 focus-visible:ring-violet-500"
                        />
                    </div>
                </div>

                {/* User list */}
                <div className="max-h-48 overflow-y-auto px-4 pb-2">
                    {filteredUsers?.map((user) => {
                        const isSelected = selectedUsers.includes(user._id);
                        return (
                            <button
                                key={user._id}
                                onClick={() => toggleUser(user._id)}
                                className={`w-full flex items-center gap-3 p-2.5 rounded-lg transition-all ${isSelected
                                        ? "bg-violet-500/10 border border-violet-500/20"
                                        : "hover:bg-gray-800/50"
                                    }`}
                            >
                                <Avatar className="w-8 h-8">
                                    <AvatarImage src={user.imageUrl} />
                                    <AvatarFallback className="bg-gradient-to-br from-violet-600 to-indigo-600 text-white text-xs font-medium">
                                        {user.name?.charAt(0)?.toUpperCase()}
                                    </AvatarFallback>
                                </Avatar>
                                <span className="text-sm text-white flex-1 text-left">
                                    {user.name}
                                </span>
                                {isSelected && (
                                    <Check className="w-4 h-4 text-violet-400" />
                                )}
                            </button>
                        );
                    })}
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-gray-800 flex justify-end gap-2">
                    <p className="text-xs text-gray-500 flex-1 self-center">
                        {selectedUsers.length} selected (min 2)
                    </p>
                    <Button
                        onClick={handleCreate}
                        disabled={!groupName.trim() || selectedUsers.length < 2}
                        className="bg-violet-600 hover:bg-violet-700 text-white disabled:opacity-30"
                    >
                        Create Group
                    </Button>
                </div>
            </div>
        </div>
    );
}
