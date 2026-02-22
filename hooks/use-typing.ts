"use client";

import { useCallback, useRef } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";

export function useTyping(conversationId: Id<"conversations">) {
    const setTyping = useMutation(api.typing.setTyping);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);
    const isTypingRef = useRef(false);

    const startTyping = useCallback(() => {
        if (!isTypingRef.current) {
            isTypingRef.current = true;
            setTyping({ conversationId, isTyping: true });
        }

        // Clear any existing timeout
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }

        // Set timeout to stop typing after 2 seconds of inactivity
        timeoutRef.current = setTimeout(() => {
            isTypingRef.current = false;
            setTyping({ conversationId, isTyping: false });
        }, 2000);
    }, [conversationId, setTyping]);

    const stopTyping = useCallback(() => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }
        if (isTypingRef.current) {
            isTypingRef.current = false;
            setTyping({ conversationId, isTyping: false });
        }
    }, [conversationId, setTyping]);

    return { startTyping, stopTyping };
}
