"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import { Check, ChevronLeft, ChevronRight, History, LockKeyhole, RotateCcw, Search, UnlockKeyhole, X } from "lucide-react";
import { DashboardShell } from "../DashboardShell";
import { EmptyState, LoadingState, PageHeader } from "../DashboardUI";
import { Panel, StatCard, StatusBadge } from "../Dashboard";

type AttendanceStatus = "Present" | "Absent" | "Not marked";
type SessionStatus = "Open" | "Closed";
type Session = { id: string; date: string; sport: string; coach: string; status: SessionStatus; reopenedAt?: string; reopenReason?: string };
type Player = { id: string; name: string; sport: string; coach: string; status: AttendanceStatus; percentage: number };

const sessions: Session[] = [
  { id: "SES-1108", date: "2026-11-04", sport: "Football", coach: "Raj Kumar", status: "Open" },
  { id: "SES-1107", date: "2026-11-04", sport: "Cricket", coach: "Imran Ali", status: "Open" },
  { id: "SES-1106", date: "2026-11-03", sport: "Swimming", coach: "Neha Rao", status: "Closed" },
  { id: "SES-1105", date: "2026-11-02", sport: "Athletics", coach: "Neha Rao", status: "Closed", reopenedAt: "2026-11-03 10:30", reopenReason: "Correcting an omitted player record" },
];

const playersBySport: Record<string, Omit<Player, "status" | "percentage">[]> = {
  Football: [
    { id: "AD-1042", name: "Arjun Patel", sport: "Football", coach: "Raj Kumar" },
    { id: "AD-1088", name: "Meera Shah", sport: "Football", coach: "Raj Kumar" },
    { id: "AD-1257", name: "Reyansh Das", sport: "Football", coach: "Raj Kumar" },
    { id: "AD-1274", name: "Aarav Nair", sport: "Football", coach: "Daniel Thomas" },
  ],
  Cricket: [
    { id: "AD-1121", name: "Vihaan Rao", sport: "Cricket", coach: "Imran Ali" },
    { id: "AD-1218", name: "Anaya Nair", sport: "Cricket", coach: "Imran Ali" },
    { id: "AD-1291", name: "Kabir Mehta", sport: "Cricket", coach: "Daniel Thomas" },
  ],
  Swimming: [
    { id: "AD-1145", name: "Ishaan Verma", sport: "Swimming", coach: "Neha Rao" },
    { id: "AD-1302", name: "Sara Khan", sport: "Swimming", coach: "Neha Rao" },
  ],
  Athletics: [
    { id: "AD-1192", name: "Kabir Singh", sport: "Athletics", coach: "Neha Rao" },
    { id: "AD-1318", name: "Riya Kapoor", sport: "Athletics", coach: "Raj Kumar" },
  ],
};

const initialStatuses: Record<string, AttendanceStatus> = {
  "AD-1042": "Present", "AD-1088": "Absent", "AD-1257": "Present", "AD-1274": "Not marked",
  "AD-1121": "Present", "AD-1218": "Present", "AD-1291": "Absent",
  "AD-1145": "Present", "AD-1302": "Absent",
  "AD-1192": "Absent", "AD-1318": "Present",
};

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: ReactNode }) {
  return <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 p-3 sm:p-6" onMouseDown={(event) => event.target === event.currentTarget && onClose()}><div role="dialog" aria-modal="true" aria-labelledby="attendance-modal-title" className="max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white shadow-2xl"><div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-100 bg-white px-5 py-4"><h2 id="attendance-modal-title" className="font-semibold text-slate-900">{title}</h2><button onClick={onClose} aria-label="Close dialog" className="grid h-9 w-9 place-items-center rounded-lg text-slate-500 hover:bg-slate-100"><X className="h-5 w-5" /></button></div>{children}</div></div>;
}

export function AttendanceManagement() {
  const [loading, setLoading] = useState(true);
  const [selectedSessionId, setSelectedSessionId] = useState(sessions[0].id);
  const [dateFilter, setDateFilter] = useState("");
  const [sportFilter, setSportFilter] = useState("All sports");
  const [coachFilter, setCoachFilter] = useState("All coaches");
  const [statusFilter, setStatusFilter] = useState("All statuses");
  const [query, setQuery] = useState("");
  const [statuses, setStatuses] = useState(initialStatuses);
  const [sessionStatuses, setSessionStatuses] = useState<Record<string, SessionStatus>>({ "SES-1108": "Open", "SES-1107": "Open", "SES-1106": "Closed", "SES-1105": "Closed" });
  const [markAll, setMarkAll] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [reopenOpen, setReopenOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [reportPeriod, setReportPeriod] = useState("Weekly");
  const [page, setPage] = useState(1);
  const [toast, setToast] = useState("");
  const pageSize = 5;

  useEffect(() => { const timer = window.setTimeout(() => setLoading(false), 350); return () => window.clearTimeout(timer); }, []);
  const notify = (message: string) => { setToast(message); window.setTimeout(() => setToast(""), 2600); };
  const session = sessions.find((item) => item.id === selectedSessionId) ?? sessions[0];
  const sessionStatus = sessionStatuses[session.id] ?? session.status;
  const isLocked = sessionStatus === "Closed";
  const eligiblePlayers = useMemo<Player[]>(() => (playersBySport[session.sport] ?? []).map((player) => ({
    ...player,
    status: statuses[player.id] ?? "Not marked",
    percentage: player.id === "AD-1042" ? 92 : player.id === "AD-1088" ? 88 : player.id === "AD-1145" ? 86 : player.id === "AD-1192" ? 68 : 81,
  })), [session.sport, statuses]);
  const filtered = eligiblePlayers.filter((player) =>
    (!query.trim() || `${player.name} ${player.id}`.toLowerCase().includes(query.trim().toLowerCase())) &&
    (coachFilter === "All coaches" || player.coach === coachFilter) &&
    (statusFilter === "All statuses" || player.status === statusFilter)
  );
  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
  const visible = filtered.slice((page - 1) * pageSize, page * pageSize);
  const markedPlayers = eligiblePlayers.filter((player) => player.status !== "Not marked");
  const presentCount = eligiblePlayers.filter((player) => player.status === "Present").length;
  const absentCount = eligiblePlayers.filter((player) => player.status === "Absent").length;
  const overall = markedPlayers.length ? Math.round((presentCount / markedPlayers.length) * 100) : 0;

  const setPlayerStatus = (playerId: string, status: AttendanceStatus) => {
    if (isLocked) return;
    setStatuses((current) => ({ ...current, [playerId]: status }));
  };
  const markAllPresent = () => {
    setStatuses((current) => {
      const next = { ...current };
      eligiblePlayers.forEach((player) => { next[player.id] = "Present"; });
      return next;
    });
    setMarkAll(false);
    notify("All eligible players marked present in this preview.");
  };
  const saveAttendance = () => {
    if (isLocked) { notify("Closed sessions cannot be edited."); return; }
    if (eligiblePlayers.some((player) => player.status === "Not marked")) { notify("Mark every player before saving."); return; }
    notify("Attendance saved in the local mock preview.");
  };
  const reopenSession = () => {
    if (reason.trim().length < 10) return;
    setSessionStatuses((current) => ({ ...current, [session.id]: "Open" }));
    setReopenOpen(false);
    notify(`${session.id} reopened with a reason recorded in the preview.`);
  };
  const resetFilters = () => { setQuery(""); setDateFilter(""); setSportFilter("All sports"); setCoachFilter("All coaches"); setStatusFilter("All statuses"); setPage(1); };
  const reportRows = [
    { period: "Daily", value: "91%" },
    { period: "Weekly", value: "87%" },
    { period: "Monthly", value: "84%" },
    { period: "Sport-wise", value: "89%" },
  ];

  return <DashboardShell role="head-coach" title="Attendance Management" subtitle="Demonstration data · Mark and review player attendance">
    <PageHeader title="Attendance Management" description="Demonstration data · Session attendance and reports" />
    <div className="mb-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <StatCard label="Overall attendance" value={`${overall}%`} detail="Present ÷ marked held-session records" icon="activity" />
      <StatCard label="Present" value={String(presentCount)} detail="Marked present in this session" icon="clipboard" tone="green" />
      <StatCard label="Absent" value={String(absentCount)} detail="Marked absent in this session" icon="users" tone="amber" />
      <StatCard label="Attendance records" value={String(markedPlayers.length)} detail={`${eligiblePlayers.length} eligible players total`} icon="calendar" tone="violet" />
    </div>

    <div className="mb-5 grid gap-3 rounded-xl border border-slate-200 bg-white p-4 md:grid-cols-4">
      <label className="text-sm font-medium text-slate-700">Date<input type="date" value={dateFilter || session.date} onChange={(event) => setDateFilter(event.target.value)} className="mt-1.5 h-10 w-full rounded-lg border border-slate-200 px-3 text-sm font-normal" /></label>
      <label className="text-sm font-medium text-slate-700">Sport<select value={sportFilter === "All sports" ? session.sport : sportFilter} onChange={(event) => { const next = event.target.value; setSportFilter(next); const match = sessions.find((item) => item.sport === next); if (match) setSelectedSessionId(match.id); }} className="mt-1.5 h-10 w-full rounded-lg border border-slate-200 px-3 text-sm font-normal"><option>All sports</option>{["Football", "Cricket", "Swimming", "Athletics"].map((sport) => <option key={sport}>{sport}</option>)}</select></label>
      <label className="text-sm font-medium text-slate-700">Session<select value={selectedSessionId} onChange={(event) => setSelectedSessionId(event.target.value)} className="mt-1.5 h-10 w-full rounded-lg border border-slate-200 px-3 text-sm font-normal">{sessions.map((item) => <option key={item.id} value={item.id}>{item.id} · {item.sport}</option>)}</select></label>
      <div className="flex items-end"><div className="flex h-10 w-full items-center justify-between rounded-lg border border-slate-200 px-3 text-sm"><span className="text-slate-500">Session status</span><StatusBadge tone={isLocked ? "slate" : "green"}>{sessionStatus}</StatusBadge></div></div>
    </div>

    {loading ? <LoadingState message="Loading attendance records..." /> : <>
      <div className="mb-5 grid gap-4 lg:grid-cols-[1.2fr_1fr]">
        <Panel title="Sport-wise attendance">
          <div className="space-y-4 p-5">{[["Football", 89], ["Cricket", 86], ["Swimming", 91], ["Athletics", 78]].map(([sport, value]) => <div key={sport}><div className="mb-1.5 flex justify-between text-sm"><span className="font-medium text-slate-700">{sport}</span><span className="font-semibold text-slate-900">{value}%</span></div><div className="h-2 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-blue-600" style={{ width: `${value}%` }} /></div></div>)}</div>
        </Panel>
        <Panel title="Attendance reports" action={<select aria-label="Attendance report period" value={reportPeriod} onChange={(event) => setReportPeriod(event.target.value)} className="rounded-lg border border-slate-200 px-2 py-1.5 text-xs"><option>Daily</option><option>Weekly</option><option>Monthly</option></select>}>
          <div className="grid grid-cols-2 gap-3 p-4">{reportRows.map((row) => <div key={row.period} className={`rounded-lg border p-3 ${reportPeriod === row.period ? "border-blue-200 bg-blue-50" : "border-slate-100"}`}><p className="text-xs text-slate-500">{row.period}</p><p className="mt-1 text-lg font-bold text-slate-900">{row.value}</p></div>)}</div>
          <div className="border-t border-slate-100 px-4 py-3 text-xs text-slate-500">Player-wise percentages are shown in the table below.</div>
        </Panel>
      </div>

      {isLocked && <div className="mb-4 flex flex-col gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 sm:flex-row sm:items-center"><LockKeyhole className="h-5 w-5 shrink-0 text-amber-700" /><div className="flex-1"><p className="text-sm font-semibold text-amber-900">Closed session · attendance locked</p><p className="mt-1 text-xs text-amber-700">Use the authorized reopening workflow to edit this record.</p>{session.reopenReason && <p className="mt-1 text-xs text-amber-700">Last reason: {session.reopenReason}</p>}</div><button onClick={() => { setReason(""); setReopenOpen(true); }} className="inline-flex h-9 items-center gap-2 rounded-lg border border-amber-300 bg-white px-3 text-xs font-semibold text-amber-800"><UnlockKeyhole className="h-4 w-4" />Reopen attendance</button></div>}

      <Panel title={`${session.id} · ${session.sport} players`}>
        <div className="grid gap-3 border-b border-slate-100 p-4 md:grid-cols-[minmax(220px,1fr)_180px_180px_44px_auto]">
          <label className="relative"><span className="sr-only">Search players</span><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" /><input type="search" value={query} onChange={(event) => { setQuery(event.target.value); setPage(1); }} placeholder="Search player or ID..." className="h-10 w-full rounded-lg border border-slate-200 pl-9 pr-3 text-sm outline-none focus:border-blue-500" /></label>
          <select aria-label="Filter by coach" value={coachFilter} onChange={(event) => setCoachFilter(event.target.value)} className="h-10 rounded-lg border border-slate-200 px-3 text-sm"><option>All coaches</option>{["Raj Kumar", "Daniel Thomas", "Imran Ali", "Neha Rao"].map((coach) => <option key={coach}>{coach}</option>)}</select>
          <select aria-label="Filter by attendance status" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} className="h-10 rounded-lg border border-slate-200 px-3 text-sm"><option>All statuses</option><option>Present</option><option>Absent</option><option>Not marked</option></select>
          <button onClick={resetFilters} aria-label="Reset filters" className="grid h-10 place-items-center rounded-lg border border-slate-200 text-slate-500"><RotateCcw className="h-4 w-4" /></button>
          {!isLocked && <button disabled={!eligiblePlayers.length} onClick={() => setMarkAll(true)} className="h-10 rounded-lg border border-blue-200 bg-blue-50 px-3 text-xs font-semibold text-blue-700 disabled:opacity-50"><Check className="mr-1 inline h-4 w-4" />Mark all present</button>}
        </div>
        {visible.length ? <>
          <div className="overflow-x-auto"><table className="w-full min-w-[830px] text-left text-sm"><thead className="bg-slate-50 text-xs uppercase text-slate-500"><tr><th className="px-5 py-3">Player</th><th className="px-5 py-3">Sport</th><th className="px-5 py-3">Coach</th><th className="px-5 py-3">Attendance</th><th className="px-5 py-3">Status</th><th className="px-5 py-3">Controls</th></tr></thead><tbody className="divide-y divide-slate-100">{visible.map((player) => <tr key={player.id} className="hover:bg-slate-50/60"><td className="px-5 py-4"><p className="font-semibold text-slate-900">{player.name}</p><p className="text-xs text-slate-500">{player.id}</p></td><td className="px-5 py-4 text-slate-600">{player.sport}</td><td className="px-5 py-4 text-slate-600">{player.coach}</td><td className="px-5 py-4 font-semibold text-slate-800">{player.percentage}%</td><td className="px-5 py-4"><StatusBadge tone={player.status === "Present" ? "green" : player.status === "Absent" ? "amber" : "slate"}>{player.status}</StatusBadge></td><td className="px-5 py-4"><div className="flex rounded-lg bg-slate-100 p-1">{(["Present", "Absent"] as const).map((value) => <button disabled={isLocked} key={value} onClick={() => setPlayerStatus(player.id, value)} className={`rounded-md px-3 py-1.5 text-xs font-semibold disabled:cursor-not-allowed disabled:opacity-60 ${player.status === value ? value === "Present" ? "bg-white text-emerald-700 shadow-sm" : "bg-white text-red-700 shadow-sm" : "text-slate-500"}`}>{value}</button>)}</div></td></tr>)}</tbody></table></div>
          <div className="flex flex-col gap-3 border-t border-slate-100 px-5 py-3 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between"><span>Showing {(page - 1) * pageSize + 1}-{Math.min(page * pageSize, filtered.length)} of {filtered.length}</span><div className="flex items-center gap-2"><button disabled={page === 1} onClick={() => setPage((current) => Math.max(1, current - 1))} aria-label="Previous page" className="grid h-8 w-8 place-items-center rounded-lg border border-slate-200 disabled:opacity-40"><ChevronLeft className="h-4 w-4" /></button><span>Page {page} of {pageCount}</span><button disabled={page === pageCount} onClick={() => setPage((current) => Math.min(pageCount, current + 1))} aria-label="Next page" className="grid h-8 w-8 place-items-center rounded-lg border border-slate-200 disabled:opacity-40"><ChevronRight className="h-4 w-4" /></button></div></div>
        </> : <EmptyState title="No attendance records" description="Change the player, coach or attendance filters." action={<button onClick={resetFilters} className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700">Reset filters</button>} />}
        {!isLocked && <div className="flex flex-col gap-3 border-t border-slate-100 p-4 sm:flex-row sm:justify-end"><button onClick={() => setHistoryOpen(true)} className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-slate-200 px-4 text-sm font-semibold text-slate-700"><History className="h-4 w-4" />View history</button><button onClick={saveAttendance} className="h-10 rounded-lg bg-blue-600 px-5 text-sm font-semibold text-white">Save attendance</button></div>}
      </Panel>
    </>}

    {markAll && <Modal title="Mark all players present" onClose={() => setMarkAll(false)}><div className="p-5"><p className="text-sm text-slate-600">Set attendance to <strong className="text-slate-900">Present</strong> for all {eligiblePlayers.length} eligible players in {session.id}?</p><div className="mt-5 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end"><button onClick={() => setMarkAll(false)} className="h-10 rounded-lg border border-slate-200 px-4 text-sm font-semibold text-slate-700">Cancel</button><button onClick={markAllPresent} className="h-10 rounded-lg bg-blue-600 px-4 text-sm font-semibold text-white">Confirm</button></div></div></Modal>}
    {historyOpen && <Modal title="Attendance history" onClose={() => setHistoryOpen(false)}><div className="p-5 space-y-3">{sessions.map((item) => <div key={item.id} className="flex items-center justify-between rounded-lg border border-slate-100 p-4"><div><p className="font-semibold text-slate-900">{item.id} · {item.sport}</p><p className="mt-1 text-xs text-slate-500">{new Date(`${item.date}T00:00:00`).toLocaleDateString()}</p></div><StatusBadge tone={(sessionStatuses[item.id] ?? item.status) === "Open" ? "green" : "slate"}>{sessionStatuses[item.id] ?? item.status}</StatusBadge></div>)}</div></Modal>}
    {reopenOpen && <Modal title="Reopen closed attendance" onClose={() => setReopenOpen(false)}><div className="p-5"><div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">Head Coach authorization is required. A reason is mandatory and will be displayed in the reopen audit preview.</div><label className="mt-4 block text-sm font-medium text-slate-700">Reason<textarea value={reason} onChange={(event) => setReason(event.target.value)} minLength={10} rows={4} className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" /><span className="mt-1 block text-xs text-slate-500">Minimum 10 characters</span></label>{session.reopenedAt && <div className="mt-4 rounded-lg bg-slate-50 p-3 text-xs text-slate-500"><strong className="text-slate-700">Audit preview:</strong> {session.reopenedAt} · {session.reopenReason}</div>}<div className="mt-5 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end"><button onClick={() => setReopenOpen(false)} className="h-10 rounded-lg border border-slate-200 px-4 text-sm font-semibold text-slate-700">Cancel</button><button disabled={reason.trim().length < 10} onClick={reopenSession} className="h-10 rounded-lg bg-blue-600 px-4 text-sm font-semibold text-white disabled:opacity-50">Confirm reopening</button></div></div></Modal>}
    {toast && <div role="status" className="fixed bottom-5 right-5 z-[60] rounded-xl bg-slate-900 px-4 py-3 text-sm font-medium text-white shadow-xl">{toast}</div>}
  </DashboardShell>;
}
