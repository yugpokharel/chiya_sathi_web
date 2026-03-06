"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { ResetPasswordData, resetPasswordSchema } from "../schema";

function ResetPasswordForm() {
    const searchParams = useSearchParams();
    const token = searchParams.get("token") ?? "";

    const [serverError, setServerError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<ResetPasswordData>({
        resolver: zodResolver(resetPasswordSchema),
        mode: "onSubmit",
    });

    const submit = async (values: ResetPasswordData) => {
        setServerError(null);

        if (!token) {
            setServerError("Invalid or missing reset token. Please request a new reset link.");
            return;
        }

        try {
            const res = await fetch("/api/auth/reset-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ token, password: values.password }),
            });

            const data = await res.json().catch(() => ({}));

            if (!res.ok) {
                setServerError(data?.message ?? "Reset failed");
                return;
            }

            setSuccess(true);
        } catch {
            setServerError("Unable to connect to server");
        }
    };

    if (!token) {
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
                    <h1 className="text-lg font-medium text-black">Reset Password</h1>
                    <span className="w-10" aria-hidden />
                </header>

                <div className="space-y-6 text-center">
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
                        <svg viewBox="0 0 24 24" className="h-8 w-8 text-red-600" fill="currentColor">
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2Zm1 15h-2v-2h2v2Zm0-4h-2V7h2v6Z" />
                        </svg>
                    </div>
                    <div>
                        <h2 className="text-xl font-semibold text-black">Invalid Reset Link</h2>
                        <p className="mt-2 text-sm text-black/60">
                            This reset link is invalid or has expired. Please request a new one.
                        </p>
                    </div>
                    <Link
                        href="/forgot-password"
                        className="inline-flex h-12 items-center justify-center rounded-md bg-orange-600 px-6 text-sm font-semibold text-white shadow-sm transition hover:opacity-90"
                    >
                        Request New Link
                    </Link>
                </div>
            </section>
        );
    }

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
                <h1 className="text-lg font-medium text-black">Reset Password</h1>
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
                        <h2 className="text-xl font-semibold text-black">Password Reset!</h2>
                        <p className="mt-2 text-sm text-black/60">
                            Your password has been reset successfully. You can now sign in with your new password.
                        </p>
                    </div>
                    <Link
                        href="/login"
                        className="inline-flex h-12 items-center justify-center rounded-md bg-orange-600 px-6 text-sm font-semibold text-white shadow-sm transition hover:opacity-90"
                    >
                        Sign In
                    </Link>
                </div>
            ) : (
                <div className="space-y-4">
                    <div>
                        <h2 className="text-2xl font-semibold text-black">
                            Create new password
                        </h2>
                        <p className="mt-2 text-sm text-black/60">
                            Enter your new password below. Make sure it&apos;s at least 8 characters.
                        </p>
                    </div>

                    <form onSubmit={handleSubmit(submit)} className="space-y-8">
                        <div className="space-y-2">
                            <label
                                className="text-xs uppercase tracking-[0.2em] text-black/60"
                                htmlFor="password"
                            >
                                New Password
                            </label>
                            <div className="relative">
                                <input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    autoComplete="new-password"
                                    className="h-12 w-full border-b border-black/20 bg-transparent pr-10 text-base text-black outline-none transition-colors placeholder:text-black/40 focus:border-orange-500"
                                    {...register("password")}
                                    placeholder="Enter new password"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword((v) => !v)}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 text-black/40 hover:text-black/70"
                                    aria-label={showPassword ? "Hide password" : "Show password"}
                                >
                                    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
                                        {showPassword ? (
                                            <path d="M12 5c4.5 0 8.3 2.6 10 6.5-1.7 3.9-5.5 6.5-10 6.5S3.7 15.4 2 11.5C3.7 7.6 7.5 5 12 5Zm0 2c-3.2 0-6 1.7-7.5 4.5C6 14.3 8.8 16 12 16s6-1.7 7.5-4.5C18 8.7 15.2 7 12 7Zm0 2.5a2 2 0 1 1 0 4 2 2 0 0 1 0-4Z" />
                                        ) : (
                                            <path d="m3.53 2.47 17.99 18-1.06 1.06-3.2-3.2A10.96 10.96 0 0 1 12 19C7.5 19 3.7 16.4 2 12.5a11.8 11.8 0 0 1 3.1-4.2L2.47 3.53l1.06-1.06Zm4.4 6.53A4 4 0 0 0 12 15c.7 0 1.4-.18 2.01-.5L7.93 9Zm9.09 4.6a7.7 7.7 0 0 0 2.48-2.1C18 8.7 15.2 7 12 7c-.38 0-.76.03-1.12.1l-1.7-1.7C9.9 5.16 10.94 5 12 5c4.5 0 8.3 2.6 10 6.5a11.6 11.6 0 0 1-3.6 4.6l-1.38-1.5Z" />
                                        )}
                                    </svg>
                                </button>
                            </div>
                            {errors.password?.message && (
                                <p className="text-xs text-red-600">{errors.password.message}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <label
                                className="text-xs uppercase tracking-[0.2em] text-black/60"
                                htmlFor="confirmPassword"
                            >
                                Confirm Password
                            </label>
                            <input
                                id="confirmPassword"
                                type={showPassword ? "text" : "password"}
                                autoComplete="new-password"
                                className="h-12 w-full border-b border-black/20 bg-transparent text-base text-black outline-none transition-colors placeholder:text-black/40 focus:border-orange-500"
                                {...register("confirmPassword")}
                                placeholder="Confirm new password"
                            />
                            {errors.confirmPassword?.message && (
                                <p className="text-xs text-red-600">{errors.confirmPassword.message}</p>
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
                            {isSubmitting ? "Resetting..." : "Reset Password"}
                        </button>
                    </form>
                </div>
            )}
        </section>
    );
}

export default function ResetPasswordPage() {
    return (
        <Suspense
            fallback={
                <div className="flex min-h-[200px] items-center justify-center">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-orange-200 border-t-orange-600" />
                </div>
            }
        >
            <ResetPasswordForm />
        </Suspense>
    );
}
