"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { CalendarDays, ClipboardCheck, Medal, UserRound } from "lucide-react";
import { DashboardShell } from "../DashboardShell";
import { Panel, StatCard, StatusBadge } from "../Dashboard";
import { LoadingState } from "../DashboardUI";
import { isPlayerReady } from "../coach/coachPlayersData";
import { currentPlayer, getPlayerOverviewMatches } from "./playerOverviewData";

function formatMatchDate(date: string) {
  return new Intl.DateTimeFormat("en-IN", { day: "2-digit", month: "short", year: "numeric", timeZone: "UTC" })
    .format(new Date(`${date}T00:00:00Z`));
}

export function PlayerOverview() {
  const [loading, setLoading] = useState(true);
  const matches = getPlayerOverviewMatches(currentPlayer);
  const upcomingMatches = matches.filter((match) => match.status === "Upcoming");
  const completedMatches = matches.filter((match) => match.status === "Completed");
  const ready = isPlayerReady(currentPlayer);
  const attendanceCondition = currentPlayer.attendance >= 75;
  const matchesCondition = currentPlayer.completedMatches >= 2;

  useEffect(() => {
    const timer = window.setTimeout(() => setLoading(false), 300);
    return () => window.clearTimeout(timer);
  }, []);

  return (
    <DashboardShell role="player" title="Player overview" subtitle="Monday, 4 November 2026">
      <div className="mb-6 rounded-xl border border-slate-200/80 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <div className="grid h-16 w-16 shrink-0 place-items-center rounded-full bg-blue-100 text-xl font-bold text-blue-700">
            {currentPlayer.initials}
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-2xl font-bold text-slate-900">Welcome back, {currentPlayer.name}</h2>
              <StatusBadge tone="blue">Mock player data</StatusBadge>
            </div>
            <p className="mt-1 text-sm text-slate-500">{currentPlayer.age <= 16 ? "U-16" : "Academy player"} · {currentPlayer.sport}</p>
          </div>
        </div>
      </div>

      {loading ? <LoadingState message="Loading your dashboard..." /> : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
            <StatCard label="Attendance" value={`${currentPlayer.attendance}%`} detail={`${currentPlayer.presentSessions} present sessions`} icon="clipboard" />
            <StatCard label="Total sessions" value={String(currentPlayer.presentSessions + currentPlayer.absentSessions)} detail="Held sessions recorded" icon="calendar" />
            <StatCard label="Present sessions" value={String(currentPlayer.presentSessions)} detail="Present attendance records" icon="clipboard" tone="green" />
            <StatCard label="Absent sessions" value={String(currentPlayer.absentSessions)} detail="Absent attendance records" icon="clipboard" tone="amber" />
            <StatCard label="Completed matches" value={String(currentPlayer.completedMatches)} detail="Recorded participation" icon="trophy" tone="violet" />
            <StatCard label="Readiness" value={ready ? "Ready" : "Not Ready"} detail={ready ? "Both conditions met" : "See requirements below"} icon="activity" tone={ready ? "green" : "amber"} />
          </div>

          <div className={`mt-5 rounded-xl border px-5 py-4 ${ready ? "border-emerald-200 bg-emerald-50" : "border-amber-200 bg-amber-50"}`} id="readiness">
            <p className={`font-semibold ${ready ? "text-emerald-900" : "text-amber-900"}`}>{ready ? "Readiness achieved" : "Readiness requirements"}</p>
            <p className={`mt-1 text-sm ${ready ? "text-emerald-700" : "text-amber-700"}`}>
              {attendanceCondition ? `Attendance requirement met (${currentPlayer.attendance}%).` : `Attendance is below 75% (${currentPlayer.attendance}%).`}
              {" "} 
              {matchesCondition ? `${currentPlayer.completedMatches} completed matches recorded.` : `Only ${currentPlayer.completedMatches} completed match recorded; at least 2 required.`}
            </p>
          </div>

          <div className="mt-5 grid gap-5 xl:grid-cols-[1.4fr_1fr]" id="attendance">
            <Panel title="Recent attendance">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[480px] text-left text-sm">
                  <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                    <tr><th className="px-5 py-3 font-medium">Session date</th><th className="px-5 py-3 font-medium">Sport</th><th className="px-5 py-3 font-medium">Status</th></tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {currentPlayer.attendanceHistory.map((record) => (
                      <tr key={record.date}>
                        <td className="px-5 py-4 font-medium text-slate-800">{record.date}</td>
                        <td className="px-5 py-4 text-slate-500">{currentPlayer.sport}</td>
                        <td className="px-5 py-4"><StatusBadge tone={record.status === "Present" ? "green" : "amber"}>{record.status}</StatusBadge></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Panel>

            <Panel title="Attendance trend">
              <div className="p-5">
                <div className="flex h-48 items-end gap-3">
                  {[...currentPlayer.attendanceHistory].reverse().map((record) => (
                    <div key={record.date} className="flex h-full flex-1 flex-col items-center justify-end gap-2">
                      <span className="text-xs font-semibold text-slate-600">{record.status === "Present" ? "Present" : "Absent"}</span>
                      <div className={`w-full rounded-t-md ${record.status === "Present" ? "bg-emerald-500" : "bg-amber-400"}`} style={{ height: record.status === "Present" ? "100%" : "35%" }} />
                      <span className="text-center text-[11px] text-slate-500">{record.date.slice(0, 6)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </Panel>
          </div>

          <div className="mt-5 grid gap-5 xl:grid-cols-2" id="matches">
            <Panel title="Upcoming matches">
              {upcomingMatches.length ? (
                <div className="divide-y divide-slate-100">
                  {upcomingMatches.map((match) => (
                    <div key={match.id} className="flex items-center gap-3 px-5 py-4">
                      <CalendarDays className="h-5 w-5 text-blue-600" />
                      <div className="min-w-0 flex-1"><p className="truncate font-medium text-slate-800">{match.name}</p><p className="text-xs text-slate-500">{match.sport} · {formatMatchDate(match.date)}</p></div>
                      <StatusBadge tone="blue">{match.status}</StatusBadge>
                    </div>
                  ))}
                </div>
              ) : <p className="px-5 py-8 text-sm text-slate-500">No upcoming matches are scheduled.</p>}
            </Panel>

            <Panel title="Completed matches and scores">
              {completedMatches.length ? (
                <div className="divide-y divide-slate-100">
                  {completedMatches.map((match) => (
                    <div key={match.id} className="flex items-center gap-3 px-5 py-4">
                      <Medal className="h-5 w-5 text-violet-600" />
                      <div className="min-w-0 flex-1"><p className="truncate font-medium text-slate-800">{match.name}</p><p className="text-xs text-slate-500">{match.sport} · {formatMatchDate(match.date)}</p></div>
                      <StatusBadge tone={match.score === null ? "slate" : "green"}>{match.score === null ? "Score unavailable" : match.score}</StatusBadge>
                    </div>
                  ))}
                </div>
              ) : <p className="px-5 py-8 text-sm text-slate-500">No completed match records are available.</p>}
            </Panel>
          </div>

          <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_2fr]" id="performance">
            <Panel title="My profile">
              <div id="profile" className="space-y-3 p-5 text-sm">
                <div className="flex justify-between gap-4"><span className="text-slate-500">Player ID</span><strong className="text-slate-800">{currentPlayer.id}</strong></div>
                <div className="flex justify-between gap-4"><span className="text-slate-500">Sport</span><strong className="text-slate-800">{currentPlayer.sport}</strong></div>
                <div className="flex justify-between gap-4"><span className="text-slate-500">Account status</span><strong className="text-slate-800">{currentPlayer.status}</strong></div>
              </div>
            </Panel>
            <Panel title="Quick navigation">
              <div className="grid gap-3 p-5 sm:grid-cols-2">
                {[
                  { label: "My Profile", href: "/player#profile", icon: UserRound },
                  { label: "My Attendance", href: "/player#attendance", icon: ClipboardCheck },
                  { label: "My Matches", href: "/player#matches", icon: CalendarDays },
                  { label: "My Performance", href: "/player#performance", icon: Medal },
                ].map(({ label, href, icon: ItemIcon }) => (
                  <Link key={label} href={href} className="flex items-center gap-3 rounded-lg border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700">
                    <ItemIcon className="h-5 w-5" />{label}
                  </Link>
                ))}
              </div>
            </Panel>
          </div>
        </>
      )}
    </DashboardShell>
  );
}
