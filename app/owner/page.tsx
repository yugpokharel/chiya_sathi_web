"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { imageUrl, STATUS_COLORS, STATUS_BG } from "@/lib/constants";
import type { User, Order } from "@/lib/types";
import { useToast } from "@/components/ToastProvider";

export default function OwnerHome() {
    const { toast } = useToast();
    const [user, setUser] = useState<User | null>(null);
    const [orders, setOrders] = useState<Order[]>([]);
    const [cafeName, setCafeName] = useState("");

    useEffect(() => {
        try {
            const raw = localStorage.getItem("auth_user");
            if (raw) setUser(JSON.parse(raw));
            setCafeName(localStorage.getItem("cafeName") ?? "");
        } catch {}
    }, []);

    const fetchOrders = useCallback(async () => {
        try {
            const res = await fetch("/api/orders");
            const data = await res.json();
            if (data?.data) setOrders(data.data);
        } catch {}
    }, []);

    useEffect(() => {
        fetchOrders();
        const interval = setInterval(fetchOrders, 10000);
        return () => clearInterval(interval);
    }, [fetchOrders]);

    const avatarUrl = useMemo(() => imageUrl(user?.profilePicture), [user]);

    // Today's stats
    const todayOrders = useMemo(() => {
        const today = new Date().toDateString();
        return orders.filter(
            (o) => new Date(o.createdAt).toDateString() === today
        );
    }, [orders]);

    const todayRevenue = useMemo(() => {
        return todayOrders
            .filter((o) => o.status !== "cancelled")
            .reduce((sum, o) => sum + o.totalAmount, 0);
    }, [todayOrders]);

    const activeOrders = useMemo(() => {
        return orders.filter(
            (o) => o.status === "pending" || o.status === "preparing"
        );
    }, [orders]);

    const updateStatus = async (orderId: string, status: string) => {
        try {
            const res = await fetch(`/api/orders/${orderId}/status`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status }),
            });
            if (res.ok) {
                toast(
                    status === "cancelled"
                        ? "Order declined"
                        : `Order marked ${status}`,
                    status === "cancelled" ? "error" : "success"
                );
                fetchOrders();
            }
        } catch {
            toast("Failed to update order", "error");
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
                                {user?.fullName?.[0] ?? "O"}
                            </div>
                        )}
                    </div>
                    <div>
                        <p className="text-sm font-semibold">{user?.fullName ?? "Owner"}</p>
                        {cafeName && (
                            <span className="inline-flex items-center rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-700">
                                {cafeName}
                            </span>
                        )}
                    </div>
                </div>
            </div>

            {/* Stats */}
            <div className="mt-6 grid grid-cols-2 gap-3">
                <div className="rounded-2xl bg-white p-4 shadow-sm">
                    <p className="text-[10px] uppercase tracking-widest text-black/40">
                        Today&apos;s Orders
                    </p>
                    <p className="mt-1 text-2xl font-bold text-orange-600">
                        {todayOrders.length}
                    </p>
                </div>
                <div className="rounded-2xl bg-white p-4 shadow-sm">
                    <p className="text-[10px] uppercase tracking-widest text-black/40">
                        Today&apos;s Revenue
                    </p>
                    <p className="mt-1 text-2xl font-bold text-green-600">
                        Rs. {todayRevenue}
                    </p>
                </div>
            </div>

            {/* Active Orders */}
            <div className="mt-6">
                <h2 className="text-sm font-semibold text-black/70">
                    Active Orders ({activeOrders.length})
                </h2>
                <div className="mt-3 space-y-3">
                    {activeOrders.length === 0 && (
                        <div className="rounded-2xl bg-white p-6 text-center shadow-sm">
                            <p className="text-sm text-black/50">No active orders</p>
                        </div>
                    )}

                    {activeOrders.map((order) => (
                        <div
                            key={order._id}
                            className="rounded-2xl bg-white shadow-sm overflow-hidden"
                        >
                            <div className="flex items-center justify-between p-4 pb-2">
                                <div className="flex items-center gap-2">
                                    <span className="text-xs font-mono text-black/40">
                                        #{order._id.slice(-6)}
                                    </span>
                                    <span
                                        className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase ${STATUS_COLORS[order.status]}`}
                                    >
                                        <span className={`h-1.5 w-1.5 rounded-full ${STATUS_BG[order.status]}`} />
                                        {order.status}
                                    </span>
                                </div>
                                <span className="rounded-lg bg-orange-100 px-2 py-0.5 text-xs font-semibold text-orange-700">
                                    {order.tableId}
                                </span>
                            </div>

                            <div className="px-4 pb-2">
                                {order.items.map((item, i) => (
                                    <p key={i} className="text-xs text-black/60">
                                        {item.quantity}x {item.name}
                                    </p>
                                ))}
                                <p className="mt-1 text-sm font-bold text-orange-600">
                                    Rs. {order.totalAmount}
                                </p>
                            </div>

                            <div className="flex gap-2 border-t border-black/5 p-3">
                                {order.status === "pending" && (
                                    <>
                                        <button
                                            onClick={() =>
                                                updateStatus(order._id, "cancelled")
                                            }
                                            className="flex-1 rounded-xl border border-red-200 py-2 text-xs font-semibold text-red-600 transition hover:bg-red-50"
                                        >
                                            Decline
                                        </button>
                                        <button
                                            onClick={() =>
                                                updateStatus(order._id, "preparing")
                                            }
                                            className="flex-1 rounded-xl bg-orange-600 py-2 text-xs font-semibold text-white transition hover:bg-orange-700"
                                        >
                                            Accept
                                        </button>
                                    </>
                                )}
                                {order.status === "preparing" && (
                                    <button
                                        onClick={() =>
                                            updateStatus(order._id, "ready")
                                        }
                                        className="flex-1 rounded-xl bg-green-600 py-2 text-xs font-semibold text-white transition hover:bg-green-700"
                                    >
                                        Mark Ready
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
