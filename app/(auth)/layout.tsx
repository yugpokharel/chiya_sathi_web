type LayoutProps = {
    children: React.ReactNode;
};

export default function Layout({ children }: LayoutProps) {
    return (
        <main className="min-h-screen bg-white">
            <div className="mx-auto w-full max-w-md px-6 py-8">
                {children}
            </div>
        </main>
    );
}
