"use client";

import { Header } from "@/components/header";
import { Sidebar } from "@/components/sidebar";
import { usePathname } from "next/navigation";
import { usePresence } from "@/hooks/use-presence";

export default function ChatLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const isInConversation = pathname !== "/chat";

    // Track user presence (online/offline)
    usePresence();

    return (
        <div className="h-screen flex flex-col">
            <Header />
            <div className="flex-1 flex overflow-hidden">
                {/* Sidebar: always visible on desktop, hidden on mobile when in a conversation */}
                <div
                    className={`${isInConversation ? "hidden md:flex" : "flex"
                        } w-full md:w-80 lg:w-96 shrink-0`}
                >
                    <Sidebar />
                </div>
                {/* Main chat area */}
                <main
                    className={`${isInConversation ? "flex" : "hidden md:flex"
                        } flex-1 flex-col overflow-hidden bg-gray-950`}
                >
                    {children}
                </main>
            </div>
        </div>
    );
}
