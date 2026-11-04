"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Search, Trophy } from "lucide-react";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { Panel, StatCard, StatusBadge } from "@/components/dashboard/Dashboard";
import { EmptyState, LoadingState, PageHeader } from "@/components/dashboard/DashboardUI";
import { coachPlayers, isPlayerReady } from "@/components/dashboard/coach/coachPlayersData";

const readyPlayers = coachPlayers.filter(isPlayerReady);
const sports = Array.from(new Set(readyPlayers.map((player) => player.sport)));
const inputClass = "h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-blue-500";

export function ScoutSportsDiscovery() {
  const [loading, setLoading] = useState(true);
  const [sportQuery, setSportQuery] = useState("");
  const [playerQuery, setPlayerQuery] = useState("");
  const [age, setAge] = useState("All ages");
  const [sort, setSort] = useState("name-asc");
  const [selectedSport, setSelectedSport] = useState<string>(sports[0] ?? "");

  useEffect(() => {
    const timer = window.setTimeout(() => setLoading(false), 350);
    return () => window.clearTimeout(timer);
  }, []);

  const averageAttendance = readyPlayers.length
    ? Math.round(readyPlayers.reduce((sum, player) => sum + player.attendance, 0) / readyPlayers.length)
    : 0;

  const sportSummaries = useMemo(() => sports.map((sportName) => {
    const players = readyPlayers.filter((player) => player.sport === sportName);
    return {
      name: sportName,
      players,
      averageAttendance: players.length ? Math.round(players.reduce((sum, player) => sum + player.attendance, 0) / players.length) : 0,
    };
  }), []);

  const largestSport = [...sportSummaries].sort((a, b) => b.players.length - a.players.length || a.name.localeCompare(b.name))[0];
  const filteredSports = sportSummaries.filter((sport) => sport.name.toLowerCase().includes(sportQuery.trim().toLowerCase()));
  const selectedSummary = sportSummaries.find((sport) => sport.name === selectedSport) ?? sportSummaries[0];
  const selectedPlayers = selectedSummary?.players ?? [];
  const completedMatches = selectedPlayers.reduce((sum, player) => sum + player.completedMatches, 0);

  const filteredPlayers = useMemo(() => {
    const normalized = playerQuery.trim().toLowerCase();
    const players = selectedPlayers.filter((player) =>
      (!normalized || player.name.toLowerCase().includes(normalized))
      && (age === "All ages" || (age === "13-14" ? player.age >= 13 && player.age <= 14 : age === "15-16" ? player.age >= 15 && player.age <= 16 : player.age >= 17))
    );
    return [...players].sort((a, b) => {
      if (sort === "attendance-desc") return b.attendance - a.attendance;
      if (sort === "matches-desc") return b.completedMatches - a.completedMatches;
      return a.name.localeCompare(b.name);
    });
  }, [selectedPlayers, playerQuery, age, sort]);

  const selectSport = (sportName: string) => {
    setSelectedSport(sportName);
    setPlayerQuery("");
    setAge("All ages");
    setSort("name-asc");
    document.getElementById("sport-player-directory")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <DashboardShell role="scout" title="Sports discovery" subtitle="Discover Ready players by sport">
      <PageHeader title="Sport-wise Discovery" description="Find Ready players using the academy's available sports data" />
      {loading ? <LoadingState message="Loading sports discovery..." /> : sportSummaries.length === 0 ? (
        <EmptyState title="No sports available" description="No available sports currently have Ready players." />
      ) : (
        <div className="space-y-5">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard label="Total available sports" value={String(sportSummaries.length)} detail="Sports with Ready players" icon="trophy" />
            <StatCard label="Total Ready players" value={String(readyPlayers.length)} detail="Both readiness conditions met" icon="users" tone="green" />
            <StatCard label="Most Ready players" value={largestSport?.name ?? "Unavailable"} detail={largestSport ? `${largestSport.players.length} Ready players` : "No sport data"} icon="trophy" tone="amber" />
            <StatCard label="Average attendance" value={`${averageAttendance}%`} detail="Across all Ready players" icon="clipboard" tone="violet" />
          </div>

          <Panel title="Sports directory">
            <div className="border-b border-slate-100 p-4">
              <label className="relative block max-w-md">
                <span className="sr-only">Search sports</span>
                <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                <input value={sportQuery} onChange={(event) => setSportQuery(event.target.value)} placeholder="Search by sport name" className={`${inputClass} w-full pl-9`} />
              </label>
            </div>
            {filteredSports.length === 0 ? (
              <EmptyState title="No matching sports" description="No available sport matches the current search." />
            ) : (
              <div className="grid gap-4 p-4 md:grid-cols-2 xl:grid-cols-3">
                {filteredSports.map((sport) => (
                  <article key={sport.name} className="rounded-xl border border-slate-200 p-5">
                    <div className="flex items-start justify-between">
                      <span className="grid h-11 w-11 place-items-center rounded-lg bg-blue-50 text-blue-600"><Trophy className="h-5 w-5" /></span>
                      <StatusBadge tone="blue">{sport.players.length} Ready</StatusBadge>
                    </div>
                    <h2 className="mt-4 font-semibold text-slate-900">{sport.name}</h2>
                    <p className="mt-1 text-sm text-slate-500">Sport description unavailable.</p>
                    <div className="mt-4 flex items-center justify-between text-sm">
                      <span className="text-slate-500">Average attendance</span>
                      <strong className="text-slate-800">{sport.averageAttendance}%</strong>
                    </div>
                    <button type="button" onClick={() => selectSport(sport.name)} className="mt-4 h-10 w-full rounded-lg bg-blue-600 text-sm font-semibold text-white hover:bg-blue-700">View players</button>
                  </article>
                ))}
              </div>
            )}
          </Panel>

          {selectedSummary ? (
            <section id="sport-player-directory" className="space-y-5 scroll-mt-24">
              <Panel title={`${selectedSummary.name} details`}>
                <div className="grid gap-4 p-5 sm:grid-cols-3">
                  <div><p className="text-xs text-slate-500">Sport description</p><p className="mt-1 font-semibold text-slate-800">Unavailable</p></div>
                  <div><p className="text-xs text-slate-500">Ready players</p><p className="mt-1 text-2xl font-bold text-slate-900">{selectedSummary.players.length}</p></div>
                  <div><p className="text-xs text-slate-500">Average attendance</p><p className="mt-1 text-2xl font-bold text-slate-900">{selectedSummary.averageAttendance}%</p></div>
                </div>
                <p className="border-t border-slate-100 px-5 py-3 text-sm text-slate-500">{completedMatches} completed matches across Ready players.</p>
              </Panel>

              <Panel title={`${selectedSummary.name} player discovery`}>
                <div className="grid gap-3 border-b border-slate-100 p-4 md:grid-cols-2 xl:grid-cols-[1fr_repeat(3,minmax(150px,auto))]">
                  <label className="relative"><span className="sr-only">Search players</span><Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" /><input value={playerQuery} onChange={(event) => setPlayerQuery(event.target.value)} placeholder="Search by player name" className={`${inputClass} w-full pl-9`} /></label>
                  <select aria-label="Age range filter" value={age} onChange={(event) => setAge(event.target.value)} className={inputClass}><option>All ages</option><option>13-14</option><option>15-16</option><option>17+</option></select>
                  <select aria-label="Sport selection" value={selectedSport} onChange={(event) => setSelectedSport(event.target.value)} className={inputClass}>{sportSummaries.map((sport) => <option key={sport.name}>{sport.name}</option>)}</select>
                  <select aria-label="Sort Ready players" value={sort} onChange={(event) => setSort(event.target.value)} className={inputClass}><option value="name-asc">Player name</option><option value="attendance-desc">Attendance: high to low</option><option value="matches-desc">Completed matches: high to low</option></select>
                </div>
                {filteredPlayers.length === 0 ? (
                  <EmptyState title="No matching players" description="No Ready players match the selected sport and filters." />
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[720px] text-left text-sm">
                      <thead className="bg-slate-50 text-xs uppercase text-slate-500"><tr><th className="px-5 py-3">Player</th><th className="px-5 py-3">Age</th><th className="px-5 py-3">Attendance</th><th className="px-5 py-3">Matches</th><th className="px-5 py-3">Readiness</th><th className="px-5 py-3 text-right">Action</th></tr></thead>
                      <tbody className="divide-y divide-slate-100">
                        {filteredPlayers.map((player) => (
                          <tr key={player.id}>
                            <td className="px-5 py-4"><div className="flex items-center gap-3"><span className="grid h-9 w-9 place-items-center rounded-full bg-blue-100 text-xs font-bold text-blue-700">{player.initials}</span><span><strong className="block text-slate-800">{player.name}</strong><span className="text-xs text-slate-400">{player.id}</span></span></div></td>
                            <td className="px-5 py-4 text-slate-500">{player.age}</td><td className="px-5 py-4 font-semibold text-slate-700">{player.attendance}%</td><td className="px-5 py-4 text-slate-700">{player.completedMatches}</td><td className="px-5 py-4"><StatusBadge>Ready</StatusBadge></td><td className="px-5 py-4 text-right"><Link href={`/scout/players/${player.id}`} className="text-sm font-semibold text-blue-600 hover:text-blue-800">View profile</Link></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </Panel>
            </section>
          ) : null}
        </div>
      )}
    </DashboardShell>
  );
}
