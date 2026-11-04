import { LoginPanel } from "@/components/auth/LoginPanel";
import Link from "next/link";

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-white">
      <div className="grid min-h-screen lg:grid-cols-[1.08fr_.92fr]">
        <section className="relative h-52 overflow-hidden bg-[#101828] sm:h-64 lg:h-auto" aria-label="Academy Desk overview">
          <div
            className="absolute inset-0 opacity-45"
            style={{
              backgroundImage:
                "linear-gradient(180deg,rgba(16,24,40,.15),rgba(16,24,40,.92)),url('https://images.unsplash.com/photo-1579952363873-27f3bade9f55?auto=format&fit=crop&w=1600&q=85')",
              backgroundPosition: "center",
              backgroundSize: "cover",
            }}
          />
          <div className="relative flex h-full flex-col justify-between p-5 sm:p-8 lg:p-10 xl:p-14">
            <Link href="/" className="hidden items-center gap-3 text-white lg:flex" aria-label="Academy Desk home">
              <span className="grid h-11 w-11 place-items-center rounded-xl bg-[#2563eb] text-sm font-black">AD</span>
              <span>
                <span className="block font-semibold">Academy Desk</span>
                <span className="block text-[10px] uppercase tracking-[0.18em] text-slate-400">Sports management</span>
              </span>
            </Link>
            <div className="max-w-xl lg:block">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-400">One academy workspace</p>
              <h2 className="mt-2 max-w-md text-xl font-bold leading-tight text-white sm:text-2xl lg:mt-4 lg:text-4xl xl:text-5xl">Every training day, match and player record in focus.</h2>
              <div className="mt-7 hidden grid-cols-3 gap-3 lg:grid">
                {["Sessions", "Attendance", "Readiness"].map((item) => (
                  <div key={item} className="rounded-xl border border-white/10 bg-white/[0.07] px-4 py-4 backdrop-blur">
                    <span className="mb-4 block h-1.5 w-8 rounded-full bg-blue-500" />
                    <span className="text-sm font-medium text-slate-200">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
        <LoginPanel />
      </div>
    </main>
  );
}
