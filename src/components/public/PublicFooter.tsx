import Link from "next/link";

export function PublicFooter() {
  return (
    <footer className="bg-[#101828] px-5 text-slate-300 sm:px-8">
      <div className="mx-auto grid max-w-7xl gap-10 border-b border-white/10 py-12 md:grid-cols-[1.5fr_1fr_1fr]">
        <div>
          <div className="flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-xl bg-[#2563eb] text-sm font-black text-white">AD</span><span className="font-semibold text-white">Academy Desk</span></div>
          <p className="mt-4 max-w-sm text-sm leading-6 text-slate-400">A focused sports academy management platform for coaches, players and scouts.</p>
        </div>
        <div><p className="text-sm font-semibold text-white">Platform</p><div className="mt-4 flex flex-col gap-3 text-sm text-slate-400"><a href="#features">Features</a><a href="#sports">Sports</a><Link href="/login">Login</Link></div></div>
        <div><p className="text-sm font-semibold text-white">Company</p><div className="mt-4 flex flex-col gap-3 text-sm text-slate-400"><a href="#about">About</a><a href="#contact">Contact</a></div></div>
      </div>
      <div className="mx-auto flex max-w-7xl flex-col gap-2 py-6 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between"><p>© 2026 Academy Desk. All rights reserved.</p><p>Sports operations, clearly managed.</p></div>
    </footer>
  );
}
