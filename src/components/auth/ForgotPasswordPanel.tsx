"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { BrandLogo } from "@/components/BrandLogo";

interface ForgotPasswordErrors {
  email?: string;
  form?: string;
}

export function ForgotPasswordPanel() {
  const [email, setEmail] = useState("");
  const [errors, setErrors] = useState<ForgotPasswordErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isPreviewSuccess, setIsPreviewSuccess] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const normalizedEmail = email.trim();
    const nextErrors: ForgotPasswordErrors = {};

    if (!normalizedEmail) {
      nextErrors.email = "Email address is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      nextErrors.email = "Enter a valid email address.";
    }

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    setErrors({});
    setIsLoading(true);
    await new Promise((resolve) => window.setTimeout(resolve, 700));
    setIsLoading(false);

    setIsPreviewSuccess(true);
  }

  return (
    <section className="flex min-h-[calc(100vh-13rem)] items-center justify-center px-5 py-10 sm:min-h-[calc(100vh-16rem)] sm:px-10 lg:min-h-screen">
      <div className="w-full max-w-[430px]">
        <Link href="/" className="mb-10 flex items-center gap-3 lg:hidden" aria-label="Academy Desk home">
          <BrandLogo size={44} />
          <span>
            <span className="block font-semibold text-slate-900">Academy Desk</span>
            <span className="block text-[10px] uppercase tracking-[0.18em] text-slate-400">Sports management</span>
          </span>
        </Link>

        {isPreviewSuccess ? (
          <div aria-live="polite">
            <div className="grid h-14 w-14 place-items-center rounded-full bg-emerald-50 text-2xl text-emerald-600" aria-hidden="true">✓</div>
            <p className="mt-6 text-sm font-semibold text-[#2563eb]">UI preview complete</p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">Reset request ready</h1>
            <p className="mt-4 text-sm leading-7 text-slate-500">
              This confirms the frontend success state only. No password reset email was sent and no backend request was made.
            </p>
            <div className="mt-5 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
              Requested for <span className="break-all font-semibold text-slate-800">{email.trim()}</span>
            </div>
            <Link href="/login" className="mt-7 flex h-12 items-center justify-center rounded-lg bg-[#2563eb] text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-500">
              Back to Login
            </Link>
          </div>
        ) : (
          <>
            <div>
              <p className="text-sm font-semibold text-[#2563eb]">Account recovery</p>
              <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">Forgot your password?</h1>
              <p className="mt-3 text-sm leading-6 text-slate-500">
                Enter your registered email address and we will send you a password reset link.
              </p>
            </div>

            <form className="mt-8 space-y-5" onSubmit={handleSubmit} noValidate>
              {errors.form && (
                <div role="alert" aria-live="polite" className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {errors.form}
                </div>
              )}

              <div>
                <label htmlFor="recovery-email" className="mb-2 block text-sm font-semibold text-slate-700">Email address</label>
                <input
                  id="recovery-email"
                  name="email"
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(event) => {
                    setEmail(event.target.value);
                    if (errors.email || errors.form) setErrors({});
                  }}
                  aria-invalid={Boolean(errors.email)}
                  aria-describedby={errors.email ? "recovery-email-error" : undefined}
                  placeholder="name@academy.com"
                  className={`h-12 w-full rounded-lg border bg-white px-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:ring-4 ${errors.email ? "border-red-400 focus:border-red-500 focus:ring-red-100" : "border-slate-300 focus:border-blue-500 focus:ring-blue-100"}`}
                />
                {errors.email && <p id="recovery-email-error" className="mt-2 text-xs text-red-600">{errors.email}</p>}
              </div>

              <button type="submit" disabled={isLoading} aria-busy={isLoading} className="flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-[#2563eb] text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-200 disabled:cursor-not-allowed disabled:opacity-70">
                {isLoading && <span aria-hidden="true" className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />}
                {isLoading ? "Preparing preview..." : "Send Reset Link"}
              </button>
            </form>

            <Link href="/login" className="mt-7 flex items-center justify-center text-sm font-semibold text-[#2563eb] hover:text-blue-700">
              ← Back to Login
            </Link>
          </>
        )}
      </div>
    </section>
  );
}
