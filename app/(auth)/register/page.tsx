import RegisterForm from "../_components/Register.Form";
import Link from "next/link";
import { Suspense } from "react";

export default function Page() {
    return (
        <section className="w-full space-y-10">
            <header className="flex items-center justify-between">
                <Link
                    href="/role-select"
                    className="flex h-10 w-10 items-center justify-center rounded-full text-black/70 hover:bg-black/5"
                    aria-label="Go back"
                >
                    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
                        <path d="M15.5 19.5 8 12l7.5-7.5 1.5 1.5L11 12l6 6-1.5 1.5Z" />
                    </svg>
                </Link>
                <h1 className="text-lg font-medium text-black">Sign Up</h1>
                <span className="w-10" aria-hidden />
            </header>

            <div className="space-y-4">
                <h2 className="text-2xl font-semibold text-black">
                    Create your account
                </h2>
            </div>

            <Suspense fallback={<div className="flex justify-center py-8"><div className="h-8 w-8 animate-spin rounded-full border-4 border-orange-200 border-t-orange-600" /></div>}>
                <RegisterForm />
            </Suspense>
        </section>
    );
}
