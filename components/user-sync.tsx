"use client";

import { useUser } from "@clerk/nextjs";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useEffect } from "react";

export function UserSync() {
    const { user, isSignedIn } = useUser();
    const storeUser = useMutation(api.users.store);

    useEffect(() => {
        if (isSignedIn && user) {
            storeUser();
        }
    }, [isSignedIn, user, storeUser]);

    return null;
}
