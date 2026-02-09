"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { RegisterData, registerSchema } from "../schema";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

export default function RegisterForm() {
    const router = useRouter();
    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [serverError, setServerError] = useState<string | null>(null);

    const {
        register,
        handleSubmit,
        setValue,
        formState: { errors, isSubmitting },
    } = useForm<RegisterData>({
        resolver: zodResolver(registerSchema),
        mode: "onSubmit",
    });

    const onPickImage = (file: File | null) => {
        if (!file) {
            if (previewUrl) {
                URL.revokeObjectURL(previewUrl);
            }
            setPreviewUrl(null);
            return;
        }

        if (previewUrl) {
            URL.revokeObjectURL(previewUrl);
        }
        setValue("profilePicture", file, { shouldValidate: true });
        setPreviewUrl(URL.createObjectURL(file));
    };

    const submit = async (values: RegisterData) => {
        setServerError(null);
        const formData = new FormData();
        formData.append("fullName", values.fullName);
        formData.append("username", values.username);
        formData.append("phoneNumber", values.phoneNumber);
        formData.append("email", values.email);
        formData.append("password", values.password);
        formData.append("profilePicture", values.profilePicture);

        const response = await fetch("/api/auth/register", {
            method: "POST",
            body: formData,
        });

        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
            setServerError(data?.message ?? "Signup failed");
            return;
        }

        router.push("/login");
    };

    useEffect(() => {
        return () => {
            if (previewUrl) {
                URL.revokeObjectURL(previewUrl);
            }
        };
    }, [previewUrl]);

    const profilePicture = register("profilePicture");

    return (
        <form onSubmit={handleSubmit(submit)} className="space-y-8">
            <div className="space-y-2">
                <label className="text-xs uppercase tracking-[0.2em] text-black/60">
                    Profile picture
                </label>
                <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className={
                        "flex h-40 w-full items-center justify-center rounded-md border-2 border-dashed " +
                        (previewUrl
                            ? "border-orange-500"
                            : "border-black/15")
                    }
                >
                    {previewUrl ? (
                        <img
                            src={previewUrl}
                            alt="Selected profile"
                            className="h-full w-full rounded-md object-cover"
                        />
                    ) : (
                        <div className="flex flex-col items-center gap-2 text-black/40">
                            <svg viewBox="0 0 24 24" className="h-10 w-10" fill="currentColor">
                                <path d="M3 6a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6Zm9 3a4 4 0 1 0 .001 8.001A4 4 0 0 0 12 9Z" />
                            </svg>
                            <span className="text-sm">Tap to select a picture</span>
                        </div>
                    )}
                </button>
                <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    {...profilePicture}
                    ref={(element) => {
                        profilePicture.ref(element);
                        fileInputRef.current = element;
                    }}
                    onChange={(event) => {
                        profilePicture.onChange(event);
                        onPickImage(event.target.files?.[0] ?? null);
                    }}
                />
                {errors.profilePicture?.message && (
                    <p className="text-xs text-red-600">
                        {errors.profilePicture.message}
                    </p>
                )}
            </div>

            <div className="space-y-2">
                <label
                    className="text-xs uppercase tracking-[0.2em] text-black/60"
                    htmlFor="fullName"
                >
                    Full name
                </label>
                <input
                    id="fullName"
                    type="text"
                    autoComplete="name"
                    className="h-12 w-full border-b border-black/20 bg-transparent text-base text-black outline-none transition-colors placeholder:text-black/40 focus:border-orange-500"
                    {...register("fullName")}
                    placeholder="Enter full name"
                />
                {errors.fullName?.message && (
                    <p className="text-xs text-red-600">{errors.fullName.message}</p>
                )}
            </div>

            <div className="space-y-2">
                <label
                    className="text-xs uppercase tracking-[0.2em] text-black/60"
                    htmlFor="username"
                >
                    Username
                </label>
                <input
                    id="username"
                    type="text"
                    autoComplete="username"
                    className="h-12 w-full border-b border-black/20 bg-transparent text-base text-black outline-none transition-colors placeholder:text-black/40 focus:border-orange-500"
                    {...register("username")}
                    placeholder="Enter username"
                />
                {errors.username?.message && (
                    <p className="text-xs text-red-600">{errors.username.message}</p>
                )}
            </div>

            <div className="space-y-2">
                <label
                    className="text-xs uppercase tracking-[0.2em] text-black/60"
                    htmlFor="phoneNumber"
                >
                    Phone number
                </label>
                <input
                    id="phoneNumber"
                    type="tel"
                    autoComplete="tel"
                    className="h-12 w-full border-b border-black/20 bg-transparent text-base text-black outline-none transition-colors placeholder:text-black/40 focus:border-orange-500"
                    {...register("phoneNumber")}
                    placeholder="Enter phone number"
                />
                {errors.phoneNumber?.message && (
                    <p className="text-xs text-red-600">{errors.phoneNumber.message}</p>
                )}
            </div>

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
                        autoComplete="new-password"
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

            <div className="space-y-2">
                <label
                    className="text-xs uppercase tracking-[0.2em] text-black/60"
                    htmlFor="confirmPassword"
                >
                    Confirm password
                </label>
                <div className="relative">
                    <input
                        id="confirmPassword"
                        type={showConfirm ? "text" : "password"}
                        autoComplete="new-password"
                        className="h-12 w-full border-b border-black/20 bg-transparent pr-10 text-base text-black outline-none transition-colors placeholder:text-black/40 focus:border-orange-500"
                        {...register("confirmPassword")}
                        placeholder="Confirm password"
                    />
                    <button
                        type="button"
                        onClick={() => setShowConfirm((value) => !value)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-black/40 hover:text-black/70"
                        aria-label={showConfirm ? "Hide confirm password" : "Show confirm password"}
                    >
                        {showConfirm ? (
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
                {errors.confirmPassword?.message && (
                    <p className="text-xs text-red-600">
                        {errors.confirmPassword.message}
                    </p>
                )}
            </div>

            {serverError && <p className="text-sm text-red-600">{serverError}</p>}

            <button
                type="submit"
                disabled={isSubmitting}
                className="h-14 w-full rounded-md bg-orange-600 text-sm font-semibold text-white shadow-sm transition-opacity hover:opacity-90 disabled:opacity-60"
            >
                {isSubmitting ? "Signing up..." : "Sign up"}
            </button>

            <div className="text-center text-sm text-black/60">
                Already have an account?{" "}
                <Link href="/login" className="font-semibold text-orange-600 hover:underline">
                    Log in
                </Link>
            </div>
        </form>
    );
}
