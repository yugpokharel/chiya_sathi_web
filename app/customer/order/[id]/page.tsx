"use client";

import { useEffect, useState, useRef, use, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
    STATUS_COLORS,
    STATUS_TEXT,
    STATUS_BG,
} from "@/lib/constants";
import type { Order, OrderStatus } from "@/lib/types";
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

    const fetchOrder = useCallback(async () => {
        try {
            const res = await fetch(`/api/orders/${id}`);
            const data = await res.json();
            if (data?.data) {
                const newOrder = data.data as Order;

                // Notify on status change
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
        } catch {} finally {
            setLoading(false);
        }
    }, [id, toast]);

    useEffect(() => {
        fetchOrder();
        const interval = setInterval(fetchOrder, 5000);
        return () => clearInterval(interval);
    }, [fetchOrder]);

    // Stop polling when served or cancelled
    useEffect(() => {
        if (
            order?.status === "served" ||
            order?.status === "cancelled"
        ) {
            // polling will still run but it's cheap
        }
    }, [order?.status]);

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
        <div className="mx-auto max-w-lg px-4 pt-4">
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
                {/* Status badge */}
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

                {/* Status text */}
                <p className="mt-4 text-center text-sm text-black/70">
                    {STATUS_TEXT[order.status]}
                </p>

                {/* Progress steps */}
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

            {/* Order Summary */}
            <div className="mt-4 rounded-2xl bg-white p-6 shadow-sm">
                <h2 className="text-sm font-semibold">Order Summary</h2>
                <div className="mt-3 space-y-2">
                    {order.items.map((item, i) => (
                        <div key={i} className="flex items-center justify-between text-sm">
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
                </div>
                {order.customerNote && (
                    <p className="mt-3 text-xs text-black/50">
                        Note: {order.customerNote}
                    </p>
                )}
            </div>

            {/* Order ID */}
            <p className="mt-4 text-center text-[10px] text-black/30">
                Order ID: {order._id}
            </p>
        </div>
    );
}
