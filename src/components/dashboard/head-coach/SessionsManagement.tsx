"use client";

import { useEffect, useMemo, useState, type FormEvent, type ReactNode } from "react";
import { ChevronLeft, ChevronRight, Eye, LockKeyhole, Plus, RotateCcw, Search, UnlockKeyhole, X } from "lucide-react";
import { DashboardShell } from "../DashboardShell";
import { EmptyState, LoadingState, PageHeader } from "../DashboardUI";
import { Panel, StatCard, StatusBadge } from "../Dashboard";

type SessionStatus = "Open" | "Closed";
type Session = {
  id: string;
  date: string;
  sport: string;
  coach: string;
  players: number;
  present: number;
  absent: number;
  status: SessionStatus;
};

const playerSports: Record<string, string[]> = {
  Football: ["Arjun Patel", "Meera Shah", "Reyansh Das", "Aarav Nair"],
  Cricket: ["Vihaan Rao", "Anaya Nair", "Kabir Mehta"],
  Swimming: ["Ishaan Verma", "Sara Khan", "Neel Joshi"],
  Athletics: ["Kabir Singh", "Riya Kapoor", "Dev Patel"],
};
const coachesBySport: Record<string, string[]> = {
  Football: ["Raj Kumar", "Daniel Thomas"],
  Cricket: ["Imran Ali", "Daniel Thomas"],
  Swimming: ["Neha Rao"],
  Athletics: ["Raj Kumar", "Neha Rao"],
};
const initialSessions: Session[] = [
  { id: "SES-1108", date: "2026-11-04", sport: "Football", coach: "Raj Kumar", players: 18, present: 14, absent: 3, status: "Open" },
  { id: "SES-1107", date: "2026-11-04", sport: "Cricket", coach: "Imran Ali", players: 16, present: 12, absent: 2, status: "Open" },
  { id: "SES-1106", date: "2026-11-03", sport: "Swimming", coach: "Neha Rao", players: 12, present: 11, absent: 1, status: "Closed" },
  { id: "SES-1105", date: "2026-11-02", sport: "Athletics", coach: "Raj Kumar", players: 14, present: 12, absent: 2, status: "Closed" },
  { id: "SES-1104", date: "2026-10-31", sport: "Football", coach: "Raj Kumar", players: 17, present: 15, absent: 2, status: "Closed" },
  { id: "SES-1103", date: "2026-10-30", sport: "Cricket", coach: "Imran Ali", players: 15, present: 13, absent: 2, status: "Closed" },
];

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: ReactNode }) {
  return <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 p-3 sm:p-6" onMouseDown={(event) => event.target === event.currentTarget && onClose()}><div role="dialog" aria-modal="true" aria-labelledby="session-modal-title" className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl"><div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-100 bg-white px-5 py-4"><h2 id="session-modal-title" className="font-semibold text-slate-900">{title}</h2><button type="button" onClick={onClose} aria-label="Close dialog" className="grid h-9 w-9 place-items-center rounded-lg text-slate-500 hover:bg-slate-100"><X className="h-5 w-5" /></button></div>{children}</div></div>;
}

function CreateSessionForm({ sessions, onCancel, onCreate }: { sessions: Session[]; onCancel: () => void; onCreate: (session: Session) => void }) {
  const [sport, setSport] = useState("Football");
  const [date, setDate] = useState("");
  const [coach, setCoach] = useState(coachesBySport.Football[0]);
  const [error, setError] = useState("");
  const eligiblePlayers = playerSports[sport] ?? [];

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!sport || !date || !coach) {
      setError("Sport, date and assigned coach are required.");
      return;
    }
    if (sessions.some((session) => session.sport === sport && session.date === date)) {
      setError("A session already exists for this sport and date.");
      return;
    }
    const id = `SES-${1109 + sessions.length}`;
    onCreate({ id, date, sport, coach, players: eligiblePlayers.length, present: 0, absent: 0, status: "Open" });
  };

  return <form onSubmit={submit} className="space-y-5 p-5">
    {error && <div role="alert" className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
    <div className="grid gap-4 sm:grid-cols-2">
      <label className="text-sm font-medium text-slate-700">Sport *<select value={sport} onChange={(event) => { const nextSport = event.target.value; setSport(nextSport); setCoach(coachesBySport[nextSport][0]); }} className="mt-1.5 h-11 w-full rounded-lg border border-slate-200 px-3 text-sm">{Object.keys(playerSports).map((item) => <option key={item}>{item}</option>)}</select></label>
      <label className="text-sm font-medium text-slate-700">Session date *<input type="date" value={date} onChange={(event) => setDate(event.target.value)} required className="mt-1.5 h-11 w-full rounded-lg border border-slate-200 px-3 text-sm" /></label>
      <label className="text-sm font-medium text-slate-700 sm:col-span-2">Assigned coach<select value={coach} onChange={(event) => setCoach(event.target.value)} className="mt-1.5 h-11 w-full rounded-lg border border-slate-200 px-3 text-sm">{coachesBySport[sport].map((item) => <option key={item}>{item}</option>)}</select></label>
    </div>
    <div className="rounded-xl border border-slate-200 p-4"><div className="flex items-center justify-between"><h3 className="font-semibold text-slate-900">Eligible players</h3><span className="text-xs text-slate-500">{eligiblePlayers.length} associated with {sport}</span></div><div className="mt-3 grid gap-2 sm:grid-cols-2">{eligiblePlayers.map((player) => <div key={player} className="rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-700">{player}</div>)}</div></div>
    <div className="rounded-lg border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-blue-800"><strong>Review:</strong> {sport} session{date ? ` on ${new Date(`${date}T00:00:00`).toLocaleDateString()}` : ""}, led by {coach}.</div>
    <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end"><button type="button" onClick={onCancel} className="h-11 rounded-lg border border-slate-200 px-4 text-sm font-semibold text-slate-700">Cancel</button><button type="submit" className="h-11 rounded-lg bg-blue-600 px-5 text-sm font-semibold text-white">Create session</button></div>
  </form>;
}

export function SessionsManagement() {
  const [sessions, setSessions] = useState(initialSessions);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [sport, setSport] = useState("All sports");
  const [status, setStatus] = useState("All statuses");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [page, setPage] = useState(1);
  const [createOpen, setCreateOpen] = useState(false);
  const [selected, setSelected] = useState<Session | null>(null);
  const [confirmClose, setConfirmClose] = useState<Session | null>(null);
  const [reopen, setReopen] = useState<Session | null>(null);
  const [reopenReason, setReopenReason] = useState("");
  const [toast, setToast] = useState("");
  const pageSize = 5;

  useEffect(() => { const timer = window.setTimeout(() => setLoading(false), 350); return () => window.clearTimeout(timer); }, []);
  const notify = (message: string) => { setToast(message); window.setTimeout(() => setToast(""), 2600); };
  const filtered = useMemo(() => [...sessions].filter((item) =>
    (!query.trim() || `${item.id} ${item.sport} ${item.coach}`.toLowerCase().includes(query.trim().toLowerCase())) &&
    (sport === "All sports" || item.sport === sport) &&
    (status === "All statuses" || item.status === status) &&
    (!fromDate || item.date >= fromDate) && (!toDate || item.date <= toDate)
  ).sort((a, b) => b.date.localeCompare(a.date) || b.id.localeCompare(a.id)), [sessions, query, sport, status, fromDate, toDate]);
  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
  const visible = filtered.slice((page - 1) * pageSize, page * pageSize);
  const today = "2026-11-04";
  const openCount = sessions.filter((item) => item.status === "Open").length;
  const closedCount = sessions.filter((item) => item.status === "Closed").length;
  const todayCount = sessions.filter((item) => item.date === today).length;
  const sports = Object.keys(playerSports);
  const reset = () => { setQuery(""); setSport("All sports"); setStatus("All statuses"); setFromDate(""); setToDate(""); setPage(1); };
  const createSession = (session: Session) => { setSessions((current) => [session, ...current]); setCreateOpen(false); notify("Session added to the local demonstration list."); };
  const closeSession = () => { if (!confirmClose) return; setSessions((current) => current.map((item) => item.id === confirmClose.id ? { ...item, status: "Closed" } : item)); setConfirmClose(null); notify(`${confirmClose.id} closed. Attendance is now locked in the preview.`); };
  const reopenSession = () => { if (!reopen || reopenReason.trim().length < 10) return; setSessions((current) => current.map((item) => item.id === reopen.id ? { ...item, status: "Open" } : item)); setReopen(null); setReopenReason(""); notify(`${reopen.id} reopened with a documented reason.`); };

  return <DashboardShell role="head-coach" title="Sessions Management" subtitle="Demonstration data · Create and review practice sessions">
    <PageHeader title="Sessions Management" description="Demonstration data · Manage practice sessions and attendance status" action={<button onClick={() => setCreateOpen(true)} className="inline-flex h-11 items-center gap-2 rounded-lg bg-blue-600 px-4 text-sm font-semibold text-white shadow-sm hover:bg-blue-700"><Plus className="h-4 w-4" />Create session</button>} />
    <div className="mb-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <StatCard label="Total sessions" value={String(sessions.length)} detail="Demonstration session records" icon="calendar" />
      <StatCard label="Sessions today" value={String(todayCount)} detail="Using the Academy Desk demo date" icon="activity" tone="blue" />
      <StatCard label="Open sessions" value={String(openCount)} detail="Attendance can be maintained" icon="clipboard" tone="green" />
      <StatCard label="Closed sessions" value={String(closedCount)} detail="Attendance locked" icon="clipboard" tone="amber" />
    </div>
    <div className="mb-5 flex flex-wrap gap-2">{sports.map((item) => <span key={item} className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-600">{item} <strong className="ml-1 text-slate-900">{sessions.filter((session) => session.sport === item).length}</strong></span>)}</div>
    {loading ? <LoadingState message="Loading sessions..." /> : <Panel title={`Sessions (${filtered.length})`}>
      <div className="grid gap-3 border-b border-slate-100 p-4 xl:grid-cols-[minmax(220px,1fr)_150px_150px_150px_150px_44px]">
        <label className="relative"><span className="sr-only">Search sessions</span><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" /><input type="search" value={query} onChange={(event) => { setQuery(event.target.value); setPage(1); }} placeholder="Search ID, sport or coach..." className="h-10 w-full rounded-lg border border-slate-200 pl-9 pr-3 text-sm outline-none focus:border-blue-500" /></label>
        <select aria-label="Filter by sport" value={sport} onChange={(event) => { setSport(event.target.value); setPage(1); }} className="h-10 rounded-lg border border-slate-200 px-3 text-sm"><option>All sports</option>{sports.map((item) => <option key={item}>{item}</option>)}</select>
        <select aria-label="Filter by status" value={status} onChange={(event) => { setStatus(event.target.value); setPage(1); }} className="h-10 rounded-lg border border-slate-200 px-3 text-sm"><option>All statuses</option><option>Open</option><option>Closed</option></select>
        <label><span className="sr-only">From date</span><input aria-label="From date" type="date" value={fromDate} onChange={(event) => { setFromDate(event.target.value); setPage(1); }} className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm" /></label>
        <label><span className="sr-only">To date</span><input aria-label="To date" type="date" value={toDate} onChange={(event) => { setToDate(event.target.value); setPage(1); }} className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm" /></label>
        <button onClick={reset} aria-label="Reset filters" className="grid h-10 place-items-center rounded-lg border border-slate-200 text-slate-500"><RotateCcw className="h-4 w-4" /></button>
      </div>
      {visible.length ? <>
        <div className="overflow-x-auto"><table className="w-full min-w-[940px] text-left text-sm"><thead className="bg-slate-50 text-xs uppercase text-slate-500"><tr><th className="px-5 py-3">Session</th><th className="px-5 py-3">Date</th><th className="px-5 py-3">Sport</th><th className="px-5 py-3">Coach</th><th className="px-5 py-3">Players</th><th className="px-5 py-3">Present</th><th className="px-5 py-3">Absent</th><th className="px-5 py-3">Status</th><th className="px-5 py-3">Actions</th></tr></thead><tbody className="divide-y divide-slate-100">{visible.map((item) => <tr key={item.id} className="hover:bg-slate-50/60">
          <td className="px-5 py-4 font-semibold text-slate-900">{item.id}</td><td className="px-5 py-4 text-slate-600">{new Date(`${item.date}T00:00:00`).toLocaleDateString()}</td><td className="px-5 py-4 text-slate-700">{item.sport}</td><td className="px-5 py-4 text-slate-600">{item.coach}</td><td className="px-5 py-4 font-semibold">{item.players}</td><td className="px-5 py-4 text-emerald-700">{item.present}</td><td className="px-5 py-4 text-red-600">{item.absent}</td><td className="px-5 py-4"><StatusBadge tone={item.status === "Open" ? "blue" : "slate"}>{item.status}</StatusBadge></td><td className="px-5 py-4"><div className="flex gap-2"><button onClick={() => setSelected(item)} aria-label={`View ${item.id}`} className="grid h-8 w-8 place-items-center rounded-lg border border-slate-200 text-slate-600"><Eye className="h-4 w-4" /></button>{item.status === "Open" ? <button onClick={() => setConfirmClose(item)} className="inline-flex h-8 items-center gap-1 rounded-lg border border-slate-200 px-2 text-xs font-medium text-slate-600"><LockKeyhole className="h-3.5 w-3.5" />Close</button> : <button onClick={() => setReopen(item)} className="inline-flex h-8 items-center gap-1 rounded-lg border border-slate-200 px-2 text-xs font-medium text-slate-600"><UnlockKeyhole className="h-3.5 w-3.5" />Reopen</button>}</div></td></tr>)}</tbody></table></div>
        <div className="flex flex-col gap-3 border-t border-slate-100 px-5 py-3 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between"><span>Showing {(page - 1) * pageSize + 1}-{Math.min(page * pageSize, filtered.length)} of {filtered.length}</span><div className="flex items-center gap-2"><button disabled={page === 1} onClick={() => setPage((current) => Math.max(1, current - 1))} aria-label="Previous page" className="grid h-8 w-8 place-items-center rounded-lg border border-slate-200 disabled:opacity-40"><ChevronLeft className="h-4 w-4" /></button><span>Page {page} of {pageCount}</span><button disabled={page === pageCount} onClick={() => setPage((current) => Math.min(pageCount, current + 1))} aria-label="Next page" className="grid h-8 w-8 place-items-center rounded-lg border border-slate-200 disabled:opacity-40"><ChevronRight className="h-4 w-4" /></button></div></div>
      </> : <EmptyState title="No sessions found" description="Change the search, sport, status or date filters." action={<button onClick={reset} className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700">Reset filters</button>} />}
    </Panel>}
    {createOpen && <Modal title="Create session" onClose={() => setCreateOpen(false)}><CreateSessionForm sessions={sessions} onCancel={() => setCreateOpen(false)} onCreate={createSession} /></Modal>}
    {selected && <Modal title="Session details" onClose={() => setSelected(null)}><div className="p-5"><div className="grid gap-4 sm:grid-cols-2">{[["Session ID", selected.id], ["Date", new Date(`${selected.date}T00:00:00`).toLocaleDateString()], ["Sport", selected.sport], ["Assigned coach", selected.coach], ["Registered players", String(selected.players)], ["Status", selected.status]].map(([label, value]) => <div key={label} className="rounded-lg border border-slate-100 p-3"><p className="text-xs text-slate-500">{label}</p><p className="mt-1 font-semibold text-slate-800">{value}</p></div>)}</div><div className="mt-5 grid gap-3 sm:grid-cols-3">{[["Present", selected.present, "text-emerald-700"], ["Absent", selected.absent, "text-red-600"], ["Attendance completion", `${selected.players ? Math.round((selected.present / selected.players) * 100) : 0}%`, "text-blue-700"]].map(([label, value, color]) => <div key={label} className="rounded-xl bg-slate-50 p-4"><p className="text-xs text-slate-500">{label}</p><p className={`mt-2 text-xl font-bold ${color}`}>{value}</p></div>)}</div><div className="mt-5 rounded-xl border border-slate-200 p-4"><p className="font-semibold text-slate-900">Relevant players</p><div className="mt-3 flex flex-wrap gap-2">{(playerSports[selected.sport] ?? []).map((player) => <span key={player} className="rounded-full bg-blue-50 px-3 py-1.5 text-xs font-medium text-blue-700">{player}</span>)}</div></div>{selected.status === "Closed" && <div className="mt-5 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">This session is closed and attendance is locked. Reopening requires authorization and a reason.</div>}<div className="mt-5 flex justify-end"><button onClick={() => setSelected(null)} className="h-10 rounded-lg border border-slate-200 px-4 text-sm font-semibold text-slate-700">Close details</button></div></div></Modal>}
    {confirmClose && <Modal title="Close session" onClose={() => setConfirmClose(null)}><div className="p-5"><p className="text-sm text-slate-600">Close <strong className="text-slate-900">{confirmClose.id}</strong>? Attendance records will be locked after closure.</p><div className="mt-5 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end"><button onClick={() => setConfirmClose(null)} className="h-10 rounded-lg border border-slate-200 px-4 text-sm font-semibold text-slate-700">Cancel</button><button onClick={closeSession} className="h-10 rounded-lg bg-blue-600 px-4 text-sm font-semibold text-white">Close session</button></div></div></Modal>}
    {reopen && <Modal title="Reopen closed session" onClose={() => setReopen(null)}><div className="p-5"><div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">Reopening attendance requires Head Coach authorization and a recorded reason.</div><label className="mt-4 block text-sm font-medium text-slate-700">Reason for reopening<textarea value={reopenReason} onChange={(event) => setReopenReason(event.target.value)} required minLength={10} rows={4} className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" /><span className="mt-1 block text-xs text-slate-500">Minimum 10 characters</span></label><div className="mt-5 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end"><button onClick={() => setReopen(null)} className="h-10 rounded-lg border border-slate-200 px-4 text-sm font-semibold text-slate-700">Cancel</button><button disabled={reopenReason.trim().length < 10} onClick={reopenSession} className="h-10 rounded-lg bg-blue-600 px-4 text-sm font-semibold text-white disabled:opacity-50">Confirm reopening</button></div></div></Modal>}
    {toast && <div role="status" className="fixed bottom-5 right-5 z-[60] rounded-xl bg-slate-900 px-4 py-3 text-sm font-medium text-white shadow-xl">{toast}</div>}
  </DashboardShell>;
}
