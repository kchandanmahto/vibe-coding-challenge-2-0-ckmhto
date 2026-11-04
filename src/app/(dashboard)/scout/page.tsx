import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { Panel, StatCard } from "@/components/dashboard/Dashboard";
import { coachPlayers, isPlayerReady } from "@/components/dashboard/coach/coachPlayersData";
import { EmptyState } from "@/components/dashboard/DashboardUI";
import { ScoutDirectory } from "./ScoutDirectory";

export default function ScoutDashboard() {
  const readyPlayers = coachPlayers.filter(isPlayerReady);
  const sports = Array.from(new Set(readyPlayers.map((player) => player.sport)));

  return (
    <DashboardShell role="scout" title="Scout discovery" subtitle="Only verified ready players are shown">
      <div className="mb-6">
        <div className="flex items-center gap-4">
          <div className="grid h-14 w-14 shrink-0 place-items-center rounded-full bg-blue-100 text-lg font-bold text-blue-700">NS</div>
          <div>
            <p className="text-sm text-slate-500">Welcome back, Neha Sharma</p>
            <h2 className="mt-1 text-2xl font-bold text-slate-900">Scout overview</h2>
            <p className="mt-1 text-sm text-slate-500">Role: Scout · Academy Desk</p>
          </div>
        </div>
      </div>
      <div className="mb-5 grid gap-4 sm:grid-cols-3">
        <StatCard label="Total ready players" value={String(readyPlayers.length)} detail="Calculated from readiness mock data" icon="users" />
        <StatCard label="Available sports" value={String(sports.length)} detail="Sports with ready players" icon="trophy" tone="green" />
        <StatCard label="Players meeting readiness" value={String(readyPlayers.length)} detail="Attendance and match criteria met" icon="activity" tone="violet" />
      </div>
      <ScoutDirectory />
      <div className="mt-5 grid gap-5 lg:grid-cols-2">
        <Panel title="Sports with ready players" id="sports">
          {sports.length ? (
            <div className="divide-y divide-slate-100">
              {sports.map((sport) => {
                const readyCount = readyPlayers.filter((player) => player.sport === sport).length;
                const availableCount = coachPlayers.filter((player) => player.sport === sport).length;
                return (
                  <div key={sport} className="flex items-center justify-between px-5 py-4">
                    <div><p className="font-medium text-slate-800">{sport}</p><p className="mt-1 text-xs text-slate-500">{availableCount} academy players available</p></div>
                    <div className="text-right"><p className="text-lg font-bold text-emerald-700">{readyCount}</p><p className="text-xs text-slate-500">ready</p></div>
                  </div>
                );
              })}
            </div>
          ) : <EmptyState title="No sports available" description="No academy sports currently have ready players." />}
        </Panel>
        <Panel title="Recently ready players" id="discovery">
          <EmptyState title="Readiness history unavailable" description="The current mock data does not provide readiness dates or recent qualification activity." />
        </Panel>
      </div>
      <nav aria-label="Scout quick navigation" className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <a href="#ready-players" className="rounded-xl border border-slate-200 bg-white px-5 py-4 text-sm font-semibold text-blue-700 shadow-sm hover:border-blue-300">Ready Players</a>
        <a href="#discovery" className="rounded-xl border border-slate-200 bg-white px-5 py-4 text-sm font-semibold text-blue-700 shadow-sm hover:border-blue-300">Player Discovery</a>
        <a href="#sports" className="rounded-xl border border-slate-200 bg-white px-5 py-4 text-sm font-semibold text-blue-700 shadow-sm hover:border-blue-300">Sports Overview</a>
      </nav>
    </DashboardShell>
  );
}
