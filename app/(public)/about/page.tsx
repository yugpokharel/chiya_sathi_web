export default function AboutPage() {
  return (
    <main className="min-h-screen bg-[#f8f5ef] text-[#1b1b1b]">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-amber-50 via-white to-emerald-50 py-20">
        <div className="absolute -left-40 top-10 h-80 w-80 rounded-full bg-amber-200/40 blur-3xl" />
        <div className="absolute -right-40 bottom-0 h-80 w-80 rounded-full bg-emerald-200/30 blur-3xl" />
        <div className="relative mx-auto max-w-4xl px-4 text-center sm:px-6">
          <span className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-white/90 px-4 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-amber-700 shadow-sm">
            Our Story
            <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
          </span>
          <h1 className="mt-6 text-4xl font-semibold tracking-tight sm:text-5xl lg:text-6xl">
            About <span className="text-amber-700">ChiyaSathi</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-base text-black/70 sm:text-lg">
            We believe every cup of tea tells a story. ChiyaSathi bridges the
            warmth of your favorite local tea stall with the convenience of
            modern technology.
          </p>
        </div>
      </section>

      {/* Mission */}
      <section className="mx-auto max-w-5xl px-4 py-20 sm:px-6">
        <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
          <div className="space-y-6">
            <h2 className="text-3xl font-semibold">Our Mission</h2>
            <p className="text-base text-black/70 leading-relaxed">
              ChiyaSathi was born out of a simple idea — make the tea ordering
              experience seamless for both customers and cafe owners. No more
              waiting in long queues or shouting orders across a crowded shop.
            </p>
            <p className="text-base text-black/70 leading-relaxed">
              We empower small tea stalls and cafes with a smart ordering system
              that lets customers browse menus, place orders from their table,
              and track preparation in real-time — all from their phone.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {[
              { value: "500+", label: "Cafes Onboarded" },
              { value: "50K+", label: "Orders Served" },
              { value: "40+", label: "Tea Blends" },
              { value: "4.8★", label: "User Rating" },
            ].map((stat) => (
              <div
                key={stat.label}
                className="rounded-2xl border border-black/5 bg-white p-6 text-center shadow-sm"
              >
                <p className="text-3xl font-bold text-amber-700">{stat.value}</p>
                <p className="mt-1 text-xs uppercase tracking-[0.15em] text-black/50">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="bg-white py-20">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <div className="text-center">
            <h2 className="text-3xl font-semibold">How It Works</h2>
            <p className="mx-auto mt-3 max-w-xl text-sm text-black/60">
              Whether you&apos;re a tea lover or a cafe owner, ChiyaSathi keeps
              things simple.
            </p>
          </div>

          <div className="mt-12 grid gap-8 md:grid-cols-2">
            {/* Customer */}
            <div className="rounded-2xl border border-black/5 bg-[#f8f5ef] p-8">
              <h3 className="text-lg font-semibold text-amber-700">
                ☕ For Customers
              </h3>
              <ul className="mt-6 space-y-4">
                {[
                  "Sit down and enter your table number",
                  "Browse the menu and add items to your cart",
                  "Place your order and track live preparation",
                  "Get notified when your order is ready",
                ].map((step, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-black/70">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-amber-600 text-xs font-bold text-white">
                      {i + 1}
                    </span>
                    {step}
                  </li>
                ))}
              </ul>
            </div>

            {/* Owner */}
            <div className="rounded-2xl border border-black/5 bg-[#f8f5ef] p-8">
              <h3 className="text-lg font-semibold text-emerald-700">
                🏪 For Cafe Owners
              </h3>
              <ul className="mt-6 space-y-4">
                {[
                  "Register your cafe and set up your menu",
                  "Receive orders instantly on your dashboard",
                  "Accept, prepare, and mark orders as ready",
                  "Manage your menu items and track daily stats",
                ].map((step, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-black/70">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-xs font-bold text-white">
                      {i + 1}
                    </span>
                    {step}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="mx-auto max-w-5xl px-4 py-20 sm:px-6">
        <h2 className="text-center text-3xl font-semibold">What We Value</h2>
        <div className="mt-12 grid gap-6 sm:grid-cols-3">
          {[
            {
              icon: "🤝",
              title: "Community First",
              desc: "We support local tea stalls and small businesses to thrive with technology.",
            },
            {
              icon: "⚡",
              title: "Speed & Simplicity",
              desc: "No complicated setup. Customers order in seconds, owners manage with ease.",
            },
            {
              icon: "🌿",
              title: "Authentic Experience",
              desc: "We enhance, never replace, the traditional charm of your neighborhood chiya pasal.",
            },
          ].map((v) => (
            <div
              key={v.title}
              className="rounded-2xl border border-black/5 bg-white p-6 text-center shadow-sm"
            >
              <span className="text-4xl">{v.icon}</span>
              <h3 className="mt-4 text-lg font-semibold">{v.title}</h3>
              <p className="mt-2 text-sm text-black/60">{v.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-5xl px-4 pb-24 sm:px-6">
        <div className="rounded-3xl bg-[#1b1b1b] px-8 py-12 text-white">
          <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
            <div className="space-y-3">
              <h2 className="text-3xl font-semibold">
                Join the ChiyaSathi family
              </h2>
              <p className="text-sm text-white/60">
                Whether you want to order your next cup or onboard your cafe,
                we&apos;re here for you.
              </p>
            </div>
            <div className="flex flex-wrap gap-3 lg:justify-end">
              <a
                href="/role-select"
                className="inline-flex h-12 items-center justify-center rounded-md bg-amber-500 px-6 text-sm font-semibold text-black"
              >
                Get Started
              </a>
              <a
                href="/login"
                className="inline-flex h-12 items-center justify-center rounded-md border border-white/20 px-6 text-sm font-semibold text-white/90"
              >
                Log in
              </a>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}