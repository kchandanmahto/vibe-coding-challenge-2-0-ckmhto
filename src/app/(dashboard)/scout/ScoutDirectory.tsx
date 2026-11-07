
"use client";

import { useMemo, useState } from "react";

import { Panel, StatusBadge } from "@/components/dashboard/Dashboard";
import {
  EmptyState,
  SearchAndFilter,
} from "@/components/dashboard/DashboardUI";

import type { ReadyPlayer } from "@/server/scouts/scout-service";

interface ScoutDirectoryProps {
  players: ReadyPlayer[];
}

export function ScoutDirectory({ players }: ScoutDirectoryProps) {
  const [query, setQuery] = useState("");
  const [sport, setSport] = useState("All sports");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const sports = useMemo(
    () => Array.from(new Set(players.map((player) => player.sport))),
    [players]
  );

  const filtered = useMemo(
    () =>
      players.filter(
        (player) =>
          (sport === "All sports" || player.sport === sport) &&
          `${player.name} ${player.playerCode}`
            .toLowerCase()
            .includes(query.trim().toLowerCase())
      ),
    [players, query, sport]
  );

  const selected =
    players.find((player) => player.id === selectedId) ?? null;

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

        {players.length === 0 ? (
          <EmptyState
            title="No ready players"
            description="No active players currently meet both readiness criteria: minimum 75% attendance and 2 participated completed matches."
          />
        ) : filtered.length ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[620px] text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-5 py-3 font-medium">Player</th>
                  <th className="px-5 py-3 font-medium">Age</th>
                  <th className="px-5 py-3 font-medium">Sport</th>
                  <th className="px-5 py-3 font-medium">Attendance</th>
                  <th className="px-5 py-3 font-medium">Matches</th>
                  <th className="px-5 py-3 font-medium">Readiness</th>
                  <th className="px-5 py-3 text-right font-medium">Action</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {filtered.map((player) => (
                  <tr
                    key={player.id}
                    className={
                      selected?.id === player.id
                        ? "bg-blue-50/60"
                        : "hover:bg-slate-50"
                    }
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <span className="grid h-9 w-9 place-items-center rounded-full bg-slate-100 text-xs font-bold text-slate-600">
                          {player.initials}
                        </span>
                        <div>
                          <p className="font-medium text-slate-800">
                            {player.name}
                          </p>
                          <p className="text-xs text-slate-400">
                            {player.playerCode}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-5 py-4 text-slate-500">
                      {player.age ?? "—"}
                    </td>

                    <td className="px-5 py-4 capitalize text-slate-500">
                      {player.sport}
                    </td>

                    <td className="px-5 py-4 font-semibold text-slate-700">
                      {player.attendance}%
                    </td>

                    <td className="px-5 py-4 text-slate-700">
                      {player.completedMatches}
                    </td>

                    <td className="px-5 py-4">
                      <StatusBadge>Ready</StatusBadge>
                    </td>

                    <td className="px-5 py-4 text-right">
                      <button
                        type="button"
                        onClick={() => setSelectedId(player.id)}
                        className="text-sm font-semibold text-blue-600 hover:text-blue-800"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState
            title="No ready players found"
            description="Try changing the search or sport filter."
          />
        )}
      </Panel>

      {selected && (
        <Panel title="Ready player summary">
          <div className="p-5 text-center">
            <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-blue-100 text-lg font-bold text-blue-700">
              {selected.initials}
            </div>

            <h3 className="mt-3 font-semibold text-slate-900">
              {selected.name}
            </h3>

            <p className="text-sm capitalize text-slate-500">
              {selected.sport} · Age {selected.age ?? "—"}
            </p>

            <StatusBadge>Ready player</StatusBadge>

            <div className="mt-5 grid grid-cols-2 gap-3 border-t border-slate-100 pt-5">
              <div>
                <p className="text-xs text-slate-400">Attendance</p>
                <p className="mt-1 text-lg font-bold text-slate-800">
                  {selected.attendance}%
                </p>
              </div>

              <div>
                <p className="text-xs text-slate-400">Matches</p>
                <p className="mt-1 text-lg font-bold text-slate-800">
                  {selected.completedMatches}
                </p>
              </div>

              <div className="col-span-2 rounded-lg bg-slate-50 py-3">
                <p className="text-xs text-slate-400">Readiness status</p>
                <p className="mt-1 text-lg font-bold text-blue-600">
                  Ready
                </p>
              </div>
            </div>
          </div>
        </Panel>
      )}
    </div>
  );
}
