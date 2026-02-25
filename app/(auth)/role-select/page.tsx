"use client";

import Link from "next/link";

const ROLES = [
    {
        role: "customer",
        title: "Customer",
        description: "Order tea, coffee, and snacks from your table",
        icon: "☕",
        color: "from-orange-400 to-orange-600",
    },
    {
        role: "owner",
        title: "Cafe Owner",
        description: "Manage your menu, orders, and track revenue",
        icon: "🏪",
        color: "from-amber-500 to-amber-700",
    },
];

export default function RoleSelectPage() {
    return (
        <section className="w-full space-y-10">
            <header className="flex items-center justify-between">
                <Link
                    href="/"
                    className="flex h-10 w-10 items-center justify-center rounded-full text-black/70 hover:bg-black/5"
                    aria-label="Go back"
                >
                    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
                        <path d="M15.5 19.5 8 12l7.5-7.5 1.5 1.5L11 12l6 6-1.5 1.5Z" />
                    </svg>
                </Link>
                <h1 className="text-lg font-medium text-black">Choose Role</h1>
                <span className="w-10" aria-hidden />
            </header>

            <div className="space-y-3">
                <h2 className="text-2xl font-semibold text-black">Who are you?</h2>
                <p className="text-sm text-black/60">
                    Select your role to get started with ChiyaSathi
                </p>
            </div>

            <div className="space-y-4">
                {ROLES.map((r) => (
                    <Link
                        key={r.role}
                        href={`/register?role=${r.role}`}
                        className="group block rounded-2xl border border-black/10 bg-white p-6 shadow-sm transition hover:shadow-md"
                    >
                        <div className="flex items-center gap-4">
                            <div
                                className={`flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br ${r.color} text-2xl shadow-sm`}
                            >
                                {r.icon}
                            </div>
                            <div className="flex-1">
                                <h3 className="text-lg font-semibold text-black">
                                    {r.title}
                                </h3>
                                <p className="text-sm text-black/60">
                                    {r.description}
                                </p>
                            </div>
                            <svg
                                viewBox="0 0 24 24"
                                className="h-5 w-5 text-black/30 transition group-hover:text-black/60"
                                fill="currentColor"
                            >
                                <path d="M8.5 4.5 16 12l-7.5 7.5L7 18l6-6-6-6 1.5-1.5Z" />
                            </svg>
                        </div>
                    </Link>
                ))}
            </div>

            <div className="text-center text-sm text-black/60">
                Already have an account?{" "}
                <Link
                    href="/login"
                    className="font-semibold text-orange-600 hover:underline"
                >
                    Log in
                </Link>
            </div>
        </section>
    );
}
