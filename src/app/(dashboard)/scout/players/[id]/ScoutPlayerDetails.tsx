"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowLeft, ChevronLeft, ChevronRight } from "lucide-react";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { Panel, StatCard, StatusBadge } from "@/components/dashboard/Dashboard";
import { EmptyState, LoadingState } from "@/components/dashboard/DashboardUI";
import { coachPlayers, isPlayerReady, type CoachPlayer } from "@/components/dashboard/coach/coachPlayersData";

const readyPlayers = coachPlayers.filter(isPlayerReady);

export function ScoutPlayerDetails({ playerId }: { playerId: string }) {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = window.setTimeout(() => setLoading(false), 300);
    return () => window.clearTimeout(timer);
  }, [playerId]);

  const player = coachPlayers.find((item) => item.id === playerId);
  const readyIndex = player ? readyPlayers.findIndex((item) => item.id === player.id) : -1;
  const previousPlayer = readyIndex > 0 ? readyPlayers[readyIndex - 1] : null;
  const nextPlayer = readyIndex >= 0 && readyIndex < readyPlayers.length - 1 ? readyPlayers[readyIndex + 1] : null;

  if (loading) {
    return (
      <DashboardShell role="scout" title="Player details" subtitle="Scouting profile">
        <LoadingState message="Loading player details..." />
      </DashboardShell>
    );
  }

  if (!player) {
    return (
      <DashboardShell role="scout" title="Player details" subtitle="Scouting profile">
        <EmptyState
          title="Player not found"
          description="This player ID does not exist in the academy's available data."
          action={<Link href="/scout/players" className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white">Back to Ready Players</Link>}
        />
      </DashboardShell>
    );
  }

  if (!isPlayerReady(player)) {
    return (
      <DashboardShell role="scout" title="Player details" subtitle="Access restricted">
        <EmptyState
          title="Access restricted"
          description="This player does not meet both readiness conditions and is not available to Scout."
          action={<Link href="/scout/players" className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white">Back to Ready Players</Link>}
        />
      </DashboardShell>
    );
  }

  return (
    <DashboardShell role="scout" title={player.name} subtitle={`${player.sport} player profile`}>
      <nav aria-label="Breadcrumb" className="mb-4 flex items-center gap-2 text-sm text-slate-500">
        <Link href="/scout/players" className="hover:text-blue-600">Ready Players</Link>
        <span>/</span>
        <span className="text-slate-800">{player.name}</span>
      </nav>

      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Link href="/scout/players" className="flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-800">
          <ArrowLeft className="h-4 w-4" />Back to Ready Players
        </Link>
        <div className="flex gap-2">
          {previousPlayer ? <Link href={`/scout/players/${previousPlayer.id}`} className="flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700"><ChevronLeft className="h-4 w-4" />Previous</Link> : null}
          {nextPlayer ? <Link href={`/scout/players/${nextPlayer.id}`} className="flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700">Next<ChevronRight className="h-4 w-4" /></Link> : null}
        </div>
      </div>

      <section className="mb-5 rounded-xl border border-slate-200/80 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <span className="grid h-16 w-16 shrink-0 place-items-center rounded-full bg-blue-100 text-xl font-bold text-blue-700">{player.initials}</span>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">{player.name}</h1>
            <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-slate-500">
              <span>{player.age} years</span><span aria-hidden="true">•</span><span>{player.sport}</span><StatusBadge>Ready</StatusBadge>
            </div>
          </div>
        </div>
      </section>

      <div className="mb-5 grid gap-4 sm:grid-cols-3">
        <StatCard label="Attendance" value={`${player.attendance}%`} detail="Attendance percentage" icon="clipboard" tone="green" />
        <StatCard label="Completed matches" value={String(player.completedMatches)} detail="Completed match record" icon="trophy" tone="blue" />
        <StatCard label="Available scores" value={String(player.matchHistory.filter((match) => match.score !== undefined).length)} detail="Individual match scores" icon="activity" tone="violet" />
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <Panel title="Attendance details">
          <div className="grid grid-cols-3 gap-3 p-5">
            <div><p className="text-xs text-slate-500">Sessions held</p><p className="mt-1 text-xl font-bold text-slate-900">{player.presentSessions + player.absentSessions}</p></div>
            <div><p className="text-xs text-slate-500">Present</p><p className="mt-1 text-xl font-bold text-emerald-700">{player.presentSessions}</p></div>
            <div><p className="text-xs text-slate-500">Absent</p><p className="mt-1 text-xl font-bold text-red-600">{player.absentSessions}</p></div>
          </div>
          <div className="border-t border-slate-100 px-5 py-4">
            <p className="mb-3 text-sm font-semibold text-slate-800">Attendance history</p>
            {player.attendanceHistory.length ? (
              <div className="space-y-2">{player.attendanceHistory.map((record) => <div key={`${record.date}-${record.status}`} className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2 text-sm"><span className="text-slate-600">{record.date}</span><StatusBadge tone={record.status === "Present" ? "green" : "amber"}>{record.status}</StatusBadge></div>)}</div>
            ) : <EmptyState title="Attendance history unavailable" description="No attendance history is included in the available mock data." />}
          </div>
        </Panel>

        <Panel title="Match history">
          {player.matchHistory.length ? (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[380px] text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase text-slate-500"><tr><th className="px-5 py-3">Match</th><th className="px-5 py-3">Date</th><th className="px-5 py-3">Score</th></tr></thead>
                <tbody className="divide-y divide-slate-100">{player.matchHistory.map((match) => <tr key={`${match.title}-${match.date}`}><td className="px-5 py-3 font-medium text-slate-800">{match.title}</td><td className="px-5 py-3 text-slate-500">{match.date}</td><td className="px-5 py-3 text-slate-700">{match.score === undefined ? "Unavailable" : match.score}</td></tr>)}</tbody>
              </table>
            </div>
          ) : <EmptyState title="Match history unavailable" description="No completed match history is included for this player." />}
        </Panel>
      </div>
    </DashboardShell>
  );
}
