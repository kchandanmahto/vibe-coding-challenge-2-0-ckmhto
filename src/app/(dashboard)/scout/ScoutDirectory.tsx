"use client";

import { useEffect, useMemo, useState } from "react";
import { Panel, StatusBadge } from "@/components/dashboard/Dashboard";
import { EmptyState, LoadingState, SearchAndFilter } from "@/components/dashboard/DashboardUI";
import { coachPlayers, isPlayerReady } from "@/components/dashboard/coach/coachPlayersData";

const readyPlayers = coachPlayers.filter(isPlayerReady);

export function ScoutDirectory() {
  const [query, setQuery] = useState("");
  const [sport, setSport] = useState("All sports");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = window.setTimeout(() => setLoading(false), 350);
    return () => window.clearTimeout(timer);
  }, []);

  const filtered = useMemo(() => readyPlayers.filter((player) =>
    (sport === "All sports" || player.sport === sport)
    && player.name.toLowerCase().includes(query.trim().toLowerCase()),
  ), [query, sport]);
  const selected = readyPlayers.find((player) => player.id === selectedId) ?? null;
  const sports = Array.from(new Set(readyPlayers.map((player) => player.sport)));

  if (loading) return <LoadingState message="Loading ready players..." />;

  return (
    <div className="grid gap-5 xl:grid-cols-[1fr_300px]" id="ready-players">
      <Panel title="Ready player directory">
        <SearchAndFilter
          query={query}
          onQueryChange={setQuery}
          queryPlaceholder="Search ready players..."
          filterValue={sport}
          onFilterChange={setSport}
          filterLabel="Filter by sport"
          filterOptions={["All sports", ...sports]}
        />
        {readyPlayers.length === 0 ? (
          <EmptyState title="No ready players" description="No players currently meet both readiness criteria." />
        ) : filtered.length ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[620px] text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase text-slate-500"><tr><th className="px-5 py-3 font-medium">Player</th><th className="px-5 py-3 font-medium">Age</th><th className="px-5 py-3 font-medium">Sport</th><th className="px-5 py-3 font-medium">Attendance</th><th className="px-5 py-3 font-medium">Matches</th><th className="px-5 py-3 font-medium">Readiness</th><th className="px-5 py-3 font-medium text-right">Action</th></tr></thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((player) => (
                  <tr key={player.id} className={selected?.id === player.id ? "bg-blue-50/60" : "hover:bg-slate-50"}>
                    <td className="px-5 py-4"><div className="flex items-center gap-3"><span className="grid h-9 w-9 place-items-center rounded-full bg-slate-100 text-xs font-bold text-slate-600">{player.initials}</span><span className="font-medium text-slate-800">{player.name}</span></div></td>
                    <td className="px-5 py-4 text-slate-500">{player.age}</td>
                    <td className="px-5 py-4 text-slate-500">{player.sport}</td>
                    <td className="px-5 py-4 font-semibold text-slate-700">{player.attendance}%</td>
                    <td className="px-5 py-4 text-slate-700">{player.completedMatches}</td>
                    <td className="px-5 py-4"><StatusBadge>Ready</StatusBadge></td>
                    <td className="px-5 py-4 text-right"><button type="button" onClick={() => setSelectedId(player.id)} className="text-sm font-semibold text-blue-600 hover:text-blue-800">View</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : <EmptyState title="No ready players found" description="Try changing the search or sport filter." />}
      </Panel>

      {selected && (
        <Panel title="Ready player summary">
          <div className="p-5 text-center">
            <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-blue-100 text-lg font-bold text-blue-700">{selected.initials}</div>
            <h3 className="mt-3 font-semibold text-slate-900">{selected.name}</h3>
            <p className="text-sm text-slate-500">{selected.sport} · Age {selected.age}</p>
            <StatusBadge>Ready player</StatusBadge>
            <div className="mt-5 grid grid-cols-2 gap-3 border-t border-slate-100 pt-5">
              <div><p className="text-xs text-slate-400">Attendance</p><p className="mt-1 text-lg font-bold text-slate-800">{selected.attendance}%</p></div>
              <div><p className="text-xs text-slate-400">Matches</p><p className="mt-1 text-lg font-bold text-slate-800">{selected.completedMatches}</p></div>
              <div className="col-span-2 rounded-lg bg-slate-50 py-3"><p className="text-xs text-slate-400">Readiness status</p><p className="mt-1 text-lg font-bold text-blue-600">Ready</p></div>
            </div>
          </div>
        </Panel>
      )}
    </div>
  );
}
