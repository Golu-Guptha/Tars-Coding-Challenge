"use client";

import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, MessageSquare } from "lucide-react";
import { formatMessageTime } from "@/lib/format-time";

interface MessageListProps {
    conversationId: Id<"conversations">;
    currentUserId: Id<"users">;
}

export function MessageList({
    conversationId,
    currentUserId,
}: MessageListProps) {
    const messages = useQuery(api.messages.list, { conversationId });
    const scrollRef = useRef<HTMLDivElement>(null);

    // Auto-scroll to bottom on new messages
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    if (!messages) {
        return (
            <div className="flex-1 flex items-center justify-center">
                <div className="flex gap-1">
                    <div className="w-2 h-2 rounded-full bg-violet-400 animate-bounce" style={{ animationDelay: "0ms" }} />
                    <div className="w-2 h-2 rounded-full bg-violet-400 animate-bounce" style={{ animationDelay: "150ms" }} />
                    <div className="w-2 h-2 rounded-full bg-violet-400 animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
            </div>
        );
    }

    if (messages.length === 0) {
        return (
            <div className="flex-1 flex items-center justify-center">
                <div className="text-center space-y-3 p-8">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-500/10 to-indigo-500/10 flex items-center justify-center mx-auto border border-violet-500/20">
                        <MessageSquare className="w-7 h-7 text-violet-400" />
                    </div>
                    <div>
                        <p className="text-gray-300 font-medium">No messages yet</p>
                        <p className="text-gray-500 text-sm mt-1">
                            Send a message to start the conversation
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-1">
            {messages.map((message, index) => {
                const isOwn = message.senderId === currentUserId;
                const showAvatar =
                    !isOwn &&
                    (index === 0 || messages[index - 1].senderId !== message.senderId);

                return (
                    <div
                        key={message._id}
                        className={`flex items-end gap-2 ${isOwn ? "justify-end" : "justify-start"} ${showAvatar ? "mt-3" : "mt-0.5"
                            }`}
                    >
                        {!isOwn && (
                            <div className="w-7 shrink-0">
                                {showAvatar && (
                                    <Avatar className="w-7 h-7">
                                        <AvatarImage src={message.sender?.imageUrl} />
                                        <AvatarFallback className="bg-gradient-to-br from-violet-600 to-indigo-600 text-white text-[10px] font-medium">
                                            {message.sender?.name?.charAt(0)?.toUpperCase()}
                                        </AvatarFallback>
                                    </Avatar>
                                )}
                            </div>
                        )}
                        <div
                            className={`max-w-[70%] group ${isOwn ? "items-end" : "items-start"}`}
                        >
                            <div
                                className={`px-3.5 py-2 rounded-2xl text-sm leading-relaxed ${isOwn
                                        ? "bg-violet-600 text-white rounded-br-md"
                                        : "bg-gray-800 text-gray-100 rounded-bl-md"
                                    }`}
                            >
                                {message.deleted ? (
                                    <span className="italic text-gray-400">
                                        This message was deleted
                                    </span>
                                ) : (
                                    message.body
                                )}
                            </div>
                            <p
                                className={`text-[10px] text-gray-600 mt-0.5 px-1 opacity-0 group-hover:opacity-100 transition-opacity ${isOwn ? "text-right" : "text-left"
                                    }`}
                            >
                                {formatMessageTime(message._creationTime)}
                            </p>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

interface MessageInputProps {
    conversationId: Id<"conversations">;
}

export function MessageInput({ conversationId }: MessageInputProps) {
    const [body, setBody] = useState("");
    const sendMessage = useMutation(api.messages.send);
    const inputRef = useRef<HTMLInputElement>(null);

    const handleSend = async () => {
        const trimmed = body.trim();
        if (!trimmed) return;

        setBody("");
        await sendMessage({ conversationId, body: trimmed });
        inputRef.current?.focus();
    };

    return (
        <div className="p-4 border-t border-gray-800 bg-gray-900/50 shrink-0">
            <form
                onSubmit={(e) => {
                    e.preventDefault();
                    handleSend();
                }}
                className="flex gap-2"
            >
                <Input
                    ref={inputRef}
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1 bg-gray-800/50 border-gray-700 text-white placeholder:text-gray-500 focus-visible:ring-violet-500"
                    autoFocus
                />
                <Button
                    type="submit"
                    size="icon"
                    disabled={!body.trim()}
                    className="bg-violet-600 hover:bg-violet-700 text-white disabled:opacity-30 shrink-0"
                >
                    <Send className="w-4 h-4" />
                </Button>
            </form>
        </div>
    );
}
