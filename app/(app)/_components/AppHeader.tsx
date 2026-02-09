"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
    { href: "/menu", label: "Menu" },
    { href: "/profile", label: "Profile" },
];

export default function AppHeader() {
    const pathname = usePathname();

    return (
        <header className="sticky top-0 z-50 border-b border-black/10 bg-white/90 backdrop-blur">
            <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-10">
                <Link href="/menu" className="flex items-center gap-2 font-semibold text-black">
                    <span className="flex h-9 w-9 items-center justify-center rounded-md bg-orange-600 text-white">
                        C
                    </span>
                    <span>ChiyaSathi</span>
                </Link>

                <div className="flex items-center gap-6">
                    {LINKS.map((link) => {
                        const isActive = pathname === link.href;
                        return (
                            <Link
                                key={link.href}
                                href={link.href}
                                className={
                                    "text-sm font-semibold transition-colors " +
                                    (isActive
                                        ? "text-black"
                                        : "text-black/60 hover:text-black")
                                }
                            >
                                {link.label}
                            </Link>
                        );
                    })}
                </div>
            </nav>
        </header>
    );
}
