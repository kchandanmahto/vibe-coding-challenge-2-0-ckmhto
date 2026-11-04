import Link from "next/link";
import { features, roles, sports } from "./landing-data";

export function Hero() {
  return (
    <section id="home" className="relative overflow-hidden bg-[#101828] pt-[76px] text-white">
      <div className="absolute inset-y-0 right-0 w-full opacity-35 lg:w-[52%]" style={{ backgroundImage: "linear-gradient(90deg,#101828 5%,rgba(16,24,40,.45)),url('https://images.unsplash.com/photo-1579952363873-27f3bade9f55?auto=format&fit=crop&w=1600&q=85')", backgroundSize: "cover", backgroundPosition: "center" }} />
      <div className="absolute right-[12%] top-32 hidden h-72 w-72 rounded-full border border-blue-400/20 lg:block" />
      <div className="relative mx-auto grid max-w-7xl gap-12 px-5 py-20 sm:px-8 sm:py-24 lg:grid-cols-[1.05fr_.95fr] lg:items-center lg:py-28">
        <div>
          <p className="mb-5 inline-flex rounded-full border border-blue-400/25 bg-blue-400/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-blue-300">Built for modern sports academies</p>
          <h1 className="max-w-3xl text-4xl font-bold leading-[1.08] tracking-tight sm:text-5xl lg:text-6xl">Run every part of your academy from one desk.</h1>
          <p className="mt-6 max-w-xl text-base leading-7 text-slate-300 sm:text-lg">Manage coaches, players, sessions, attendance, matches and player readiness with one clear, mobile-ready platform.</p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link href="/login" className="flex h-12 items-center justify-center rounded-lg bg-[#2563eb] px-6 text-sm font-semibold transition hover:bg-blue-500">Login to Academy Desk</Link>
            <a href="#features" className="flex h-12 items-center justify-center rounded-lg border border-white/20 px-6 text-sm font-semibold text-white transition hover:bg-white/10">Explore features</a>
          </div>
        </div>
        <div className="relative hidden min-h-[390px] lg:block">
          <div className="absolute bottom-8 right-0 w-[330px] rounded-2xl border border-white/15 bg-[#172033]/95 p-5 shadow-2xl backdrop-blur">
            <div className="flex items-center justify-between">
              <div><p className="text-xs text-slate-400">Program overview</p><p className="mt-1 font-semibold">Academy workspace</p></div><span className="rounded-full bg-emerald-400/15 px-2.5 py-1 text-xs text-emerald-300">Active</span>
            </div>
            <div className="mt-5 grid grid-cols-2 gap-3">
              <div className="rounded-xl bg-white/[0.06] p-4"><p className="text-xs text-slate-400">Sessions</p><p className="mt-2 text-xl font-bold">Plan</p></div>
              <div className="rounded-xl bg-white/[0.06] p-4"><p className="text-xs text-slate-400">Attendance</p><p className="mt-2 text-xl font-bold">Track</p></div>
            </div>
            <div className="mt-3 rounded-xl border border-blue-400/20 bg-blue-500/10 p-4"><p className="text-xs text-blue-300">Readiness overview</p><div className="mt-3 h-2 rounded-full bg-white/10"><div className="h-full w-[78%] rounded-full bg-blue-500" /></div></div>
          </div>
        </div>
      </div>
    </section>
  );
}

export function SportsSection() {
  return (
    <section id="sports" className="bg-white px-5 py-20 sm:px-8">
      <div className="mx-auto max-w-7xl">
        <SectionHeading eyebrow="Sports workspace" title="Built around every training program" description="Configure Academy Desk for the sports your academy offers." />
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {sports.map((sport) => (
            <article key={sport.name} className="group rounded-2xl border border-slate-200 bg-white p-6 transition hover:-translate-y-1 hover:border-blue-200 hover:shadow-xl hover:shadow-slate-200/60">
              <div className="grid h-12 w-12 place-items-center rounded-xl bg-[#eff5ff] text-sm font-bold text-[#2563eb]">{sport.mark}</div>
              <h3 className="mt-5 text-lg font-semibold text-slate-900">{sport.name}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-500">{sport.short}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export function FeaturesSection() {
  return (
    <section id="features" className="bg-[#f4f7fb] px-5 py-20 sm:px-8">
      <div className="mx-auto max-w-7xl">
        <SectionHeading eyebrow="Platform features" title="One system for daily academy operations" description="Replace disconnected notes and spreadsheets with connected, role-focused workflows." />
        <div className="mt-10 grid gap-5 md:grid-cols-2">
          {features.map((feature) => (
            <article key={feature.title} className="rounded-2xl border border-slate-200/80 bg-white p-7 shadow-sm">
              <span className="text-xs font-bold tracking-[0.18em] text-blue-600">{feature.icon}</span>
              <h3 className="mt-5 text-xl font-semibold text-slate-900">{feature.title}</h3>
              <p className="mt-3 max-w-md text-sm leading-7 text-slate-500">{feature.description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export function HowItWorks() {
  const steps = [
    ["01", "Configure your academy", "Set up the academy, sports and authorised team roles."],
    ["02", "Organize daily operations", "Create sessions, manage assignments and mark attendance."],
    ["03", "Track verified records", "Record matches and scores in consistent player histories."],
    ["04", "Understand readiness", "Use attendance and match participation to review player readiness."],
  ];
  return (
    <section className="bg-white px-5 py-20 sm:px-8">
      <div className="mx-auto max-w-7xl">
        <SectionHeading eyebrow="How it works" title="From daily activity to clear insights" description="A straightforward workflow designed for academy teams." />
        <div className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {steps.map(([number, title, description]) => (
            <div key={number} className="relative">
              <span className="grid h-11 w-11 place-items-center rounded-full bg-[#2563eb] text-sm font-bold text-white">{number}</span>
              <h3 className="mt-5 text-lg font-semibold text-slate-900">{title}</h3>
              <p className="mt-3 text-sm leading-6 text-slate-500">{description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function RoleBenefits() {
  return (
    <section className="bg-[#101828] px-5 py-20 text-white sm:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="max-w-2xl">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-400">Purpose-built roles</p>
          <h2 className="mt-4 text-3xl font-bold sm:text-4xl">The right view for every person in your academy</h2>
        </div>
        <div className="mt-10 grid gap-5 md:grid-cols-2">
          {roles.map((item, index) => (
            <article key={item.role} className="rounded-2xl border border-white/10 bg-white/[0.04] p-6 sm:p-7">
              <div className="flex items-start justify-between">
                <h3 className="text-xl font-semibold">{item.role}</h3>
                <span className="text-xs font-bold text-blue-400">0{index + 1}</span>
              </div>
              <p className="mt-3 text-sm leading-6 text-slate-400">{item.description}</p>
              <ul className="mt-5 space-y-2 text-sm text-slate-300">
                {item.points.map((point) => <li key={point} className="flex gap-2"><span className="text-blue-400">✓</span>{point}</li>)}
              </ul>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export function AboutSection() {
  return (
    <section id="about" className="bg-white px-5 py-20 sm:px-8">
      <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-2 lg:items-center">
        <div className="relative min-h-[360px] overflow-hidden rounded-3xl bg-[#101828]" style={{ backgroundImage: "linear-gradient(rgba(16,24,40,.15),rgba(16,24,40,.55)),url('https://images.unsplash.com/photo-1526232761682-d26e03ac148e?auto=format&fit=crop&w=1200&q=85')", backgroundSize: "cover", backgroundPosition: "center" }}>
          <div className="absolute bottom-5 left-5 rounded-xl border border-white/15 bg-[#101828]/90 px-5 py-4 text-white backdrop-blur"><p className="text-xs text-slate-400">Academy Desk</p><p className="mt-1 font-semibold">Focused on better daily operations</p></div>
        </div>
        <div>
          <SectionHeading align="left" eyebrow="About Academy Desk" title="Clear records support stronger coaching" description="Academy Desk is designed to make academy information easier to organise, review and act on. It gives coaches and administrators a shared operational view without adding complexity to daily routines." />
          <a href="#contact" className="mt-7 inline-flex h-11 items-center rounded-lg border border-slate-300 px-5 text-sm font-semibold text-slate-800 transition hover:border-blue-500 hover:text-blue-600">Contact the team</a>
        </div>
      </div>
    </section>
  );
}

export function ContactSection() {
  return (
    <section id="contact" className="bg-[#f4f7fb] px-5 py-20 sm:px-8">
      <div className="mx-auto grid max-w-7xl gap-8 overflow-hidden rounded-3xl bg-[#2563eb] px-6 py-10 text-white sm:px-10 lg:grid-cols-[1fr_auto] lg:items-center">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-100">Start a conversation</p>
          <h2 className="mt-3 text-3xl font-bold">Bring your academy operations into one clear workspace.</h2>
          <p className="mt-4 max-w-xl text-sm leading-7 text-blue-100">Contact the Academy Desk team to discuss how the platform can fit your academy workflow.</p>
        </div>
        <a href="mailto:contact@academy-desk.example" className="flex h-12 items-center justify-center rounded-lg bg-white px-6 text-sm font-semibold text-[#2563eb]">Email Academy Desk</a>
      </div>
    </section>
  );
}

function SectionHeading({ eyebrow, title, description, align = "center" }: { eyebrow: string; title: string; description: string; align?: "left" | "center" }) {
  return (
    <div className={align === "center" ? "mx-auto max-w-2xl text-center" : "max-w-xl text-left"}>
      <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-600">{eyebrow}</p>
      <h2 className="mt-4 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">{title}</h2>
      <p className="mt-4 text-sm leading-7 text-slate-500 sm:text-base">{description}</p>
    </div>
  );
}
