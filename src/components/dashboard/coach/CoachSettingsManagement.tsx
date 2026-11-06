"use client";

import { useEffect, useState, type FormEvent } from "react";
import { Eye, EyeOff, LockKeyhole, X } from "lucide-react";
import { DashboardShell } from "../DashboardShell";
import { LoadingState, PageHeader } from "../DashboardUI";
import { Panel, StatusBadge } from "../Dashboard";
import { LogoutButton } from "@/components/auth/LogoutButton";

const coachAccount = {
  id: "CCH-1001",
  name: "Raj Kumar",
  email: "raj.kumar@academy.example",
  phone: "+91 98765 41001",
  sports: ["Football", "Athletics"],
  role: "Coach",
  status: "Active",
  joined: "2021-07-14",
  lastLogin: "Today, 09:42",
};

const fieldClass = "mt-1.5 h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100";

function Toggle({ label, detail, checked, onChange }: { label: string; detail: string; checked: boolean; onChange: (value: boolean) => void }) {
  return <label className="flex cursor-pointer items-center justify-between gap-4 border-b border-slate-100 py-4 last:border-0"><span><span className="block text-sm font-semibold text-slate-800">{label}</span><span className="mt-1 block text-xs leading-5 text-slate-500">{detail}</span></span><input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} className="sr-only" /><span className={`relative h-6 w-11 shrink-0 rounded-full transition ${checked ? "bg-blue-600" : "bg-slate-300"}`}><span className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow transition ${checked ? "left-6" : "left-1"}`} /></span></label>;
}

export function CoachSettingsManagement() {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState({ name: coachAccount.name, email: coachAccount.email, phone: coachAccount.phone });
  const [savedProfile, setSavedProfile] = useState(profile);
  const [language, setLanguage] = useState("English");
  const [timezone, setTimezone] = useState("Asia/Kolkata");
  const [dateFormat, setDateFormat] = useState("DD/MM/YYYY");
  const [theme, setTheme] = useState("Light");
  const [notifications, setNotifications] = useState({ sessions: true, attendance: true, matches: true, scores: true, announcements: false });
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
    if (password.next.length < 8) {
      setError("New password must contain at least 8 characters.");
      return;
    }
    if (!/[A-Za-z]/.test(password.next) || !/[0-9]/.test(password.next)) {
      setError("New password must contain at least one letter and one number.");
      return;
    }
    if (password.next !== password.confirm) {
      setError("New password and confirmation do not match.");
      return;
    }
    setError("");
    notify("Password fields passed preview validation. No password was changed.");
    setPassword({ current: "", next: "", confirm: "" });
  };

  const resetChanges = () => {
    setProfile(savedProfile);
    setLanguage("English");
    setTimezone("Asia/Kolkata");
    setDateFormat("DD/MM/YYYY");
    setTheme("Light");
    setNotifications({ sessions: true, attendance: true, matches: true, scores: true, announcements: false });
    setConfirmReset(false);
    notify("Settings reset to the mock defaults.");
  };

  return (
    <DashboardShell role="coach" title="Settings" subtitle="Coach profile and preferences">
      <PageHeader title="Coach Settings" description="Manage your local mock profile and preference preview" />
      {toast && <div role="status" className="fixed bottom-5 right-5 z-[60] rounded-lg bg-slate-900 px-4 py-3 text-sm text-white shadow-xl">{toast}</div>}
      {loading ? <LoadingState message="Loading settings..." /> : (
        <div className="space-y-5">
          {error && <div role="alert" className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
          <Panel title="Profile settings">
            <form onSubmit={saveProfile} className="grid gap-4 p-5 md:grid-cols-2">
              <div className="md:col-span-2 flex items-center gap-4 rounded-xl bg-slate-50 p-4"><span className="grid h-16 w-16 place-items-center rounded-full bg-blue-100 text-xl font-bold text-blue-700">RK</span><div><p className="font-semibold text-slate-900">Profile photo preview</p><p className="mt-1 text-xs text-slate-500">Mock initials avatar</p></div></div>
              <label className="text-sm font-medium text-slate-700">Full name<input value={profile.name} onChange={(event) => setProfile((current) => ({ ...current, name: event.target.value }))} className={fieldClass} /></label>
              <label className="text-sm font-medium text-slate-700">Email address<input type="email" value={profile.email} onChange={(event) => setProfile((current) => ({ ...current, email: event.target.value }))} className={fieldClass} /></label>
              <label className="text-sm font-medium text-slate-700">Phone number<input value={profile.phone} onChange={(event) => setProfile((current) => ({ ...current, phone: event.target.value }))} className={fieldClass} /></label>
              <div className="text-sm"><span className="font-medium text-slate-700">Assigned sports</span><div className="mt-2 flex flex-wrap gap-2">{coachAccount.sports.map((sport) => <StatusBadge key={sport} tone="blue">{sport}</StatusBadge>)}</div></div>
              <label className="text-sm font-medium text-slate-700">Account role<input value={coachAccount.role} disabled className={`${fieldClass} bg-slate-50`} /></label>
              <label className="text-sm font-medium text-slate-700">Account status<input value={coachAccount.status} disabled className={`${fieldClass} bg-slate-50`} /></label>
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
              <Toggle label="Session reminders" detail="Upcoming and changed coach sessions." checked={notifications.sessions} onChange={(value) => setNotifications((current) => ({ ...current, sessions: value }))} />
              <Toggle label="Attendance reminders" detail="Attendance marking and submission reminders." checked={notifications.attendance} onChange={(value) => setNotifications((current) => ({ ...current, attendance: value }))} />
              <Toggle label="Match updates" detail="Match creation, status and cancellation updates." checked={notifications.matches} onChange={(value) => setNotifications((current) => ({ ...current, matches: value }))} />
              <Toggle label="Score updates" detail="Score entry and score correction updates." checked={notifications.scores} onChange={(value) => setNotifications((current) => ({ ...current, scores: value }))} />
              <Toggle label="Academy announcements" detail="General Academy Desk announcements." checked={notifications.announcements} onChange={(value) => setNotifications((current) => ({ ...current, announcements: value }))} />
            </div>
          </Panel>

          <Panel title="Security">
            <form onSubmit={validatePassword} className="p-5">
              <div className="mb-4 flex items-start gap-3 rounded-lg border border-blue-100 bg-blue-50 p-4"><LockKeyhole className="mt-0.5 h-5 w-5 text-blue-600" /><div><p className="text-sm font-semibold text-blue-900">Security actions</p><p className="mt-1 text-xs leading-5 text-blue-700">Password change validation remains a preview. No password is sent, stored or changed.</p></div></div>
              <div className="grid gap-4 md:grid-cols-3">
                {(["current", "next", "confirm"] as const).map((field) => {
                  const label = field === "current" ? "Current password" : field === "next" ? "New password" : "Confirm new password";
                  return <label key={field} className="text-sm font-medium text-slate-700">{label}<div className="relative"><input type={showPasswords ? "text" : "password"} value={password[field]} onChange={(event) => setPassword((current) => ({ ...current, [field]: event.target.value }))} className={`${fieldClass} pr-11`} /><button type="button" onClick={() => setShowPasswords((current) => !current)} aria-label={showPasswords ? "Hide passwords" : "Show passwords"} className="absolute bottom-0 right-0 grid h-11 w-11 place-items-center text-slate-400">{showPasswords ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button></div></label>;
                })}
              </div>
              <div className="mt-4 flex flex-wrap justify-end gap-2"><LogoutButton className="h-10 rounded-lg border border-slate-200 px-4 text-sm font-semibold text-slate-700 disabled:cursor-not-allowed disabled:opacity-70" /><button type="submit" className="h-10 rounded-lg bg-blue-600 px-4 text-sm font-semibold text-white">Validate password change</button></div>
            </form>
          </Panel>

          <Panel title="Account information">
            <div className="grid gap-4 p-5 sm:grid-cols-2 lg:grid-cols-5">
              <div className="rounded-lg bg-slate-50 p-4"><p className="text-xs text-slate-500">Coach ID</p><p className="mt-1 font-semibold">{coachAccount.id}</p></div>
              <div className="rounded-lg bg-slate-50 p-4"><p className="text-xs text-slate-500">Account created</p><p className="mt-1 font-semibold">{coachAccount.joined}</p></div>
              <div className="rounded-lg bg-slate-50 p-4"><p className="text-xs text-slate-500">Last login</p><p className="mt-1 font-semibold">{coachAccount.lastLogin}</p></div>
              <div className="rounded-lg bg-slate-50 p-4"><p className="text-xs text-slate-500">Status</p><p className="mt-1"><StatusBadge tone="green">{coachAccount.status}</StatusBadge></p></div>
              <div className="rounded-lg bg-slate-50 p-4"><p className="text-xs text-slate-500">Assigned sports</p><p className="mt-1 font-semibold">{coachAccount.sports.join(", ")}</p></div>
            </div>
          </Panel>

          <div className="flex justify-end"><button type="button" onClick={() => setConfirmReset(true)} className="h-10 rounded-lg border border-slate-200 px-4 text-sm font-semibold text-slate-700">Reset changes</button></div>
        </div>
      )}

      {confirmSave && <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 p-4"><div role="alertdialog" aria-modal="true" className="w-full max-w-md rounded-2xl bg-white p-5 shadow-2xl"><h2 className="font-semibold">Save profile preview?</h2><p className="mt-2 text-sm text-slate-600">These changes will remain in local component state only.</p><div className="mt-6 flex justify-end gap-2"><button onClick={() => setConfirmSave(false)} className="h-10 rounded-lg border border-slate-200 px-4 text-sm font-semibold">Cancel</button><button onClick={() => { setSavedProfile(profile); setConfirmSave(false); notify("Profile preview updated. Nothing was permanently saved."); }} className="h-10 rounded-lg bg-blue-600 px-4 text-sm font-semibold text-white">Confirm</button></div></div></div>}
      {confirmReset && <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 p-4"><div role="alertdialog" aria-modal="true" className="w-full max-w-md rounded-2xl bg-white p-5 shadow-2xl"><div className="flex items-start justify-between gap-4"><div><h2 className="font-semibold">Reset settings?</h2><p className="mt-2 text-sm text-slate-600">This restores the mock defaults and clears unsaved preference changes.</p></div><button aria-label="Close reset confirmation" onClick={() => setConfirmReset(false)}><X className="h-5 w-5 text-slate-400" /></button></div><div className="mt-6 flex justify-end gap-2"><button onClick={() => setConfirmReset(false)} className="h-10 rounded-lg border border-slate-200 px-4 text-sm font-semibold">Cancel</button><button onClick={resetChanges} className="h-10 rounded-lg bg-blue-600 px-4 text-sm font-semibold text-white">Reset</button></div></div></div>}
    </DashboardShell>
  );
}
