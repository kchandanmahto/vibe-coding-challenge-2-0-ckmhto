"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, type FormEvent, type ReactNode } from "react";
import { ChevronLeft, ChevronRight, LockKeyhole, Plus, Search, X } from "lucide-react";
import { DashboardShell } from "../DashboardShell";
import { EmptyState, LoadingState, PageHeader } from "../DashboardUI";
import { Panel, StatCard, StatusBadge } from "../Dashboard";
import { coachPlayers } from "./coachPlayersData";
import { coachSessionsMock, type CoachSession } from "./coachSessionsData";

const pageSize = 5;
const today = "2026-11-04";

function Modal({ title, children, onClose, wide = false }: { title: string; children: ReactNode; onClose: () => void; wide?: boolean }) {
  return <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 p-3 sm:p-6" onMouseDown={(event) => event.target === event.currentTarget && onClose()}><div role="dialog" aria-modal="true" className={`max-h-[92vh] w-full overflow-y-auto rounded-2xl bg-white shadow-2xl ${wide ? "max-w-4xl" : "max-w-2xl"}`}><div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-100 bg-white px-5 py-4"><h2 className="font-semibold text-slate-900">{title}</h2><button type="button" onClick={onClose} aria-label="Close dialog" className="grid h-9 w-9 place-items-center rounded-lg text-slate-500 hover:bg-slate-100"><X className="h-5 w-5" /></button></div>{children}</div></div>;
}

export function CoachSessionsManagement() {
  const [sessions, setSessions] = useState(coachSessionsMock);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [sport, setSport] = useState("All sports");
  const [status, setStatus] = useState("All statuses");
  const [date, setDate] = useState("");
  const [sort, setSort] = useState("Newest first");
  const [page, setPage] = useState(1);
  const [createOpen, setCreateOpen] = useState(false);
  const [selected, setSelected] = useState<CoachSession | null>(null);
  const [closeSession, setCloseSession] = useState<CoachSession | null>(null);
  const [toast, setToast] = useState("");
  const [formError, setFormError] = useState("");

  useEffect(() => { const timer = window.setTimeout(() => setLoading(false), 350); return () => window.clearTimeout(timer); }, []);

  const notify = (message: string) => { setToast(message); window.setTimeout(() => setToast(""), 2600); };
  const filtered = useMemo(() => [...sessions].filter((session) =>
    (!query.trim() || `${session.id} ${session.title} ${session.coach}`.toLowerCase().includes(query.trim().toLowerCase())) &&
    (sport === "All sports" || session.sport === sport) &&
    (status === "All statuses" || session.status === status) &&
    (!date || session.date === date)
  ).sort((a, b) => sort === "Oldest first" ? a.date.localeCompare(b.date) : b.date.localeCompare(a.date)), [sessions, query, sport, status, date, sort]);
  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
  const visible = filtered.slice((page - 1) * pageSize, page * pageSize);
  const todayCount = sessions.filter((session) => session.date === today).length;
  const upcomingCount = sessions.filter((session) => session.date > today).length;
  const openCount = sessions.filter((session) => session.status === "Open").length;
  const closedCount = sessions.filter((session) => session.status === "Closed").length;

  const createSession = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const selectedSport = String(data.get("sport")) as "Football" | "Athletics";
    const sessionDate = String(data.get("date"));
    const title = String(data.get("title")).trim();
    const notes = String(data.get("notes")).trim();
    const selectedPlayers = data.getAll("player");
    if (!selectedSport || !sessionDate || !title) { setFormError("Sport, date and session title are required."); return; }
    if (sessions.some((session) => session.sport === selectedSport && session.date === sessionDate)) { setFormError("A duplicate session for this sport and date already exists."); return; }
    if (!selectedPlayers.length) { setFormError("Select at least one relevant player."); return; }
    const playerIds = selectedPlayers.map(String);
    const invalidPlayer = playerIds.some((id) => coachPlayers.find((player) => player.id === id)?.sport !== selectedSport);
    if (invalidPlayer) { setFormError("Every selected player must belong to the selected sport."); return; }
    setSessions((current) => [{ id: `SES-${1114 + current.length}`, title, date: sessionDate, sport: selectedSport, coach: "Raj Kumar", playerIds, present: 0, absent: 0, status: "Open", notes }, ...current]);
    setCreateOpen(false); setFormError(""); notify("Mock session created successfully.");
  };

  const closeConfirmed = () => {
    if (!closeSession) return;
    setSessions((current) => current.map((session) => session.id === closeSession.id ? { ...session, status: "Closed" } : session));
    setCloseSession(null); setSelected(null); notify("Session closed. Attendance is now locked.");
  };

  const resetFilters = () => { setQuery(""); setSport("All sports"); setStatus("All statuses"); setDate(""); setPage(1); };

  return (
    <DashboardShell role="coach" title="Sessions" subtitle="Mock data for sessions assigned to you">
      <PageHeader title="Sessions Management" description="Create, review and close sessions for your assigned sports" action={<button type="button" onClick={() => { setFormError(""); setCreateOpen(true); }} className="inline-flex h-11 items-center gap-2 rounded-lg bg-blue-600 px-4 text-sm font-semibold text-white shadow-sm"><Plus className="h-4 w-4" /> Create session</button>} />
      {toast && <div role="status" className="fixed right-4 top-20 z-[60] rounded-lg bg-slate-900 px-4 py-3 text-sm text-white shadow-lg">{toast}</div>}
      {loading ? <LoadingState message="Loading assigned sessions..." /> : (
        <div className="space-y-5">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
            <StatCard label="Total sessions" value={String(sessions.length)} detail="Mock assigned sessions" icon="calendar" tone="blue" />
            <StatCard label="Today's sessions" value={String(todayCount)} detail={today} icon="calendar" tone="green" />
            <StatCard label="Upcoming sessions" value={String(upcomingCount)} detail="Future demo sessions" icon="activity" tone="violet" />
            <StatCard label="Open sessions" value={String(openCount)} detail="Attendance editable" icon="clipboard" tone="amber" />
            <StatCard label="Closed sessions" value={String(closedCount)} detail="Attendance locked" icon="clipboard" tone="blue" />
          </div>

          <Panel title="Session history">
            <div className="grid gap-3 border-b border-slate-100 p-4 lg:grid-cols-[minmax(220px,1fr)_160px_170px_170px_160px_auto]">
              <label className="relative"><Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" /><span className="sr-only">Search sessions</span><input type="search" value={query} onChange={(event) => { setQuery(event.target.value); setPage(1); }} placeholder="Search session ID, title or coach" className="h-10 w-full rounded-lg border border-slate-200 pl-9 pr-3 text-sm" /></label>
              <select aria-label="Filter by sport" value={sport} onChange={(event) => { setSport(event.target.value); setPage(1); }} className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm"><option>All sports</option><option>Football</option><option>Athletics</option></select>
              <select aria-label="Filter by status" value={status} onChange={(event) => { setStatus(event.target.value); setPage(1); }} className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm"><option>All statuses</option><option>Open</option><option>Closed</option></select>
              <input aria-label="Filter by date" type="date" value={date} onChange={(event) => { setDate(event.target.value); setPage(1); }} className="h-10 rounded-lg border border-slate-200 px-3 text-sm" />
              <select aria-label="Sort sessions" value={sort} onChange={(event) => setSort(event.target.value)} className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm"><option>Newest first</option><option>Oldest first</option></select>
              <button type="button" onClick={resetFilters} className="h-10 rounded-lg border border-slate-200 px-3 text-sm font-semibold text-slate-600">Reset</button>
            </div>
            {visible.length ? <div className="overflow-x-auto"><table className="w-full min-w-[950px] text-left text-sm"><thead className="bg-slate-50 text-xs uppercase text-slate-500"><tr><th className="px-5 py-3">Session</th><th className="px-5 py-3">Date</th><th className="px-5 py-3">Sport</th><th className="px-5 py-3">Coach</th><th className="px-5 py-3">Players</th><th className="px-5 py-3">Present</th><th className="px-5 py-3">Absent</th><th className="px-5 py-3">Status</th><th className="px-5 py-3">Actions</th></tr></thead><tbody className="divide-y divide-slate-100">{visible.map((session) => { const total = session.status === "Closed" ? session.present + session.absent : session.playerIds.length || session.present + session.absent; return <tr key={session.id}><td className="px-5 py-3.5"><p className="font-semibold text-slate-800">{session.title}</p><p className="text-xs text-slate-500">{session.id}</p></td><td className="px-5 py-3.5">{new Date(`${session.date}T00:00:00`).toLocaleDateString()}</td><td className="px-5 py-3.5">{session.sport}</td><td className="px-5 py-3.5">{session.coach}</td><td className="px-5 py-3.5">{total}</td><td className="px-5 py-3.5 text-emerald-700">{session.present}</td><td className="px-5 py-3.5 text-amber-700">{session.absent}</td><td className="px-5 py-3.5"><StatusBadge tone={session.status === "Open" ? "blue" : "slate"}>{session.status}</StatusBadge></td><td className="px-5 py-3.5"><div className="flex flex-wrap gap-3"><button type="button" onClick={() => setSelected(session)} className="font-semibold text-blue-600">View</button>{session.status === "Open" && <button type="button" onClick={() => setCloseSession(session)} className="font-semibold text-slate-700">Close</button>}<Link href="/coach#attendance" className="font-semibold text-slate-600">Attendance</Link></div></td></tr>; })}</tbody></table></div> : <EmptyState title="No sessions found" description="Change or reset the search and filters." />}
            {filtered.length > 0 && <div className="flex items-center justify-between border-t border-slate-100 px-5 py-4"><p className="text-xs text-slate-500">{filtered.length} mock sessions · Page {page > pageCount ? pageCount : page} of {pageCount}</p><div className="flex gap-2"><button type="button" aria-label="Previous page" disabled={page === 1} onClick={() => setPage((value) => Math.max(1, value - 1))} className="grid h-9 w-9 place-items-center rounded-lg border border-slate-200 disabled:opacity-40"><ChevronLeft className="h-4 w-4" /></button><button type="button" aria-label="Next page" disabled={page >= pageCount} onClick={() => setPage((value) => Math.min(pageCount, value + 1))} className="grid h-9 w-9 place-items-center rounded-lg border border-slate-200 disabled:opacity-40"><ChevronRight className="h-4 w-4" /></button></div></div>}
          </Panel>

          <div className="grid gap-5 lg:grid-cols-2"><Panel title="Sport-wise history"><div className="grid grid-cols-2 gap-3 p-5">{(["Football", "Athletics"] as const).map((item) => { const matching = sessions.filter((session) => session.sport === item); return <div key={item} className="rounded-xl bg-slate-50 p-4"><p className="text-sm font-medium text-slate-700">{item}</p><p className="mt-2 text-2xl font-bold text-slate-900">{matching.length}</p><p className="text-xs text-slate-500">{matching.filter((session) => session.status === "Closed").length} closed · {matching.filter((session) => session.status === "Open").length} open</p></div>; })}</div></Panel><Panel title="Date-wise history"><div className="p-5 space-y-3">{sessions.filter((session) => session.status === "Closed").slice(0, 4).map((session) => <Link key={session.id} href="/coach#sessions" className="flex items-center justify-between rounded-lg border border-slate-200 px-3 py-2.5 text-sm"><span><strong>{session.title}</strong><span className="block text-xs text-slate-500">{session.date} · {session.sport}</span></span><span className="text-xs text-slate-500">View</span></Link>)}</div></Panel></div>
        </div>
      )}

      {createOpen && <Modal title="Create mock session" onClose={() => setCreateOpen(false)} wide><form onSubmit={createSession} className="space-y-5 p-5">{formError && <div role="alert" className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{formError}</div>}<div className="grid gap-4 sm:grid-cols-2"><label className="text-sm font-medium">Sport *<select name="sport" required className="mt-1.5 h-11 w-full rounded-lg border border-slate-200 px-3"><option value="">Select assigned sport</option><option>Football</option><option>Athletics</option></select></label><label className="text-sm font-medium">Session date *<input name="date" type="date" required className="mt-1.5 h-11 w-full rounded-lg border border-slate-200 px-3" /></label><label className="text-sm font-medium sm:col-span-2">Session title *<input name="title" required className="mt-1.5 h-11 w-full rounded-lg border border-slate-200 px-3" /></label><label className="text-sm font-medium sm:col-span-2">Notes<textarea name="notes" rows={3} className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2" /></label></div><CreatePlayerSelection /><div className="flex justify-end gap-3 border-t border-slate-100 pt-5"><button type="button" onClick={() => setCreateOpen(false)} className="h-11 rounded-lg border border-slate-200 px-4 text-sm font-semibold">Cancel</button><button type="submit" className="h-11 rounded-lg bg-blue-600 px-5 text-sm font-semibold text-white">Create session</button></div></form></Modal>}
      {selected && <Modal title="Session details" onClose={() => setSelected(null)} wide><div className="p-5"><div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"><Info label="Session ID" value={selected.id} /><Info label="Sport" value={selected.sport} /><Info label="Date" value={selected.date} /><Info label="Coach" value={selected.coach} /><Info label="Status" value={selected.status} /><Info label="Attendance" value={`${selected.present + selected.absent ? Math.round(selected.present / (selected.present + selected.absent) * 100) : 0}%`} /></div><div className="mt-5 grid grid-cols-2 gap-3"><div className="rounded-lg bg-emerald-50 p-4"><p className="text-xs text-slate-500">Present</p><p className="mt-1 text-xl font-bold text-emerald-700">{selected.present}</p></div><div className="rounded-lg bg-amber-50 p-4"><p className="text-xs text-slate-500">Absent</p><p className="mt-1 text-xl font-bold text-amber-700">{selected.absent}</p></div></div><div className="mt-5 rounded-xl border border-slate-200 p-4"><h3 className="font-semibold">Relevant players</h3><div className="mt-3 grid gap-2 sm:grid-cols-2">{coachPlayers.filter((player) => selected.playerIds.includes(player.id)).map((player) => <div key={player.id} className="rounded-lg bg-slate-50 px-3 py-2 text-sm">{player.name} · {player.id}</div>)}</div></div>{selected.notes && <p className="mt-4 text-sm text-slate-600"><strong>Notes:</strong> {selected.notes}</p>}<div className="mt-5 flex flex-wrap justify-end gap-3 border-t border-slate-100 pt-4">{selected.status === "Open" && <button type="button" onClick={() => setCloseSession(selected)} className="inline-flex h-10 items-center gap-2 rounded-lg border border-slate-200 px-4 text-sm font-semibold"><LockKeyhole className="h-4 w-4" /> Close session</button>}<Link href="/coach#attendance" className="inline-flex h-10 items-center rounded-lg bg-blue-600 px-4 text-sm font-semibold text-white">View attendance</Link></div></div></Modal>}
      {closeSession && <Modal title="Close session?" onClose={() => setCloseSession(null)}><div className="p-5"><p className="text-sm text-slate-600">Closing <strong>{closeSession.title}</strong> locks its attendance. Attendance will not be editable while the session remains closed.</p><div className="mt-5 flex justify-end gap-3"><button type="button" onClick={() => setCloseSession(null)} className="h-10 rounded-lg border border-slate-200 px-4 text-sm font-semibold">Cancel</button><button type="button" onClick={closeConfirmed} className="h-10 rounded-lg bg-slate-900 px-4 text-sm font-semibold text-white">Close and lock attendance</button></div></div></Modal>}
    </DashboardShell>
  );
}

function CreatePlayerSelection() {
  return <fieldset className="rounded-xl border border-slate-200 p-4"><legend className="px-1 text-sm font-semibold text-slate-800">Relevant players</legend><div className="grid gap-2 sm:grid-cols-2">{coachPlayers.map((player) => <label key={player.id} className="flex items-center gap-3 rounded-lg bg-slate-50 px-3 py-2 text-sm"><input name="player" type="checkbox" value={player.id} className="h-4 w-4" /><span><strong>{player.name}</strong><span className="block text-xs text-slate-500">{player.sport} · {player.id}</span></span></label>)}</div></fieldset>;
}

function Info({ label, value }: { label: string; value: string }) {
  return <div className="rounded-lg bg-slate-50 p-4"><p className="text-xs text-slate-500">{label}</p><p className="mt-1 font-semibold text-slate-800">{value}</p></div>;
}
