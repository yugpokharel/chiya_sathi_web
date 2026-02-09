"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

type StoredUser = {
    fullName?: string;
    username?: string;
    email?: string;
    phoneNumber?: string;
    profilePicture?: string | null;
};

const API_ORIGIN =
    process.env.NEXT_PUBLIC_API_ORIGIN ?? "http://127.0.0.1:5000";

export default function ProfilePage() {
    const [user, setUser] = useState<StoredUser | null>(null);

    useEffect(() => {
        const raw = localStorage.getItem("auth_user");
        if (!raw) {
            setUser(null);
            return;
        }

        try {
            setUser(JSON.parse(raw) as StoredUser);
        } catch {
            setUser(null);
        }
    }, []);

    const avatarUrl = useMemo(() => {
        if (!user?.profilePicture) {
            return null;
        }

        if (user.profilePicture.startsWith("http")) {
            return user.profilePicture;
        }

        return `${API_ORIGIN}${user.profilePicture}`;
    }, [user]);

    if (!user) {
        return (
            <section className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
                <div className="rounded-2xl border border-black/10 bg-white/90 p-8 text-center shadow-sm">
                    <h1 className="text-2xl font-semibold text-foreground">
                        Your profile is empty
                    </h1>
                    <p className="mt-3 text-sm text-foreground/60">
                        Log in to view your saved credentials and profile photo.
                    </p>
                    <div className="mt-6 flex justify-center gap-3">
                        <Link
                            href="/login"
                            className="inline-flex h-11 items-center justify-center rounded-md bg-foreground px-5 text-sm font-semibold text-background"
                        >
                            Log in
                        </Link>
                        <Link
                            href="/register"
                            className="inline-flex h-11 items-center justify-center rounded-md border border-black/10 px-5 text-sm font-semibold text-foreground"
                        >
                            Create account
                        </Link>
                    </div>
                </div>
            </section>
        );
    }

    return (
        <section className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
            <div className="grid gap-8 lg:grid-cols-[240px_1fr]">
                <div className="rounded-2xl border border-black/10 bg-white/90 p-6 shadow-sm">
                    <div className="flex flex-col items-center gap-4">
                        <div className="h-28 w-28 overflow-hidden rounded-full border border-black/10 bg-amber-100">
                            {avatarUrl ? (
                                <img
                                    src={avatarUrl}
                                    alt="Profile"
                                    className="h-full w-full object-cover"
                                />
                            ) : (
                                <div className="flex h-full w-full items-center justify-center text-2xl font-semibold text-amber-700">
                                    {user.fullName?.[0] ?? "C"}
                                </div>
                            )}
                        </div>
                        <div className="text-center">
                            <p className="text-lg font-semibold text-foreground">
                                {user.fullName ?? "ChiyaSathi User"}
                            </p>
                            <p className="text-sm text-foreground/60">
                                @{user.username ?? "username"}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="rounded-2xl border border-black/10 bg-white/90 p-6 shadow-sm">
                        <h2 className="text-lg font-semibold text-foreground">
                            Credentials
                        </h2>
                        <div className="mt-4 grid gap-4 sm:grid-cols-2">
                            <div className="rounded-xl border border-black/5 bg-white p-4">
                                <p className="text-xs uppercase tracking-[0.2em] text-foreground/50">
                                    Email
                                </p>
                                <p className="mt-2 text-sm font-medium text-foreground">
                                    {user.email ?? "-"}
                                </p>
                            </div>
                            <div className="rounded-xl border border-black/5 bg-white p-4">
                                <p className="text-xs uppercase tracking-[0.2em] text-foreground/50">
                                    Phone
                                </p>
                                <p className="mt-2 text-sm font-medium text-foreground">
                                    {user.phoneNumber ?? "-"}
                                </p>
                            </div>
                            <div className="rounded-xl border border-black/5 bg-white p-4 sm:col-span-2">
                                <p className="text-xs uppercase tracking-[0.2em] text-foreground/50">
                                    Profile image
                                </p>
                                <p className="mt-2 text-sm text-foreground/60">
                                    {user.profilePicture ?? "No file on record"}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6">
                        <h3 className="text-base font-semibold text-foreground">
                            Keep your cup warm
                        </h3>
                        <p className="mt-2 text-sm text-foreground/60">
                            Update your profile in the mobile app and your web
                            experience stays synced.
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
}
