"use client";

import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Eye, Search, X } from "lucide-react";
import { DashboardShell } from "../DashboardShell";
import { EmptyState, LoadingState, PageHeader } from "../DashboardUI";
import { Panel, StatCard, StatusBadge } from "../Dashboard";
import { coachPlayers, isPlayerReady, type CoachPlayer } from "./coachPlayersData";

const pageSize = 5;

function ProfileModal({ player, onClose }: { player: CoachPlayer; onClose: () => void }) {
  const ready = isPlayerReady(player);
  const averageScore = player.matchHistory.length
    ? Math.round(player.matchHistory.reduce((sum, match) => sum + match.score, 0) / player.matchHistory.length)
    : 0;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 p-3 sm:p-6" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <div role="dialog" aria-modal="true" aria-labelledby="player-profile-title" className="max-h-[92vh] w-full max-w-4xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-100 bg-white px-5 py-4">
          <div><p className="text-xs text-slate-500">{player.id} · Mock player profile</p><h2 id="player-profile-title" className="text-lg font-semibold text-slate-900">{player.name}</h2></div>
          <button type="button" onClick={onClose} aria-label="Close player profile" className="grid h-9 w-9 place-items-center rounded-lg text-slate-500 hover:bg-slate-100"><X className="h-5 w-5" /></button>
        </div>
        <div className="grid gap-5 p-5 lg:grid-cols-[240px_1fr]">
          <aside className="rounded-xl bg-slate-50 p-5 text-center">
            <span className="mx-auto grid h-24 w-24 place-items-center rounded-full bg-blue-100 text-2xl font-bold text-blue-700">{player.initials}</span>
            <p className="mt-4 font-semibold text-slate-900">{player.name}</p><p className="mt-1 text-sm text-slate-500">{player.sport} player</p>
            <div className="mt-4 flex justify-center gap-2"><StatusBadge tone={ready ? "green" : "amber"}>{ready ? "Ready" : "Not ready"}</StatusBadge><StatusBadge tone={player.status === "Active" ? "blue" : "slate"}>{player.status}</StatusBadge></div>
          </aside>
          <div className="grid gap-4 sm:grid-cols-2">
            <section className="rounded-xl border border-slate-200 p-4"><h3 className="font-semibold text-slate-900">Personal information</h3><dl className="mt-3 space-y-2 text-sm"><div><dt className="text-xs text-slate-500">Age / Gender</dt><dd>{player.age} years · {player.gender}</dd></div><div><dt className="text-xs text-slate-500">Phone</dt><dd>{player.phone}</dd></div><div><dt className="text-xs text-slate-500">Email</dt><dd>{player.email}</dd></div><div><dt className="text-xs text-slate-500">Address</dt><dd>{player.address}</dd></div></dl></section>
            <section className="rounded-xl border border-slate-200 p-4"><h3 className="font-semibold text-slate-900">Sport information</h3><dl className="mt-3 space-y-3 text-sm"><div><dt className="text-xs text-slate-500">Assigned sport</dt><dd>{player.sport}</dd></div><div><dt className="text-xs text-slate-500">Assigned coach</dt><dd>Raj Kumar</dd></div><div><dt className="text-xs text-slate-500">Player status</dt><dd>{player.status}</dd></div></dl></section>
            <section className="rounded-xl border border-slate-200 p-4 sm:col-span-2"><h3 className="font-semibold text-slate-900">Attendance</h3><div className="mt-3 grid grid-cols-3 gap-3"><div className="rounded-lg bg-blue-50 p-3"><p className="text-xs text-slate-500">Overall</p><p className="mt-1 text-xl font-bold text-blue-700">{player.attendance}%</p></div><div className="rounded-lg bg-emerald-50 p-3"><p className="text-xs text-slate-500">Present</p><p className="mt-1 text-xl font-bold text-emerald-700">{player.presentSessions}</p></div><div className="rounded-lg bg-amber-50 p-3"><p className="text-xs text-slate-500">Absent</p><p className="mt-1 text-xl font-bold text-amber-700">{player.absentSessions}</p></div></div><div className="mt-4 space-y-2">{player.attendanceHistory.map((record) => <div key={`${record.date}-${record.status}`} className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2 text-sm"><span>{record.date}</span><StatusBadge tone={record.status === "Present" ? "green" : "amber"}>{record.status}</StatusBadge></div>)}</div></section>
            <section className="rounded-xl border border-slate-200 p-4 sm:col-span-2"><div className="flex items-center justify-between"><h3 className="font-semibold text-slate-900">Match history</h3><span className="text-xs text-slate-500">Average recorded score: {averageScore}</span></div><div className="mt-3 overflow-x-auto"><table className="w-full min-w-[460px] text-left text-sm"><thead className="text-xs uppercase text-slate-500"><tr><th className="py-2">Match</th><th className="py-2">Date</th><th className="py-2 text-right">Score</th></tr></thead><tbody className="divide-y divide-slate-100">{player.matchHistory.map((match) => <tr key={`${match.title}-${match.date}`}><td className="py-2.5 font-medium">{match.title}</td><td className="py-2.5 text-slate-500">{match.date}</td><td className="py-2.5 text-right font-semibold">{match.score}</td></tr>)}</tbody></table></div></section>
            <section className="rounded-xl border border-slate-200 p-4 sm:col-span-2"><h3 className="font-semibold text-slate-900">Readiness calculation</h3><div className="mt-3 grid gap-3 sm:grid-cols-3"><div className="rounded-lg bg-slate-50 p-3 text-sm"><p className="text-xs text-slate-500">Attendance eligibility</p><p className={`mt-1 font-semibold ${player.attendance >= 75 ? "text-emerald-700" : "text-amber-700"}`}>{player.attendance >= 75 ? "Met" : "Not met"} · {player.attendance}%</p></div><div className="rounded-lg bg-slate-50 p-3 text-sm"><p className="text-xs text-slate-500">Completed match eligibility</p><p className={`mt-1 font-semibold ${player.completedMatches >= 2 ? "text-emerald-700" : "text-amber-700"}`}>{player.completedMatches >= 2 ? "Met" : "Not met"} · {player.completedMatches} matches</p></div><div className="rounded-lg bg-slate-50 p-3 text-sm"><p className="text-xs text-slate-500">Overall status</p><p className={`mt-1 font-semibold ${ready ? "text-emerald-700" : "text-amber-700"}`}>{ready ? "Ready" : "Not ready"}</p></div></div></section>
          </div>
        </div>
      </div>
    </div>
  );
}

export function CoachPlayersManagement() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [query, setQuery] = useState("");
  const [sport, setSport] = useState("All sports");
  const [readiness, setReadiness] = useState("All readiness");
  const [status, setStatus] = useState("All statuses");
  const [attendanceRange, setAttendanceRange] = useState("All attendance");
  const [sort, setSort] = useState("Name A-Z");
  const [page, setPage] = useState(1);
  const [selectedPlayer, setSelectedPlayer] = useState<CoachPlayer | null>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => setLoading(false), 350);
    return () => window.clearTimeout(timer);
  }, []);

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    const result = coachPlayers.filter((player) => {
      const readinessLabel = isPlayerReady(player) ? "Ready" : "Not ready";
      const matchesSearch = !normalized || player.name.toLowerCase().includes(normalized) || player.id.toLowerCase().includes(normalized);
      const matchesSport = sport === "All sports" || player.sport === sport;
      const matchesReadiness = readiness === "All readiness" || readinessLabel === readiness;
      const matchesStatus = status === "All statuses" || player.status === status;
      const matchesAttendance =
        attendanceRange === "All attendance" ||
        (attendanceRange === "Below 75%" && player.attendance < 75) ||
        (attendanceRange === "75% to 84%" && player.attendance >= 75 && player.attendance < 85) ||
        (attendanceRange === "85% and above" && player.attendance >= 85);
      return matchesSearch && matchesSport && matchesReadiness && matchesStatus && matchesAttendance;
    });
    return [...result].sort((a, b) => sort === "Attendance high-low" ? b.attendance - a.attendance : a.name.localeCompare(b.name));
  }, [attendanceRange, query, readiness, sort, sport, status]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, pageCount);
  const visible = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  const readyCount = coachPlayers.filter(isPlayerReady).length;
  const averageAttendance = Math.round(coachPlayers.reduce((sum, player) => sum + player.attendance, 0) / coachPlayers.length);

  if (error) return <DashboardShell role="coach" title="My players" subtitle="Assigned-player mock workspace"><div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-6"><h2 className="font-semibold text-red-800">Player data could not load</h2><p className="mt-1 text-sm text-red-700">The demo player workspace failed to load.</p><button type="button" onClick={() => setError(false)} className="mt-4 rounded-lg border border-red-200 bg-white px-4 py-2 text-sm font-semibold text-red-700">Retry</button></div></DashboardShell>;

  return (
    <DashboardShell role="coach" title="My players" subtitle="Mock data for players in your assigned sports">
      <PageHeader title="Players Management" description="View assigned player profiles, attendance, match records and readiness" />
      {loading ? <LoadingState message="Loading assigned players..." /> : (
        <div className="space-y-5">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
            <StatCard label="Total assigned players" value={String(coachPlayers.length)} detail="Demo assigned players" icon="users" tone="blue" />
            <StatCard label="Active players" value={String(coachPlayers.filter((player) => player.status === "Active").length)} detail="Active demo accounts" icon="user" tone="green" />
            <StatCard label="Ready players" value={String(readyCount)} detail="Attendance + matches met" icon="activity" tone="green" />
            <StatCard label="Not ready players" value={String(coachPlayers.length - readyCount)} detail="One or both rules unmet" icon="activity" tone="amber" />
            <StatCard label="Average attendance" value={`${averageAttendance}%`} detail="Mock attendance average" icon="clipboard" tone="violet" />
          </div>
          <Panel title="Assigned players">
            <div className="grid gap-3 border-b border-slate-100 p-4 lg:grid-cols-[minmax(240px,1fr)_repeat(5,minmax(150px,auto))]">
              <label className="relative"><Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" /><span className="sr-only">Search players</span><input type="search" value={query} onChange={(event) => { setQuery(event.target.value); setPage(1); }} placeholder="Search name or player ID" className="h-10 w-full rounded-lg border border-slate-200 pl-9 pr-3 text-sm outline-none focus:border-blue-500" /></label>
              {[["Sport", sport, ["All sports", "Football", "Athletics"], setSport], ["Readiness", readiness, ["All readiness", "Ready", "Not ready"], setReadiness], ["Status", status, ["All statuses", "Active", "Inactive"], setStatus], ["Attendance", attendanceRange, ["All attendance", "Below 75%", "75% to 84%", "85% and above"], setAttendanceRange], ["Sort", sort, ["Name A-Z", "Attendance high-low"], setSort]].map(([label, value, options, setter]) => <label key={String(label)}><span className="sr-only">{String(label)}</span><select aria-label={String(label)} value={String(value)} onChange={(event) => { (setter as (value: string) => void)(event.target.value); setPage(1); }} className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700">{(options as string[]).map((option) => <option key={option}>{option}</option>)}</select></label>)}
            </div>
            {visible.length ? (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[1050px] text-left text-sm">
                  <thead className="bg-slate-50 text-xs uppercase text-slate-500"><tr><th className="px-5 py-3">Player</th><th className="px-5 py-3">Age / Gender</th><th className="px-5 py-3">Sport</th><th className="px-5 py-3">Contact</th><th className="px-5 py-3">Attendance</th><th className="px-5 py-3">Matches</th><th className="px-5 py-3">Readiness</th><th className="px-5 py-3">Status</th><th className="px-5 py-3">Actions</th></tr></thead>
                  <tbody className="divide-y divide-slate-100">{visible.map((player) => {
                    const ready = isPlayerReady(player);
                    return <tr key={player.id}><td className="px-5 py-3.5"><div className="flex items-center gap-3"><span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-blue-50 text-xs font-bold text-blue-700">{player.initials}</span><div><p className="font-semibold text-slate-800">{player.name}</p><p className="text-xs text-slate-500">{player.id}</p></div></div></td><td className="px-5 py-3.5">{player.age} / {player.gender}</td><td className="px-5 py-3.5">{player.sport}</td><td className="px-5 py-3.5"><p>{player.phone}</p><p className="text-xs text-slate-500">{player.email}</p></td><td className="px-5 py-3.5 font-semibold">{player.attendance}%</td><td className="px-5 py-3.5">{player.completedMatches}</td><td className="px-5 py-3.5"><StatusBadge tone={ready ? "green" : "amber"}>{ready ? "Ready" : "Not ready"}</StatusBadge></td><td className="px-5 py-3.5"><StatusBadge tone={player.status === "Active" ? "blue" : "slate"}>{player.status}</StatusBadge></td><td className="px-5 py-3.5"><button type="button" onClick={() => setSelectedPlayer(player)} className="inline-flex items-center gap-1 font-semibold text-blue-600"><Eye className="h-4 w-4" /> View profile</button></td></tr>;
                  })}</tbody>
                </table>
              </div>
            ) : <EmptyState title="No assigned players found" description="Try changing the search or filters." />}
            {filtered.length > 0 && <div className="flex flex-col items-center justify-between gap-3 border-t border-slate-100 px-5 py-4 sm:flex-row"><p className="text-xs text-slate-500">{filtered.length} mock players · Page {currentPage} of {pageCount}</p><div className="flex gap-2"><button type="button" disabled={currentPage === 1} onClick={() => setPage((value) => Math.max(1, value - 1))} className="grid h-9 w-9 place-items-center rounded-lg border border-slate-200 disabled:opacity-40" aria-label="Previous page"><ChevronLeft className="h-4 w-4" /></button><button type="button" disabled={currentPage === pageCount} onClick={() => setPage((value) => Math.min(pageCount, value + 1))} className="grid h-9 w-9 place-items-center rounded-lg border border-slate-200 disabled:opacity-40" aria-label="Next page"><ChevronRight className="h-4 w-4" /></button></div></div>}
          </Panel>
          {selectedPlayer && <ProfileModal player={selectedPlayer} onClose={() => setSelectedPlayer(null)} />}
        </div>
      )}
    </DashboardShell>
  );
}
