"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { STATUS_COLORS, STATUS_BG } from "@/lib/constants";
import type { Order } from "@/lib/types";
import { useToast } from "@/components/ToastProvider";

type Tab = "pending" | "preparing" | "ready" | "history";

function timeAgo(dateStr: string): string {
    const diff = Date.now() - new Date(dateStr).getTime();
    const min = Math.floor(diff / 60000);
    if (min < 1) return "just now";
    if (min < 60) return `${min}m ago`;
    const hr = Math.floor(min / 60);
    if (hr < 24) return `${hr}h ago`;
    return `${Math.floor(hr / 24)}d ago`;
}

export default function OwnerOrders() {
    const { toast } = useToast();
    const [orders, setOrders] = useState<Order[]>([]);
    const [tab, setTab] = useState<Tab>("pending");
    const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

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

    const filtered = useMemo(() => {
        switch (tab) {
            case "pending":
                return orders.filter((o) => o.status === "pending");
            case "preparing":
                return orders.filter((o) => o.status === "preparing");
            case "ready":
                return orders.filter((o) => o.status === "ready");
            case "history":
                return orders.filter(
                    (o) => o.status === "served" || o.status === "cancelled"
                );
        }
    }, [orders, tab]);

    const counts = useMemo(() => ({
        pending: orders.filter((o) => o.status === "pending").length,
        preparing: orders.filter((o) => o.status === "preparing").length,
        ready: orders.filter((o) => o.status === "ready").length,
        history: orders.filter(
            (o) => o.status === "served" || o.status === "cancelled"
        ).length,
    }), [orders]);

    const updateStatus = async (orderId: string, status: string) => {
        try {
            const res = await fetch(`/api/orders/${orderId}/status`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status }),
            });
            if (res.ok) {
                toast(`Order marked ${status}`, "success");
                fetchOrders();
            }
        } catch {
            toast("Failed to update", "error");
        }
    };

    const deleteOrder = async (orderId: string) => {
        try {
            const res = await fetch(`/api/orders/${orderId}`, {
                method: "DELETE",
            });
            if (res.ok) {
                toast("Order deleted", "success");
                setConfirmDelete(null);
                fetchOrders();
            }
        } catch {
            toast("Delete failed", "error");
        }
    };

    const TABS: { key: Tab; label: string }[] = [
        { key: "pending", label: "Pending" },
        { key: "preparing", label: "Preparing" },
        { key: "ready", label: "Ready" },
        { key: "history", label: "History" },
    ];

    return (
        <div className="mx-auto max-w-lg px-4 pt-6">
            <h1 className="text-xl font-bold">Orders</h1>

            {/* Tabs */}
            <div className="mt-4 flex gap-1 rounded-xl bg-white p-1 shadow-sm">
                {TABS.map((t) => (
                    <button
                        key={t.key}
                        onClick={() => setTab(t.key)}
                        className={
                            "flex-1 rounded-lg py-2 text-xs font-semibold transition " +
                            (tab === t.key
                                ? "bg-orange-600 text-white shadow"
                                : "text-black/50 hover:text-black/70")
                        }
                    >
                        {t.label} ({counts[t.key]})
                    </button>
                ))}
            </div>

            {/* Orders */}
            <div className="mt-4 space-y-3">
                {filtered.length === 0 && (
                    <div className="rounded-2xl bg-white p-8 text-center shadow-sm">
                        <p className="text-sm text-black/50">No orders here</p>
                    </div>
                )}

                {filtered.map((order) => (
                    <div
                        key={order._id}
                        className="overflow-hidden rounded-2xl bg-white shadow-sm"
                    >
                        {/* Header */}
                        <div
                            className={`flex items-center justify-between px-4 py-3 ${
                                order.status === "pending"
                                    ? "bg-orange-50"
                                    : order.status === "preparing"
                                    ? "bg-blue-50"
                                    : order.status === "ready"
                                    ? "bg-green-50"
                                    : order.status === "cancelled"
                                    ? "bg-red-50"
                                    : "bg-gray-50"
                            }`}
                        >
                            <div className="flex items-center gap-2">
                                <span className="text-xs font-mono text-black/40">
                                    #{order._id.slice(-6)}
                                </span>
                                <span
                                    className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase ${STATUS_COLORS[order.status]}`}
                                >
                                    <span
                                        className={`h-1.5 w-1.5 rounded-full ${STATUS_BG[order.status]}`}
                                    />
                                    {order.status}
                                </span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="rounded-lg bg-orange-100 px-2 py-0.5 text-xs font-semibold text-orange-700">
                                    {order.tableId}
                                </span>
                                <span className="text-[10px] text-black/40">
                                    {timeAgo(order.createdAt)}
                                </span>
                            </div>
                        </div>

                        {/* Items */}
                        <div className="px-4 py-3">
                            {order.items.map((item, i) => (
                                <div key={i} className="flex justify-between text-xs text-black/60">
                                    <span>
                                        {item.quantity}x {item.name}
                                    </span>
                                    <span>Rs. {item.price * item.quantity}</span>
                                </div>
                            ))}
                            <div className="mt-2 border-t border-black/5 pt-2">
                                <div className="flex justify-between text-sm font-bold">
                                    <span>Total</span>
                                    <span className="text-orange-600">
                                        Rs. {order.totalAmount}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2 border-t border-black/5 p-3">
                            {order.status === "pending" && (
                                <>
                                    <button
                                        onClick={() =>
                                            updateStatus(order._id, "cancelled")
                                        }
                                        className="flex-1 rounded-xl border border-red-200 py-2 text-xs font-semibold text-red-600 hover:bg-red-50"
                                    >
                                        Decline
                                    </button>
                                    <button
                                        onClick={() =>
                                            updateStatus(order._id, "preparing")
                                        }
                                        className="flex-1 rounded-xl bg-orange-600 py-2 text-xs font-semibold text-white hover:bg-orange-700"
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
                                    className="flex-1 rounded-xl bg-green-600 py-2 text-xs font-semibold text-white hover:bg-green-700"
                                >
                                    Mark Ready
                                </button>
                            )}
                            {order.status === "ready" && (
                                <button
                                    onClick={() =>
                                        updateStatus(order._id, "served")
                                    }
                                    className="flex-1 rounded-xl bg-gray-800 py-2 text-xs font-semibold text-white hover:bg-gray-900"
                                >
                                    Mark Served
                                </button>
                            )}
                            {tab === "history" && (
                                <>
                                    {confirmDelete === order._id ? (
                                        <div className="flex flex-1 gap-2">
                                            <button
                                                onClick={() => setConfirmDelete(null)}
                                                className="flex-1 rounded-xl border border-black/10 py-2 text-xs font-semibold text-black/60"
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                onClick={() => deleteOrder(order._id)}
                                                className="flex-1 rounded-xl bg-red-600 py-2 text-xs font-semibold text-white"
                                            >
                                                Confirm Delete
                                            </button>
                                        </div>
                                    ) : (
                                        <button
                                            onClick={() =>
                                                setConfirmDelete(order._id)
                                            }
                                            className="flex-1 rounded-xl border border-red-200 py-2 text-xs font-semibold text-red-600 hover:bg-red-50"
                                        >
                                            Delete
                                        </button>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
