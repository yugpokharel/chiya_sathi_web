"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { LoginData, loginSchema } from "../schema";
export default function LoginForm() {
    const router = useRouter();
    const [showPassword, setShowPassword] = useState(false);
    const [serverError, setServerError] = useState<string | null>(null);
    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<LoginData>({
        resolver: zodResolver(loginSchema),
        mode: "onSubmit",
    });

    const submit = async (values: LoginData) => {
        setServerError(null);
        const response = await fetch("/api/auth/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(values),
        });

        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
            setServerError(data?.message ?? "Login failed");
            return;
        }

        if (data?.user) {
            localStorage.setItem("auth_user", JSON.stringify(data.user));
        }

        router.push("/dashboard");
    };

    return (
        <form onSubmit={handleSubmit(submit)} className="space-y-8">
            <div className="space-y-2">
                <label
                    className="text-xs uppercase tracking-[0.2em] text-black/60"
                    htmlFor="email"
                >
                    Email address
                </label>
                <div className="relative">
                    <input
                        id="email"
                        type="email"
                        autoComplete="email"
                        className="h-12 w-full border-b border-black/20 bg-transparent pr-10 text-base text-black outline-none transition-colors placeholder:text-black/40 focus:border-orange-500"
                        {...register("email")}
                        placeholder="Enter your email"
                    />
                    <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-orange-500">
                        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
                            <path d="M9.55 17.65 4.9 13l1.4-1.4 3.25 3.25 7.55-7.55L18.5 8.7l-8.95 8.95Z" />
                        </svg>
                    </span>
                </div>
                {errors.email?.message && (
                    <p className="text-xs text-red-600">{errors.email.message}</p>
                )}
            </div>

            <div className="space-y-2">
                <label
                    className="text-xs uppercase tracking-[0.2em] text-black/60"
                    htmlFor="password"
                >
                    Password
                </label>
                <div className="relative">
                    <input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        autoComplete="current-password"
                        className="h-12 w-full border-b border-black/20 bg-transparent pr-10 text-base text-black outline-none transition-colors placeholder:text-black/40 focus:border-orange-500"
                        {...register("password")}
                        placeholder="Enter password"
                    />
                    <button
                        type="button"
                        onClick={() => setShowPassword((value) => !value)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-black/40 hover:text-black/70"
                        aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                        {showPassword ? (
                            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
                                <path d="M12 5c4.5 0 8.3 2.6 10 6.5-1.7 3.9-5.5 6.5-10 6.5S3.7 15.4 2 11.5C3.7 7.6 7.5 5 12 5Zm0 2c-3.2 0-6 1.7-7.5 4.5C6 14.3 8.8 16 12 16s6-1.7 7.5-4.5C18 8.7 15.2 7 12 7Zm0 2.5a2 2 0 1 1 0 4 2 2 0 0 1 0-4Z" />
                            </svg>
                        ) : (
                            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
                                <path d="m3.53 2.47 17.99 18-1.06 1.06-3.2-3.2A10.96 10.96 0 0 1 12 19C7.5 19 3.7 16.4 2 12.5a11.8 11.8 0 0 1 3.1-4.2L2.47 3.53l1.06-1.06Zm4.4 6.53A4 4 0 0 0 12 15c.7 0 1.4-.18 2.01-.5L7.93 9Zm9.09 4.6a7.7 7.7 0 0 0 2.48-2.1C18 8.7 15.2 7 12 7c-.38 0-.76.03-1.12.1l-1.7-1.7C9.9 5.16 10.94 5 12 5c4.5 0 8.3 2.6 10 6.5a11.6 11.6 0 0 1-3.6 4.6l-1.38-1.5Z" />
                            </svg>
                        )}
                    </button>
                </div>
                {errors.password?.message && (
                    <p className="text-xs text-red-600">{errors.password.message}</p>
                )}
            </div>

            {serverError && (
                <p className="text-sm text-red-600">{serverError}</p>
            )}

            <button
                type="submit"
                disabled={isSubmitting}
                className="h-14 w-full rounded-md bg-orange-600 text-sm font-semibold text-white shadow-sm transition-opacity hover:opacity-90 disabled:opacity-60"
            >
                {isSubmitting ? "Signing in..." : "Sign in"}
            </button>

            <div className="text-center text-sm text-black/60">
                Don&apos;t have an account?{" "}
                <Link href="/register" className="font-semibold text-orange-600 hover:underline">
                    Create new account
                </Link>
            </div>
        </form>
    );
}
