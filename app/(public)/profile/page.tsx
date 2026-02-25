"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function ProfileRedirect() {
    const router = useRouter();

    useEffect(() => {
        const role = localStorage.getItem("userRole");
        const token = localStorage.getItem("auth_token");

        if (!token) {
            router.push("/login");
            return;
        }

        if (role === "owner") {
            router.push("/owner/profile");
        } else {
            router.push("/customer/profile");
        }
    }, [router]);

    return (
        <div className="flex min-h-screen items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-orange-200 border-t-orange-600" />
        </div>
    );
}
