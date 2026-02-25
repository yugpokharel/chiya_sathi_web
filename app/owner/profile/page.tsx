"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { imageUrl } from "@/lib/constants";
import type { User } from "@/lib/types";
import { useToast } from "@/components/ToastProvider";

export default function OwnerProfile() {
    const router = useRouter();
    const { toast } = useToast();
    const [user, setUser] = useState<User | null>(null);
    const [cafeName, setCafeName] = useState("");
    const [cafeAddress, setCafeAddress] = useState("");
    const fileRef = useRef<HTMLInputElement>(null);
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        try {
            const raw = localStorage.getItem("auth_user");
            if (raw) setUser(JSON.parse(raw));
            setCafeName(localStorage.getItem("cafeName") ?? "");
            setCafeAddress(localStorage.getItem("cafeAddress") ?? "");
        } catch {}
    }, []);

    const avatarUrl = useMemo(() => imageUrl(user?.profilePicture), [user]);

    const handleUpload = async (file: File) => {
        setUploading(true);
        try {
            const fd = new FormData();
            fd.append("profilePicture", file);
            const res = await fetch("/api/auth/profile-picture", {
                method: "PUT",
                body: fd,
            });
            const data = await res.json();
            if (res.ok && data?.data?.profilePicture) {
                const updated = { ...user!, profilePicture: data.data.profilePicture };
                setUser(updated);
                localStorage.setItem("auth_user", JSON.stringify(updated));
                toast("Profile picture updated!", "success");
            } else {
                toast(data?.message ?? "Upload failed", "error");
            }
        } catch {
            toast("Upload failed", "error");
        } finally {
            setUploading(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem("auth_token");
        localStorage.removeItem("auth_user");
        localStorage.removeItem("userRole");
        localStorage.removeItem("cafeName");
        localStorage.removeItem("cafeAddress");
        localStorage.removeItem("tableId");
        document.cookie = "auth_token=; path=/; max-age=0";
        router.push("/login");
    };

    if (!user) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-orange-200 border-t-orange-600" />
            </div>
        );
    }

    return (
        <div className="mx-auto max-w-lg px-4 pt-6">
            <h1 className="text-xl font-bold">Owner Profile</h1>

            {/* Avatar */}
            <div className="mt-6 flex flex-col items-center">
                <div className="relative">
                    <div className="h-24 w-24 overflow-hidden rounded-full border-4 border-white bg-amber-100 shadow-lg">
                        {avatarUrl ? (
                            <img src={avatarUrl} alt="" className="h-full w-full object-cover" />
                        ) : (
                            <div className="flex h-full w-full items-center justify-center text-2xl font-bold text-amber-700">
                                {user.fullName?.[0] ?? "O"}
                            </div>
                        )}
                    </div>
                    <button
                        onClick={() => fileRef.current?.click()}
                        disabled={uploading}
                        className="absolute bottom-0 right-0 flex h-8 w-8 items-center justify-center rounded-full bg-orange-600 text-white shadow transition hover:bg-orange-700 disabled:opacity-50"
                    >
                        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
                            <path d="M12 15.2a3.2 3.2 0 1 0 0-6.4 3.2 3.2 0 0 0 0 6.4ZM9 2l1.83 2H18a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h1.17L9 2Zm3 15a5 5 0 1 1 0-10 5 5 0 0 1 0 10Z" />
                        </svg>
                    </button>
                    <input
                        ref={fileRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                            const f = e.target.files?.[0];
                            if (f) handleUpload(f);
                        }}
                    />
                </div>
                <h2 className="mt-3 text-lg font-bold">{user.fullName}</h2>
                <p className="text-sm text-black/50">@{user.username}</p>
                {cafeName && (
                    <span className="mt-1 inline-flex items-center rounded-full bg-amber-100 px-3 py-0.5 text-xs font-semibold text-amber-700">
                        {cafeName}
                    </span>
                )}
            </div>

            {/* Info */}
            <div className="mt-6 space-y-3">
                <div className="rounded-2xl bg-white p-4 shadow-sm">
                    <p className="text-[10px] uppercase tracking-widest text-black/40">
                        Email
                    </p>
                    <p className="mt-1 text-sm font-medium">{user.email}</p>
                </div>
                <div className="rounded-2xl bg-white p-4 shadow-sm">
                    <p className="text-[10px] uppercase tracking-widest text-black/40">
                        Phone
                    </p>
                    <p className="mt-1 text-sm font-medium">{user.phoneNumber}</p>
                </div>
            </div>

            {/* Cafe Details */}
            {(cafeName || cafeAddress) && (
                <div className="mt-6">
                    <h3 className="text-sm font-semibold text-black/70">Cafe Details</h3>
                    <div className="mt-3 space-y-3">
                        {cafeName && (
                            <div className="rounded-2xl bg-white p-4 shadow-sm">
                                <p className="text-[10px] uppercase tracking-widest text-black/40">
                                    Cafe Name
                                </p>
                                <p className="mt-1 text-sm font-medium">{cafeName}</p>
                            </div>
                        )}
                        {cafeAddress && (
                            <div className="rounded-2xl bg-white p-4 shadow-sm">
                                <p className="text-[10px] uppercase tracking-widest text-black/40">
                                    Cafe Address
                                </p>
                                <p className="mt-1 text-sm font-medium">{cafeAddress}</p>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Logout */}
            <div className="mt-6">
                <button
                    onClick={handleLogout}
                    className="flex w-full items-center gap-3 rounded-2xl bg-white p-4 shadow-sm transition hover:shadow-md"
                >
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-100 text-red-600">
                        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
                            <path d="M5 5h7V3H3v18h9v-2H5V5Zm16 7-5-5v3H9v4h7v3l5-5Z" />
                        </svg>
                    </span>
                    <span className="text-sm font-medium text-red-600">Logout</span>
                </button>
            </div>

            {/* About */}
            <div className="mt-6 rounded-2xl border border-orange-200 bg-orange-50 p-4">
                <p className="text-xs font-semibold text-orange-700">About ChiyaSathi</p>
                <p className="mt-1 text-xs text-orange-600/80">
                    Order smart. Serve faster. Manage better. Version 1.0
                </p>
            </div>
        </div>
    );
}
