import Image from "next/image";

type LayoutProps = {
    children: React.ReactNode;
};

export default function Layout({ children }: LayoutProps) {
    return (
        <main className="min-h-screen grid md:grid-cols-2">
            <div className="relative hidden md:block">
                <Image
                    src="/auth-illustration.svg"
                    alt="Auth visual"
                    fill
                    priority
                    className="object-cover"
                />
            </div>

            <div className="flex items-center justify-center px-6 sm:px-8">
                <div className="w-full max-w-md rounded-xl border border-black/10 dark:border-white/10 bg-background/75 p-6 shadow backdrop-blur">
                    {children}
                </div>
            </div>
        </main>
    );
}
