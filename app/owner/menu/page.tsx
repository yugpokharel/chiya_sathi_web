"use client";

import { useEffect, useState, useCallback } from "react";
import { imageUrl, CATEGORIES, CATEGORY_ICONS } from "@/lib/constants";
import type { MenuItem, MenuCategory } from "@/lib/types";
import { useToast } from "@/components/ToastProvider";

interface ModalState {
    open: boolean;
    editing: MenuItem | null;
}

export default function OwnerMenu() {
    const { toast } = useToast();
    const [items, setItems] = useState<MenuItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [modal, setModal] = useState<ModalState>({ open: false, editing: null });
    const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
    const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

    // Form state
    const [formName, setFormName] = useState("");
    const [formPrice, setFormPrice] = useState("");
    const [formCategory, setFormCategory] = useState<MenuCategory>("Tea");
    const [formImage, setFormImage] = useState<File | null>(null);
    const [formPreview, setFormPreview] = useState<string | null>(null);
    const [saving, setSaving] = useState(false);

    const fetchMenu = useCallback(async () => {
        try {
            const res = await fetch("/api/menu");
            const data = await res.json();
            if (data?.data) setItems(data.data);
        } catch {} finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchMenu();
    }, [fetchMenu]);

    const openAdd = () => {
        setFormName("");
        setFormPrice("");
        setFormCategory("Tea");
        setFormImage(null);
        setFormPreview(null);
        setModal({ open: true, editing: null });
    };

    const openEdit = (item: MenuItem) => {
        setFormName(item.name);
        setFormPrice(String(item.price));
        setFormCategory(item.category);
        setFormImage(null);
        setFormPreview(imageUrl(item.image));
        setModal({ open: true, editing: item });
    };

    const closeModal = () => {
        setModal({ open: false, editing: null });
        if (formPreview && !modal.editing) {
            URL.revokeObjectURL(formPreview);
        }
    };

    const handleImageChange = (file: File | null) => {
        if (formPreview && !modal.editing?.image) {
            URL.revokeObjectURL(formPreview);
        }
        if (file) {
            setFormImage(file);
            setFormPreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async () => {
        if (!formName.trim() || !formPrice.trim()) {
            toast("Name and price required", "error");
            return;
        }

        setSaving(true);
        const fd = new FormData();
        fd.append("name", formName.trim());
        fd.append("price", formPrice);
        fd.append("category", formCategory);
        if (formImage) fd.append("image", formImage);

        try {
            const url = modal.editing
                ? `/api/menu/${modal.editing._id}`
                : "/api/menu";
            const method = modal.editing ? "PUT" : "POST";

            const res = await fetch(url, { method, body: fd });
            const data = await res.json();

            if (res.ok) {
                toast(
                    modal.editing ? "Item updated!" : "Item added!",
                    "success"
                );
                closeModal();
                fetchMenu();
            } else {
                toast(data?.message ?? "Failed", "error");
            }
        } catch {
            toast("Failed to save", "error");
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id: string) => {
        try {
            const res = await fetch(`/api/menu/${id}`, { method: "DELETE" });
            if (res.ok) {
                toast("Item deleted", "success");
                setConfirmDelete(null);
                fetchMenu();
            }
        } catch {
            toast("Delete failed", "error");
        }
    };

    const toggleCollapse = (cat: string) => {
        setCollapsed((prev) => ({ ...prev, [cat]: !prev[cat] }));
    };

    const grouped = CATEGORIES.reduce<Record<string, MenuItem[]>>(
        (acc, cat) => {
            acc[cat] = items.filter((i) => i.category === cat);
            return acc;
        },
        {} as Record<string, MenuItem[]>
    );

    return (
        <div className="mx-auto max-w-lg px-4 pt-6">
            <div className="flex items-center justify-between">
                <h1 className="text-xl font-bold">Menu Management</h1>
                <button
                    onClick={openAdd}
                    className="flex h-10 items-center gap-1.5 rounded-xl bg-orange-600 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-orange-700"
                >
                    <span className="text-lg">+</span> Add Item
                </button>
            </div>

            {loading && (
                <div className="mt-8 space-y-4">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="h-20 animate-pulse rounded-2xl bg-white shadow-sm" />
                    ))}
                </div>
            )}

            {/* Categories */}
            <div className="mt-6 space-y-4">
                {CATEGORIES.map((cat) => {
                    const catItems = grouped[cat] ?? [];
                    const isCollapsed = collapsed[cat];

                    return (
                        <div key={cat} className="overflow-hidden rounded-2xl bg-white shadow-sm">
                            <button
                                onClick={() => toggleCollapse(cat)}
                                className="flex w-full items-center justify-between p-4 text-left"
                            >
                                <div className="flex items-center gap-3">
                                    <span className="text-xl">
                                        {CATEGORY_ICONS[cat]}
                                    </span>
                                    <span className="text-sm font-semibold">
                                        {cat}
                                    </span>
                                    <span className="rounded-full bg-black/5 px-2 py-0.5 text-[10px] font-semibold text-black/50">
                                        {catItems.length}
                                    </span>
                                </div>
                                <svg
                                    viewBox="0 0 24 24"
                                    className={`h-5 w-5 text-black/30 transition-transform ${
                                        isCollapsed ? "" : "rotate-180"
                                    }`}
                                    fill="currentColor"
                                >
                                    <path d="M7 10l5 5 5-5H7Z" />
                                </svg>
                            </button>

                            {!isCollapsed && (
                                <div className="border-t border-black/5">
                                    {catItems.length === 0 && (
                                        <p className="p-4 text-center text-xs text-black/40">
                                            No items yet
                                        </p>
                                    )}
                                    {catItems.map((item) => {
                                        const imgSrc = imageUrl(item.image);
                                        return (
                                            <div
                                                key={item._id}
                                                className="flex items-center gap-3 border-b border-black/5 p-4 last:border-b-0"
                                            >
                                                <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded-xl bg-orange-50">
                                                    {imgSrc ? (
                                                        <img
                                                            src={imgSrc}
                                                            alt={item.name}
                                                            className="h-full w-full object-cover"
                                                        />
                                                    ) : (
                                                        <div className="flex h-full w-full items-center justify-center text-lg">
                                                            {CATEGORY_ICONS[item.category]}
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="flex-1">
                                                    <p className="text-sm font-semibold">
                                                        {item.name}
                                                    </p>
                                                    <p className="text-xs font-bold text-orange-600">
                                                        Rs. {item.price}
                                                    </p>
                                                </div>
                                                <div className="flex gap-1">
                                                    <button
                                                        onClick={() => openEdit(item)}
                                                        className="rounded-lg bg-blue-50 px-3 py-1.5 text-[10px] font-semibold text-blue-600 transition hover:bg-blue-100"
                                                    >
                                                        Edit
                                                    </button>
                                                    {confirmDelete === item._id ? (
                                                        <div className="flex gap-1">
                                                            <button
                                                                onClick={() => setConfirmDelete(null)}
                                                                className="rounded-lg bg-gray-100 px-2 py-1.5 text-[10px] font-semibold text-black/60"
                                                            >
                                                                No
                                                            </button>
                                                            <button
                                                                onClick={() => handleDelete(item._id)}
                                                                className="rounded-lg bg-red-600 px-2 py-1.5 text-[10px] font-semibold text-white"
                                                            >
                                                                Yes
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <button
                                                            onClick={() =>
                                                                setConfirmDelete(item._id)
                                                            }
                                                            className="rounded-lg bg-red-50 px-3 py-1.5 text-[10px] font-semibold text-red-600 transition hover:bg-red-100"
                                                        >
                                                            Delete
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Modal */}
            {modal.open && (
                <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 sm:items-center">
                    <div className="w-full max-w-lg rounded-t-3xl bg-white p-6 shadow-xl sm:rounded-3xl">
                        <div className="flex items-center justify-between">
                            <h2 className="text-lg font-bold">
                                {modal.editing ? "Edit Item" : "Add Item"}
                            </h2>
                            <button
                                onClick={closeModal}
                                className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-black/5"
                            >
                                ✕
                            </button>
                        </div>

                        <div className="mt-4 space-y-4">
                            {/* Image */}
                            <div>
                                <label className="text-xs uppercase tracking-widest text-black/40">
                                    Image
                                </label>
                                <button
                                    type="button"
                                    onClick={() =>
                                        document.getElementById("menuImageInput")?.click()
                                    }
                                    className="mt-1 flex h-28 w-full items-center justify-center rounded-xl border-2 border-dashed border-black/15 transition hover:border-black/30"
                                >
                                    {formPreview ? (
                                        <img
                                            src={formPreview}
                                            alt=""
                                            className="h-full w-full rounded-xl object-cover"
                                        />
                                    ) : (
                                        <span className="text-sm text-black/40">
                                            Tap to upload
                                        </span>
                                    )}
                                </button>
                                <input
                                    id="menuImageInput"
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={(e) =>
                                        handleImageChange(e.target.files?.[0] ?? null)
                                    }
                                />
                            </div>

                            {/* Name */}
                            <div>
                                <label className="text-xs uppercase tracking-widest text-black/40">
                                    Name
                                </label>
                                <input
                                    type="text"
                                    value={formName}
                                    onChange={(e) => setFormName(e.target.value)}
                                    className="mt-1 h-11 w-full rounded-xl border border-black/10 bg-[#f8f5ef] px-4 text-sm outline-none focus:border-orange-500"
                                    placeholder="Item name"
                                />
                            </div>

                            {/* Price */}
                            <div>
                                <label className="text-xs uppercase tracking-widest text-black/40">
                                    Price (Rs.)
                                </label>
                                <input
                                    type="number"
                                    value={formPrice}
                                    onChange={(e) => setFormPrice(e.target.value)}
                                    className="mt-1 h-11 w-full rounded-xl border border-black/10 bg-[#f8f5ef] px-4 text-sm outline-none focus:border-orange-500"
                                    placeholder="0"
                                />
                            </div>

                            {/* Category */}
                            <div>
                                <label className="text-xs uppercase tracking-widest text-black/40">
                                    Category
                                </label>
                                <select
                                    value={formCategory}
                                    onChange={(e) =>
                                        setFormCategory(
                                            e.target.value as MenuCategory
                                        )
                                    }
                                    className="mt-1 h-11 w-full rounded-xl border border-black/10 bg-[#f8f5ef] px-4 text-sm outline-none focus:border-orange-500"
                                >
                                    {CATEGORIES.map((c) => (
                                        <option key={c} value={c}>
                                            {CATEGORY_ICONS[c]} {c}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <button
                                onClick={handleSubmit}
                                disabled={saving}
                                className="h-12 w-full rounded-xl bg-orange-600 text-sm font-semibold text-white shadow-sm transition hover:bg-orange-700 disabled:opacity-60"
                            >
                                {saving
                                    ? "Saving..."
                                    : modal.editing
                                    ? "Update Item"
                                    : "Add Item"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
