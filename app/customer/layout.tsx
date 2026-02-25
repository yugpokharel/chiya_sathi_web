"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV = [
    { href: "/customer", label: "Home", icon: "home" },
    { href: "/customer/menu", label: "Menu", icon: "menu" },
    { href: "/customer/profile", label: "Profile", icon: "profile" },
];

function NavIcon({ type, active }: { type: string; active: boolean }) {
    const color = active ? "text-orange-600" : "text-black/40";
    switch (type) {
        case "home":
            return (
                <svg viewBox="0 0 24 24" className={`h-6 w-6 ${color}`} fill="currentColor">
                    <path d="M12 3 2 12h3v8h6v-6h2v6h6v-8h3L12 3Z" />
                </svg>
            );
        case "menu":
            return (
                <svg viewBox="0 0 24 24" className={`h-6 w-6 ${color}`} fill="currentColor">
                    <path d="M3 5h18v2H3V5Zm0 6h18v2H3v-2Zm0 6h18v2H3v-2Z" />
                </svg>
            );
        case "profile":
            return (
                <svg viewBox="0 0 24 24" className={`h-6 w-6 ${color}`} fill="currentColor">
                    <path d="M12 12a5 5 0 1 0 0-10 5 5 0 0 0 0 10Zm0 2c-5.33 0-8 2.67-8 4v2h16v-2c0-1.33-2.67-4-8-4Z" />
                </svg>
            );
        default:
            return null;
    }
}

export default function CustomerLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();

    return (
        <div className="min-h-screen bg-[#f8f5ef] text-[#1b1b1b]">
            <main className="pb-20">{children}</main>

            {/* Bottom navigation */}
            <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-black/10 bg-white/95 backdrop-blur">
                <div className="mx-auto flex h-16 max-w-md items-center justify-around">
                    {NAV.map((item) => {
                        const active =
                            item.href === "/customer"
                                ? pathname === "/customer"
                                : pathname.startsWith(item.href);
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className="flex flex-col items-center gap-1"
                            >
                                <NavIcon type={item.icon} active={active} />
                                <span
                                    className={
                                        "text-[10px] font-semibold " +
                                        (active ? "text-orange-600" : "text-black/40")
                                    }
                                >
                                    {item.label}
                                </span>
                            </Link>
                        );
                    })}
                </div>
            </nav>
        </div>
    );
}
