import AppHeader from "./_components/AppHeader";

export default function Layout({ children }: { children: React.ReactNode }) {
    return (
        <section className="min-h-screen bg-[#f8f5ef] text-[#1b1b1b]">
            <AppHeader />
            <main>{children}</main>
        </section>
    );
}
