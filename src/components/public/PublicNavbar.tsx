
"use client";

import Link from "next/link";
import { useState } from "react";
import { BrandLogo } from "@/components/BrandLogo";

const links = [
  ["Home", "#home"],
  ["About", "#about"],
  ["Sports", "#sports"],
  ["Gallery", "#gallery"],
  ["Contact", "#contact"],
];

export function PublicNavbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-white/10 bg-[#101828]/95 backdrop-blur">
      <div className="mx-auto flex h-[76px] max-w-7xl items-center justify-between px-5 sm:px-8">
        <Link
          href="/"
          className="flex items-center gap-3 text-white"
          aria-label="Academy Desk home"
        >
          <BrandLogo size={40} priority />
          <span>
            <span className="block font-semibold">Academy Desk</span>
            <span className="block text-[10px] uppercase tracking-[0.18em] text-slate-400">
              Sports management
            </span>
          </span>
        </Link>

        <nav
          className="hidden items-center gap-7 lg:flex"
          aria-label="Main navigation"
        >
          {links.map(([label, href]) => (
            <a
              key={label}
              href={href}
              className="text-sm font-medium text-slate-300 transition hover:text-white"
            >
              {label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Link
            href="/login"
            className="hidden h-10 items-center rounded-lg bg-[#2563eb] px-5 text-sm font-semibold text-white transition hover:bg-blue-500 sm:flex"
          >
            Login
          </Link>

          <button
            type="button"
            aria-label={open ? "Close navigation" : "Open navigation"}
            aria-expanded={open}
            onClick={() => setOpen((value) => !value)}
            className="grid h-10 w-10 place-items-center rounded-lg border border-white/15 text-white lg:hidden"
          >
            <span className="text-xl leading-none">
              {open ? "×" : "☰"}
            </span>
          </button>
        </div>
      </div>

      {open && (
        <nav
          className="border-t border-white/10 bg-[#101828] px-5 py-4 lg:hidden"
          aria-label="Mobile navigation"
        >
          <div className="mx-auto flex max-w-7xl flex-col">
            {links.map(([label, href]) => (
              <a
                key={label}
                href={href}
                onClick={() => setOpen(false)}
                className="border-b border-white/8 py-3 text-sm text-slate-200"
              >
                {label}
              </a>
            ))}

            <Link
              href="/login"
              onClick={() => setOpen(false)}
              className="mt-4 flex h-11 items-center justify-center rounded-lg bg-[#2563eb] text-sm font-semibold text-white"
            >
              Login
            </Link>
          </div>
        </nav>
      )}
    </header>
  );
}
