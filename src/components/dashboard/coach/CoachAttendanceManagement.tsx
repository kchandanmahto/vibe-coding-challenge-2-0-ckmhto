"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import { Check, LockKeyhole, Search, UnlockKeyhole, X } from "lucide-react";
import { DashboardShell } from "../DashboardShell";
import { EmptyState, LoadingState, PageHeader } from "../DashboardUI";
import { Panel, StatCard, StatusBadge } from "../Dashboard";
import { coachPlayers } from "./coachPlayersData";
import { coachAttendanceSessions, initialCoachAttendance, type AttendanceStatus, type CoachAttendanceRecord } from "./coachAttendanceData";

type ModalProps = { title: string; onClose: () => void; children: ReactNode };

function Modal({ title, onClose, children }: ModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 p-3 sm:p-6" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <div role="dialog" aria-modal="true" className="max-h-[92vh] w-full max-w-xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
        <div className="sticky top-0 flex items-center justify-between border-b border-slate-100 bg-white px-5 py-4"><h2 className="font-semibold text-slate-900">{title}</h2><button type="button" onClick={onClose} aria-label="Close dialog" className="grid h-9 w-9 place-items-center rounded-lg text-slate-500 hover:bg-slate-100"><X className="h-5 w-5" /></button></div>
        {children}
      </div>
    </div>
  );
}

export function CoachAttendanceManagement() {
  const [loading, setLoading] = useState(true);
  const [selectedSessionId, setSelectedSessionId] = useState(coachAttendanceSessions[0].id);
  const [sessionStatuses, setSessionStatuses] = useState<Record<string, "Open" | "Closed">>(() => Object.fromEntries(coachAttendanceSessions.map((item) => [item.id, item.status])));
  const [records, setRecords] = useState<Record<string, CoachAttendanceRecord[]>>(initialCoachAttendance);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All statuses");
  const [historySport, setHistorySport] = useState("All sports");
  const [historyStatus, setHistoryStatus] = useState("All statuses");
  const [historyFrom, setHistoryFrom] = useState("");
  const [historyTo, setHistoryTo] = useState("");
  const [confirmSave, setConfirmSave] = useState(false);
  const [confirmAll, setConfirmAll] = useState<AttendanceStatus | null>(null);
  const [reopenOpen, setReopenOpen] = useState(false);
  const [reopenReason, setReopenReason] = useState("");
  const [toast, setToast] = useState("");

  useEffect(() => { const timer = window.setTimeout(() => setLoading(false), 350); return () => window.clearTimeout(timer); }, []);
  const notify = (message: string) => { setToast(message); window.setTimeout(() => setToast(""), 2600); };

  const selectedSession = coachAttendanceSessions.find((item) => item.id === selectedSessionId) ?? coachAttendanceSessions[0];
  const status = sessionStatuses[selectedSession.id];
  const locked = status === "Closed";
  const players = useMemo(() => coachPlayers.filter((player) => selectedSession.playerIds.includes(player.id) && player.sport === selectedSession.sport), [selectedSession]);
  const sessionRecords = records[selectedSession.id] ?? [];

  const recordFor = (playerId: string) => sessionRecords.find((record) => record.playerId === playerId) ?? { playerId, status: "Not marked" as AttendanceStatus };
  const filteredPlayers = players.filter((player) => {
    const matchesQuery = `${player.name} ${player.id}`.toLowerCase().includes(query.trim().toLowerCase());
    const playerStatus = recordFor(player.id).status;
    return matchesQuery && (statusFilter === "All statuses" || playerStatus === statusFilter);
  });

  const marked = sessionRecords.filter((record) => record.status !== "Not marked");
  const presentToday = marked.filter((record) => record.status === "Present").length;
  const absentToday = marked.filter((record) => record.status === "Absent").length;
  const heldSessions = coachAttendanceSessions.filter((session) => session.held || sessionStatuses[session.id] === "Closed");
  const heldRecords = heldSessions.flatMap((session) => (records[session.id] ?? []).filter((record) => record.status !== "Not marked"));
  const averageAttendance = heldRecords.length ? Math.round(heldRecords.filter((record) => record.status === "Present").length / heldRecords.length * 100) : 0;
  const sessionsHeld = heldSessions.length;

  const setPlayerStatus = (playerId: string, playerStatus: AttendanceStatus) => {
    if (locked) { notify("Closed sessions cannot be edited."); return; }
    setRecords((current) => ({
      ...current,
      [selectedSession.id]: players.map((player) => {
        const existing = (current[selectedSession.id] ?? []).find((record) => record.playerId === player.id);
        if (player.id !== playerId) return existing ?? { playerId: player.id, status: "Not marked" as AttendanceStatus };
        return { playerId, status: playerStatus, markedAt: "2026-11-04 08:10 AM (mock)" };
      }),
    }));
  };

  const markAll = (playerStatus: AttendanceStatus) => {
    if (locked) return;
    setRecords((current) => ({
      ...current,
      [selectedSession.id]: players.map((player) => ({ playerId: player.id, status: playerStatus, markedAt: playerStatus === "Present" ? "2026-11-04 08:10 AM (mock)" : undefined })),
    }));
    setConfirmAll(null);
    notify(`All eligible players marked ${playerStatus.toLowerCase()} in the mock preview.`);
  };

  const saveAttendance = () => {
    if (locked) { notify("Closed sessions cannot be edited."); return; }
    const missing = players.some((player) => recordFor(player.id).status === "Not marked");
    if (missing) { notify("Mark every eligible player before saving."); return; }
    setConfirmSave(false);
    notify("Attendance saved in the local mock preview.");
  };

  const reopenAttendance = () => {
    if (reopenReason.trim().length < 10) return;
    setSessionStatuses((current) => ({ ...current, [selectedSession.id]: "Open" }));
    setReopenOpen(false);
    setReopenReason("");
    notify("Attendance reopened with the reason recorded in the mock audit.");
  };

  const history = coachAttendanceSessions.filter((session) => {
    const sessionStatus = sessionStatuses[session.id] ?? session.status;
    return (historySport === "All sports" || session.sport === historySport)
      && (historyStatus === "All statuses" || sessionStatus === historyStatus)
      && (!historyFrom || session.date >= historyFrom)
      && (!historyTo || session.date <= historyTo)
      && session.held;
  }).map((session) => {
    const markedRecords = (records[session.id] ?? []).filter((record) => record.status !== "Not marked");
    const present = markedRecords.filter((record) => record.status === "Present").length;
    return { session, total: session.playerIds.length, present, absent: markedRecords.length - present, percentage: markedRecords.length ? Math.round(present / markedRecords.length * 100) : 0 };
  });

  return (
    <DashboardShell role="coach" title="Attendance" subtitle="Mock attendance for assigned sports">
      <PageHeader title="Attendance Management" description="Mark and review player attendance for your assigned sessions" />
      {toast && <div role="status" className="fixed bottom-5 right-5 z-[60] rounded-xl bg-slate-900 px-4 py-3 text-sm font-medium text-white shadow-xl">{toast}</div>}
      {loading ? <LoadingState message="Loading attendance records..." /> : (
        <div className="space-y-5">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
            <StatCard label="Total sessions" value={String(coachAttendanceSessions.length)} detail="Coach scope mock data" icon="calendar" tone="blue" />
            <StatCard label="Sessions held" value={String(sessionsHeld)} detail="Closed/held sessions only" icon="clipboard" tone="green" />
            <StatCard label="Present today" value={String(presentToday)} detail="Marked in selected session" icon="users" tone="green" />
            <StatCard label="Absent today" value={String(absentToday)} detail="Marked in selected session" icon="activity" tone="amber" />
            <StatCard label="Average attendance" value={`${averageAttendance}%`} detail="Eligible marked records" icon="activity" tone="violet" />
          </div>

          <Panel title="Session selection">
            <div className="grid gap-4 p-4 sm:grid-cols-2 lg:grid-cols-4">
              <label className="text-sm font-medium text-slate-700">Session date<div className="mt-1.5 text-sm font-normal text-slate-500">{selectedSession.date}</div></label>
              <label className="text-sm font-medium text-slate-700">Sport<select value={selectedSession.sport} onChange={(event) => { const match = coachAttendanceSessions.find((item) => item.sport === event.target.value); if (match) setSelectedSessionId(match.id); setQuery(""); }} className="mt-1.5 h-10 w-full rounded-lg border border-slate-200 px-3 text-sm font-normal"><option value="">Select sport</option>{["Football", "Athletics"].map((sport) => <option key={sport}>{sport}</option>)}</select></label>
              <label className="text-sm font-medium text-slate-700">Session<select value={selectedSessionId} onChange={(event) => { setSelectedSessionId(event.target.value); setQuery(""); }} className="mt-1.5 h-10 w-full rounded-lg border border-slate-200 px-3 text-sm font-normal">{coachAttendanceSessions.filter((item) => item.sport === selectedSession.sport).map((item) => <option key={item.id} value={item.id}>{item.id} · {item.title}</option>)}</select></label>
              <div className="flex items-end"><div className="flex h-10 w-full items-center justify-between rounded-lg border border-slate-200 px-3 text-sm"><span className="text-slate-500">Status</span><StatusBadge tone={locked ? "slate" : "green"}>{status}</StatusBadge></div></div>
            </div>
          </Panel>

          {locked && (
            <div className="flex flex-col gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 sm:flex-row sm:items-center">
              <LockKeyhole className="h-5 w-5 shrink-0 text-amber-700" />
              <div className="flex-1"><p className="text-sm font-semibold text-amber-900">Closed session · attendance locked</p><p className="mt-1 text-xs text-amber-700">Normally editable only while authorized and the session is open.</p></div>
              <button type="button" onClick={() => { setReopenReason(""); setReopenOpen(true); }} className="inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-amber-300 bg-white px-3 text-xs font-semibold text-amber-800"><UnlockKeyhole className="h-4 w-4" /> Reopen attendance</button>
            </div>
          )}

          <Panel title={`${selectedSession.id} · ${selectedSession.title}`} action={!locked ? <div className="flex gap-2"><button type="button" onClick={() => setConfirmAll("Present")} className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700">Mark all present</button><button type="button" onClick={() => setConfirmAll("Absent")} className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-700">Mark all absent</button></div> : undefined}>
            <div className="grid gap-3 border-b border-slate-100 p-4 md:grid-cols-[minmax(220px,1fr)_180px]">
              <label className="relative"><span className="sr-only">Search players</span><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search player name or ID..." className="h-10 w-full rounded-lg border border-slate-200 pl-9 pr-3 text-sm" /></label>
              <select aria-label="Filter attendance status" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} className="h-10 rounded-lg border border-slate-200 px-3 text-sm"><option>All statuses</option><option>Present</option><option>Absent</option><option>Not marked</option></select>
            </div>
            {filteredPlayers.length ? (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[760px] text-left text-sm">
                  <thead className="bg-slate-50 text-xs uppercase text-slate-500"><tr><th className="px-5 py-3">Player</th><th className="px-5 py-3">Sport</th><th className="px-5 py-3">Status</th><th className="px-5 py-3">Marked at</th><th className="px-5 py-3">Actions</th></tr></thead>
                  <tbody className="divide-y divide-slate-100">{filteredPlayers.map((player) => { const record = recordFor(player.id); return <tr key={player.id}><td className="px-5 py-4"><div className="flex items-center gap-3"><span className="grid h-9 w-9 place-items-center rounded-full bg-blue-50 text-xs font-bold text-blue-700">{player.initials}</span><div><p className="font-semibold text-slate-900">{player.name}</p><p className="text-xs text-slate-500">{player.id}</p></div></div></td><td className="px-5 py-4 text-slate-600">{player.sport}</td><td className="px-5 py-4"><StatusBadge tone={record.status === "Present" ? "green" : record.status === "Absent" ? "amber" : "slate"}>{record.status}</StatusBadge></td><td className="px-5 py-4 text-xs text-slate-500">{record.markedAt ?? "Not marked"}</td><td className="px-5 py-4"><div className="flex rounded-lg bg-slate-100 p-1">{(["Present", "Absent"] as AttendanceStatus[]).map((value) => <button key={value} type="button" disabled={locked} onClick={() => setPlayerStatus(player.id, value)} className={`rounded-md px-3 py-1.5 text-xs font-semibold disabled:cursor-not-allowed disabled:opacity-50 ${record.status === value ? value === "Present" ? "bg-white text-emerald-700 shadow-sm" : "bg-white text-red-700 shadow-sm" : "text-slate-500"}`}>{value}</button>)}</div></td></tr>; })}</tbody>
                </table>
              </div>
            ) : <EmptyState title="No players found" description="Search and status filters did not match any eligible players." />}
            {!locked && <div className="flex justify-end border-t border-slate-100 p-4"><button type="button" onClick={() => setConfirmSave(true)} className="inline-flex h-10 items-center gap-2 rounded-lg bg-blue-600 px-5 text-sm font-semibold text-white"><Check className="h-4 w-4" /> Save attendance</button></div>}
          </Panel>

          <Panel title="Attendance history">
            <div className="grid gap-3 border-b border-slate-100 p-4 md:grid-cols-4">
              <input aria-label="History from date" type="date" value={historyFrom} onChange={(event) => setHistoryFrom(event.target.value)} className="h-10 rounded-lg border border-slate-200 px-3 text-sm" />
              <input aria-label="History to date" type="date" value={historyTo} onChange={(event) => setHistoryTo(event.target.value)} className="h-10 rounded-lg border border-slate-200 px-3 text-sm" />
              <select aria-label="History sport filter" value={historySport} onChange={(event) => setHistorySport(event.target.value)} className="h-10 rounded-lg border border-slate-200 px-3 text-sm"><option>All sports</option><option>Football</option><option>Athletics</option></select>
              <select aria-label="History status filter" value={historyStatus} onChange={(event) => setHistoryStatus(event.target.value)} className="h-10 rounded-lg border border-slate-200 px-3 text-sm"><option>All statuses</option><option>Open</option><option>Closed</option></select>
            </div>
            {history.length ? <div className="overflow-x-auto"><table className="w-full min-w-[760px] text-left text-sm"><thead className="bg-slate-50 text-xs uppercase text-slate-500"><tr><th className="px-5 py-3">Date</th><th className="px-5 py-3">Sport</th><th className="px-5 py-3">Session</th><th className="px-5 py-3">Players</th><th className="px-5 py-3">Present</th><th className="px-5 py-3">Absent</th><th className="px-5 py-3">Attendance</th><th className="px-5 py-3">Status</th></tr></thead><tbody className="divide-y divide-slate-100">{history.map(({ session, total, present, absent, percentage }) => <tr key={session.id}><td className="px-5 py-4">{session.date}</td><td className="px-5 py-4">{session.sport}</td><td className="px-5 py-4"><p className="font-semibold">{session.title}</p><p className="text-xs text-slate-500">{session.id}</p></td><td className="px-5 py-4">{total}</td><td className="px-5 py-4 text-emerald-700">{present}</td><td className="px-5 py-4 text-red-700">{absent}</td><td className="px-5 py-4 font-semibold">{percentage}%</td><td className="px-5 py-4"><StatusBadge tone={sessionStatuses[session.id] === "Open" ? "green" : "slate"}>{sessionStatuses[session.id]}</StatusBadge></td></tr>)}</tbody></table></div> : <EmptyState title="No attendance history" description="No held sessions match the selected history filters." />}
          </Panel>

          <Panel title="Attendance trend">
            <div className="grid gap-4 p-5 sm:grid-cols-5">{coachAttendanceSessions.filter((session) => session.held).map((session) => { const sessionRecords = (records[session.id] ?? []).filter((record) => record.status !== "Not marked"); const present = sessionRecords.filter((record) => record.status === "Present").length; const percentage = sessionRecords.length ? Math.round(present / sessionRecords.length * 100) : 0; return <div key={session.id}><div className="mb-2 flex h-28 items-end rounded-lg bg-slate-50 px-3"><div className="w-full rounded-t-md bg-blue-500" style={{ height: `${percentage}%` }} /></div><p className="text-center text-xs font-semibold text-slate-700">{percentage}%</p><p className="mt-1 text-center text-[11px] text-slate-500">{session.date.slice(5)}</p></div>; })}</div>
          </Panel>
        </div>
      )}

      {confirmSave && <Modal title="Save attendance?" onClose={() => setConfirmSave(false)}><div className="p-5"><p className="text-sm text-slate-600">Save the mock attendance changes for <strong>{selectedSession.id}</strong>? This preview does not persist to a database.</p><div className="mt-5 flex justify-end gap-3"><button type="button" onClick={() => setConfirmSave(false)} className="h-10 rounded-lg border border-slate-200 px-4 text-sm font-semibold">Cancel</button><button type="button" onClick={saveAttendance} className="h-10 rounded-lg bg-blue-600 px-4 text-sm font-semibold text-white">Confirm save</button></div></div></Modal>}
      {confirmAll && <Modal title={`Mark all ${confirmAll.toLowerCase()}?`} onClose={() => setConfirmAll(null)}><div className="p-5"><p className="text-sm text-slate-600">Set all {players.length} eligible players to <strong>{confirmAll}</strong> for {selectedSession.id}?</p><div className="mt-5 flex justify-end gap-3"><button type="button" onClick={() => setConfirmAll(null)} className="h-10 rounded-lg border border-slate-200 px-4 text-sm font-semibold">Cancel</button><button type="button" onClick={() => markAll(confirmAll)} className="h-10 rounded-lg bg-blue-600 px-4 text-sm font-semibold text-white">Confirm</button></div></div></Modal>}
      {reopenOpen && <Modal title="Authorized reopen attendance" onClose={() => setReopenOpen(false)}><div className="p-5"><div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">This mock workflow requires Head Coach authorization. The reopening reason and audit event will be mandatory.</div><label className="mt-4 block text-sm font-medium text-slate-700">Reopening reason<textarea value={reopenReason} onChange={(event) => setReopenReason(event.target.value)} rows={4} className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" /><span className="mt-1 block text-xs text-slate-500">Minimum 10 characters</span></label>{reopenReason.length > 0 && reopenReason.trim().length < 10 && <p className="mt-2 text-xs text-red-600">Enter a reason of at least 10 characters.</p>}<div className="mt-5 flex justify-end gap-3"><button type="button" onClick={() => setReopenOpen(false)} className="h-10 rounded-lg border border-slate-200 px-4 text-sm font-semibold">Cancel</button><button type="button" disabled={reopenReason.trim().length < 10} onClick={reopenAttendance} className="h-10 rounded-lg bg-blue-600 px-4 text-sm font-semibold text-white disabled:opacity-50">Authorize reopening</button></div></div></Modal>}
    </DashboardShell>
  );
}
