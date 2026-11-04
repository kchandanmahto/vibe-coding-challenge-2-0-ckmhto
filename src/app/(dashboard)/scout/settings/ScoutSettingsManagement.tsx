"use client";

import { Eye, EyeOff, LockKeyhole, X } from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { Panel } from "@/components/dashboard/Dashboard";
import { LoadingState, PageHeader } from "@/components/dashboard/DashboardUI";

const fieldClass = "mt-1.5 h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100";

const defaults = {
  name: "Neha Sharma",
  email: "neha.sharma@academy.example",
  phone: "",
  language: "English",
  timezone: "Asia/Kolkata",
  dateFormat: "DD/MM/YYYY",
  theme: "Light",
};

function Toggle({ label, detail, checked, onChange }: { label: string; detail: string; checked: boolean; onChange: (value: boolean) => void }) {
  return (
    <label className="flex cursor-pointer items-center justify-between gap-4 border-b border-slate-100 py-4 last:border-0">
      <span><span className="block text-sm font-semibold text-slate-800">{label}</span><span className="mt-1 block text-xs leading-5 text-slate-500">{detail}</span></span>
      <input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} className="sr-only" />
      <span className={`relative h-6 w-11 shrink-0 rounded-full transition ${checked ? "bg-blue-600" : "bg-slate-300"}`}><span className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow transition ${checked ? "left-6" : "left-1"}`} /></span>
    </label>
  );
}

export function ScoutSettingsManagement() {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState({ name: defaults.name, email: defaults.email, phone: defaults.phone });
  const [savedProfile, setSavedProfile] = useState(profile);
  const [language, setLanguage] = useState(defaults.language);
  const [timezone, setTimezone] = useState(defaults.timezone);
  const [dateFormat, setDateFormat] = useState(defaults.dateFormat);
  const [theme, setTheme] = useState(defaults.theme);
  const [notifications, setNotifications] = useState({ ready: true, readiness: true, announcements: false, account: true });
  const [password, setPassword] = useState({ current: "", next: "", confirm: "" });
  const [showPasswords, setShowPasswords] = useState(false);
  const [error, setError] = useState("");
  const [toast, setToast] = useState("");
  const [confirmReset, setConfirmReset] = useState(false);
  const [confirmSave, setConfirmSave] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => setLoading(false), 350);
    return () => window.clearTimeout(timer);
  }, []);

  const notify = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(""), 2600);
  };

  const saveProfile = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!profile.name.trim()) {
      setError("Full name is required.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profile.email)) {
      setError("Enter a valid email address.");
      return;
    }
    setError("");
    setConfirmSave(true);
  };

  const validatePassword = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!password.current || !password.next || !password.confirm) {
      setError("All password fields are required.");
      return;
    }
    if (password.next.length < 8 || !/[A-Za-z]/.test(password.next) || !/[0-9]/.test(password.next)) {
      setError("New password must contain at least 8 characters, including a letter and a number.");
      return;
    }
    if (password.next !== password.confirm) {
      setError("New password and confirmation do not match.");
      return;
    }
    setError("");
    setPassword({ current: "", next: "", confirm: "" });
    notify("Password fields passed preview validation. No password was changed.");
  };

  const resetChanges = () => {
    setProfile(savedProfile);
    setLanguage(defaults.language);
    setTimezone(defaults.timezone);
    setDateFormat(defaults.dateFormat);
    setTheme(defaults.theme);
    setNotifications({ ready: true, readiness: true, announcements: false, account: true });
    setPassword({ current: "", next: "", confirm: "" });
    setConfirmReset(false);
    notify("Settings reset locally to the mock defaults.");
  };

  return (
    <DashboardShell role="scout" title="Settings" subtitle="Scout profile and preferences">
      <PageHeader title="Scout Settings" description="Manage local mock preferences; changes are not persisted" />
      {toast && <div role="status" className="fixed bottom-5 right-5 z-[60] rounded-lg bg-slate-900 px-4 py-3 text-sm text-white shadow-xl">{toast}</div>}
      {loading ? <LoadingState message="Loading settings..." /> : (
        <div className="space-y-5">
          {error && <div role="alert" className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

          <Panel title="Profile preferences">
            <form onSubmit={saveProfile} className="grid gap-4 p-5 md:grid-cols-2">
              <div className="md:col-span-2 flex items-center gap-4 rounded-xl bg-slate-50 p-4"><span className="grid h-16 w-16 place-items-center rounded-full bg-blue-100 text-xl font-bold text-blue-700">NS</span><div><p className="font-semibold text-slate-900">Profile photo preview</p><p className="mt-1 text-xs text-slate-500">Mock initials avatar</p></div></div>
              <label className="text-sm font-medium text-slate-700">Full name<input value={profile.name} onChange={(event) => setProfile((current) => ({ ...current, name: event.target.value }))} className={fieldClass} /></label>
              <label className="text-sm font-medium text-slate-700">Email address<input type="email" value={profile.email} onChange={(event) => setProfile((current) => ({ ...current, email: event.target.value }))} className={fieldClass} /></label>
              <label className="text-sm font-medium text-slate-700">Phone number<input value={profile.phone} onChange={(event) => setProfile((current) => ({ ...current, phone: event.target.value }))} placeholder="Unavailable" className={fieldClass} /></label>
              <label className="text-sm font-medium text-slate-700">Role<input value="Scout" disabled className={`${fieldClass} bg-slate-50`} /></label>
              <label className="text-sm font-medium text-slate-700 md:col-span-2">Account status<input value="Active" disabled className={`${fieldClass} bg-slate-50`} /></label>
              <div className="md:col-span-2 flex justify-end"><button type="submit" className="h-10 rounded-lg bg-blue-600 px-4 text-sm font-semibold text-white">Save changes</button></div>
            </form>
          </Panel>

          <Panel title="Account preferences">
            <div className="grid gap-4 p-5 md:grid-cols-2 xl:grid-cols-4">
              <label className="text-sm font-medium text-slate-700">Preferred language<select value={language} onChange={(event) => setLanguage(event.target.value)} className={fieldClass}><option>English</option><option>Hindi</option><option>Marathi</option></select></label>
              <label className="text-sm font-medium text-slate-700">Time zone<select value={timezone} onChange={(event) => setTimezone(event.target.value)} className={fieldClass}><option>Asia/Kolkata</option><option>UTC</option></select></label>
              <label className="text-sm font-medium text-slate-700">Date format<select value={dateFormat} onChange={(event) => setDateFormat(event.target.value)} className={fieldClass}><option>DD/MM/YYYY</option><option>MM/DD/YYYY</option><option>YYYY-MM-DD</option></select></label>
              <label className="text-sm font-medium text-slate-700">Theme<select value={theme} onChange={(event) => setTheme(event.target.value)} className={fieldClass}><option>Light</option><option>Dark</option><option>System</option></select></label>
            </div>
          </Panel>

          <Panel title="Notification preferences">
            <div className="px-5">
              <Toggle label="New Ready Players" detail="Notify when a player meets the documented readiness criteria." checked={notifications.ready} onChange={(value) => setNotifications((current) => ({ ...current, ready: value }))} />
              <Toggle label="Player Readiness Updates" detail="Notify when readiness eligibility changes." checked={notifications.readiness} onChange={(value) => setNotifications((current) => ({ ...current, readiness: value }))} />
              <Toggle label="Academy Announcements" detail="Receive general academy notifications." checked={notifications.announcements} onChange={(value) => setNotifications((current) => ({ ...current, announcements: value }))} />
              <Toggle label="Important Account Notifications" detail="Receive account and security notices." checked={notifications.account} onChange={(value) => setNotifications((current) => ({ ...current, account: value }))} />
            </div>
          </Panel>

          <Panel title="Privacy and access rules">
            <div className="grid gap-3 p-5 text-sm text-slate-600 md:grid-cols-2">
              {["A Scout can view Ready players only.", "Not Ready players are not available in Scout directories.", "Private player contact information is restricted.", "A Scout cannot edit player attendance, matches, scores, or readiness."].map((rule) => <div key={rule} className="rounded-lg bg-slate-50 px-4 py-3">{rule}</div>)}
            </div>
          </Panel>

          <Panel title="Security settings">
            <form onSubmit={validatePassword} className="p-5">
              <div className="mb-4 flex items-start gap-3 rounded-lg border border-blue-100 bg-blue-50 p-4"><LockKeyhole className="mt-0.5 h-5 w-5 text-blue-600" /><div><p className="text-sm font-semibold text-blue-900">Preview-only security actions</p><p className="mt-1 text-xs leading-5 text-blue-700">Password validation runs locally. No password is sent, stored, or changed.</p></div></div>
              <div className="grid gap-4 md:grid-cols-3">
                {(["current", "next", "confirm"] as const).map((field) => {
                  const label = field === "current" ? "Current password" : field === "next" ? "New password" : "Confirm new password";
                  return <label key={field} className="text-sm font-medium text-slate-700">{label}<div className="relative"><input type={showPasswords ? "text" : "password"} value={password[field]} onChange={(event) => setPassword((current) => ({ ...current, [field]: event.target.value }))} className={`${fieldClass} pr-11`} /><button type="button" onClick={() => setShowPasswords((current) => !current)} aria-label={showPasswords ? "Hide passwords" : "Show passwords"} className="absolute bottom-0 right-0 grid h-11 w-11 place-items-center text-slate-400">{showPasswords ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button></div></label>;
                })}
              </div>
              <div className="mt-4 flex justify-end"><button type="submit" className="h-10 rounded-lg bg-blue-600 px-4 text-sm font-semibold text-white">Validate password change</button></div>
            </form>
          </Panel>

          <div className="grid gap-5 lg:grid-cols-2">
            <Panel title="Account information">
              <dl className="grid gap-3 p-5 sm:grid-cols-2">
                {[["Scout ID", "Unavailable in mock data"], ["Account created", "Unavailable in mock data"], ["Last login", "Unavailable in mock data"], ["Account status", "Active"], ["Role", "Scout"]].map(([label, value]) => <div key={label}><dt className="text-xs text-slate-500">{label}</dt><dd className="mt-1 text-sm font-semibold text-slate-800">{value}</dd></div>)}
              </dl>
            </Panel>
            <Panel title="Save or reset">
              <div className="p-5"><p className="text-sm text-slate-500">These controls update local component state only and do not claim permanent persistence.</p><div className="mt-5 flex justify-end gap-2"><button type="button" onClick={() => setConfirmReset(true)} className="h-10 rounded-lg border border-slate-200 px-4 text-sm font-semibold text-slate-700">Reset changes</button><button type="button" onClick={() => { setSavedProfile(profile); notify("Settings preview saved locally. No permanent changes were made."); }} className="h-10 rounded-lg bg-blue-600 px-4 text-sm font-semibold text-white">Save changes</button></div></div>
            </Panel>
          </div>
        </div>
      )}

      {confirmSave && <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 p-4"><div role="alertdialog" aria-modal="true" className="w-full max-w-md rounded-xl bg-white p-5 shadow-2xl"><h2 className="font-semibold">Save profile preview?</h2><p className="mt-2 text-sm text-slate-600">The permitted profile fields will be updated only in this local preview.</p><div className="mt-6 flex justify-end gap-2"><button onClick={() => setConfirmSave(false)} className="h-10 rounded-lg border border-slate-200 px-4 text-sm font-semibold">Cancel</button><button onClick={() => { setSavedProfile(profile); setConfirmSave(false); notify("Profile preview saved locally."); }} className="h-10 rounded-lg bg-blue-600 px-4 text-sm font-semibold text-white">Save</button></div></div></div>}
      {confirmReset && <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 p-4"><div role="alertdialog" aria-modal="true" className="w-full max-w-md rounded-xl bg-white p-5 shadow-2xl"><div className="flex items-start justify-between gap-4"><div><h2 className="font-semibold">Reset settings?</h2><p className="mt-2 text-sm text-slate-600">This restores the mock defaults and clears unsaved preference changes.</p></div><button aria-label="Close reset confirmation" onClick={() => setConfirmReset(false)}><X className="h-5 w-5 text-slate-400" /></button></div><div className="mt-6 flex justify-end gap-2"><button onClick={() => setConfirmReset(false)} className="h-10 rounded-lg border border-slate-200 px-4 text-sm font-semibold">Cancel</button><button onClick={resetChanges} className="h-10 rounded-lg bg-blue-600 px-4 text-sm font-semibold text-white">Reset</button></div></div></div>}
    </DashboardShell>
  );
}
