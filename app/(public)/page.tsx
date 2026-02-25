import Image from "next/image";

export default function Home() {
  return (
    <main className="relative min-h-screen w-full overflow-hidden bg-[#f8f5ef] text-[#1b1b1b]">
      <div className="absolute inset-0 -z-10">
        <div className="absolute -left-32 top-24 h-72 w-72 rounded-full bg-amber-200/60 blur-3xl" />
        <div className="absolute right-[-10rem] top-0 h-96 w-96 rounded-full bg-emerald-200/50 blur-3xl" />
        <div className="absolute bottom-[-12rem] left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-orange-200/50 blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.95),rgba(248,245,239,0.35))]" />
      </div>

          <section className="mx-auto max-w-6xl px-4 pb-20 pt-16 sm:px-6 lg:px-10">
        <div className="grid gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-white/90 px-4 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-amber-700 shadow-sm">
              ChiyaSathi
              <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
              Warm moments, fast
            </div>

            <div className="space-y-4">
              <h1 className="text-4xl font-semibold tracking-tight text-[#1b1b1b] sm:text-5xl lg:text-6xl">
                Sit, order, relax
                <span className="block text-amber-700">your classic tea ritual, reimagined.</span>
              </h1>
              <p className="max-w-xl text-base text-black/75 sm:text-lg">
                Discover fresh brews, curated snacks, and a calm place to
                connect. Order for pickup or delivery in minutes.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <a
                href="/role-select"
                className="inline-flex h-12 items-center justify-center rounded-md bg-amber-600 px-6 text-sm font-semibold text-white shadow-sm transition hover:opacity-90"
              >
                Get started
              </a>
              <a
                href="/role-select"
                className="inline-flex h-12 items-center justify-center rounded-md border border-black/10 bg-white/90 px-6 text-sm font-semibold text-[#1b1b1b] shadow-sm transition hover:bg-white"
              >
                Explore the menu
              </a>
            </div>

            <div className="grid gap-6 sm:grid-cols-3">
              {[
                { label: "Daily brews", value: "2,500+" },
                { label: "Avg. delivery", value: "15 min" },
                { label: "Tea blends", value: "40+" },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-xl border border-black/5 bg-white/90 p-4 shadow-sm"
                >
                  <p className="text-2xl font-semibold text-[#1b1b1b]">
                    {stat.value}
                  </p>
                  <p className="text-xs uppercase tracking-[0.2em] text-black/60">
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="relative">
            <div className="absolute -left-6 top-10 h-24 w-24 rounded-3xl bg-amber-200/80 shadow-lg animate-float" />
            <div className="absolute -right-8 bottom-6 h-32 w-32 rounded-full bg-emerald-200/70 shadow-lg animate-float-slow" />
            <div className="rounded-3xl border border-black/10 bg-white/95 p-6 shadow-xl backdrop-blur">
              <div className="mb-6 overflow-hidden rounded-2xl border border-black/10 bg-[#F8F5EF] p-4">
                <Image
                  src="/classic-tea.svg"
                  alt="Classic tea"
                  width={720}
                  height={520}
                  className="h-56 w-full object-contain"
                />
              </div>
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-black/55">
                      Today at ChiyaSathi
                    </p>
                    <p className="text-lg font-semibold text-[#1b1b1b]">
                      Spiced Milk Tea
                    </p>
                  </div>
                  <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">
                    New
                  </span>
                </div>

                <div className="space-y-3">
                  {[
                    "Cinnamon, cardamom, and clove",
                    "Oat milk or dairy",
                    "Lightly sweetened",
                  ].map((item) => (
                    <div key={item} className="flex items-center gap-2 text-sm text-black/70">
                      <span className="h-2 w-2 rounded-full bg-emerald-500" />
                      {item}
                    </div>
                  ))}
                </div>

                <div className="rounded-2xl bg-amber-50/90 p-4">
                  <p className="text-sm font-semibold text-[#1b1b1b]">
                    Ready in 8 minutes
                  </p>
                  <p className="text-xs text-black/65">
                    Order now and pick up at your closest stall.
                  </p>
                </div>

                <a href="/login" className="flex h-12 w-full items-center justify-center rounded-md bg-[#1b1b1b] text-sm font-semibold text-white hover:opacity-90">
                  Quick order
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

          <section className="mx-auto max-w-6xl px-4 pb-20 sm:px-6 lg:px-10">
        <div className="grid gap-8 lg:grid-cols-3">
          {[
            {
              title: "Curated blends",
              description:
                "Seasonal herbs, slow-steeped leaves, and barista-grade attention.",
            },
            {
              title: "Neighborhood pickup",
              description:
                "Grab your cup from nearby stalls with live preparation updates.",
            },
            {
              title: "Friends and rewards",
              description:
                "Earn points, unlock perks, and share your favorite blends.",
            },
          ].map((card, index) => (
            <div
              key={card.title}
              className="rounded-2xl border border-black/5 bg-white/90 p-6 shadow-sm animate-fade-up"
              style={{ animationDelay: `${index * 120}ms` }}
            >
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
                <svg viewBox="0 0 24 24" className="h-6 w-6" fill="currentColor">
                  <path d="M12 3a9 9 0 1 1 0 18 9 9 0 0 1 0-18Zm0 2a7 7 0 1 0 .001 14.001A7 7 0 0 0 12 5Zm-1 3h2v4.25l3.25 1.9-1 1.73L11 13V8Z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-[#1b1b1b]">
                {card.title}
              </h3>
              <p className="mt-2 text-sm text-black/70">
                {card.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-24 sm:px-6 lg:px-10">
        <div className="rounded-3xl border border-black/10 bg-gradient-to-r from-amber-50 via-white to-emerald-50 p-8 shadow-sm">
          <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
            <div className="space-y-4">
              <p className="text-xs uppercase tracking-[0.2em] text-black/60">
                How it works
              </p>
              <h2 className="text-3xl font-semibold text-[#1b1b1b]">
                From order to first sip in three steps.
              </h2>
              <p className="text-sm text-black/70">
                Pick a blend, customize it, and track your tea as it brews.
              </p>
            </div>

            <div className="space-y-5">
              {[
                "Choose a brew from the curated list.",
                "Add your milk, sugar, and spice level.",
                "Collect or deliver with live tracking.",
              ].map((step, index) => (
                <div
                  key={step}
                  className="flex items-start gap-4 rounded-2xl border border-black/5 bg-white p-4 shadow-sm"
                >
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-600 text-sm font-semibold text-white">
                    {index + 1}
                  </span>
                  <p className="text-sm text-black/70">{step}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

          <section className="mx-auto max-w-6xl px-4 pb-24 sm:px-6 lg:px-10">
        <div className="rounded-3xl bg-foreground px-8 py-12 text-background">
          <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
            <div className="space-y-4">
              <h2 className="text-3xl font-semibold">
                Ready to share a cup?
              </h2>
              <p className="text-sm text-background/70">
                Create your account and start collecting rewards on every brew.
              </p>
            </div>
            <div className="flex flex-wrap gap-3 lg:justify-end">
              <a
                href="/role-select"
                className="inline-flex h-12 items-center justify-center rounded-md bg-amber-500 px-6 text-sm font-semibold text-foreground"
              >
                Create account
              </a>
              <a
                href="/login"
                className="inline-flex h-12 items-center justify-center rounded-md border border-white/20 px-6 text-sm font-semibold text-white/90"
              >
                I already have one
              </a>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
