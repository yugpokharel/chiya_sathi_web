"use client";

import RegisterForm from "../_components/Register.Form";

const PageHeader = () => {
    return (
        <header className="flex flex-col items-center gap-1 text-center">
            <h1 className="text-2xl font-medium tracking-tight">
                Create your account
            </h1>
            <p className="text-sm opacity-70">
                Sign up to get started
            </p>
        </header>
    );
};

export default function Page() {
    return (
        <section className="w-full space-y-7">
            <PageHeader />
            <RegisterForm />
        </section>
    );
}
