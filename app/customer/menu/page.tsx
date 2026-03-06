"use client";

import Link from "next/link";
import { CATEGORY_DETAILS } from "@/lib/constants";

export default function MenuPage() {
    return (
        <div className="mx-auto max-w-lg px-4 pt-6">
            <h1 className="text-xl font-bold">Menu</h1>
            <p className="mt-1 text-sm text-black/60">Choose a category to browse items</p>

            <div className="mt-6 grid grid-cols-2 gap-4">
                {CATEGORY_DETAILS.map((cat) => (
                    <Link
                        key={cat.name}
                        href={`/customer/menu/${cat.name}`}
                        className="group relative overflow-hidden rounded-2xl bg-white shadow-sm transition hover:shadow-md"
                    >
                        <div
                            className={`flex h-32 flex-col items-center justify-center bg-gradient-to-br ${cat.color} text-white`}
                        >
                            <span className="text-4xl">{cat.icon}</span>
                            <span className="mt-2 text-base font-semibold">
                                {cat.name}
                            </span>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
}
