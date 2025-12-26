
"use client";

import LoginForm from "../_components/Login.Form";

const Header = () => (
    <div className="flex flex-col items-center gap-1 text-center">
        <h1 className="text-2xl font-medium tracking-tight">
            Welcome back
        </h1>
        <p className="text-sm opacity-70">
            Log in to your account
        </p>
    </div>
);

export default function Page() {
    return (
        <section className="w-full space-y-7">
            <Header />
            <LoginForm />
        </section>
    );
}
