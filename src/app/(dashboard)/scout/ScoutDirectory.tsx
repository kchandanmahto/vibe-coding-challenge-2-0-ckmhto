"use client";

import { useMemo, useState } from "react";
import { Panel, StatusBadge } from "@/components/dashboard/Dashboard";
import { EmptyState, SearchAndFilter } from "@/components/dashboard/DashboardUI";

const readyPlayers = [
  { id: "AD-1042", name: "Arjun Patel", sport: "Football", attendance: 92, matches: 12, score: 78, age: 16, initials: "AP" },
  { id: "AD-1088", name: "Meera Shah", sport: "Football", attendance: 88, matches: 9, score: 84, age: 15, initials: "MS" },
  { id: "AD-1121", name: "Vihaan Rao", sport: "Cricket", attendance: 91, matches: 8, score: 81, age: 17, initials: "VR" },
  { id: "AD-1145", name: "Ishaan Verma", sport: "Swimming", attendance: 86, matches: 6, score: 76, age: 16, initials: "IV" },
  { id: "AD-1192", name: "Aisha Khan", sport: "Football", attendance: 81, matches: 7, score: 79, age: 15, initials: "AK" },
];

export function ScoutDirectory() {
  const [query, setQuery] = useState("");
  const [sport, setSport] = useState("All sports");
  const [selectedId, setSelectedId] = useState(readyPlayers[0].id);

  const filtered = useMemo(() => readyPlayers.filter((player) =>
    (sport === "All sports" || player.sport === sport) &&
    player.name.toLowerCase().includes(query.toLowerCase()),
  ), [query, sport]);
  const selected = readyPlayers.find((player) => player.id === selectedId) ?? filtered[0] ?? readyPlayers[0];

  return (
    <div className="grid gap-5 xl:grid-cols-[1fr_300px]">
      <Panel title="Ready player directory">
        <SearchAndFilter
          query={query}
          onQueryChange={setQuery}
          queryPlaceholder="Search ready players..."
          filterValue={sport}
          onFilterChange={setSport}
          filterLabel="Filter by sport"
          filterOptions={["All sports", "Football", "Cricket", "Swimming"]}
        />
        {filtered.length ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[620px] text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase text-slate-500"><tr><th className="px-5 py-3 font-medium">Player</th><th className="px-5 py-3 font-medium">Sport</th><th className="px-5 py-3 font-medium">Attendance</th><th className="px-5 py-3 font-medium">Matches</th><th className="px-5 py-3 font-medium">Readiness</th></tr></thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((player) => (
                  <tr key={player.id} onClick={() => setSelectedId(player.id)} className={`cursor-pointer ${selected.id === player.id ? "bg-blue-50/60" : "hover:bg-slate-50"}`}>
                    <td className="px-5 py-4"><div className="flex items-center gap-3"><span className="grid h-9 w-9 place-items-center rounded-full bg-slate-100 text-xs font-bold text-slate-600">{player.initials}</span><span className="font-medium text-slate-800">{player.name}</span></div></td>
                    <td className="px-5 py-4 text-slate-500">{player.sport}</td><td className="px-5 py-4 font-semibold text-slate-700">{player.attendance}%</td><td className="px-5 py-4 text-slate-700">{player.matches}</td><td className="px-5 py-4"><StatusBadge>Ready</StatusBadge></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState title="No ready players found" description="Try changing the search or sport filter." />
        )}
      </Panel>

      {selected && (
        <Panel title="Player profile">
          <div className="p-5 text-center">
            <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-blue-100 text-lg font-bold text-blue-700">{selected.initials}</div>
            <h3 className="mt-3 font-semibold text-slate-900">{selected.name}</h3>
            <p className="text-sm text-slate-500">{selected.sport} · Age {selected.age}</p>
            <StatusBadge>Ready player</StatusBadge>
            <div className="mt-5 grid grid-cols-2 gap-3 border-t border-slate-100 pt-5">
              <div><p className="text-xs text-slate-400">Attendance</p><p className="mt-1 text-lg font-bold text-slate-800">{selected.attendance}%</p></div>
              <div><p className="text-xs text-slate-400">Matches</p><p className="mt-1 text-lg font-bold text-slate-800">{selected.matches}</p></div>
              <div className="col-span-2 rounded-lg bg-slate-50 py-3"><p className="text-xs text-slate-400">Performance score</p><p className="mt-1 text-lg font-bold text-blue-600">{selected.score}/100</p></div>
            </div>
          </div>
        </Panel>
      )}
    </div>
  );
}
