import Image from "next/image";

type AuthLayoutProps = {
    children: React.ReactNode;
};

export default function Layout({ children }: AuthLayoutProps) {
    return (
        <main className="min-h-screen">
            <div className="grid min-h-screen md:grid-cols-2">

                {/* Illustration panel */}
                <aside className="relative hidden md:block overflow-hidden">
                    <Image
                        src="/auth-illustration.svg"
                        alt="Authentication illustration"
                        fill
                        priority
                        className="object-cover"
                    />
                </aside>

                {/* Form container */}
                <div className="flex items-center justify-center px-5 md:px-12">
                    <div className="w-full max-w-md rounded-2xl border border-black/10 dark:border-white/10 bg-background/80 p-7 shadow-sm backdrop-blur-sm">
                        {children}
                    </div>
                </div>

            </div>
        </main>
    );
}
