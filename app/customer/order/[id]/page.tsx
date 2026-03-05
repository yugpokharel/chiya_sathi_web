"use client";

import { useEffect, useState, useRef, use, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
    STATUS_COLORS,
    STATUS_TEXT,
    STATUS_BG,
} from "@/lib/constants";
import type { Order, OrderStatus, OrderItem } from "@/lib/types";
import { useToast } from "@/components/ToastProvider";

const STEPS = ["Placed", "Accepted", "Ready"];

function stepIndex(status: OrderStatus): number {
    switch (status) {
        case "pending":
            return 0;
        case "preparing":
            return 1;
        case "ready":
        case "served":
            return 2;
        default:
            return 0;
    }
}

/** Safely extract an error message from any response */
async function extractError(res: Response, fallback: string): Promise<string> {
    try {
        const data = await res.json();
        if (typeof data?.message === "string") return data.message;
    } catch {
        /* response wasn't JSON */
    }
    return `${fallback} (${res.status})`;
}

export default function OrderStatusPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = use(params);
    const router = useRouter();
    const { toast } = useToast();
    const [order, setOrder] = useState<Order | null>(null);
    const [loading, setLoading] = useState(true);
    const prevStatus = useRef<OrderStatus | null>(null);
    const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

    /* ── Edit mode state ───────────────────────── */
    const [editing, setEditing] = useState(false);
    const [editItems, setEditItems] = useState<OrderItem[]>([]);
    const [saving, setSaving] = useState(false);
    const [cancelling, setCancelling] = useState(false);

    const canEdit =
        order?.status === "pending" || order?.status === "preparing";

    /* ── Fetch single order ───────────────────── */
    const fetchOrder = useCallback(async () => {
        try {
            const res = await fetch(`/api/orders/${id}`);
            if (!res.ok) return;
            const data = await res.json();
            if (data?.data) {
                const newOrder = data.data as Order;

                if (
                    prevStatus.current &&
                    prevStatus.current !== newOrder.status
                ) {
                    if (
                        prevStatus.current === "pending" &&
                        newOrder.status === "preparing"
                    ) {
                        toast("Order Accepted! 🎉", "success");
                    } else if (
                        prevStatus.current === "preparing" &&
                        newOrder.status === "ready"
                    ) {
                        toast("Order Ready! Head to the counter 🎉", "success");
                    } else if (newOrder.status === "cancelled") {
                        toast("Order was cancelled", "error");
                    }
                }
                prevStatus.current = newOrder.status;
                setOrder(newOrder);
            }
        } catch {
            /* silent */
        } finally {
            setLoading(false);
        }
    }, [id, toast]);

    /* ── Polling ───────────────────────────────── */
    useEffect(() => {
        fetchOrder();
        pollRef.current = setInterval(fetchOrder, 10000);
        return () => {
            if (pollRef.current) clearInterval(pollRef.current);
        };
    }, [fetchOrder]);

    // Stop polling on terminal statuses
    useEffect(() => {
        if (
            order?.status === "served" ||
            order?.status === "cancelled"
        ) {
            if (pollRef.current) {
                clearInterval(pollRef.current);
                pollRef.current = null;
            }
        }
    }, [order?.status]);

    /* ── Edit helpers ──────────────────────────── */
    const startEditing = () => {
        if (!order) return;
        setEditItems(order.items.map((i) => ({ ...i })));
        setEditing(true);
    };

    const cancelEditing = () => {
        setEditing(false);
        setEditItems([]);
    };

    const changeQty = (menuItemId: string, delta: number) => {
        setEditItems((prev) =>
            prev.map((i) =>
                i.menuItemId === menuItemId
                    ? { ...i, quantity: Math.max(0, i.quantity + delta) }
                    : i
            )
        );
    };

    const editTotal = editItems
        .filter((i) => i.quantity > 0)
        .reduce((sum, i) => sum + i.price * i.quantity, 0);

    const visibleEditItems = editItems.filter((i) => i.quantity > 0);

    /* ── Save edited items ─────────────────────── */
    const saveEdit = async () => {
        if (!order) return;
        const filtered = editItems.filter((i) => i.quantity > 0);

        // All items removed → cancel order
        if (filtered.length === 0) {
            toast("All items removed — order cancelled", "info");
            await cancelOrder();
            setEditing(false);
            return;
        }

        const newTotal = filtered.reduce(
            (sum, i) => sum + i.price * i.quantity,
            0
        );

        setSaving(true);
        try {
            const res = await fetch(`/api/orders/${order._id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ items: filtered, totalAmount: newTotal }),
            });

            if (!res.ok) {
                const msg = await extractError(res, "Failed to update order");
                toast(msg, "error");
                return; // stay in edit mode
            }

            const data = await res.json();
            if (data?.data) {
                setOrder(data.data as Order);
            }
            toast("Order updated!", "success");
            setEditing(false);
        } catch {
            toast("Failed to update order", "error");
        } finally {
            setSaving(false);
        }
    };

    /* ── Cancel order (with 404 fallback) ──────── */
    const cancelOrder = async () => {
        if (!order) return;
        setCancelling(true);
        try {
            // Try the /status sub-route first
            let res = await fetch(`/api/orders/${order._id}/status`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: "cancelled" }),
            });

            // Fallback: if /status returns 404 or 405, use PUT /orders/:id directly
            if (res.status === 404 || res.status === 405) {
                res = await fetch(`/api/orders/${order._id}`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ status: "cancelled" }),
                });
            }

            if (!res.ok) {
                const msg = await extractError(res, "Failed to cancel order");
                toast(msg, "error");
                return;
            }

            const data = await res.json().catch(() => null);
            if (data?.data) {
                setOrder(data.data as Order);
            } else {
                setOrder((prev) =>
                    prev ? { ...prev, status: "cancelled" } : prev
                );
            }
            prevStatus.current = "cancelled";
            toast("Order cancelled", "success");

            // Stop polling
            if (pollRef.current) {
                clearInterval(pollRef.current);
                pollRef.current = null;
            }
        } catch {
            toast("Failed to cancel order", "error");
        } finally {
            setCancelling(false);
        }
    };

    /* ── Loading / not found ──────────────────── */
    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-orange-200 border-t-orange-600" />
            </div>
        );
    }

    if (!order) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <div className="text-center">
                    <p className="text-sm text-black/50">Order not found</p>
                    <button
                        onClick={() => router.push("/customer")}
                        className="mt-4 text-sm font-semibold text-orange-600"
                    >
                        Go Home
                    </button>
                </div>
            </div>
        );
    }

    const step = stepIndex(order.status);

    return (
        <div className="mx-auto max-w-lg px-4 pt-4 pb-24">
            {/* Header */}
            <div className="flex items-center gap-3">
                <button
                    onClick={() => router.push("/customer")}
                    className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-black/5"
                >
                    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
                        <path d="M15.5 19.5 8 12l7.5-7.5 1.5 1.5L11 12l6 6-1.5 1.5Z" />
                    </svg>
                </button>
                <h1 className="text-lg font-bold">Order Status</h1>
                <div className="ml-auto">
                    <button
                        onClick={fetchOrder}
                        className="flex h-9 items-center gap-1.5 rounded-full bg-white px-3 text-xs font-semibold text-black/60 shadow-sm transition hover:bg-black/5"
                    >
                        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
                            <path d="M17.65 6.35A7.96 7.96 0 0 0 12 4a8 8 0 1 0 8 8h-2a6 6 0 1 1-1.76-4.24L14 10h6V4l-2.35 2.35Z" />
                        </svg>
                        Refresh
                    </button>
                </div>
            </div>

            {/* Status Card */}
            <div className="mt-6 rounded-2xl bg-white p-6 shadow-sm">
                <div className="flex items-center justify-between">
                    <span
                        className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-bold uppercase ${STATUS_COLORS[order.status]}`}
                    >
                        <span
                            className={`h-2 w-2 rounded-full ${STATUS_BG[order.status]}`}
                        />
                        {order.status}
                    </span>
                    <span className="rounded-lg bg-orange-100 px-2.5 py-1 text-xs font-semibold text-orange-700">
                        {order.tableId}
                    </span>
                </div>

                <p className="mt-4 text-center text-sm text-black/70">
                    {STATUS_TEXT[order.status]}
                </p>

                {order.status !== "cancelled" && (
                    <div className="mt-6 flex items-center justify-between">
                        {STEPS.map((s, i) => (
                            <div key={s} className="flex flex-1 items-center">
                                <div className="flex flex-col items-center">
                                    <div
                                        className={
                                            "flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold " +
                                            (i <= step
                                                ? "bg-orange-600 text-white"
                                                : "bg-black/10 text-black/40")
                                        }
                                    >
                                        {i < step ? "✓" : i + 1}
                                    </div>
                                    <span className="mt-1 text-[10px] font-medium text-black/50">
                                        {s}
                                    </span>
                                </div>
                                {i < STEPS.length - 1 && (
                                    <div
                                        className={
                                            "mx-1 h-0.5 flex-1 rounded " +
                                            (i < step
                                                ? "bg-orange-600"
                                                : "bg-black/10")
                                        }
                                    />
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* ── Order Summary ─────────────────────── */}
            <div className="mt-4 rounded-2xl bg-white p-6 shadow-sm">
                {/* Header with edit controls */}
                <div className="flex items-center justify-between">
                    <h2 className="text-sm font-semibold">Order Summary</h2>
                    {canEdit && !editing && (
                        <button
                            onClick={startEditing}
                            className="flex h-8 w-8 items-center justify-center rounded-full text-black/40 transition hover:bg-black/5 hover:text-black/60"
                            title="Edit order"
                        >
                            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
                                <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25Zm2.92-1.17 8.89-8.89 1.75 1.75-8.89 8.89H5.92v-1.75ZM20.71 5.63 18.37 3.29a1 1 0 0 0-1.42 0l-1.83 1.83 3.75 3.75 1.83-1.83a1 1 0 0 0 .01-1.41Z" />
                            </svg>
                        </button>
                    )}
                    {editing && (
                        <div className="flex items-center gap-1">
                            {/* Cancel edit */}
                            <button
                                onClick={cancelEditing}
                                className="flex h-8 w-8 items-center justify-center rounded-full text-black/40 transition hover:bg-black/5 hover:text-black/60"
                                title="Cancel editing"
                            >
                                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
                                    <path d="M19 6.41 17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41Z" />
                                </svg>
                            </button>
                            {/* Save edit */}
                            <button
                                onClick={saveEdit}
                                disabled={saving}
                                className="flex h-8 w-8 items-center justify-center rounded-full text-green-600 transition hover:bg-green-50 disabled:opacity-50"
                                title="Save changes"
                            >
                                {saving ? (
                                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-green-200 border-t-green-600" />
                                ) : (
                                    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
                                        <path d="M9 16.17 4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17Z" />
                                    </svg>
                                )}
                            </button>
                        </div>
                    )}
                </div>

                {/* Items list */}
                <div className="mt-3 space-y-2">
                    {editing ? (
                        <>
                            {visibleEditItems.length === 0 && (
                                <p className="py-4 text-center text-xs text-black/40">
                                    All items removed. Save to cancel order.
                                </p>
                            )}
                            {editItems.map((item) =>
                                item.quantity > 0 ? (
                                    <div
                                        key={item.menuItemId}
                                        className="flex items-center justify-between text-sm"
                                    >
                                        <span className="flex-1 text-black/70 truncate mr-2">
                                            {item.name}
                                        </span>
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() =>
                                                    changeQty(item.menuItemId, -1)
                                                }
                                                className="flex h-7 w-7 items-center justify-center rounded-full bg-red-100 text-red-600 font-bold"
                                            >
                                                −
                                            </button>
                                            <span className="w-6 text-center font-semibold">
                                                {item.quantity}
                                            </span>
                                            <button
                                                onClick={() =>
                                                    changeQty(item.menuItemId, 1)
                                                }
                                                className="flex h-7 w-7 items-center justify-center rounded-full bg-orange-100 text-orange-600 font-bold"
                                            >
                                                +
                                            </button>
                                        </div>
                                        <span className="ml-3 w-20 text-right font-semibold">
                                            Rs. {item.price * item.quantity}
                                        </span>
                                    </div>
                                ) : null
                            )}
                            <div className="border-t border-black/10 pt-2">
                                <div className="flex items-center justify-between text-sm font-bold">
                                    <span>Total</span>
                                    <span className="text-orange-600">
                                        Rs. {editTotal}
                                    </span>
                                </div>
                            </div>
                        </>
                    ) : (
                        <>
                            {order.items.map((item, i) => (
                                <div
                                    key={i}
                                    className="flex items-center justify-between text-sm"
                                >
                                    <span className="text-black/70">
                                        {item.quantity}x {item.name}
                                    </span>
                                    <span className="font-semibold">
                                        Rs. {item.price * item.quantity}
                                    </span>
                                </div>
                            ))}
                            <div className="border-t border-black/10 pt-2">
                                <div className="flex items-center justify-between text-sm font-bold">
                                    <span>Total</span>
                                    <span className="text-orange-600">
                                        Rs. {order.totalAmount}
                                    </span>
                                </div>
                            </div>
                        </>
                    )}
                </div>
                {order.customerNote && (
                    <p className="mt-3 text-xs text-black/50">
                        Note: {order.customerNote}
                    </p>
                )}
            </div>

            {/* ── Action buttons ────────────────────── */}
            {canEdit && !editing && (
                <div className="mt-4 space-y-2">
                    {/* Order More */}
                    <button
                        onClick={() => router.push("/customer/menu")}
                        className="flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-orange-600 text-sm font-semibold text-white shadow-sm transition hover:bg-orange-700"
                    >
                        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
                            <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2Z" />
                        </svg>
                        Order More
                    </button>
                    {/* Cancel Order */}
                    <button
                        onClick={cancelOrder}
                        disabled={cancelling}
                        className="flex h-12 w-full items-center justify-center gap-2 rounded-2xl border border-red-200 bg-red-50 text-sm font-semibold text-red-600 transition hover:bg-red-100 disabled:opacity-50"
                    >
                        {cancelling ? (
                            <div className="h-4 w-4 animate-spin rounded-full border-2 border-red-200 border-t-red-600" />
                        ) : (
                            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
                                <path d="M19 6.41 17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41Z" />
                            </svg>
                        )}
                        {cancelling ? "Cancelling..." : "Cancel Order"}
                    </button>
                </div>
            )}

            {/* Order ID */}
            <p className="mt-4 text-center text-[10px] text-black/30">
                Order ID: {order._id}
            </p>
        </div>
    );
}
