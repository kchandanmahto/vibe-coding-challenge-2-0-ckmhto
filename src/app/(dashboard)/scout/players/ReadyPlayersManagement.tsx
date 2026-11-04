"use client";

import { ChevronLeft, ChevronRight, Download, Search, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { Panel, StatCard, StatusBadge } from "@/components/dashboard/Dashboard";
import { EmptyState, LoadingState, PageHeader } from "@/components/dashboard/DashboardUI";
import { coachPlayers, isPlayerReady, type CoachPlayer } from "@/components/dashboard/coach/coachPlayersData";

const pageSize = 6;
const readyPlayers = coachPlayers.filter(isPlayerReady);
const inputClass = "h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-blue-500";

export function ReadyPlayersManagement() {
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [sport, setSport] = useState("All sports");
  const [age, setAge] = useState("All ages");
  const [sort, setSort] = useState("name-asc");
  const [page, setPage] = useState(1);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [compareIds, setCompareIds] = useState<string[]>([]);
  const [exportPreview, setExportPreview] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => setLoading(false), 350);
    return () => window.clearTimeout(timer);
  }, []);

  const sports = Array.from(new Set(readyPlayers.map((player) => player.sport)));
  const averageAttendance = readyPlayers.length
    ? Math.round(readyPlayers.reduce((sum, player) => sum + player.attendance, 0) / readyPlayers.length)
    : 0;
  const completedMatches = readyPlayers.reduce((sum, player) => sum + player.completedMatches, 0);

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    const matches = readyPlayers.filter((player) =>
      (!normalized || player.name.toLowerCase().includes(normalized))
      && (sport === "All sports" || player.sport === sport)
      && (age === "All ages" || (age === "13-14" ? player.age >= 13 && player.age <= 14 : age === "15-16" ? player.age >= 15 && player.age <= 16 : player.age >= 17))
    );
    return [...matches].sort((a, b) => {
      if (sort === "attendance-desc") return b.attendance - a.attendance;
      if (sort === "matches-desc") return b.completedMatches - a.completedMatches;
      return a.name.localeCompare(b.name);
    });
  }, [query, sport, age, sort]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
  const visible = filtered.slice((page - 1) * pageSize, page * pageSize);
  const selected = selectedId ? readyPlayers.find((player) => player.id === selectedId && isPlayerReady(player)) ?? null : null;
  const compared = compareIds.map((id) => readyPlayers.find((player) => player.id === id && isPlayerReady(player))).filter((player): player is CoachPlayer => Boolean(player));
  const comparisonSport = new Set(compared.map((player) => player.sport)).size === 1 ? compared[0]?.sport : null;

  const toggleComparison = (player: CoachPlayer) => {
    setCompareIds((current) => current.includes(player.id)
      ? current.filter((id) => id !== player.id)
      : [...current, player.id].slice(-3));
  };

  const updateFilter = (setter: (value: string) => void, value: string) => {
    setter(value);
    setPage(1);
  };

  return (
    <DashboardShell role="scout" title="Ready players" subtitle="Verified readiness directory">
      <PageHeader title="Ready Players" description="Scout-facing players who meet both readiness conditions" action={
        <button type="button" onClick={() => setExportPreview((current) => !current)} className="flex h-10 items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 hover:bg-slate-50"><Download className="h-4 w-4" />Export preview</button>
      } />
      {loading ? <LoadingState message="Loading ready players..." /> : (
        <div className="space-y-5">
          {readyPlayers.length === 0 ? (
            <EmptyState title="No ready players" description="No players currently meet the documented readiness criteria." />
          ) : (
            <>
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <StatCard label="Total ready players" value={String(readyPlayers.length)} detail="Both readiness conditions met" icon="users" />
                <StatCard label="Available sports" value={String(sports.length)} detail="Sports represented by ready players" icon="trophy" tone="green" />
                <StatCard label="Average attendance" value={`${averageAttendance}%`} detail="Ready-player attendance average" icon="clipboard" tone="blue" />
                <StatCard label="Total completed matches" value={String(completedMatches)} detail="Across ready players" icon="activity" tone="violet" />
              </div>

              {exportPreview && (
                <Panel title="Preview-only export">
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[620px] text-left text-sm"><thead className="bg-slate-50 text-xs uppercase text-slate-500"><tr><th className="px-5 py-3">Player</th><th className="px-5 py-3">Age</th><th className="px-5 py-3">Sport</th><th className="px-5 py-3">Attendance</th><th className="px-5 py-3">Matches</th></tr></thead><tbody className="divide-y divide-slate-100">{filtered.map((player) => <tr key={player.id}><td className="px-5 py-3 font-medium">{player.name}</td><td className="px-5 py-3">{player.age}</td><td className="px-5 py-3">{player.sport}</td><td className="px-5 py-3">{player.attendance}%</td><td className="px-5 py-3">{player.completedMatches}</td></tr>)}</tbody></table>
                  </div>
                  <p className="border-t border-slate-100 px-5 py-3 text-xs text-slate-500">Preview only. This interface does not generate or download a file.</p>
                </Panel>
              )}

              <Panel title="Ready player directory" id="ready-players">
                <div className="grid gap-3 border-b border-slate-100 p-4 md:grid-cols-2 xl:grid-cols-[1fr_repeat(3,minmax(150px,auto))]">
                  <label className="relative"><span className="sr-only">Search ready players</span><Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" /><input value={query} onChange={(event) => updateFilter(setQuery, event.target.value)} placeholder="Search by player name" className={`${inputClass} w-full pl-9`} /></label>
                  <select aria-label="Sport filter" value={sport} onChange={(event) => updateFilter(setSport, event.target.value)} className={inputClass}><option>All sports</option>{sports.map((item) => <option key={item}>{item}</option>)}</select>
                  <select aria-label="Age range filter" value={age} onChange={(event) => updateFilter(setAge, event.target.value)} className={inputClass}><option>All ages</option><option>13-14</option><option>15-16</option><option>17+</option></select>
                  <select aria-label="Sort ready players" value={sort} onChange={(event) => updateFilter(setSort, event.target.value)} className={inputClass}><option value="name-asc">Player name</option><option value="attendance-desc">Attendance: high to low</option><option value="matches-desc">Completed matches: high to low</option></select>
                </div>
                {sports.length === 0 ? <EmptyState title="No sports available" description="No sports currently have ready players." /> : filtered.length === 0 ? <EmptyState title="No matching players" description="No ready players match the selected filters." /> : (
                  <>
                    <div className="overflow-x-auto">
                      <table className="w-full min-w-[760px] text-left text-sm">
                        <thead className="bg-slate-50 text-xs uppercase text-slate-500"><tr><th className="px-5 py-3 font-medium">Player</th><th className="px-5 py-3 font-medium">Age</th><th className="px-5 py-3 font-medium">Sport</th><th className="px-5 py-3 font-medium">Attendance</th><th className="px-5 py-3 font-medium">Matches</th><th className="px-5 py-3 font-medium">Readiness</th><th className="px-5 py-3 font-medium text-right">Actions</th></tr></thead>
                        <tbody className="divide-y divide-slate-100">
                          {visible.map((player) => (
                            <tr key={player.id}>
                              <td className="px-5 py-4"><div className="flex items-center gap-3"><span className="grid h-9 w-9 place-items-center rounded-full bg-blue-100 text-xs font-bold text-blue-700">{player.initials}</span><span><strong className="block text-slate-800">{player.name}</strong><span className="text-xs text-slate-400">{player.id}</span></span></div></td>
                              <td className="px-5 py-4 text-slate-500">{player.age}</td><td className="px-5 py-4 text-slate-500">{player.sport}</td><td className="px-5 py-4 font-semibold text-slate-700">{player.attendance}%</td><td className="px-5 py-4 text-slate-700">{player.completedMatches}</td><td className="px-5 py-4"><StatusBadge>Ready</StatusBadge></td>
                              <td className="px-5 py-4"><div className="flex justify-end gap-3"><label className="flex items-center gap-1 text-xs text-slate-500"><input type="checkbox" checked={compareIds.includes(player.id)} onChange={() => toggleComparison(player)} />Compare</label><Link href={`/scout/players/${player.id}`} className="text-sm font-semibold text-blue-600 hover:text-blue-800">View profile</Link></div></td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <div className="flex items-center justify-between border-t border-slate-100 px-4 py-3 text-sm"><span className="text-slate-500">{filtered.length} ready players</span><div className="flex items-center gap-2"><button type="button" aria-label="Previous page" disabled={page === 1} onClick={() => setPage((value) => value - 1)} className="grid h-8 w-8 place-items-center rounded border border-slate-200 disabled:opacity-40"><ChevronLeft className="h-4 w-4" /></button><span>{page} / {pageCount}</span><button type="button" aria-label="Next page" disabled={page === pageCount} onClick={() => setPage((value) => value + 1)} className="grid h-8 w-8 place-items-center rounded border border-slate-200 disabled:opacity-40"><ChevronRight className="h-4 w-4" /></button></div></div>
                  </>
                )}
              </Panel>

              <Panel title="Player comparison">
                {compared.length === 0 ? <EmptyState title="No comparison selection" description="Select ready players from the directory to compare permitted performance fields." /> : (
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[600px] text-left text-sm"><thead className="bg-slate-50 text-xs uppercase text-slate-500"><tr><th className="px-5 py-3">Player</th><th className="px-5 py-3">Sport</th><th className="px-5 py-3">Attendance</th><th className="px-5 py-3">Completed matches</th><th className="px-5 py-3">Available scores</th></tr></thead><tbody className="divide-y divide-slate-100">{compared.map((player) => <tr key={player.id}><td className="px-5 py-4 font-medium">{player.name}</td><td className="px-5 py-4">{player.sport}</td><td className="px-5 py-4">{player.attendance}%</td><td className="px-5 py-4">{player.completedMatches}</td><td className="px-5 py-4">{comparisonSport ? player.matchHistory.map((match) => match.score).join(", ") : "Unavailable: players use different sports"}</td></tr>)}</tbody></table>
                  </div>
                )}
              </Panel>
            </>
          )}
        </div>
      )}

      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 p-4">
          <div role="dialog" aria-modal="true" className="w-full max-w-lg rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4"><div><p className="text-xs text-slate-500">Ready player profile</p><h2 className="font-semibold text-slate-900">{selected.name}</h2></div><button type="button" aria-label="Close profile" onClick={() => setSelectedId(null)} className="text-slate-400"><X className="h-5 w-5" /></button></div>
            <div className="grid gap-4 p-5 sm:grid-cols-2">
              <div className="sm:col-span-2 flex items-center gap-4 rounded-xl bg-slate-50 p-4"><span className="grid h-14 w-14 place-items-center rounded-full bg-blue-100 text-lg font-bold text-blue-700">{selected.initials}</span><div><p className="font-semibold text-slate-900">{selected.name}</p><StatusBadge>Ready</StatusBadge></div></div>
              {[["Age", String(selected.age)], ["Sport", selected.sport], ["Attendance", `${selected.attendance}%`], ["Completed matches", String(selected.completedMatches)], ["Available match scores", selected.matchHistory.length ? selected.matchHistory.map((match) => match.score).join(", ") : "No score data"]].map(([label, value]) => <div key={label} className={label === "Available match scores" ? "sm:col-span-2" : ""}><p className="text-xs text-slate-500">{label}</p><p className="mt-1 font-semibold text-slate-800">{value}</p></div>)}
            </div>
          </div>
        </div>
      )}
    </DashboardShell>
  );
}
