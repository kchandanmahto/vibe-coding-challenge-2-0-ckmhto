"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import { ChevronLeft, ChevronRight, Eye, Search, X } from "lucide-react";
import { DashboardShell } from "../DashboardShell";
import { EmptyState, LoadingState, PageHeader } from "../DashboardUI";
import { Panel, StatCard, StatusBadge } from "../Dashboard";

type AttendanceRecord = { date: string; status: "Present" | "Absent"; sessionId: string };
type MatchRecord = { matchId: string; title: string; date: string; status: "Completed" };
type ReadinessPlayer = {
  id: string;
  name: string;
  sport: string;
  coach: string;
  attendance: number;
  matches: number;
  attendanceHistory: AttendanceRecord[];
  matchHistory: MatchRecord[];
};

export const isPlayerReady = (attendance: number, completedMatches: number) =>
  attendance >= 75 && completedMatches >= 2;

const players: ReadinessPlayer[] = [
  { id: "AD-1042", name: "Arjun Patel", sport: "Football", coach: "Raj Kumar", attendance: 92, matches: 12, attendanceHistory: [{ sessionId: "SES-1101", date: "2026-10-28", status: "Present" }, { sessionId: "SES-1102", date: "2026-10-25", status: "Present" }, { sessionId: "SES-1103", date: "2026-10-21", status: "Absent" }], matchHistory: [{ matchId: "MAT-2001", title: "District League", date: "2026-10-07", status: "Completed" }, { matchId: "MAT-2002", title: "Academy Championship", date: "2026-09-19", status: "Completed" }] },
  { id: "AD-1088", name: "Meera Shah", sport: "Football", coach: "Raj Kumar", attendance: 88, matches: 9, attendanceHistory: [{ sessionId: "SES-1101", date: "2026-10-28", status: "Present" }, { sessionId: "SES-1102", date: "2026-10-25", status: "Present" }, { sessionId: "SES-1103", date: "2026-10-21", status: "Present" }], matchHistory: [{ matchId: "MAT-2001", title: "District League", date: "2026-10-07", status: "Completed" }, { matchId: "MAT-2002", title: "Academy Championship", date: "2026-09-19", status: "Completed" }] },
  { id: "AD-1121", name: "Vihaan Rao", sport: "Cricket", coach: "Imran Ali", attendance: 75, matches: 1, attendanceHistory: [{ sessionId: "SES-1111", date: "2026-10-29", status: "Present" }, { sessionId: "SES-1112", date: "2026-10-26", status: "Present" }, { sessionId: "SES-1113", date: "2026-10-22", status: "Absent" }], matchHistory: [{ matchId: "MAT-2011", title: "Academy Championship", date: "2026-10-12", status: "Completed" }] },
  { id: "AD-1145", name: "Ishaan Verma", sport: "Swimming", coach: "Neha Rao", attendance: 86, matches: 6, attendanceHistory: [{ sessionId: "SES-1121", date: "2026-10-30", status: "Present" }, { sessionId: "SES-1122", date: "2026-10-27", status: "Present" }, { sessionId: "SES-1123", date: "2026-10-24", status: "Absent" }], matchHistory: [{ matchId: "MAT-2021", title: "Junior Swimming Meet", date: "2026-10-21", status: "Completed" }, { matchId: "MAT-2022", title: "District Qualifier", date: "2026-09-08", status: "Completed" }] },
  { id: "AD-1192", name: "Kabir Singh", sport: "Athletics", coach: "Neha Rao", attendance: 68, matches: 1, attendanceHistory: [{ sessionId: "SES-1131", date: "2026-10-30", status: "Absent" }, { sessionId: "SES-1132", date: "2026-10-27", status: "Absent" }, { sessionId: "SES-1133", date: "2026-10-24", status: "Present" }], matchHistory: [{ matchId: "MAT-2031", title: "City Athletics Trial", date: "2026-10-18", status: "Completed" }] },
  { id: "AD-1257", name: "Reyansh Das", sport: "Football", coach: "Raj Kumar", attendance: 74, matches: 2, attendanceHistory: [{ sessionId: "SES-1101", date: "2026-10-28", status: "Absent" }, { sessionId: "SES-1102", date: "2026-10-25", status: "Present" }, { sessionId: "SES-1103", date: "2026-10-21", status: "Present" }], matchHistory: [{ matchId: "MAT-2035", title: "City Cup", date: "2026-08-22", status: "Completed" }, { matchId: "MAT-2036", title: "Academy Championship", date: "2026-09-19", status: "Completed" }] },
];

function Modal({ title, children, onClose }: { title: string; children: ReactNode; onClose: () => void }) {
  return <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 p-3 sm:p-6" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
    <div role="dialog" aria-modal="true" aria-labelledby="readiness-modal-title" className="max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
      <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-100 bg-white px-5 py-4"><h2 id="readiness-modal-title" className="font-semibold text-slate-900">{title}</h2><button aria-label="Close dialog" onClick={onClose} className="grid h-9 w-9 place-items-center rounded-lg text-slate-500 hover:bg-slate-100"><X className="h-5 w-5" /></button></div>
      {children}
    </div>
  </div>;
}

export function ReadinessManagement() {
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [sport, setSport] = useState("All sports");
  const [coach, setCoach] = useState("All coaches");
  const [status, setStatus] = useState("All statuses");
  const [attendanceRange, setAttendanceRange] = useState("All attendance");
  const [matchCount, setMatchCount] = useState("All match counts");
  const [sort, setSort] = useState("status-ready");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<ReadinessPlayer | null>(null);
  const pageSize = 5;

  useEffect(() => {
    const timer = window.setTimeout(() => setLoading(false), 350);
    return () => window.clearTimeout(timer);
  }, []);

  const readiness = useMemo(() => players.map((player) => ({
    ...player,
    ready: isPlayerReady(player.attendance, player.matches),
    attendanceFails: player.attendance < 75,
    matchesFail: player.matches < 2,
  })), []);
  const filtered = useMemo(() => readiness.filter((player) => {
    const attendanceMatches = attendanceRange === "All attendance" ||
      (attendanceRange === "Below 75%" && player.attendance < 75) ||
      (attendanceRange === "75% to 84%" && player.attendance >= 75 && player.attendance < 85) ||
      (attendanceRange === "85% or above" && player.attendance >= 85);
    const matchMatches = matchCount === "All match counts" ||
      (matchCount === "No matches" && player.matches === 0) ||
      (matchCount === "1 match" && player.matches === 1) ||
      (matchCount === "2 or more matches" && player.matches >= 2);
    return (!query.trim() || `${player.name} ${player.id}`.toLowerCase().includes(query.trim().toLowerCase())) &&
      (sport === "All sports" || player.sport === sport) &&
      (coach === "All coaches" || player.coach === coach) &&
      (status === "All statuses" || (status === "Ready" ? player.ready : !player.ready)) &&
      attendanceMatches && matchMatches;
  }).sort((a, b) => {
    if (sort === "name") return a.name.localeCompare(b.name);
    if (sort === "attendance-desc") return b.attendance - a.attendance;
    if (sort === "attendance-asc") return a.attendance - b.attendance;
    if (sort === "matches-desc") return b.matches - a.matches;
    if (sort === "status-not-ready") return Number(a.ready) - Number(b.ready) || a.name.localeCompare(b.name);
    return Number(b.ready) - Number(a.ready) || a.name.localeCompare(b.name);
  }), [readiness, query, sport, coach, status, attendanceRange, matchCount, sort]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
  const visible = filtered.slice((page - 1) * pageSize, page * pageSize);
  const readyCount = readiness.filter((player) => player.ready).length;
  const attendanceFailures = readiness.filter((player) => player.attendanceFails).length;
  const matchFailures = readiness.filter((player) => player.matchesFail).length;
  const reset = () => { setQuery(""); setSport("All sports"); setCoach("All coaches"); setStatus("All statuses"); setAttendanceRange("All attendance"); setMatchCount("All match counts"); setSort("status-ready"); setPage(1); };

  return <DashboardShell role="head-coach" title="Ready Players" subtitle="Demonstration data · Mandatory readiness eligibility">
    <PageHeader title="Ready Players" description="Demonstration data · Readiness is calculated from attendance and completed match records" />
    <div className="mb-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
      <StatCard label="Total players" value={String(readiness.length)} detail="Demo player records" icon="users" />
      <StatCard label="Ready players" value={String(readyCount)} detail="Both conditions satisfied" icon="activity" tone="green" />
      <StatCard label="Not ready" value={String(readiness.length - readyCount)} detail="One or both conditions fail" icon="activity" tone="amber" />
      <StatCard label="Below attendance" value={String(attendanceFailures)} detail="Attendance below 75%" icon="calendar" tone="blue" />
      <StatCard label="Below match count" value={String(matchFailures)} detail="Fewer than 2 completed matches" icon="trophy" tone="violet" />
    </div>
    {loading ? <LoadingState message="Calculating readiness..." /> : <div className="space-y-5">
      <div className="grid gap-5 xl:grid-cols-[1fr_340px]">
        <Panel title="Eligibility rule">
          <div className="grid gap-3 p-5 sm:grid-cols-2"><div className="rounded-xl border border-blue-100 bg-blue-50 p-4"><p className="text-xs font-semibold uppercase tracking-wide text-blue-700">Condition 1</p><p className="mt-2 text-lg font-bold text-slate-900">Attendance &gt;= 75%</p><p className="mt-1 text-sm text-slate-600">{attendanceFailures} demo players currently fail this condition.</p></div><div className="rounded-xl border border-violet-100 bg-violet-50 p-4"><p className="text-xs font-semibold uppercase tracking-wide text-violet-700">Condition 2</p><p className="mt-2 text-lg font-bold text-slate-900">Completed matches &gt;= 2</p><p className="mt-1 text-sm text-slate-600">{matchFailures} demo players currently fail this condition.</p></div></div>
        </Panel>
        <Panel title="Readiness distribution">
          <div className="p-5"><div className="flex h-5 overflow-hidden rounded-full bg-slate-100"><div className="bg-emerald-500" style={{ width: `${readyCount / readiness.length * 100}%` }} /><div className="bg-amber-400" style={{ width: `${(readiness.length - readyCount) / readiness.length * 100}%` }} /></div><div className="mt-4 flex justify-between text-xs text-slate-500"><span className="text-emerald-700">Ready {readyCount}</span><span className="text-amber-700">Not Ready {readiness.length - readyCount}</span></div><p className="mt-4 text-xs leading-5 text-slate-500">Non-ready players are excluded from Scout-facing readiness lists. This page is for Head Coach review only.</p></div>
        </Panel>
      </div>
      <Panel title={`Readiness list (${filtered.length})`}>
        <div className="grid gap-3 border-b border-slate-100 p-4 xl:grid-cols-[minmax(210px,1fr)_145px_145px_145px_150px_150px_150px_44px]">
          <label className="relative"><span className="sr-only">Search players</span><Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" /><input value={query} onChange={(event) => { setQuery(event.target.value); setPage(1); }} placeholder="Name or player ID..." className="h-10 w-full rounded-lg border border-slate-200 pl-9 pr-3 text-sm" /></label>
          <select aria-label="Sport filter" value={sport} onChange={(event) => { setSport(event.target.value); setPage(1); }} className="h-10 rounded-lg border border-slate-200 px-3 text-sm"><option>All sports</option>{["Football", "Cricket", "Swimming", "Athletics"].map((item) => <option key={item}>{item}</option>)}</select>
          <select aria-label="Coach filter" value={coach} onChange={(event) => setCoach(event.target.value)} className="h-10 rounded-lg border border-slate-200 px-3 text-sm"><option>All coaches</option>{["Raj Kumar", "Imran Ali", "Neha Rao"].map((item) => <option key={item}>{item}</option>)}</select>
          <select aria-label="Readiness filter" value={status} onChange={(event) => setStatus(event.target.value)} className="h-10 rounded-lg border border-slate-200 px-3 text-sm"><option>All statuses</option><option>Ready</option><option>Not Ready</option></select>
          <select aria-label="Attendance range" value={attendanceRange} onChange={(event) => setAttendanceRange(event.target.value)} className="h-10 rounded-lg border border-slate-200 px-3 text-sm"><option>All attendance</option><option>Below 75%</option><option>75% to 84%</option><option>85% or above</option></select>
          <select aria-label="Match count" value={matchCount} onChange={(event) => setMatchCount(event.target.value)} className="h-10 rounded-lg border border-slate-200 px-3 text-sm"><option>All match counts</option><option>No matches</option><option>1 match</option><option>2 or more matches</option></select>
          <select aria-label="Sort players" value={sort} onChange={(event) => setSort(event.target.value)} className="h-10 rounded-lg border border-slate-200 px-3 text-sm"><option value="status-ready">Ready first</option><option value="status-not-ready">Not Ready first</option><option value="attendance-desc">Attendance high-low</option><option value="attendance-asc">Attendance low-high</option><option value="matches-desc">Most matches</option><option value="name">Name A-Z</option></select>
          <button onClick={reset} aria-label="Reset filters" className="h-10 rounded-lg border border-slate-200 px-3 text-sm font-semibold text-slate-600">Reset</button>
        </div>
        {visible.length ? <>
          <div className="overflow-x-auto"><table className="w-full min-w-[880px] text-left text-sm"><thead className="bg-slate-50 text-xs uppercase text-slate-500"><tr><th className="px-5 py-3">Player</th><th className="px-5 py-3">Sport / Coach</th><th className="px-5 py-3">Attendance</th><th className="px-5 py-3">Completed matches</th><th className="px-5 py-3">Status</th><th className="px-5 py-3">Missing condition</th><th className="px-5 py-3">Details</th></tr></thead><tbody className="divide-y divide-slate-100">{visible.map((player) => {
            const missing = [player.attendanceFails && "Attendance below 75%", player.matchesFail && "Fewer than 2 completed matches"].filter(Boolean);
            return <tr key={player.id} className="hover:bg-slate-50/60"><td className="px-5 py-4"><p className="font-semibold text-slate-900">{player.name}</p><p className="text-xs text-slate-500">{player.id}</p></td><td className="px-5 py-4"><p className="text-slate-700">{player.sport}</p><p className="text-xs text-slate-500">{player.coach}</p></td><td className="px-5 py-4"><span className={player.attendanceFails ? "font-semibold text-red-600" : "font-semibold text-slate-800"}>{player.attendance}%</span></td><td className="px-5 py-4"><span className={player.matchesFail ? "font-semibold text-red-600" : "font-semibold text-slate-800"}>{player.matches}</span></td><td className="px-5 py-4"><StatusBadge tone={player.ready ? "green" : "amber"}>{player.ready ? "Ready" : "Not Ready"}</StatusBadge></td><td className="px-5 py-4 text-xs text-slate-600">{missing.length ? missing.join("; ") : <span className="text-emerald-700">None</span>}</td><td className="px-5 py-4"><button aria-label={`View ${player.name} readiness`} onClick={() => setSelected(player)} className="grid h-8 w-8 place-items-center rounded-lg border border-slate-200 text-slate-600"><Eye className="h-4 w-4" /></button></td></tr>;
          })}</tbody></table></div>
          <div className="flex flex-col gap-3 border-t border-slate-100 px-5 py-3 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between"><span>{(page - 1) * pageSize + 1}-{Math.min(page * pageSize, filtered.length)} of {filtered.length}</span><div className="flex items-center gap-2"><button disabled={page === 1} onClick={() => setPage((current) => Math.max(1, current - 1))} aria-label="Previous page" className="grid h-8 w-8 place-items-center rounded-lg border border-slate-200 disabled:opacity-40"><ChevronLeft className="h-4 w-4" /></button><span>Page {page} of {pageCount}</span><button disabled={page === pageCount} onClick={() => setPage((current) => Math.min(pageCount, current + 1))} aria-label="Next page" className="grid h-8 w-8 place-items-center rounded-lg border border-slate-200 disabled:opacity-40"><ChevronRight className="h-4 w-4" /></button></div></div>
        </> : <EmptyState title="No players match these filters" description="Reset or broaden the readiness filters to show demo players." />}
      </Panel>
    </div>}
    {selected && <Modal title={`${selected.name} readiness details`} onClose={() => setSelected(null)}><div className="p-5">
      <div className="grid gap-3 sm:grid-cols-3"><div className="rounded-lg bg-slate-50 p-4"><p className="text-xs text-slate-500">Attendance</p><p className="mt-1 text-xl font-bold text-slate-900">{selected.attendance}%</p><p className="mt-1 text-xs text-slate-500">{isPlayerReady(selected.attendance, selected.matches) || selected.attendance >= 75 ? "Condition met" : "Requires at least 75%"}</p></div><div className="rounded-lg bg-slate-50 p-4"><p className="text-xs text-slate-500">Completed matches</p><p className="mt-1 text-xl font-bold text-slate-900">{selected.matches}</p><p className="mt-1 text-xs text-slate-500">{selected.matches >= 2 ? "Condition met" : "Requires at least 2"}</p></div><div className="rounded-lg bg-slate-50 p-4"><p className="text-xs text-slate-500">Final status</p><div className="mt-2"><StatusBadge tone={isPlayerReady(selected.attendance, selected.matches) ? "green" : "amber"}>{isPlayerReady(selected.attendance, selected.matches) ? "Ready" : "Not Ready"}</StatusBadge></div></div></div>
      <div className="mt-5 rounded-xl border border-blue-100 bg-blue-50 p-4 text-sm text-blue-900"><strong>Calculation:</strong> {selected.attendance >= 75 ? "Attendance condition passes" : "Attendance condition fails"} AND {selected.matches >= 2 ? "completed match condition passes" : "completed match condition fails"}. Therefore, {isPlayerReady(selected.attendance, selected.matches) ? "this player is Ready." : "this player is Not Ready."}</div>
      <div className="mt-5 grid gap-5 lg:grid-cols-2"><div><h3 className="font-semibold text-slate-900">Attendance history</h3><div className="mt-3 divide-y divide-slate-100 rounded-xl border border-slate-200">{selected.attendanceHistory.map((record) => <div key={record.sessionId} className="flex items-center justify-between px-4 py-3 text-sm"><span><strong className="block text-slate-800">{record.sessionId}</strong><span className="text-xs text-slate-500">{record.date}</span></span><StatusBadge tone={record.status === "Present" ? "green" : "amber"}>{record.status}</StatusBadge></div>)}</div></div><div><h3 className="font-semibold text-slate-900">Completed match history</h3><div className="mt-3 divide-y divide-slate-100 rounded-xl border border-slate-200">{selected.matchHistory.map((record) => <div key={record.matchId} className="px-4 py-3 text-sm"><strong className="block text-slate-800">{record.title}</strong><span className="text-xs text-slate-500">{record.matchId} · {record.date}</span></div>)}</div></div></div>
      <div className="mt-5 flex justify-end"><button onClick={() => setSelected(null)} className="h-10 rounded-lg border border-slate-200 px-4 text-sm font-semibold text-slate-700">Close details</button></div>
    </div></Modal>}
  </DashboardShell>;
}
