"use client";

import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Search, X } from "lucide-react";
import { DashboardShell } from "../DashboardShell";
import { EmptyState, LoadingState, PageHeader } from "../DashboardUI";
import { Panel, StatCard, StatusBadge } from "../Dashboard";
import { coachPlayers, isPlayerReady, type CoachPlayer } from "./coachPlayersData";

const pageSize = 5;

function Modal({ player, onClose }: { player: CoachPlayer | null; onClose: () => void }) {
  if (!player) return null;
  const ready = isPlayerReady(player);
  const conditions = [
    { label: "Attendance >= 75%", met: player.attendance >= 75, detail: `${player.attendance}% attendance` },
    { label: "At least 2 completed matches", met: player.completedMatches >= 2, detail: `${player.completedMatches} completed matches` },
  ];
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 p-3 sm:p-6" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <div role="dialog" aria-modal="true" className="max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-100 bg-white px-5 py-4">
          <div><p className="text-xs text-slate-500">{player.id} · Performance profile</p><h2 className="text-lg font-semibold text-slate-900">{player.name}</h2></div>
          <button type="button" onClick={onClose} aria-label="Close performance details" className="grid h-9 w-9 place-items-center rounded-lg text-slate-500 hover:bg-slate-100"><X className="h-5 w-5" /></button>
        </div>
        <div className="grid gap-4 p-5 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-lg bg-slate-50 p-4"><p className="text-xs text-slate-500">Sport</p><p className="mt-1 font-semibold">{player.sport}</p></div>
          <div className="rounded-lg bg-blue-50 p-4"><p className="text-xs text-slate-500">Attendance</p><p className="mt-1 text-xl font-bold text-blue-700">{player.attendance}%</p></div>
          <div className="rounded-lg bg-emerald-50 p-4"><p className="text-xs text-slate-500">Completed matches</p><p className="mt-1 text-xl font-bold text-emerald-700">{player.completedMatches}</p></div>
          <div className="rounded-lg bg-slate-50 p-4"><p className="text-xs text-slate-500">Readiness</p><p className={`mt-1 font-semibold ${ready ? "text-emerald-700" : "text-amber-700"}`}>{ready ? "Ready" : "Not ready"}</p></div>
          <div className="rounded-xl border border-slate-200 p-4 sm:col-span-2"><h3 className="font-semibold">Session records</h3><div className="mt-3 grid grid-cols-3 gap-2 text-sm"><div className="rounded-lg bg-slate-50 p-3"><p className="text-xs text-slate-500">Held</p><p className="mt-1 text-lg font-bold">{player.presentSessions + player.absentSessions}</p></div><div className="rounded-lg bg-slate-50 p-3"><p className="text-xs text-slate-500">Present</p><p className="mt-1 text-lg font-bold">{player.presentSessions}</p></div><div className="rounded-lg bg-slate-50 p-3"><p className="text-xs text-slate-500">Absent</p><p className="mt-1 text-lg font-bold">{player.absentSessions}</p></div></div></div>
          <div className="rounded-xl border border-slate-200 p-4 sm:col-span-2"><h3 className="font-semibold">Readiness criteria</h3><div className="mt-3 space-y-2">{conditions.map((condition) => <div key={condition.label} className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2 text-sm"><span><span className="block font-medium">{condition.label}</span><span className="text-xs text-slate-500">{condition.detail}</span></span><StatusBadge tone={condition.met ? "green" : "amber"}>{condition.met ? "Met" : "Not met"}</StatusBadge></div>)}</div></div>
          <div className="rounded-xl border border-slate-200 p-4 sm:col-span-4"><h3 className="font-semibold">Available match scores</h3>{player.matchHistory.length ? <div className="mt-3 overflow-x-auto"><table className="w-full min-w-[480px] text-left text-sm"><thead className="text-xs uppercase text-slate-500"><tr><th className="py-2">Match</th><th className="py-2">Date</th><th className="py-2 text-right">Score</th></tr></thead><tbody className="divide-y divide-slate-100">{player.matchHistory.map((match) => <tr key={`${match.title}-${match.date}`}><td className="py-2.5">{match.title}</td><td className="py-2.5 text-slate-500">{match.date}</td><td className="py-2.5 text-right font-semibold">{match.score}</td></tr>)}</tbody></table></div> : <p className="mt-3 text-sm text-slate-500">No score information available.</p>}</div>
        </div>
      </div>
    </div>
  );
}

export function CoachPerformanceManagement() {
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [sport, setSport] = useState("All sports");
  const [readiness, setReadiness] = useState("All readiness");
  const [sort, setSort] = useState("name-asc");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<CoachPlayer | null>(null);
  const [compareIds, setCompareIds] = useState<string[]>([]);

  useEffect(() => {
    const timer = window.setTimeout(() => setLoading(false), 350);
    return () => window.clearTimeout(timer);
  }, []);

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return coachPlayers.filter((player) =>
      (!normalized || player.name.toLowerCase().includes(normalized) || player.id.toLowerCase().includes(normalized))
      && (sport === "All sports" || player.sport === sport)
      && (readiness === "All readiness" || (isPlayerReady(player) ? "Ready" : "Not ready") === readiness)
    ).sort((a, b) => {
      if (sort === "attendance-desc") return b.attendance - a.attendance;
      if (sort === "matches-desc") return b.completedMatches - a.completedMatches;
      return a.name.localeCompare(b.name);
    });
  }, [query, sport, readiness, sort]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
  const visible = filtered.slice((page - 1) * pageSize, page * pageSize);
  const averageAttendance = coachPlayers.length ? Math.round(coachPlayers.reduce((sum, player) => sum + player.attendance, 0) / coachPlayers.length) : 0;
  const completedMatches = coachPlayers.reduce((sum, player) => sum + player.completedMatches, 0);
  const readyPlayers = coachPlayers.filter(isPlayerReady).length;
  const comparableComparison = compareIds
    .map((id) => coachPlayers.find((player) => player.id === id))
    .filter((player): player is CoachPlayer => Boolean(player));

  const toggleComparison = (player: CoachPlayer) => {
    setCompareIds((current) => current.includes(player.id) ? current.filter((id) => id !== player.id) : [...current, player.id].slice(-3));
  };

  const comparisonSports = new Set(comparableComparison.map((player) => player.sport));
  const comparableScores = comparisonSports.size === 1 && comparableComparison.every((player) => player.matchHistory.length > 0);

  return (
    <DashboardShell role="coach" title="Performance" subtitle="Mock player performance analytics">
      <PageHeader title="Performance Analytics" description="Attendance, match participation, scores and readiness for assigned players" />
      {loading ? <LoadingState message="Loading performance data..." /> : (
        <div className="space-y-5">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard label="Assigned players" value={String(coachPlayers.length)} detail="Football and Athletics scope" icon="users" tone="blue" />
            <StatCard label="Average attendance" value={`${averageAttendance}%`} detail="Calculated from player mock data" icon="clipboard" tone="green" />
            <StatCard label="Completed matches" value={String(completedMatches)} detail="Total player match participation" icon="trophy" tone="violet" />
            <StatCard label="Players meeting readiness" value={String(readyPlayers)} detail="Both readiness conditions met" icon="activity" tone="amber" />
          </div>

          <div className="grid gap-5 xl:grid-cols-2">
            <Panel title="Attendance distribution">
              <div className="space-y-3 p-5">
                {(["Below 75%", "75% and above"] as const).map((label) => {
                  const count = coachPlayers.filter((player) => label === "Below 75%" ? player.attendance < 75 : player.attendance >= 75).length;
                  const width = Math.round((count / coachPlayers.length) * 100);
                  return <div key={label}><div className="mb-1 flex justify-between text-sm"><span>{label}</span><strong>{count}</strong></div><div className="h-4 rounded-full bg-slate-100"><div className="h-4 rounded-full bg-blue-600" style={{ width: `${width}%` }} /></div></div>;
                })}
              </div>
            </Panel>
            <Panel title="Player attendance comparison">
              <div className="space-y-3 p-5">{coachPlayers.map((player) => <div key={player.id}><div className="mb-1 flex justify-between text-sm"><span>{player.name}</span><strong>{player.attendance}%</strong></div><div className="h-3 rounded-full bg-slate-100"><div className="h-3 rounded-full bg-emerald-500" style={{ width: `${player.attendance}%` }} /></div></div>)}</div>
            </Panel>
          </div>

          <Panel title="Player performance">
            <div className="grid gap-3 border-b border-slate-100 p-4 md:grid-cols-[minmax(220px,1fr)_150px_170px_180px]">
              <label className="relative"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" /><span className="sr-only">Search players</span><input value={query} onChange={(event) => { setQuery(event.target.value); setPage(1); }} placeholder="Search player name or ID..." className="h-10 w-full rounded-lg border border-slate-200 pl-9 pr-3 text-sm" /></label>
              <select aria-label="Filter by sport" value={sport} onChange={(event) => { setSport(event.target.value); setPage(1); }} className="h-10 rounded-lg border border-slate-200 px-3 text-sm"><option>All sports</option><option>Football</option><option>Athletics</option></select>
              <select aria-label="Filter by readiness" value={readiness} onChange={(event) => { setReadiness(event.target.value); setPage(1); }} className="h-10 rounded-lg border border-slate-200 px-3 text-sm"><option>All readiness</option><option>Ready</option><option>Not ready</option></select>
              <select aria-label="Sort players" value={sort} onChange={(event) => setSort(event.target.value)} className="h-10 rounded-lg border border-slate-200 px-3 text-sm"><option value="name-asc">Name A-Z</option><option value="attendance-desc">Attendance high-low</option><option value="matches-desc">Completed matches high-low</option></select>
            </div>
            {visible.length ? (
              <>
                <div className="overflow-x-auto"><table className="w-full min-w-[900px] text-left text-sm"><thead className="bg-slate-50 text-xs uppercase text-slate-500"><tr><th className="px-5 py-3">Player</th><th className="px-5 py-3">Sport</th><th className="px-5 py-3">Attendance</th><th className="px-5 py-3">Completed matches</th><th className="px-5 py-3">Available scores</th><th className="px-5 py-3">Readiness</th><th className="px-5 py-3">Actions</th></tr></thead><tbody className="divide-y divide-slate-100">{visible.map((player) => {
                  const ready = isPlayerReady(player);
                  return <tr key={player.id}><td className="px-5 py-4"><p className="font-semibold text-slate-900">{player.name}</p><p className="text-xs text-slate-500">{player.id}</p></td><td className="px-5 py-4">{player.sport}</td><td className="px-5 py-4">{player.attendance}%</td><td className="px-5 py-4">{player.completedMatches}</td><td className="px-5 py-4">{player.matchHistory.length ? `${player.matchHistory.length} records` : "Not available"}</td><td className="px-5 py-4"><StatusBadge tone={ready ? "green" : "amber"}>{ready ? "Ready" : "Not ready"}</StatusBadge></td><td className="px-5 py-4"><div className="flex gap-3"><button type="button" onClick={() => setSelected(player)} className="font-semibold text-blue-600">View details</button><button type="button" onClick={() => toggleComparison(player)} className={`font-semibold ${compareIds.includes(player.id) ? "text-red-600" : "text-slate-600"}`}>{compareIds.includes(player.id) ? "Remove" : "Compare"}</button></div></td></tr>;
                })}</tbody></table></div>
                <div className="flex items-center justify-between border-t border-slate-100 px-5 py-4 text-sm"><span className="text-slate-500">{filtered.length} players · Page {page} of {pageCount}</span><div className="flex gap-2"><button type="button" disabled={page === 1} onClick={() => setPage((current) => current - 1)} className="grid h-9 w-9 place-items-center rounded-lg border border-slate-200 disabled:opacity-40"><ChevronLeft className="h-4 w-4" /></button><button type="button" disabled={page === pageCount} onClick={() => setPage((current) => current + 1)} className="grid h-9 w-9 place-items-center rounded-lg border border-slate-200 disabled:opacity-40"><ChevronRight className="h-4 w-4" /></button></div></div>
              </>
            ) : <EmptyState title="No players found" description="No assigned players match the selected filters." />}
          </Panel>

          <Panel title="Player comparison">
            {comparableComparison.length === 0 ? <EmptyState title="No players selected" description="Use Compare on player rows to add up to three assigned players." /> : (
              <div className="space-y-4 p-5">
                <div className="grid gap-3 md:grid-cols-3">{comparableComparison.map((player) => <div key={player.id} className="rounded-xl border border-slate-200 p-4"><p className="font-semibold">{player.name}</p><p className="mt-1 text-sm text-slate-500">{player.sport}</p><div className="mt-3 grid grid-cols-2 gap-2 text-sm"><div className="rounded-lg bg-slate-50 p-3"><p className="text-xs text-slate-500">Attendance</p><strong>{player.attendance}%</strong></div><div className="rounded-lg bg-slate-50 p-3"><p className="text-xs text-slate-500">Matches</p><strong>{player.completedMatches}</strong></div></div></div>)}</div>
                <div className="rounded-lg bg-blue-50 p-4 text-sm text-blue-800">{comparableScores ? `Score records are comparable because all selected players use the same ${comparableComparison[0].sport} mock format. Available records are shown in each player detail view.` : "Score comparison unavailable: select players from the same sport and with available score records. Scores across different sports are not compared."}</div>
              </div>
            )}
          </Panel>
        </div>
      )}
      <Modal player={selected} onClose={() => setSelected(null)} />
    </DashboardShell>
  );
}
