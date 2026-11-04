import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { StatCard } from "@/components/dashboard/Dashboard";
import { ScoutDirectory } from "./ScoutDirectory";

export default function ScoutDashboard() {
  return (
    <DashboardShell role="scout" title="Scout discovery" subtitle="Only verified ready players are shown">
      <div className="mb-6">
        <p className="text-sm text-slate-500">Player discovery</p>
        <h2 className="mt-1 text-2xl font-bold text-slate-900">Explore ready talent</h2>
      </div>
      <div className="mb-5 grid gap-4 sm:grid-cols-3">
        <StatCard label="Ready players" value="142" detail="Across 6 sports" icon="users" />
        <StatCard label="Football talent" value="48" detail="Highest ready pool" icon="trophy" tone="green" />
        <StatCard label="High performers" value="36" detail="Score of 80 or above" icon="activity" tone="violet" />
      </div>
      <ScoutDirectory />
    </DashboardShell>
  );
}
