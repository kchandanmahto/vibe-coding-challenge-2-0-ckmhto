"use client";

import { useEffect, useState, type FormEvent } from "react";
import { Building2, Camera, Check, LockKeyhole, Monitor, ShieldCheck, UserRound, X } from "lucide-react";
import { DashboardShell } from "../DashboardShell";
import { LoadingState, PageHeader } from "../DashboardUI";
import { Panel, StatusBadge } from "../Dashboard";

type Tab = "Academy profile" | "Head Coach profile" | "Account" | "Notifications" | "Display" | "Security";
const tabs: { name: Tab; icon: typeof Building2 }[] = [
  { name: "Academy profile", icon: Building2 },
  { name: "Head Coach profile", icon: UserRound },
  { name: "Account", icon: Monitor },
  { name: "Notifications", icon: Check },
  { name: "Display", icon: Monitor },
  { name: "Security", icon: LockKeyhole },
];

const fieldClass = "mt-1.5 h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-50";

function Toggle({ label, detail, checked, onChange, disabled }: { label: string; detail: string; checked: boolean; onChange: (value: boolean) => void; disabled: boolean }) {
  return <label className={`flex items-center justify-between gap-4 py-4 ${disabled ? "cursor-not-allowed opacity-70" : "cursor-pointer"}`}><span><span className="block text-sm font-semibold text-slate-800">{label}</span><span className="mt-1 block text-xs leading-5 text-slate-500">{detail}</span></span><input type="checkbox" checked={checked} disabled={disabled} onChange={(event) => onChange(event.target.checked)} className="sr-only" /><span className={`relative h-6 w-11 shrink-0 rounded-full transition ${checked ? "bg-blue-600" : "bg-slate-300"}`}><span className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow transition ${checked ? "left-6" : "left-1"}`} /></span></label>;
}

function ConfirmModal({ title, onCancel, onConfirm }: { title: string; onCancel: () => void; onConfirm: () => void }) {
  return <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 p-4" onMouseDown={(event) => event.target === event.currentTarget && onCancel()}>
    <div role="alertdialog" aria-modal="true" aria-labelledby="settings-confirm-title" className="w-full max-w-md rounded-2xl bg-white shadow-2xl">
      <div className="p-5"><div className="flex items-start justify-between gap-4"><div><h2 id="settings-confirm-title" className="font-semibold text-slate-900">Confirm changes</h2><p className="mt-2 text-sm leading-6 text-slate-600">{title}</p></div><button aria-label="Close confirmation" onClick={onCancel} className="text-slate-400"><X className="h-5 w-5" /></button></div><div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end"><button onClick={onCancel} className="h-10 rounded-lg border border-slate-200 px-4 text-sm font-semibold text-slate-700">Cancel</button><button onClick={onConfirm} className="h-10 rounded-lg bg-blue-600 px-4 text-sm font-semibold text-white">Save mock changes</button></div></div>
    </div>
  </div>;
}

export function SettingsManagement() {
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>("Academy profile");
  const [editing, setEditing] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [toast, setToast] = useState("");
  const [error, setError] = useState("");
  const [academyName, setAcademyName] = useState("Academy Desk");
  const [academyDescription, setAcademyDescription] = useState("Sports academy profile");
  const [academyEmail, setAcademyEmail] = useState("");
  const [academyPhone, setAcademyPhone] = useState("");
  const [academyAddress, setAcademyAddress] = useState("");
  const [coachName, setCoachName] = useState("Raj Kumar");
  const [coachEmail, setCoachEmail] = useState("raj@academy.example");
  const [coachPhone, setCoachPhone] = useState("");
  const [coachAddress, setCoachAddress] = useState("");
  const [displayName, setDisplayName] = useState("Raj Kumar");
  const [language, setLanguage] = useState("English");
  const [timezone, setTimezone] = useState("Asia/Kolkata");
  const [dateFormat, setDateFormat] = useState("DD/MM/YYYY");
  const [notifications, setNotifications] = useState({ general: true, sessions: true, attendance: true, matches: true, readiness: true });
  const [theme, setTheme] = useState("Light");
  const [sidebar, setSidebar] = useState("Expanded");
  const [density, setDensity] = useState("Comfortable");

  useEffect(() => { const timer = window.setTimeout(() => setLoading(false), 350); return () => window.clearTimeout(timer); }, []);
  const notify = (message: string) => { setToast(message); window.setTimeout(() => setToast(""), 2600); };

  const save = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    if (!academyName.trim() && tab === "Academy profile") { setError("Academy name is required."); return; }
    if (!coachName.trim() && tab === "Head Coach profile") { setError("Full name is required."); return; }
    if (!coachEmail.trim() && tab === "Head Coach profile") { setError("Email is required."); return; }
    setConfirming(true);
  };
  const confirmSave = () => {
    setConfirming(false);
    setEditing(false);
    notify("Settings saved in the local frontend preview.");
  };

  const actions = editing ? <div className="flex gap-2 print:hidden"><button type="button" onClick={() => setEditing(false)} className="h-10 rounded-lg border border-slate-200 px-4 text-sm font-semibold text-slate-700">Cancel</button><button form={`settings-${tab}`} type="submit" className="h-10 rounded-lg bg-blue-600 px-4 text-sm font-semibold text-white">Review changes</button></div> : <button onClick={() => setEditing(true)} className="h-10 rounded-lg border border-slate-200 px-4 text-sm font-semibold text-slate-700">Edit settings</button>;

  const renderContent = () => {
    if (tab === "Security") return <div className="space-y-5">
      <form id="settings-Security" onSubmit={(event) => { event.preventDefault(); setError(""); const form = new FormData(event.currentTarget); const current = String(form.get("currentPassword")); const next = String(form.get("newPassword")); const confirm = String(form.get("confirmPassword")); if (!current || !next || !confirm) { setError("All password fields are required."); return; } if (next.length < 8) { setError("New password must be at least 8 characters."); return; } if (next !== confirm) { setError("Passwords do not match."); return; } notify("Password change preview validated; no account was changed."); }} className="p-5">
        {error && <div role="alert" className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
        <div className="grid gap-4 sm:grid-cols-3"><label className="text-sm font-medium text-slate-700">Current password<input name="currentPassword" type="password" autoComplete="current-password" disabled={!editing} required className={fieldClass} /></label><label className="text-sm font-medium text-slate-700">New password<input name="newPassword" type="password" autoComplete="new-password" disabled={!editing} required minLength={8} className={fieldClass} /></label><label className="text-sm font-medium text-slate-700">Confirm new password<input name="confirmPassword" type="password" autoComplete="new-password" disabled={!editing} required minLength={8} className={fieldClass} /></label></div>
        <p className="mt-3 text-xs text-slate-500">This is validation-only UI. Passwords are not sent or stored by this demo.</p>
      </form>
      <div className="grid gap-5 border-t border-slate-100 p-5 lg:grid-cols-2"><div><div className="flex items-center gap-2"><ShieldCheck className="h-5 w-5 text-blue-600" /><h3 className="font-semibold text-slate-900">Security information</h3></div><p className="mt-2 text-sm leading-6 text-slate-600">Academy Desk uses server-side authentication and password hashing in the production implementation. Frontend settings cannot change account security.</p></div><div><h3 className="font-semibold text-slate-900">Active sessions</h3><div className="mt-3 flex items-center justify-between rounded-lg border border-slate-200 p-3"><div><p className="text-sm font-medium text-slate-800">Current browser session</p><p className="mt-1 text-xs text-slate-500">Session details require a live account integration.</p></div><StatusBadge tone="green">Placeholder</StatusBadge></div></div></div>
    </div>;
    if (tab === "Notifications") return <form id="settings-Notifications" onSubmit={save}><div className="divide-y divide-slate-100 px-5"><Toggle disabled={!editing} label="General notifications" detail="Academy-wide updates and important announcements" checked={notifications.general} onChange={(value) => setNotifications((current) => ({ ...current, general: value }))} /><Toggle disabled={!editing} label="Session notifications" detail="Session creation, updates and status changes" checked={notifications.sessions} onChange={(value) => setNotifications((current) => ({ ...current, sessions: value }))} /><Toggle disabled={!editing} label="Attendance notifications" detail="Attendance submissions and reopening requests" checked={notifications.attendance} onChange={(value) => setNotifications((current) => ({ ...current, attendance: value }))} /><Toggle disabled={!editing} label="Match notifications" detail="Match scheduling, completion and score updates" checked={notifications.matches} onChange={(value) => setNotifications((current) => ({ ...current, matches: value }))} /><Toggle disabled={!editing} label="Readiness notifications" detail="Changes to readiness eligibility conditions" checked={notifications.readiness} onChange={(value) => setNotifications((current) => ({ ...current, readiness: value }))} /></div></form>;
    if (tab === "Display") return <form id="settings-Display" onSubmit={save} className="grid gap-5 p-5 sm:grid-cols-3"><label className="text-sm font-medium text-slate-700">Theme<select value={theme} disabled={!editing} onChange={(event) => setTheme(event.target.value)} className={fieldClass}><option>Light</option><option>Dark preview</option><option>System</option></select></label><label className="text-sm font-medium text-slate-700">Sidebar<select value={sidebar} disabled={!editing} onChange={(event) => setSidebar(event.target.value)} className={fieldClass}><option>Expanded</option><option>Collapsed</option></select></label><label className="text-sm font-medium text-slate-700">Dashboard density<select value={density} disabled={!editing} onChange={(event) => setDensity(event.target.value)} className={fieldClass}><option>Comfortable</option><option>Compact</option></select></label></form>;
    if (tab === "Account") return <form id="settings-Account" onSubmit={save} className="grid gap-4 p-5 sm:grid-cols-2">{[
      ["Display name", displayName, (value: string) => setDisplayName(value)],
      ["Language", language, (value: string) => setLanguage(value)],
      ["Timezone", timezone, (value: string) => setTimezone(value)],
      ["Date format", dateFormat, (value: string) => setDateFormat(value)],
    ].map(([label, value, setter]) => label === "Language" ? <label key={String(label)} className="text-sm font-medium text-slate-700">{String(label)}<select value={language} disabled={!editing} onChange={(event) => (setter as (value: string) => void)(event.target.value)} className={fieldClass}><option>English</option><option>Hindi</option><option>Other preference unavailable</option></select></label> : label === "Timezone" ? <label key={String(label)} className="text-sm font-medium text-slate-700">{String(label)}<select value={timezone} disabled={!editing} onChange={(event) => (setter as (value: string) => void)(event.target.value)} className={fieldClass}><option>Asia/Kolkata</option><option>UTC</option></select></label> : label === "Date format" ? <label key={String(label)} className="text-sm font-medium text-slate-700">{String(label)}<select value={dateFormat} disabled={!editing} onChange={(event) => (setter as (value: string) => void)(event.target.value)} className={fieldClass}><option>DD/MM/YYYY</option><option>MM/DD/YYYY</option><option>YYYY-MM-DD</option></select></label> : <label key={String(label)} className="text-sm font-medium text-slate-700">{String(label)}<input required value={String(value)} disabled={!editing} onChange={(event) => (setter as (value: string) => void)(event.target.value)} className={fieldClass} /></label>)}</form>;
    if (tab === "Head Coach profile") return <form id="settings-Head Coach profile" onSubmit={save} className="grid gap-5 p-5">
      <div className="flex items-center gap-4 rounded-xl border border-slate-200 bg-slate-50 p-4"><span className="grid h-16 w-16 place-items-center rounded-full bg-blue-100 text-xl font-bold text-blue-700">RK</span><div><p className="font-semibold text-slate-900">Profile photo preview</p><p className="mt-1 text-xs text-slate-500">Photo uploads require a future secure file integration.</p>{editing && <button type="button" className="mt-3 inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700"><Camera className="h-4 w-4" />Choose image</button>}</div></div>
      <div className="grid gap-4 sm:grid-cols-2"><label className="text-sm font-medium text-slate-700">Full name<input required value={coachName} disabled={!editing} onChange={(event) => setCoachName(event.target.value)} className={fieldClass} /></label><label className="text-sm font-medium text-slate-700">Email<input required type="email" value={coachEmail} disabled={!editing} onChange={(event) => setCoachEmail(event.target.value)} className={fieldClass} /></label><label className="text-sm font-medium text-slate-700">Phone<input value={coachPhone} disabled={!editing} onChange={(event) => setCoachPhone(event.target.value)} placeholder="Not configured" className={fieldClass} /></label><label className="text-sm font-medium text-slate-700">Address<input value={coachAddress} disabled={!editing} onChange={(event) => setCoachAddress(event.target.value)} placeholder="Not configured" className={fieldClass} /></label></div>
    </form>;
    return <form id="settings-Academy profile" onSubmit={save} className="grid gap-5 p-5">
      <div className="flex items-center gap-4 rounded-xl border border-slate-200 bg-slate-50 p-4"><span className="grid h-16 w-16 place-items-center rounded-xl bg-blue-600 text-xl font-bold text-white">AD</span><div><p className="font-semibold text-slate-900">Academy logo preview</p><p className="mt-1 text-xs text-slate-500">No uploaded logo is stored in this frontend preview.</p>{editing && <button type="button" className="mt-3 inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700"><Camera className="h-4 w-4" />Choose image</button>}</div></div>
      <div className="grid gap-4 sm:grid-cols-2"><label className="text-sm font-medium text-slate-700 sm:col-span-2">Academy name<input required value={academyName} disabled={!editing} onChange={(event) => setAcademyName(event.target.value)} className={fieldClass} /></label><label className="text-sm font-medium text-slate-700 sm:col-span-2">Academy description<textarea value={academyDescription} disabled={!editing} onChange={(event) => setAcademyDescription(event.target.value)} rows={3} className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm disabled:bg-slate-50" /></label><label className="text-sm font-medium text-slate-700">Contact email<input type="email" value={academyEmail} disabled={!editing} onChange={(event) => setAcademyEmail(event.target.value)} placeholder="Not configured" className={fieldClass} /></label><label className="text-sm font-medium text-slate-700">Contact phone<input value={academyPhone} disabled={!editing} onChange={(event) => setAcademyPhone(event.target.value)} placeholder="Not configured" className={fieldClass} /></label><label className="text-sm font-medium text-slate-700 sm:col-span-2">Address<input value={academyAddress} disabled={!editing} onChange={(event) => setAcademyAddress(event.target.value)} placeholder="Not configured" className={fieldClass} /></label></div>
    </form>;
  };

  return <DashboardShell role="head-coach" title="Settings" subtitle="Demonstration settings · No account changes are sent">
    <PageHeader title="Settings" description="Demonstration preferences and profiles · Frontend preview only" />
    {loading ? <LoadingState message="Loading settings..." /> : <div className="grid gap-5 lg:grid-cols-[220px_1fr]">
      <aside className="h-fit rounded-xl border border-slate-200 bg-white p-2">{tabs.map((item) => { const Icon = item.icon; return <button key={item.name} onClick={() => { setTab(item.name); setEditing(false); setError(""); }} className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm ${tab === item.name ? "bg-blue-50 font-semibold text-blue-700" : "text-slate-600 hover:bg-slate-50"}`}><Icon className="h-4 w-4" />{item.name}</button>; })}</aside>
      <Panel title={tab} action={actions}><div>{error && tab !== "Security" && <div role="alert" className="mx-5 mt-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}{renderContent()}</div></Panel>
    </div>}
    {confirming && <ConfirmModal title={`Save changes made to ${tab.toLowerCase()} in this local demonstration? No account or database record will be changed.`} onCancel={() => setConfirming(false)} onConfirm={confirmSave} />}
    {toast && <div role="status" className="fixed bottom-5 right-5 z-[60] rounded-xl bg-slate-900 px-4 py-3 text-sm font-medium text-white shadow-xl">{toast}</div>}
  </DashboardShell>;
}
