import Link from "next/link";
import Image from "next/image";

export default function Footer() {
  return (
    <footer className="border-t border-black/10 bg-white text-[#1b1b1b]">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-2 font-semibold">
              <Image src="/logo.png" alt="ChiyaSathi" width={32} height={32} className="h-8 w-8 rounded-md object-contain" />
              ChiyaSathi
            </Link>
            <p className="text-sm text-black/60 leading-relaxed">
              Order smart. Serve faster. Your favorite tea experience,
              reimagined for the digital age.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-black/40">
              Quick Links
            </h4>
            <ul className="mt-4 space-y-2">
              {[
                { href: "/", label: "Home" },
                { href: "/about", label: "About" },
                { href: "/login", label: "Log in" },
                { href: "/role-select", label: "Sign up" },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-black/60 transition hover:text-black"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* For Business */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-black/40">
              For Business
            </h4>
            <ul className="mt-4 space-y-2">
              {[
                { href: "/role-select", label: "Onboard your cafe" },
                { href: "/about", label: "How it works" },
              ].map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-black/60 transition hover:text-black"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-black/40">
              Contact
            </h4>
            <ul className="mt-4 space-y-2 text-sm text-black/60">
              <li>hello@chiyasathi.com</li>
              <li>Kathmandu, Nepal</li>
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-black/10 pt-6 sm:flex-row">
          <p className="text-xs text-black/40">
            &copy; {new Date().getFullYear()} ChiyaSathi. All rights reserved.
          </p>
          <p className="text-xs text-black/40">
            Made with ☕ in Nepal
          </p>
        </div>
      </div>
    </footer>
  );
}
