"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send, MessageSquare, ArrowDown, Trash2, SmilePlus, Check, CheckCheck } from "lucide-react";
import { formatMessageTime, formatDateSeparator, getDateKey } from "@/lib/format-time";
import { useTyping } from "@/hooks/use-typing";

const EMOJI_LIST = ["👍", "❤️", "😂", "😮", "😢"];

interface MessageListProps {
    conversationId: Id<"conversations">;
    currentUserId: Id<"users">;
}

export function MessageList({
    conversationId,
    currentUserId,
}: MessageListProps) {
    const messages = useQuery(api.messages.list, { conversationId });
    const deleteMessage = useMutation(api.messages.remove);
    const toggleReaction = useMutation(api.reactions.toggle);
    const scrollRef = useRef<HTMLDivElement>(null);
    const [showNewMessages, setShowNewMessages] = useState(false);
    const isAtBottomRef = useRef(true);
    const prevMessageCountRef = useRef(0);
    const initialScrollDone = useRef(false);
    const [showEmojiPicker, setShowEmojiPicker] = useState<string | null>(null);
    const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

    const checkIsAtBottom = useCallback(() => {
        if (!scrollRef.current) return true;
        const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
        return scrollHeight - scrollTop - clientHeight < 100;
    }, []);

    const handleScroll = useCallback(() => {
        const atBottom = checkIsAtBottom();
        isAtBottomRef.current = atBottom;
        if (atBottom) setShowNewMessages(false);
    }, [checkIsAtBottom]);

    useEffect(() => {
        if (!messages || !scrollRef.current) return;
        const count = messages.length;
        if (!initialScrollDone.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
            initialScrollDone.current = true;
            prevMessageCountRef.current = count;
            return;
        }
        if (count > prevMessageCountRef.current) {
            if (isAtBottomRef.current) {
                scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
            } else {
                setShowNewMessages(true);
            }
        }
        prevMessageCountRef.current = count;
    }, [messages]);

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

    useEffect(() => {
        const handleClick = () => setShowEmojiPicker(null);
        window.addEventListener("click", handleClick);
        return () => window.removeEventListener("click", handleClick);
    }, []);

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
                    const hasReactions =
                        message.reactions && message.reactions.length > 0;

                    // Date separator — show when day changes
                    const currentDateKey = getDateKey(message._creationTime);
                    const prevDateKey = index > 0 ? getDateKey(messages[index - 1]._creationTime) : null;
                    const showDateSeparator = index === 0 || currentDateKey !== prevDateKey;

                    return (
                        <div key={message._id}>
                            {/* Date separator */}
                            {showDateSeparator && (
                                <div className="flex items-center gap-3 my-4">
                                    <div className="flex-1 h-px bg-gray-800" />
                                    <span className="text-[11px] text-gray-500 font-medium px-2">
                                        {formatDateSeparator(message._creationTime)}
                                    </span>
                                    <div className="flex-1 h-px bg-gray-800" />
                                </div>
                            )}

                            {/* Message row */}
                            <div
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
                                    className={`max-w-[70%] group relative ${isOwn ? "items-end" : "items-start"}`}
                                >
                                    {/* Hover actions */}
                                    {!message.deleted && (
                                        <div
                                            className={`absolute -top-3 ${isOwn ? "right-0" : "left-0"} opacity-0 group-hover:opacity-100 transition-opacity flex gap-0.5 z-10`}
                                        >
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setShowEmojiPicker(
                                                        showEmojiPicker === message._id ? null : message._id
                                                    );
                                                }}
                                                className="p-1 rounded bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white transition-colors"
                                            >
                                                <SmilePlus className="w-3.5 h-3.5" />
                                            </button>
                                            {isOwn && (
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setConfirmDelete(message._id);
                                                    }}
                                                    className="p-1 rounded bg-gray-800 hover:bg-red-600 text-gray-400 hover:text-white transition-colors"
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </button>
                                            )}
                                        </div>
                                    )}

                                    {/* Emoji picker popup */}
                                    {showEmojiPicker === message._id && (
                                        <div
                                            className={`absolute -top-10 ${isOwn ? "right-0" : "left-0"} bg-gray-800 border border-gray-700 rounded-lg p-1 flex gap-0.5 z-20 shadow-lg`}
                                            onClick={(e) => e.stopPropagation()}
                                        >
                                            {EMOJI_LIST.map((emoji) => (
                                                <button
                                                    key={emoji}
                                                    onClick={() => {
                                                        toggleReaction({ messageId: message._id, emoji });
                                                        setShowEmojiPicker(null);
                                                    }}
                                                    className="w-8 h-8 flex items-center justify-center rounded hover:bg-gray-700 transition-colors text-base"
                                                >
                                                    {emoji}
                                                </button>
                                            ))}
                                        </div>
                                    )}

                                    {/* Message bubble */}
                                    <div
                                        className={`px-3.5 py-2 rounded-2xl text-sm leading-relaxed ${isOwn
                                            ? "bg-violet-600 text-white rounded-br-md"
                                            : "bg-gray-800 text-gray-100 rounded-bl-md"
                                            }`}
                                    >
                                        {message.deleted ? (
                                            <span className="italic text-gray-400 text-xs">
                                                🚫 This message was deleted
                                            </span>
                                        ) : (
                                            message.body
                                        )}
                                    </div>

                                    {/* Reactions display */}
                                    {hasReactions && (
                                        <div className={`flex gap-1 mt-0.5 flex-wrap ${isOwn ? "justify-end" : "justify-start"}`}>
                                            {message.reactions.map((reaction: { emoji: string; count: number; userIds: string[] }) => {
                                                const reacted = reaction.userIds.includes(currentUserId);
                                                return (
                                                    <button
                                                        key={reaction.emoji}
                                                        onClick={() =>
                                                            toggleReaction({ messageId: message._id, emoji: reaction.emoji })
                                                        }
                                                        className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-xs border transition-colors ${reacted
                                                            ? "bg-violet-600/20 border-violet-500/40 text-violet-300"
                                                            : "bg-gray-800/50 border-gray-700 text-gray-400 hover:border-gray-600"
                                                            }`}
                                                    >
                                                        <span>{reaction.emoji}</span>
                                                        <span className="text-[10px]">{reaction.count}</span>
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    )}

                                    {/* Timestamp + read receipts (always visible) */}
                                    <div
                                        className={`flex items-center gap-1 mt-0.5 px-1 ${isOwn ? "justify-end" : "justify-start"
                                            }`}
                                    >
                                        <span className="text-[10px] text-gray-500">
                                            {formatMessageTime(message._creationTime)}
                                        </span>
                                        {isOwn && !message.deleted && (
                                            <span className={`flex items-center ${message.status === "read" ? "text-blue-400" : "text-gray-500"
                                                }`}>
                                                {message.status === "sent" ? (
                                                    <Check className="w-3.5 h-3.5" />
                                                ) : (
                                                    <CheckCheck className="w-3.5 h-3.5" />
                                                )}
                                            </span>
                                        )}
                                    </div>
                                </div>
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

            {/* Delete confirmation dialog */}
            {confirmDelete && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
                    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 max-w-sm mx-4 shadow-2xl">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center">
                                <Trash2 className="w-5 h-5 text-red-400" />
                            </div>
                            <div>
                                <h3 className="text-sm font-semibold text-white">Delete message?</h3>
                                <p className="text-xs text-gray-400">This can&apos;t be undone.</p>
                            </div>
                        </div>
                        <div className="flex gap-2 justify-end">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setConfirmDelete(null)}
                                className="border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white"
                            >
                                Cancel
                            </Button>
                            <Button
                                size="sm"
                                onClick={() => {
                                    deleteMessage({ messageId: confirmDelete as Id<"messages"> });
                                    setConfirmDelete(null);
                                }}
                                className="bg-red-600 hover:bg-red-700 text-white"
                            >
                                Delete
                            </Button>
                        </div>
                    </div>
                </div>
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
