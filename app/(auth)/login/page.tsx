
import LoginForm from "../_components/Login.Form";
import Link from "next/link";

export default function Page() {
    return (
        <section className="w-full space-y-10">
            <header className="flex items-center justify-between">
                <Link
                    href="/"
                    className="flex h-10 w-10 items-center justify-center rounded-full text-black/70 hover:bg-black/5"
                    aria-label="Go back"
                >
                    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
                        <path d="M15.5 19.5 8 12l7.5-7.5 1.5 1.5L11 12l6 6-1.5 1.5Z" />
                    </svg>
                </Link>
                <h1 className="text-lg font-medium text-black">Sign In</h1>
                <span className="w-10" aria-hidden />
            </header>

            <div className="space-y-4">
                <h2 className="text-2xl font-semibold text-black">
                    Welcome to ChiyaSathi
                </h2>
            </div>

            <LoginForm />
        </section>
    );
}
