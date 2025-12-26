"use client";

import { useEffect, useState } from "react";

type ThemeMode = "light" | "dark" | "system";

const ORDER: ThemeMode[] = ["system", "dark", "light"];

export default function ThemeToggle() {
    const [mode, setMode] = useState<ThemeMode>("system");

    useEffect(() => {
        const saved = localStorage.getItem("theme") as ThemeMode | null;
        setMode(saved ?? "system");
    }, []);

    useEffect(() => {
        const root = document.documentElement;
        const resolved =
            mode === "system"
                ? window.matchMedia("(prefers-color-scheme: dark)").matches
                    ? "dark"
                    : "light"
                : mode;

        root.setAttribute("data-theme", resolved);
        localStorage.setItem("theme", mode);
    }, [mode]);

    const next = () => {
        setMode((current) => ORDER[(ORDER.indexOf(current) + 1) % ORDER.length]);
    };

    return (
        <button
            type="button"
            aria-label="Change theme"
            title={`Theme: ${mode}`}
            onClick={next}
            className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-black/10 dark:border-white/15 hover:bg-foreground/5 transition-colors"
        >
            {mode === "dark" && (
                <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
                    <path d="M21 12.79A9 9 0 1 1 11.21 3a7 7 0 0 0 9.79 9.79Z" />
                </svg>
            )}

            {mode === "light" && (
                <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
                    <path d="M12 18a6 6 0 1 0 0-12 6 6 0 0 0 0 12Zm0-15a.75.75 0 0 1 .75-.75h.01a.75.75 0 0 1 0 1.5h-.01A.75.75 0 0 1 12 3Zm0 18a.75.75 0 0 1 .75-.75h.01a.75.75 0 0 1 0 1.5h-.01A.75.75 0 0 1 12 21Zm9-9a.75.75 0 0 1-.75.75v.01a.75.75 0 0 1-1.5 0v-.01A.75.75 0 0 1 21 12ZM3 12a.75.75 0 0 1 .75-.75v-.01a.75.75 0 0 1 1.5 0v.01A.75.75 0 0 1 3 12Z" />
                </svg>
            )}

            {mode === "system" && (
                <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
                    <path d="M3 6a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-5v2h2a.75.75 0 0 1 0 1.5H8a.75.75 0 0 1 0-1.5h2v-2H5a2 2 0 0 1-2-2V6Z" />
                </svg>
            )}
        </button>
    );
}
