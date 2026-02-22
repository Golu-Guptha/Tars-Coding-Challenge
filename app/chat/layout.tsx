"use client";

import { Header } from "@/components/header";
import { Sidebar } from "@/components/sidebar";

export default function ChatLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="h-screen flex flex-col">
            <Header />
            <div className="flex-1 flex overflow-hidden">
                <Sidebar />
                <main className="flex-1 overflow-hidden bg-gray-950">
                    {children}
                </main>
            </div>
        </div>
    );
}
