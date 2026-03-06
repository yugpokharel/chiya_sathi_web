"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useState, useRef } from "react";
import {
    ForgotPasswordData,
    forgotPasswordSchema,
    ResetPasswordData,
    resetPasswordSchema,
} from "../schema";

type Step = "email" | "reset" | "done";

export default function ForgotPasswordPage() {
    const [step, setStep] = useState<Step>("email");
    const [email, setEmail] = useState("");
    const [otp, setOtp] = useState(["", "", "", "", "", ""]);
    const [serverError, setServerError] = useState<string | null>(null);
    const [sending, setSending] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

    const emailForm = useForm<ForgotPasswordData>({
        resolver: zodResolver(forgotPasswordSchema),
        mode: "onSubmit",
    });

    const sendOtp = async (values: ForgotPasswordData) => {
        setServerError(null);
        setSending(true);
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
            setEmail(values.email);
            setStep("reset");
        } catch {
            setServerError("Unable to connect to server");
        } finally {
            setSending(false);
        }
    };

    const handleOtpChange = (index: number, value: string) => {
        if (!/^\d*$/.test(value)) return;
        const next = [...otp];
        next[index] = value.slice(-1);
        setOtp(next);
        if (value && index < 5) {
            otpRefs.current[index + 1]?.focus();
        }
    };

    const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
        if (e.key === "Backspace" && !otp[index] && index > 0) {
            otpRefs.current[index - 1]?.focus();
        }
    };

    const handleOtpPaste = (e: React.ClipboardEvent) => {
        e.preventDefault();
        const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
        const next = [...otp];
        for (let i = 0; i < 6; i++) next[i] = pasted[i] ?? "";
        setOtp(next);
        const focusIdx = Math.min(pasted.length, 5);
        otpRefs.current[focusIdx]?.focus();
    };

    const otpValue = otp.join("");

    const passwordForm = useForm<ResetPasswordData>({
        resolver: zodResolver(resetPasswordSchema),
        mode: "onSubmit",
    });

    const resetPassword = async (values: ResetPasswordData) => {
        if (otpValue.length !== 6) {
            setServerError("Please enter the 6-digit OTP");
            return;
        }
        setServerError(null);
        try {
            const res = await fetch("/api/auth/reset-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, otp: otpValue, password: values.password }),
            });
            const data = await res.json().catch(() => ({}));
            if (!res.ok) {
                setServerError(data?.message ?? "Reset failed");
                return;
            }
            setStep("done");
        } catch {
            setServerError("Unable to connect to server");
        }
    };

    const resendOtp = async () => {
        setServerError(null);
        setSending(true);
        try {
            const res = await fetch("/api/auth/forgot-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email }),
            });
            const data = await res.json().catch(() => ({}));
            if (res.ok) {
                setOtp(["", "", "", "", "", ""]);
                otpRefs.current[0]?.focus();
                setServerError(null);
            } else {
                setServerError(data?.message ?? "Failed to resend");
            }
        } catch {
            setServerError("Unable to connect to server");
        } finally {
            setSending(false);
        }
    };

    const title =
        step === "email"
            ? "Forgot Password"
            : step === "reset"
            ? "Reset Password"
            : "Forgot Password";

    return (
        <section className="w-full space-y-10">
            <header className="flex items-center justify-between">
                <Link
                    href={step === "email" ? "/login" : "#"}
                    onClick={(e) => {
                        if (step === "reset") {
                            e.preventDefault();
                            setStep("email");
                            setServerError(null);
                        }
                    }}
                    className="flex h-10 w-10 items-center justify-center rounded-full text-black/70 hover:bg-black/5"
                    aria-label="Go back"
                >
                    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
                        <path d="M15.5 19.5 8 12l7.5-7.5 1.5 1.5L11 12l6 6-1.5 1.5Z" />
                    </svg>
                </Link>
                <h1 className="text-lg font-medium text-black">{title}</h1>
                <span className="w-10" aria-hidden />
            </header>

            {/* ── Step indicators ─────────────────── */}
            {step !== "done" && (
                <div className="flex items-center justify-center gap-2">
                    {["email", "reset"].map((s, i) => (
                        <div key={s} className="flex items-center gap-2">
                            <div
                                className={
                                    "flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold " +
                                    (step === s
                                        ? "bg-orange-600 text-white"
                                        : ["email", "reset"].indexOf(step) > i
                                        ? "bg-orange-200 text-orange-700"
                                        : "bg-black/10 text-black/40")
                                }
                            >
                                {["email", "reset"].indexOf(step) > i ? "✓" : i + 1}
                            </div>
                            {i < 1 && (
                                <div
                                    className={
                                        "h-0.5 w-8 rounded " +
                                        (["email", "reset"].indexOf(step) > i
                                            ? "bg-orange-400"
                                            : "bg-black/10")
                                    }
                                />
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* ── Step 1: Email ──────────────────── */}
            {step === "email" && (
                <div className="space-y-4">
                    <div>
                        <h2 className="text-2xl font-semibold text-black">
                            Reset your password
                        </h2>
                        <p className="mt-2 text-sm text-black/60">
                            Enter your email and we&apos;ll send you a 6-digit OTP to verify your identity.
                        </p>
                    </div>
                    <form onSubmit={emailForm.handleSubmit(sendOtp)} className="space-y-8">
                        <div className="space-y-2">
                            <label className="text-xs uppercase tracking-[0.2em] text-black/60" htmlFor="email">
                                Email address
                            </label>
                            <input
                                id="email"
                                type="email"
                                autoComplete="email"
                                className="h-12 w-full border-b border-black/20 bg-transparent text-base text-black outline-none transition-colors placeholder:text-black/40 focus:border-orange-500"
                                {...emailForm.register("email")}
                                placeholder="Enter your email"
                            />
                            {emailForm.formState.errors.email?.message && (
                                <p className="text-xs text-red-600">{emailForm.formState.errors.email.message}</p>
                            )}
                        </div>
                        {serverError && <p className="text-sm text-red-600">{serverError}</p>}
                        <button
                            type="submit"
                            disabled={sending}
                            className="h-14 w-full rounded-md bg-orange-600 text-sm font-semibold text-white shadow-sm transition-opacity hover:opacity-90 disabled:opacity-60"
                        >
                            {sending ? "Sending OTP..." : "Send OTP"}
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

            {/* ── Step 2: OTP + New Password ─────── */}
            {step === "reset" && (
                <div className="space-y-4">
                    <div className="text-center">
                        <h2 className="text-2xl font-semibold text-black">Reset Password</h2>
                        <p className="mt-2 text-sm text-black/60">
                            Enter the 6-digit code sent to <span className="font-semibold text-black">{email}</span> and your new password.
                        </p>
                    </div>
                    <form onSubmit={passwordForm.handleSubmit(resetPassword)} className="space-y-6">
                        {/* OTP inputs */}
                        <div className="space-y-2">
                            <label className="text-xs uppercase tracking-[0.2em] text-black/60">
                                Verification Code
                            </label>
                            <div className="flex justify-center gap-3" onPaste={handleOtpPaste}>
                                {otp.map((digit, i) => (
                                    <input
                                        key={i}
                                        ref={(el) => { otpRefs.current[i] = el; }}
                                        type="text"
                                        inputMode="numeric"
                                        maxLength={1}
                                        value={digit}
                                        onChange={(e) => handleOtpChange(i, e.target.value)}
                                        onKeyDown={(e) => handleOtpKeyDown(i, e)}
                                        className="h-14 w-12 rounded-xl border-2 border-black/10 bg-white text-center text-xl font-bold outline-none transition-colors focus:border-orange-500"
                                        autoFocus={i === 0}
                                    />
                                ))}
                            </div>
                        </div>
                        {/* Password */}
                        <div className="space-y-2">
                            <label className="text-xs uppercase tracking-[0.2em] text-black/60" htmlFor="password">
                                New Password
                            </label>
                            <div className="relative">
                                <input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    autoComplete="new-password"
                                    className="h-12 w-full border-b border-black/20 bg-transparent pr-10 text-base text-black outline-none transition-colors placeholder:text-black/40 focus:border-orange-500"
                                    {...passwordForm.register("password")}
                                    placeholder="Enter new password"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword((v) => !v)}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 text-black/40 hover:text-black/70"
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
                            {passwordForm.formState.errors.password?.message && (
                                <p className="text-xs text-red-600">{passwordForm.formState.errors.password.message}</p>
                            )}
                        </div>
                        {/* Confirm Password */}
                        <div className="space-y-2">
                            <label className="text-xs uppercase tracking-[0.2em] text-black/60" htmlFor="confirmPassword">
                                Confirm Password
                            </label>
                            <input
                                id="confirmPassword"
                                type={showPassword ? "text" : "password"}
                                autoComplete="new-password"
                                className="h-12 w-full border-b border-black/20 bg-transparent text-base text-black outline-none transition-colors placeholder:text-black/40 focus:border-orange-500"
                                {...passwordForm.register("confirmPassword")}
                                placeholder="Confirm new password"
                            />
                            {passwordForm.formState.errors.confirmPassword?.message && (
                                <p className="text-xs text-red-600">{passwordForm.formState.errors.confirmPassword.message}</p>
                            )}
                        </div>
                        {serverError && <p className="text-sm text-red-600">{serverError}</p>}
                        <button
                            type="submit"
                            disabled={passwordForm.formState.isSubmitting || otpValue.length !== 6}
                            className="h-14 w-full rounded-md bg-orange-600 text-sm font-semibold text-white shadow-sm transition-opacity hover:opacity-90 disabled:opacity-60"
                        >
                            {passwordForm.formState.isSubmitting ? "Resetting..." : "Reset Password"}
                        </button>
                        <div className="text-center text-sm text-black/60">
                            Didn&apos;t receive the code?{" "}
                            <button
                                type="button"
                                onClick={resendOtp}
                                disabled={sending}
                                className="font-semibold text-orange-600 hover:underline disabled:opacity-60"
                            >
                                {sending ? "Sending..." : "Resend OTP"}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* ── Done ───────────────────────────── */}
            {step === "done" && (
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
            )}
        </section>
    );
}
