"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useMemo } from "react";
import ThemeToggle from "./ThemeToggle";

const LINKS = [
    { href: "/", label: "Home" },
    { href: "/about", label: "About" },
    { href: "/profile", label: "Profile" },
];

export default function Header() {
    const pathname = usePathname();
    const [menuOpen, setMenuOpen] = useState(false);

    const activeMap = useMemo(() => {
        return LINKS.reduce<Record<string, boolean>>((acc, link) => {
            acc[link.href] =
                link.href === "/"
                    ? pathname === "/"
                    : pathname?.startsWith(link.href);
            return acc;
        }, {});
    }, [pathname]);

    return (
        <header className="sticky top-0 z-50 border-b border-black/10 bg-white text-black shadow-sm">
            <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="flex h-16 items-center justify-between md:grid md:grid-cols-[1fr_auto_1fr]">
                    <Link href="/" className="flex items-center gap-2 font-semibold tracking-tight text-black">
                        <span className="flex h-8 w-8 items-center justify-center rounded-md bg-orange-600 text-white">
                            C
                        </span>
                        <span className="hidden sm:block">ChiyaSathi</span>
                    </Link>

                    <div className="hidden md:flex items-center gap-6 justify-self-center">
                        {LINKS.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                className={
                                    "text-sm font-medium transition-colors " +
                                    (activeMap[link.href]
                                        ? "text-black"
                                        : "text-black/70 hover:text-black")
                                }
                            >
                                {link.label}
                            </Link>
                        ))}
                    </div>

                    <div className="flex items-center gap-2 md:justify-self-end">
                        <div className="hidden sm:flex items-center gap-2">
                            <Link
                                href="/login"
                                className="h-9 rounded-md border border-black/10 px-3 text-sm font-medium text-black hover:bg-black/5"
                            >
                                Log in
                            </Link>
                            <Link
                                href="/register"
                                className="h-9 rounded-md bg-white px-3 text-sm font-semibold text-black hover:bg-black/5"
                            >
                                Sign up
                            </Link>
                        </div>

                        <ThemeToggle />

                        <button
                            aria-expanded={menuOpen}
                            onClick={() => setMenuOpen((v) => !v)}
                            className="md:hidden flex h-9 w-9 items-center justify-center rounded-md border border-black/10 text-black hover:bg-black/5"
                        >
                            {menuOpen ? (
                                <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
                                    <path d="M6.225 4.811a.75.75 0 0 1 1.06 0L12 9.525l4.715-4.714a.75.75 0 1 1 1.06 1.06L13.06 10.586l4.715 4.715a.75.75 0 1 1-1.06 1.06L12 11.646l-4.715 4.715a.75.75 0 0 1-1.06-1.06l4.715-4.715-4.715-4.715a.75.75 0 0 1 0-1.06Z" />
                                </svg>
                            ) : (
                                <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
                                    <path d="M4.5 6.75h15a.75.75 0 0 0 0-1.5h-15a.75.75 0 0 0 0 1.5Zm15 4.5h-15a.75.75 0 0 0 0 1.5h15a.75.75 0 0 0 0-1.5Zm0 6h-15a.75.75 0 0 0 0 1.5h15a.75.75 0 0 0 0-1.5Z" />
                                </svg>
                            )}
                        </button>
                    </div>
                </div>

                <div
                    className={
                        "md:hidden overflow-hidden transition-[max-height] duration-300 " +
                        (menuOpen ? "max-h-80" : "max-h-0")
                    }
                >
                    <div className="border-t border-black/10 py-3">
                        <div className="flex flex-col gap-1">
                            {LINKS.map((link) => (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    onClick={() => setMenuOpen(false)}
                                    className={
                                        "rounded-md px-2 py-2 text-sm font-medium text-black/80 hover:bg-black/5 " +
                                        (activeMap[link.href]
                                            ? "text-black"
                                            : "text-black/70")
                                    }
                                >
                                    {link.label}
                                </Link>
                            ))}

                            <div className="mt-2 flex gap-2">
                                <Link
                                    href="/login"
                                    className="flex-1 h-9 rounded-md border border-black/10 text-sm font-medium text-black flex items-center justify-center hover:bg-black/5"
                                >
                                    Log in
                                </Link>
                                <Link
                                    href="/register"
                                    className="flex-1 h-9 rounded-md bg-white text-black text-sm font-semibold flex items-center justify-center hover:bg-black/5"
                                >
                                    Sign up
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </nav>
        </header>
    );
}
