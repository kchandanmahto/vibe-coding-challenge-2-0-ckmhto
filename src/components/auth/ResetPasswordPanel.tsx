"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { BrandLogo } from "@/components/BrandLogo";

interface ResetPasswordErrors {
  password?: string;
  confirmPassword?: string;
  form?: string;
}

export function ResetPasswordPanel({ token }: { token: string }) {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [errors, setErrors] = useState<ResetPasswordErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isPreviewSuccess, setIsPreviewSuccess] = useState(false);

  const strength = getPasswordStrength(password);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextErrors: ResetPasswordErrors = {};

    if (!password) {
      nextErrors.password = "New password is required.";
    } else if (password.length < 8) {
      nextErrors.password = "Password must be at least 8 characters.";
    }

    if (!confirmPassword) {
      nextErrors.confirmPassword = "Please confirm your new password.";
    } else if (password !== confirmPassword) {
      nextErrors.confirmPassword = "Passwords do not match.";
    }

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    setErrors({});
    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const result = await response.json().catch(() => null) as
        | { message?: string }
        | null;

      if (!response.ok) {
        setErrors({
          form: result?.message ?? "This reset link is invalid or has expired.",
        });
        return;
      }
      setIsPreviewSuccess(true);
    } catch {
      setErrors({ form: "Unable to reset the password. Please try again." });
    } finally {
      setIsLoading(false);
    }
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

        {!token ? (
          <div aria-live="polite">
            <p className="text-sm font-semibold text-red-600">Invalid reset link</p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">Request a new link</h1>
            <p className="mt-4 text-sm leading-7 text-slate-500">
              This reset link is missing, invalid, or has expired.
            </p>
            <Link href="/forgot-password" className="mt-7 flex h-12 items-center justify-center rounded-lg bg-[#2563eb] text-sm font-semibold text-white">
              Request New Reset Link
            </Link>
          </div>
        ) : isPreviewSuccess ? (
          <div aria-live="polite">
            <div className="grid h-14 w-14 place-items-center rounded-full bg-emerald-50 text-2xl text-emerald-600" aria-hidden="true">✓</div>
            <p className="mt-6 text-sm font-semibold text-[#2563eb]">Password updated</p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">Password reset complete</h1>
            <p className="mt-4 text-sm leading-7 text-slate-500">
              Your password has been changed. Sign in with your new password.
            </p>
            <Link href="/login" className="mt-7 flex h-12 items-center justify-center rounded-lg bg-[#2563eb] text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-500">
              Back to Login
            </Link>
          </div>
        ) : (
          <>
            <div>
              <p className="text-sm font-semibold text-[#2563eb]">Account security</p>
              <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">Create a New Password</h1>
              <p className="mt-3 text-sm leading-6 text-slate-500">Choose a strong password to secure your Academy Desk account.</p>
            </div>

            <form className="mt-8 space-y-5" onSubmit={handleSubmit} noValidate>
              {errors.form && (
                <div role="alert" aria-live="polite" className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {errors.form}
                </div>
              )}

              <PasswordField
                id="new-password"
                label="New Password"
                value={password}
                show={showPassword}
                error={errors.password}
                onToggle={() => setShowPassword((value) => !value)}
                onChange={(value) => {
                  setPassword(value);
                  if (errors.password || errors.confirmPassword || errors.form) setErrors({});
                }}
              />

              {password && (
                <div aria-live="polite">
                  <div className="mb-2 flex items-center justify-between text-xs">
                    <span className="text-slate-500">Password strength</span>
                    <span className={`font-semibold ${strength.color}`}>{strength.label}</span>
                  </div>
                  <div className="grid grid-cols-4 gap-2" aria-hidden="true">
                    {[1, 2, 3, 4].map((segment) => (
                      <span key={segment} className={`h-1.5 rounded-full ${segment <= strength.score ? strength.bar : "bg-slate-200"}`} />
                    ))}
                  </div>
                </div>
              )}

              <PasswordField
                id="confirm-password"
                label="Confirm New Password"
                value={confirmPassword}
                show={showConfirmation}
                error={errors.confirmPassword}
                onToggle={() => setShowConfirmation((value) => !value)}
                onChange={(value) => {
                  setConfirmPassword(value);
                  if (errors.confirmPassword || errors.form) setErrors({});
                }}
              />

              <button type="submit" disabled={isLoading} aria-busy={isLoading} className="flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-[#2563eb] text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-200 disabled:cursor-not-allowed disabled:opacity-70">
                {isLoading && <span aria-hidden="true" className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />}
                {isLoading ? "Resetting..." : "Reset Password"}
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

interface PasswordFieldProps {
  id: string;
  label: string;
  value: string;
  show: boolean;
  error?: string;
  onToggle: () => void;
  onChange: (value: string) => void;
}

function PasswordField({ id, label, value, show, error, onToggle, onChange }: PasswordFieldProps) {
  return (
    <div>
      <label htmlFor={id} className="mb-2 block text-sm font-semibold text-slate-700">{label}</label>
      <div className="relative">
        <input
          id={id}
          name={id}
          type={show ? "text" : "password"}
          autoComplete="new-password"
          required
          value={value}
          onChange={(event) => onChange(event.target.value)}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${id}-error` : undefined}
          placeholder={label}
          className={`h-12 w-full rounded-lg border bg-white px-4 pr-20 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:ring-4 ${error ? "border-red-400 focus:border-red-500 focus:ring-red-100" : "border-slate-300 focus:border-blue-500 focus:ring-blue-100"}`}
        />
        <button type="button" onClick={onToggle} aria-label={`${show ? "Hide" : "Show"} ${label.toLowerCase()}`} aria-pressed={show} className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md px-2 py-2 text-xs font-semibold text-slate-500 hover:bg-slate-100">
          {show ? "Hide" : "Show"}
        </button>
      </div>
      {error && <p id={`${id}-error`} className="mt-2 text-xs text-red-600">{error}</p>}
    </div>
  );
}

function getPasswordStrength(password: string) {
  let score = 0;
  if (password.length >= 8) score += 1;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score += 1;
  if (/\d/.test(password)) score += 1;
  if (/[^A-Za-z0-9]/.test(password)) score += 1;

  const levels = [
    { label: "Very weak", color: "text-red-600", bar: "bg-red-500" },
    { label: "Weak", color: "text-orange-600", bar: "bg-orange-500" },
    { label: "Fair", color: "text-amber-600", bar: "bg-amber-500" },
    { label: "Strong", color: "text-blue-600", bar: "bg-blue-500" },
    { label: "Excellent", color: "text-emerald-600", bar: "bg-emerald-500" },
  ];

  return { score, ...levels[score] };
}
