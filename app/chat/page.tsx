"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { MessageSquarePlus } from "lucide-react";

export default function ChatPage() {
    const currentUser = useQuery(api.users.getCurrentUser);

    return (
        <div className="h-full flex items-center justify-center">
            <div className="text-center space-y-4 p-8">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500/20 to-indigo-500/20 flex items-center justify-center mx-auto border border-violet-500/20">
                    <MessageSquarePlus className="w-8 h-8 text-violet-400" />
                </div>
                <div>
                    <h2 className="text-xl font-semibold text-white">
                        Welcome{currentUser ? `, ${currentUser.name}` : ""}! 👋
                    </h2>
                    <p className="text-gray-400 mt-1 max-w-md">
                        Start a conversation by selecting a user from the sidebar, or search for someone to chat with.
                    </p>
                </div>
            </div>
        </div>
    );
}
