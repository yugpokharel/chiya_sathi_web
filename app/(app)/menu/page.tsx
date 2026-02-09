import Image from "next/image";

const MENU_ITEMS = [
    { title: "Tea", image: "/menu-tea.svg" },
    { title: "Coffee", image: "/menu-coffee.svg" },
    { title: "Cigarette", image: "/menu-cigarette.svg" },
    { title: "Snacks", image: "/menu-snacks.svg" },
];

export default function MenuPage() {
    return (
        <section className="mx-auto max-w-6xl px-4 pb-16 pt-6 sm:px-6 lg:px-10">
            <div className="rounded-b-[32px] bg-gradient-to-br from-orange-300 via-orange-400 to-orange-500 px-6 py-8 text-black shadow-sm sm:px-8">
                <div className="inline-flex items-center gap-2 rounded-full bg-emerald-600 px-3 py-1 text-xs font-semibold text-white">
                    <span className="h-2 w-2 rounded-full bg-white" />
                    Online
                </div>
                <h1 className="mt-4 text-2xl font-semibold">Chiya Sathi</h1>
                <p className="mt-1 text-sm text-black/80">Welcome to Chiya Sathi</p>
                <p className="mt-2 text-xs text-black/70">Table: Table no. 1</p>
            </div>

            <div className="mt-8 space-y-4">
                <h2 className="text-lg font-semibold">Quick Actions</h2>
                <button className="flex w-full items-center gap-4 rounded-2xl bg-orange-300 px-5 py-4 text-left text-white shadow-sm">
                    <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-white text-orange-600">
                        <svg viewBox="0 0 24 24" className="h-6 w-6" fill="currentColor">
                            <path d="M4 4h6v6H4V4Zm10 0h6v6h-6V4ZM4 14h6v6H4v-6Zm10 3h6v3h-6v-3ZM14 14h6v2h-6v-2Z" />
                        </svg>
                    </span>
                    <span className="text-base font-semibold">Scan Your Table QR</span>
                </button>
            </div>

            <div className="mt-10 space-y-4">
                <h2 className="text-lg font-semibold">Browse Menu</h2>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {MENU_ITEMS.map((item) => (
                        <button
                            key={item.title}
                            className="group relative overflow-hidden rounded-2xl shadow-lg"
                        >
                            <Image
                                src={item.image}
                                alt={item.title}
                                width={320}
                                height={420}
                                className="h-44 w-full object-cover"
                            />
                            <div className="absolute inset-0 bg-black/35 transition group-hover:bg-black/45" />
                            <div className="absolute inset-0 flex items-center justify-center">
                                <span className="text-lg font-semibold text-white">
                                    {item.title}
                                </span>
                            </div>
                        </button>
                    ))}
                </div>
            </div>
        </section>
    );
}
