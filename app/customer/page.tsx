"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { imageUrl } from "@/lib/constants";
import type { User, Order } from "@/lib/types";

const CATEGORIES = [
    { name: "Tea", icon: "☕", color: "from-amber-400 to-amber-600" },
    { name: "Coffee", icon: "☕", color: "from-orange-400 to-orange-600" },
    { name: "Cigarette", icon: "🚬", color: "from-gray-400 to-gray-600" },
    { name: "Snacks", icon: "🍽️", color: "from-emerald-400 to-emerald-600" },
];

export default function CustomerHome() {
    const [user, setUser] = useState<User | null>(null);
    const [tableId, setTableId] = useState<string>("");
    const [tableInput, setTableInput] = useState("");
    const [showTableInput, setShowTableInput] = useState(false);
    const [activeOrder, setActiveOrder] = useState<Order | null>(null);

    useEffect(() => {
        try {
            const raw = localStorage.getItem("auth_user");
            if (raw) setUser(JSON.parse(raw));
        } catch {}

        const stored = localStorage.getItem("tableId");
        if (stored) setTableId(stored);
    }, []);

    // Check for active order
    useEffect(() => {
        const checkOrder = async () => {
            try {
                const res = await fetch("/api/orders");
                const data = await res.json();
                if (data?.data) {
                    const active = data.data.find(
                        (o: Order) =>
                            o.status === "pending" ||
                            o.status === "preparing" ||
                            o.status === "ready"
                    );
                    if (active) setActiveOrder(active);
                }
            } catch {}
        };
        checkOrder();
    }, []);

    const avatarUrl = useMemo(() => imageUrl(user?.profilePicture), [user]);

    const handleSetTable = () => {
        if (tableInput.trim()) {
            localStorage.setItem("tableId", tableInput.trim());
            setTableId(tableInput.trim());
            setShowTableInput(false);
            setTableInput("");
        }
    };

    return (
        <div className="mx-auto max-w-lg px-4 pt-4">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 overflow-hidden rounded-full border-2 border-white bg-amber-100 shadow">
                        {avatarUrl ? (
                            <img src={avatarUrl} alt="" className="h-full w-full object-cover" />
                        ) : (
                            <div className="flex h-full w-full items-center justify-center text-sm font-bold text-amber-700">
                                {user?.fullName?.[0] ?? "C"}
                            </div>
                        )}
                    </div>
                    <div>
                        <p className="text-xs text-black/50">Welcome back</p>
                        <p className="text-sm font-semibold">{user?.fullName ?? "Customer"}</p>
                    </div>
                </div>

                {activeOrder && (
                    <Link
                        href={`/customer/order/${activeOrder._id}`}
                        className="flex items-center gap-2 rounded-full bg-green-100 px-3 py-1.5 text-xs font-semibold text-green-700"
                    >
                        <span className="h-2 w-2 animate-pulse rounded-full bg-green-500" />
                        Active Order
                    </Link>
                )}
            </div>

            {/* Banner */}
            <div className="mt-6 rounded-2xl bg-gradient-to-br from-orange-400 to-orange-600 p-6 text-white shadow-lg">
                <div className="flex items-center gap-2">
                    <span
                        className={
                            "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider " +
                            (tableId
                                ? "bg-green-500/90 text-white"
                                : "bg-white/20 text-white/90")
                        }
                    >
                        <span
                            className={
                                "h-1.5 w-1.5 rounded-full " +
                                (tableId ? "bg-white" : "bg-white/60")
                            }
                        />
                        {tableId ? "Online" : "Offline"}
                    </span>
                </div>
                <h1 className="mt-3 text-xl font-bold">Chiya Sathi</h1>
                <p className="mt-1 text-sm text-white/80">
                    Order smart. Serve faster.
                </p>
                {tableId && (
                    <p className="mt-2 text-xs text-white/70">
                        Table: {tableId}
                    </p>
                )}
            </div>

            {/* Quick Actions */}
            <div className="mt-6 space-y-3">
                <h2 className="text-sm font-semibold text-black/70">Quick Actions</h2>

                {/* Table entry */}
                {!showTableInput ? (
                    <button
                        onClick={() => setShowTableInput(true)}
                        className="flex w-full items-center gap-4 rounded-2xl bg-white p-4 shadow-sm transition hover:shadow-md"
                    >
                        <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-100 text-orange-600">
                            <svg viewBox="0 0 24 24" className="h-6 w-6" fill="currentColor">
                                <path d="M4 4h6v6H4V4Zm10 0h6v6h-6V4ZM4 14h6v6H4v-6Zm10 3h6v3h-6v-3ZM14 14h6v2h-6v-2Z" />
                            </svg>
                        </span>
                        <div className="text-left">
                            <p className="text-sm font-semibold">
                                {tableId ? "Change Table Number" : "Enter Table Number"}
                            </p>
                            <p className="text-xs text-black/50">
                                {tableId
                                    ? `Currently: ${tableId}`
                                    : "Required before ordering"}
                            </p>
                        </div>
                    </button>
                ) : (
                    <div className="rounded-2xl bg-white p-4 shadow-sm">
                        <p className="mb-3 text-sm font-semibold">Enter your table number</p>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={tableInput}
                                onChange={(e) => setTableInput(e.target.value)}
                                placeholder="e.g. T1, T5..."
                                className="h-11 flex-1 rounded-xl border border-black/10 bg-[#f8f5ef] px-4 text-sm outline-none focus:border-orange-500"
                                onKeyDown={(e) =>
                                    e.key === "Enter" && handleSetTable()
                                }
                                autoFocus
                            />
                            <button
                                onClick={handleSetTable}
                                className="h-11 rounded-xl bg-orange-600 px-5 text-sm font-semibold text-white"
                            >
                                Set
                            </button>
                            <button
                                onClick={() => setShowTableInput(false)}
                                className="h-11 rounded-xl border border-black/10 px-3 text-sm text-black/60"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                )}

                {/* View active order */}
                {activeOrder && (
                    <Link
                        href={`/customer/order/${activeOrder._id}`}
                        className="flex w-full items-center gap-4 rounded-2xl bg-white p-4 shadow-sm transition hover:shadow-md"
                    >
                        <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-100 text-green-600">
                            <svg viewBox="0 0 24 24" className="h-6 w-6" fill="currentColor">
                                <path d="M9 16.17 4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17Z" />
                            </svg>
                        </span>
                        <div className="text-left">
                            <p className="text-sm font-semibold">View Order</p>
                            <p className="text-xs text-black/50">
                                Status: {activeOrder.status}
                            </p>
                        </div>
                    </Link>
                )}
            </div>

            {/* Browse Menu */}
            {tableId && (
                <div className="mt-8 space-y-3">
                    <h2 className="text-sm font-semibold text-black/70">
                        Browse Menu
                    </h2>
                    <div className="grid grid-cols-2 gap-3">
                        {CATEGORIES.map((cat) => (
                            <Link
                                key={cat.name}
                                href={`/customer/menu/${cat.name}`}
                                className="group relative overflow-hidden rounded-2xl bg-white shadow-sm transition hover:shadow-md"
                            >
                                <div
                                    className={`flex h-28 flex-col items-center justify-center bg-gradient-to-br ${cat.color} text-white`}
                                >
                                    <span className="text-3xl">{cat.icon}</span>
                                    <span className="mt-2 text-sm font-semibold">
                                        {cat.name}
                                    </span>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            )}

            {!tableId && (
                <div className="mt-8 rounded-2xl border border-dashed border-orange-300 bg-orange-50 p-6 text-center">
                    <p className="text-sm font-semibold text-orange-700">
                        Enter your table number to browse the menu
                    </p>
                    <p className="mt-1 text-xs text-orange-600/70">
                        Tap &quot;Enter Table Number&quot; above to get started
                    </p>
                </div>
            )}
        </div>
    );
}
