"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useState } from "react";
import { ForgotPasswordData, forgotPasswordSchema } from "../schema";

export default function ForgotPasswordPage() {
    const [serverError, setServerError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<ForgotPasswordData>({
        resolver: zodResolver(forgotPasswordSchema),
        mode: "onSubmit",
    });

    const submit = async (values: ForgotPasswordData) => {
        setServerError(null);
        try {
            const res = await fetch("/api/auth/forgot-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(values),
            });

            const data = await res.json().catch(() => ({}));

            if (!res.ok) {
                setServerError(data?.message ?? "Something went wrong");
                return;
            }

            setSuccess(true);
        } catch {
            setServerError("Unable to connect to server");
        }
    };

    return (
        <section className="w-full space-y-10">
            <header className="flex items-center justify-between">
                <Link
                    href="/login"
                    className="flex h-10 w-10 items-center justify-center rounded-full text-black/70 hover:bg-black/5"
                    aria-label="Go back"
                >
                    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
                        <path d="M15.5 19.5 8 12l7.5-7.5 1.5 1.5L11 12l6 6-1.5 1.5Z" />
                    </svg>
                </Link>
                <h1 className="text-lg font-medium text-black">Forgot Password</h1>
                <span className="w-10" aria-hidden />
            </header>

            {success ? (
                <div className="space-y-6 text-center">
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                        <svg viewBox="0 0 24 24" className="h-8 w-8 text-green-600" fill="currentColor">
                            <path d="M9.55 17.65 4.9 13l1.4-1.4 3.25 3.25 7.55-7.55L18.5 8.7l-8.95 8.95Z" />
                        </svg>
                    </div>
                    <div>
                        <h2 className="text-xl font-semibold text-black">Check your email</h2>
                        <p className="mt-2 text-sm text-black/60">
                            We&apos;ve sent password reset instructions to your email address.
                            Please check your inbox and follow the link to reset your password.
                        </p>
                    </div>
                    <Link
                        href="/login"
                        className="inline-flex h-12 items-center justify-center rounded-md bg-orange-600 px-6 text-sm font-semibold text-white shadow-sm transition hover:opacity-90"
                    >
                        Back to Sign In
                    </Link>
                </div>
            ) : (
                <div className="space-y-4">
                    <div>
                        <h2 className="text-2xl font-semibold text-black">
                            Reset your password
                        </h2>
                        <p className="mt-2 text-sm text-black/60">
                            Enter your email address and we&apos;ll send you instructions to reset your password.
                        </p>
                    </div>

                    <form onSubmit={handleSubmit(submit)} className="space-y-8">
                        <div className="space-y-2">
                            <label
                                className="text-xs uppercase tracking-[0.2em] text-black/60"
                                htmlFor="email"
                            >
                                Email address
                            </label>
                            <input
                                id="email"
                                type="email"
                                autoComplete="email"
                                className="h-12 w-full border-b border-black/20 bg-transparent text-base text-black outline-none transition-colors placeholder:text-black/40 focus:border-orange-500"
                                {...register("email")}
                                placeholder="Enter your email"
                            />
                            {errors.email?.message && (
                                <p className="text-xs text-red-600">{errors.email.message}</p>
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
                            {isSubmitting ? "Sending..." : "Send Reset Instructions"}
                        </button>

                        <div className="text-center text-sm text-black/60">
                            Remember your password?{" "}
                            <Link href="/login" className="font-semibold text-orange-600 hover:underline">
                                Sign in
                            </Link>
                        </div>
                    </form>
                </div>
            )}
        </section>
    );
}
