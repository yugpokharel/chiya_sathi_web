"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { imageUrl, CATEGORY_ICONS } from "@/lib/constants";
import type { MenuItem, CartItem } from "@/lib/types";
import { useToast } from "@/components/ToastProvider";

export default function CategoryMenuPage({
    params,
}: {
    params: Promise<{ category: string }>;
}) {
    const { category } = use(params);
    const decodedCategory = decodeURIComponent(category);
    const router = useRouter();
    const { toast } = useToast();
    const [items, setItems] = useState<MenuItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [cart, setCart] = useState<CartItem[]>([]);
    const [submitting, setSubmitting] = useState(false);
    const [note, setNote] = useState("");

    useEffect(() => {
        const fetchMenu = async () => {
            try {
                const res = await fetch("/api/menu");
                const data = await res.json();
                if (data?.data) {
                    setItems(
                        data.data.filter(
                            (i: MenuItem) =>
                                i.category.toLowerCase() ===
                                decodedCategory.toLowerCase()
                        )
                    );
                }
            } catch {
                toast("Failed to load menu", "error");
            } finally {
                setLoading(false);
            }
        };
        fetchMenu();
    }, [decodedCategory, toast]);

    const addToCart = (item: MenuItem) => {
        setCart((prev) => {
            const existing = prev.find((c) => c.menuItemId === item._id);
            if (existing) {
                return prev.map((c) =>
                    c.menuItemId === item._id
                        ? { ...c, quantity: c.quantity + 1 }
                        : c
                );
            }
            return [
                ...prev,
                {
                    menuItemId: item._id,
                    name: item.name,
                    price: item.price,
                    quantity: 1,
                    category: item.category,
                },
            ];
        });
    };

    const removeFromCart = (menuItemId: string) => {
        setCart((prev) => {
            const existing = prev.find((c) => c.menuItemId === menuItemId);
            if (!existing) return prev;
            if (existing.quantity <= 1) {
                return prev.filter((c) => c.menuItemId !== menuItemId);
            }
            return prev.map((c) =>
                c.menuItemId === menuItemId
                    ? { ...c, quantity: c.quantity - 1 }
                    : c
            );
        });
    };

    const getQty = (id: string) =>
        cart.find((c) => c.menuItemId === id)?.quantity ?? 0;

    const totalAmount = cart.reduce(
        (sum, c) => sum + c.price * c.quantity,
        0
    );
    const totalItems = cart.reduce((sum, c) => sum + c.quantity, 0);

    const placeOrder = async () => {
        const tableId = localStorage.getItem("tableId");
        if (!tableId) {
            toast("Please set your table number first", "error");
            return;
        }
        if (cart.length === 0) return;

        setSubmitting(true);
        try {
            const res = await fetch("/api/orders", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    tableId,
                    items: cart,
                    totalAmount,
                    customerNote: note || undefined,
                }),
            });
            const data = await res.json();
            if (!res.ok) {
                toast(data?.message ?? "Order failed", "error");
                return;
            }
            toast("Order placed!", "success");
            setCart([]);
            const orderId = data?.data?._id;
            if (orderId) {
                router.push(`/customer/order/${orderId}`);
            }
        } catch {
            toast("Failed to place order", "error");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="mx-auto max-w-lg px-4 pt-4 pb-32">
            {/* Header */}
            <div className="flex items-center gap-3">
                <button
                    onClick={() => router.back()}
                    className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-black/5"
                >
                    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
                        <path d="M15.5 19.5 8 12l7.5-7.5 1.5 1.5L11 12l6 6-1.5 1.5Z" />
                    </svg>
                </button>
                <div>
                    <h1 className="text-lg font-bold">
                        {CATEGORY_ICONS[decodedCategory] ?? "📋"}{" "}
                        {decodedCategory}
                    </h1>
                    <p className="text-xs text-black/50">
                        {items.length} items available
                    </p>
                </div>
            </div>

            {/* Items */}
            <div className="mt-6 space-y-3">
                {loading &&
                    Array.from({ length: 3 }).map((_, i) => (
                        <div
                            key={i}
                            className="h-24 animate-pulse rounded-2xl bg-white shadow-sm"
                        />
                    ))}

                {!loading && items.length === 0 && (
                    <div className="rounded-2xl bg-white p-8 text-center shadow-sm">
                        <p className="text-sm text-black/50">
                            No items in this category yet
                        </p>
                    </div>
                )}

                {items.map((item) => {
                    const qty = getQty(item._id);
                    const imgSrc = imageUrl(item.image);
                    return (
                        <div
                            key={item._id}
                            className="flex items-center gap-4 rounded-2xl bg-white p-4 shadow-sm"
                        >
                            <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-xl bg-orange-50">
                                {imgSrc ? (
                                    <img
                                        src={imgSrc}
                                        alt={item.name}
                                        className="h-full w-full object-cover"
                                    />
                                ) : (
                                    <div className="flex h-full w-full items-center justify-center text-2xl">
                                        {CATEGORY_ICONS[item.category] ?? "📋"}
                                    </div>
                                )}
                            </div>
                            <div className="flex-1">
                                <p className="text-sm font-semibold">
                                    {item.name}
                                </p>
                                <p className="text-sm font-bold text-orange-600">
                                    Rs. {item.price}
                                </p>
                            </div>
                            <div className="flex items-center gap-2">
                                {qty > 0 && (
                                    <>
                                        <button
                                            onClick={() =>
                                                removeFromCart(item._id)
                                            }
                                            className="flex h-8 w-8 items-center justify-center rounded-full bg-red-100 text-red-600 text-lg font-bold"
                                        >
                                            −
                                        </button>
                                        <span className="w-6 text-center text-sm font-bold">
                                            {qty}
                                        </span>
                                    </>
                                )}
                                <button
                                    onClick={() => addToCart(item)}
                                    className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-100 text-orange-600 text-lg font-bold"
                                >
                                    +
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Customer Note */}
            {cart.length > 0 && (
                <div className="mt-4">
                    <input
                        type="text"
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                        placeholder="Add a note (optional)"
                        className="h-11 w-full rounded-xl border border-black/10 bg-white px-4 text-sm outline-none focus:border-orange-500"
                    />
                </div>
            )}

            {/* Floating Cart Summary */}
            {cart.length > 0 && (
                <div className="fixed bottom-20 left-0 right-0 z-40 px-4">
                    <div className="mx-auto max-w-lg">
                        <button
                            onClick={placeOrder}
                            disabled={submitting}
                            className="flex h-14 w-full items-center justify-between rounded-2xl bg-orange-600 px-6 text-white shadow-xl transition hover:bg-orange-700 disabled:opacity-60"
                        >
                            <span className="flex items-center gap-2">
                                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/20 text-xs font-bold">
                                    {totalItems}
                                </span>
                                <span className="text-sm font-semibold">
                                    {submitting
                                        ? "Placing order..."
                                        : "Proceed to Order"}
                                </span>
                            </span>
                            <span className="text-sm font-bold">
                                Rs. {totalAmount}
                            </span>
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
