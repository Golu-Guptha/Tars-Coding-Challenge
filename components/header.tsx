"use client";

import { UserButton } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MessageSquare } from "lucide-react";

export function Header() {
    const currentUser = useQuery(api.users.getCurrentUser);

    return (
        <header className="h-16 border-b border-gray-800 bg-gray-900/95 backdrop-blur supports-[backdrop-filter]:bg-gray-900/60 flex items-center justify-between px-4 md:px-6 shrink-0">
            <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center">
                        <MessageSquare className="w-4 h-4 text-white" />
                    </div>
                    <h1 className="text-lg font-bold bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent">
                        Tars Chat
                    </h1>
                </div>
            </div>

            <div className="flex items-center gap-3">
                {currentUser && (
                    <div className="hidden sm:flex items-center gap-2 mr-2">
                        <Avatar className="w-7 h-7">
                            <AvatarImage src={currentUser.imageUrl} />
                            <AvatarFallback className="bg-violet-600 text-white text-xs">
                                {currentUser.name?.charAt(0)?.toUpperCase()}
                            </AvatarFallback>
                        </Avatar>
                        <span className="text-sm text-gray-300 font-medium">
                            {currentUser.name}
                        </span>
                    </div>
                )}
                <UserButton
                    afterSignOutUrl="/sign-in"
                    appearance={{
                        elements: {
                            avatarBox: "w-8 h-8",
                        },
                    }}
                />
            </div>
        </header>
    );
}
