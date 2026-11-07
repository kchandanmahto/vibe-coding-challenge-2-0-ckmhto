
import Link from "next/link";
import { BrandLogo } from "@/components/BrandLogo";

const socialLinks = [
  {
    name: "Instagram",
    href: "https://www.instagram.com/",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden="true">
        <rect x="3" y="3" width="18" height="18" rx="5" stroke="currentColor" strokeWidth="1.8" />
        <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.8" />
        <circle cx="17.5" cy="6.5" r="1" fill="currentColor" />
      </svg>
    ),
  },
  {
    name: "Facebook",
    href: "https://www.facebook.com/",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5" aria-hidden="true">
        <path d="M13.4 21v-8.2h2.8l.4-3.2h-3.2V7.5c0-.9.3-1.5 1.6-1.5h1.7V3.1c-.3 0-1.4-.1-2.6-.1-2.6 0-4.4 1.6-4.4 4.5v2.1H7v3.2h2.7V21h3.7Z" />
      </svg>
    ),
  },
  {
    name: "YouTube",
    href: "https://www.youtube.com/",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5" aria-hidden="true">
        <path d="M23.2 7a3 3 0 0 0-2.1-2.1C19.2 4.4 12 4.4 12 4.4s-7.2 0-9.1.5A3 3 0 0 0 .8 7 31 31 0 0 0 .3 12a31 31 0 0 0 .5 5 3 3 0 0 0 2.1 2.1c1.9.5 9.1.5 9.1.5s7.2 0 9.1-.5a3 3 0 0 0 2.1-2.1 31 31 0 0 0 .5-5 31 31 0 0 0-.5-5ZM9.6 15.6V8.4l6.2 3.6-6.2 3.6Z" />
      </svg>
    ),
  },
  {
    name: "LinkedIn",
    href: "https://www.linkedin.com/",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5" aria-hidden="true">
        <path d="M5.2 3.5a2.2 2.2 0 1 0 0 4.4 2.2 2.2 0 0 0 0-4.4ZM3.3 9.5h3.8v11H3.3v-11Zm6.1 0H13v1.5h.1a4 4 0 0 1 3.6-2c3.9 0 4.6 2.5 4.6 5.7v5.8h-3.8v-5.1c0-1.2 0-2.8-1.8-2.8s-2.1 1.3-2.1 2.7v5.2H9.4v-11Z" />
      </svg>
    ),
  },
];

const quickLinks = [
  { label: "Home", href: "#home" },
  { label: "About Academy", href: "#about" },
  { label: "Sports", href: "#sports" },
  { label: "Gallery", href: "#gallery" },
];

export function PublicFooter() {
  return (
    <footer className="relative overflow-hidden border-t border-white/10 bg-[#080f1e] text-slate-300">
      <div className="pointer-events-none absolute -left-32 top-0 h-56 w-56 rounded-full bg-blue-600/10 blur-[100px]" />
      <div className="pointer-events-none absolute -right-32 bottom-0 h-56 w-56 rounded-full bg-indigo-600/10 blur-[100px]" />

      <div className="relative mx-auto max-w-7xl px-5 sm:px-8">
        <div className="grid gap-8 py-8 sm:py-9 md:grid-cols-2 lg:grid-cols-[1.4fr_0.8fr_0.8fr] lg:gap-12">
          {/* Brand */}
          <div>
            <Link href="/" className="inline-flex items-center gap-3">
              <BrandLogo size={42} />
              <span>
                <span className="block text-lg font-bold text-white">
                  Academy Desk
                </span>
                <span className="block text-[10px] uppercase tracking-[0.2em] text-blue-400">
                  Sports Management
                </span>
              </span>
            </Link>

            <p className="mt-3 max-w-sm text-sm leading-6 text-slate-400">
              A smarter way to manage sports academies, connect coaches and
              players, and bring every sports activity together in one place.
            </p>

            <p className="mt-2 text-sm font-medium text-blue-300">
              Dumka Sports Academy
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-white">
              Quick Links
            </h3>

            <div className="mt-4 flex flex-col items-start gap-2.5">
              {quickLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  className="text-sm text-slate-400 transition hover:translate-x-1 hover:text-blue-400"
                >
                  {link.label}
                </a>
              ))}

              <Link
                href="/login"
                className="text-sm text-slate-400 transition hover:translate-x-1 hover:text-blue-400"
              >
                Login
              </Link>
            </div>
          </div>

          {/* Social Media */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-white">
              Follow Us
            </h3>

            <div className="mt-4 flex flex-col items-start gap-3">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`Visit ${social.name}`}
                  className="group flex items-center gap-3 text-sm text-slate-400 transition hover:text-blue-400"
                >
                  <span className="transition group-hover:scale-110">
                    {social.icon}
                  </span>
                  <span>{social.name}</span>
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="flex flex-col gap-2 border-t border-white/10 py-4 text-center sm:flex-row sm:items-center sm:justify-between sm:text-left">
          <p className="text-xs text-slate-500">
            © 2026 Academy Desk. All rights reserved.
          </p>

          <p className="text-xs text-slate-500">
            Built for sports. Designed for progress.
          </p>
        </div>
      </div>
    </footer>
  );
}
