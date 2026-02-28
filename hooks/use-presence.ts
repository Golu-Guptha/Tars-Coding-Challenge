"use client";

import { useEffect, useRef } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

export function usePresence() {
    const heartbeat = useMutation(api.presence.heartbeat);
    const setOffline = useMutation(api.presence.setOffline);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        // Send initial heartbeat
        heartbeat();

        // Send heartbeat every 30 seconds
        intervalRef.current = setInterval(() => {
            heartbeat();
        }, 30000);

        // Set offline on visibility change (tab hidden)
        const handleVisibilityChange = () => {
            if (document.hidden) {
                setOffline();
            } else {
                heartbeat();
            }
        };

        document.addEventListener("visibilitychange", handleVisibilityChange);

        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
            document.removeEventListener("visibilitychange", handleVisibilityChange);
            setOffline();
        };
    }, [heartbeat, setOffline]);
}
