"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";

interface LoginErrors {
  email?: string;
  password?: string;
  form?: string;
}

export function LoginPanel() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<LoginErrors>({});
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextErrors: LoginErrors = {};
    const normalizedEmail = email.trim();

    if (!normalizedEmail) {
      nextErrors.email = "Email address is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      nextErrors.email = "Enter a valid email address.";
    }

    if (!password) {
      nextErrors.password = "Password is required.";
    } else if (password.length < 8) {
      nextErrors.password = "Password must be at least 8 characters.";
    }

    if (Object.keys(nextErrors).length === 0) {
      setIsLoading(true);
      await new Promise((resolve) => window.setTimeout(resolve, 700));
      setIsLoading(false);
      nextErrors.form = "Sign in is temporarily unavailable because authentication is not connected yet.";
    }

    setErrors(nextErrors);
  }

  return (
    <section className="flex min-h-[calc(100vh-13rem)] items-center justify-center px-5 py-10 sm:min-h-[calc(100vh-16rem)] sm:px-10 lg:min-h-screen">
      <div className="w-full max-w-[430px]">
        <Link href="/" className="mb-10 flex items-center gap-3 lg:hidden" aria-label="Academy Desk home">
          <span className="grid h-11 w-11 place-items-center rounded-xl bg-[#2563eb] text-sm font-black text-white">AD</span>
          <span>
            <span className="block font-semibold text-slate-900">Academy Desk</span>
            <span className="block text-[10px] uppercase tracking-[0.18em] text-slate-400">Sports management</span>
          </span>
        </Link>

        <div>
          <p className="text-sm font-semibold text-[#2563eb]">Academy portal</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">Welcome back</h1>
          <p className="mt-3 text-sm leading-6 text-slate-500">Sign in to access your Academy Desk workspace.</p>
        </div>

        <form className="mt-8 space-y-5" onSubmit={handleSubmit} noValidate>
          {errors.form && (
            <div role="alert" aria-live="polite" className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {errors.form}
            </div>
          )}

          <div>
            <label htmlFor="email" className="mb-2 block text-sm font-semibold text-slate-700">Email address</label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(event) => {
                setEmail(event.target.value);
                if (errors.email || errors.form) setErrors({});
              }}
              aria-invalid={Boolean(errors.email)}
              aria-describedby={errors.email ? "email-error" : undefined}
              placeholder="name@academy.com"
              className={`h-12 w-full rounded-lg border bg-white px-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:ring-4 ${errors.email ? "border-red-400 focus:border-red-500 focus:ring-red-100" : "border-slate-300 focus:border-blue-500 focus:ring-blue-100"}`}
            />
            {errors.email && <p id="email-error" className="mt-2 text-xs text-red-600">{errors.email}</p>}
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between">
              <label htmlFor="password" className="text-sm font-semibold text-slate-700">Password</label>
              <Link href="/forgot-password" className="text-sm font-semibold text-[#2563eb] hover:text-blue-700">Forgot password?</Link>
            </div>
            <div className="relative">
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                required
                value={password}
                onChange={(event) => {
                  setPassword(event.target.value);
                  if (errors.password || errors.form) setErrors({});
                }}
                aria-invalid={Boolean(errors.password)}
                aria-describedby={errors.password ? "password-error" : undefined}
                placeholder="Enter your password"
                className={`h-12 w-full rounded-lg border bg-white px-4 pr-20 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:ring-4 ${errors.password ? "border-red-400 focus:border-red-500 focus:ring-red-100" : "border-slate-300 focus:border-blue-500 focus:ring-blue-100"}`}
              />
              <button type="button" onClick={() => setShowPassword((value) => !value)} aria-label={showPassword ? "Hide password" : "Show password"} aria-pressed={showPassword} className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md px-2 py-2 text-xs font-semibold text-slate-500 hover:bg-slate-100">
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
            {errors.password && <p id="password-error" className="mt-2 text-xs text-red-600">{errors.password}</p>}
          </div>

          <label className="flex cursor-pointer items-center gap-3 text-sm text-slate-600">
            <input type="checkbox" checked={remember} onChange={(event) => setRemember(event.target.checked)} className="h-4 w-4 rounded border-slate-300 accent-[#2563eb]" />
            Remember me on this device
          </label>

          <button type="submit" disabled={isLoading} aria-busy={isLoading} className="flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-[#2563eb] text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-200 disabled:cursor-not-allowed disabled:opacity-70">
            {isLoading && <span aria-hidden="true" className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />}
            {isLoading ? "Signing in..." : "Sign in"}
          </button>
        </form>

        <p className="mt-8 text-center text-xs text-slate-400">Secure access for Academy Desk teams</p>
      </div>
    </section>
  );
}
