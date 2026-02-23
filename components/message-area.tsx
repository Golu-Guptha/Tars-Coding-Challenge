"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send, MessageSquare, ArrowDown } from "lucide-react";
import { formatMessageTime } from "@/lib/format-time";
import { useTyping } from "@/hooks/use-typing";

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
    const [showNewMessages, setShowNewMessages] = useState(false);
    const isAtBottomRef = useRef(true);
    const prevMessageCountRef = useRef(0);
    const initialScrollDone = useRef(false);

    // Check if user is near the bottom
    const checkIsAtBottom = useCallback(() => {
        if (!scrollRef.current) return true;
        const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
        return scrollHeight - scrollTop - clientHeight < 100;
    }, []);

    // Handle scroll events — only update ref, no state that triggers re-renders
    const handleScroll = useCallback(() => {
        const atBottom = checkIsAtBottom();
        isAtBottomRef.current = atBottom;
        if (atBottom) {
            setShowNewMessages(false);
        }
    }, [checkIsAtBottom]);

    // Scroll logic — only depends on messages, uses ref for isAtBottom
    useEffect(() => {
        if (!messages || !scrollRef.current) return;

        const count = messages.length;

        // Initial load — scroll to bottom once
        if (!initialScrollDone.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
            initialScrollDone.current = true;
            prevMessageCountRef.current = count;
            return;
        }

        // New message arrived
        if (count > prevMessageCountRef.current) {
            if (isAtBottomRef.current) {
                // User is at bottom → auto-scroll
                scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
            } else {
                // User scrolled up → show button, don't interrupt
                setShowNewMessages(true);
            }
        }

        prevMessageCountRef.current = count;
    }, [messages]);

    // Reset when conversation changes
    useEffect(() => {
        initialScrollDone.current = false;
        prevMessageCountRef.current = 0;
        isAtBottomRef.current = true;
        setShowNewMessages(false);
    }, [conversationId]);

    const scrollToBottom = () => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
            setShowNewMessages(false);
            isAtBottomRef.current = true;
        }
    };

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
        <div className="flex-1 relative overflow-hidden">
            <div
                ref={scrollRef}
                onScroll={handleScroll}
                className="h-full overflow-y-auto p-4 space-y-1"
            >
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

            {/* ↓ New messages button */}
            {showNewMessages && (
                <button
                    onClick={scrollToBottom}
                    className="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white text-xs font-medium rounded-full shadow-lg shadow-violet-600/25 flex items-center gap-1.5 transition-all z-10"
                >
                    <ArrowDown className="w-3.5 h-3.5" />
                    New messages
                </button>
            )}
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
    const { startTyping, stopTyping } = useTyping(conversationId);

    const handleSend = async () => {
        const trimmed = body.trim();
        if (!trimmed) return;

        stopTyping();
        setBody("");
        await sendMessage({ conversationId, body: trimmed });
        inputRef.current?.focus();
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setBody(e.target.value);
        if (e.target.value.trim()) {
            startTyping();
        } else {
            stopTyping();
        }
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
                    onChange={handleChange}
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
