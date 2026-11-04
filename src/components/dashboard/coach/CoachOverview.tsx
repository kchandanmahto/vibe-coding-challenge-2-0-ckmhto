"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ArrowRight, Plus, Search } from "lucide-react";
import { DashboardShell } from "../DashboardShell";
import { EmptyState, LoadingState, PageHeader } from "../DashboardUI";
import { Panel, StatCard, StatusBadge } from "../Dashboard";

const players = [
  { id: "AD-1042", name: "Arjun Patel", initials: "AP", sport: "Football", attendance: 92, completedMatches: 4, ready: true, added: "2026-11-03" },
  { id: "AD-1088", name: "Meera Shah", initials: "MS", sport: "Football", attendance: 88, completedMatches: 3, ready: true, added: "2026-11-01" },
  { id: "AD-1265", name: "Kabir Singh", initials: "KS", sport: "Football", attendance: 74, completedMatches: 2, ready: false, added: "2026-10-28" },
  { id: "AD-1310", name: "Aisha Khan", initials: "AK", sport: "Athletics", attendance: 81, completedMatches: 3, ready: true, added: "2026-10-25" },
  { id: "AD-1342", name: "Rohan Das", initials: "RD", sport: "Football", attendance: 69, completedMatches: 1, ready: false, added: "2026-10-22" },
];
const sessions = [
  { id: "SES-1108", date: "04 Nov 2026", time: "06:30 AM", title: "Morning Fitness", sport: "Football", status: "Open", players: 18, present: 16, absent: 2 },
  { id: "SES-1109", date: "04 Nov 2026", time: "04:00 PM", title: "Technical Training", sport: "Football", status: "Open", players: 22, present: 19, absent: 3 },
  { id: "SES-1110", date: "04 Nov 2026", time: "05:30 PM", title: "Speed Conditioning", sport: "Athletics", status: "Closed", players: 12, present: 11, absent: 1 },
];
const matches = [
  { id: "MAT-2001", title: "District Football League", sport: "Football", date: "2026-11-07", time: "4:30 PM", status: "Upcoming", participants: ["Arjun Patel", "Meera Shah", "Kabir Singh"] },
  { id: "MAT-2002", title: "Academy Championship", sport: "Football", date: "2026-11-12", time: "5:00 PM", status: "Upcoming", participants: ["Arjun Patel", "Aisha Khan"] },
  { id: "MAT-2003", title: "City Cup", sport: "Football", date: "2026-10-29", time: "4:00 PM", status: "Completed", result: "4-2 win", participants: ["Arjun Patel", "Meera Shah"], scores: [78, 84] },
  { id: "MAT-2004", title: "Athletics Trial", sport: "Athletics", date: "2026-10-24", time: "6:00 PM", status: "Completed", result: "Participation recorded", participants: ["Aisha Khan", "Rohan Das"], scores: [87, 62] },
];
const weeklyAttendance = [
  { day: "Mon", percentage: 88 },
  { day: "Tue", percentage: 92 },
  { day: "Wed", percentage: 84 },
  { day: "Thu", percentage: 90 },
  { day: "Fri", percentage: 78 },
];
const attendanceActivity = [
  { title: "Morning Fitness attendance saved", detail: "Football · 16 present, 2 absent · 12 minutes ago" },
  { title: "Speed Conditioning marked closed", detail: "Athletics · 11 present, 1 absent · 1 hour ago" },
  { title: "Technical Training opened", detail: "Football · 22 eligible demo players · Today" },
];

export function CoachOverview() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [sport, setSport] = useState("All assigned sports");
  const [playerQuery, setPlayerQuery] = useState("");
  const [showAllPlayers, setShowAllPlayers] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => setLoading(false), 350);
    return () => window.clearTimeout(timer);
  }, []);

  const filteredPlayers = useMemo(() => players.filter((player) =>
    (sport === "All assigned sports" || player.sport === sport) &&
    `${player.name} ${player.id}`.toLowerCase().includes(playerQuery.trim().toLowerCase())
  ), [sport, playerQuery]);
  const filteredSessions = sessions.filter((session) => sport === "All assigned sports" || session.sport === sport);
  const filteredMatches = matches.filter((match) => sport === "All assigned sports" || match.sport === sport);
  const completedMatches = filteredMatches.filter((match) => match.status === "Completed");
  const upcomingMatches = filteredMatches.filter((match) => match.status === "Upcoming");
  const topPlayers = [
    { name: "Aisha Khan", sport: "Athletics", score: 87, match: "Athletics Trial" },
    { name: "Meera Shah", sport: "Football", score: 84, match: "City Cup" },
    { name: "Arjun Patel", sport: "Football", score: 78, match: "City Cup" },
  ].filter((player) => sport === "All assigned sports" || player.sport === sport);

  if (error) return <DashboardShell role="coach" title="Coach dashboard" subtitle="Mock assigned-sports workspace"><div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-6"><h2 className="font-semibold text-red-800">Overview could not load</h2><p className="mt-1 text-sm text-red-700">The mock workspace did not finish loading.</p><button onClick={() => setError(false)} className="mt-4 rounded-lg bg-white px-4 py-2 text-sm font-semibold text-red-700 ring-1 ring-red-200">Retry</button></div></DashboardShell>;

  return <DashboardShell role="coach" title="Coach dashboard" subtitle="Demonstration data · Assigned sports and players only">
    <PageHeader title="Good morning, Raj" description="Here is your assigned-sports coaching snapshot" action={<select aria-label="Filter dashboard by sport" value={sport} onChange={(event) => setSport(event.target.value)} className="h-11 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700"><option>All assigned sports</option><option>Football</option><option>Athletics</option></select>} />
    {loading ? <LoadingState message="Loading coaching overview..." /> : <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <StatCard label="My total players" value={String(players.filter((player) => sport === "All assigned sports" || player.sport === sport).length)} detail="Assigned demo players" icon="users" tone="green" />
        <StatCard label="Assigned sports" value={sport === "All assigned sports" ? "2" : "1"} detail={sport === "All assigned sports" ? "Football and Athletics" : sport} icon="trophy" tone="blue" />
        <StatCard label="Sessions this week" value="3" detail="2 open · 1 closed" icon="calendar" tone="amber" />
        <StatCard label="Average attendance" value="86%" detail="Weekly demo average" icon="clipboard" tone="violet" />
        <StatCard label="Upcoming matches" value={String(upcomingMatches.length)} detail="Assigned sport matches" icon="trophy" tone="blue" />
        <StatCard label="Completed matches" value={String(completedMatches.length)} detail="Available match records" icon="activity" tone="green" />
      </div>

      <div className="grid gap-5 xl:grid-cols-[1.45fr_1fr]" id="players">
        <Panel title="My players" action={<Link href="/coach/players" className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600">View all <ArrowRight className="h-3.5 w-3.5" /></Link>}>
          <div className="flex items-center gap-3 border-b border-slate-100 px-5 py-3"><label className="relative flex-1"><Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" /><span className="sr-only">Search players</span><input value={playerQuery} onChange={(event) => setPlayerQuery(event.target.value)} placeholder="Search assigned players..." className="h-10 w-full rounded-lg border border-slate-200 pl-9 pr-3 text-sm" /></label></div>
          {filteredPlayers.length ? <div className="overflow-x-auto"><table className="w-full min-w-[760px] text-left text-sm"><thead className="bg-slate-50 text-xs uppercase text-slate-500"><tr><th className="px-5 py-3">Player</th><th className="px-5 py-3">Sport</th><th className="px-5 py-3">Attendance</th><th className="px-5 py-3">Matches</th><th className="px-5 py-3">Readiness</th></tr></thead><tbody className="divide-y divide-slate-100">{filteredPlayers.slice(0, showAllPlayers ? filteredPlayers.length : 4).map((player) => <tr key={player.id}><td className="px-5 py-3.5"><div className="flex items-center gap-3"><span className="grid h-9 w-9 place-items-center rounded-full bg-blue-50 text-xs font-bold text-blue-700">{player.initials}</span><div><p className="font-semibold text-slate-800">{player.name}</p><p className="text-xs text-slate-500">{player.id}</p></div></div></td><td className="px-5 py-3.5 text-slate-600">{player.sport}</td><td className="px-5 py-3.5 font-medium">{player.attendance}%</td><td className="px-5 py-3.5">{player.completedMatches}</td><td className="px-5 py-3.5"><StatusBadge tone={player.ready ? "green" : "amber"}>{player.ready ? "Ready" : "Not Ready"}</StatusBadge></td></tr>)}</tbody></table></div> : <EmptyState title="No assigned players found" description="Change the sport or player search filter." />}
          {filteredPlayers.length > 4 && <button type="button" onClick={() => setShowAllPlayers((current) => !current)} className="w-full border-t border-slate-100 py-3 text-sm font-semibold text-blue-600">{showAllPlayers ? "Show fewer players" : `View all ${filteredPlayers.length} demo players`}</button>}
        </Panel>
        <Panel title="Quick actions" action={<Plus className="h-4 w-4 text-slate-400" />} id="settings">
          <div className="grid gap-2 p-4">{[
            ["View my players", "/coach/players"], ["Create session", "/coach#sessions"], ["Mark attendance", "/coach#attendance"], ["View matches", "/coach#matches"], ["Manage scores", "/coach#scores"]
          ].map(([label, href]) => <Link key={label} href={href} className="flex items-center justify-between rounded-lg border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 hover:border-blue-200 hover:bg-blue-50"><span>{label}</span><ArrowRight className="h-4 w-4 text-blue-600" /></Link>)}</div>
        </Panel>
      </div>

      <div className="grid gap-5 xl:grid-cols-[1.45fr_1fr]" id="sessions">
        <Panel title="Today's sessions">
          {filteredSessions.length ? <div className="divide-y divide-slate-100 px-5">{filteredSessions.map((session) => <div key={session.id} className="flex flex-col gap-3 py-4 lg:flex-row lg:items-center"><div className="w-24 shrink-0"><p className="text-sm font-semibold text-blue-600">{session.time}</p><p className="mt-1 text-xs text-slate-500">{session.date}</p></div><div className="min-w-0 flex-1"><p className="font-medium text-slate-800">{session.title}</p><p className="text-xs text-slate-500">{session.sport} · {session.id}</p></div><div className="flex flex-wrap items-center gap-3 text-xs"><StatusBadge tone={session.status === "Open" ? "blue" : "slate"}>{session.status}</StatusBadge><span className="text-slate-500">{session.players} players</span><span className="text-emerald-600">{session.present} present</span><span className="text-amber-600">{session.absent} absent</span><Link href="/coach#attendance" className="font-semibold text-blue-600">View session</Link></div></div>)}</div> : <EmptyState title="No sessions for this sport" description="Select an assigned sport with demo session records." />}
        </Panel>
        <Panel title="Attendance overview" action={<span className="text-xs font-semibold text-slate-500">86% average</span>} id="attendance">
          <div className="p-5"><div className="flex justify-between text-xs text-slate-500"><span><i className="mr-1 inline-block h-2 w-2 rounded-full bg-blue-600" />Present 86%</span><span><i className="mr-1 inline-block h-2 w-2 rounded-full bg-slate-200" />Absent 14%</span></div>{weeklyAttendance.map((item) => <div key={item.day} className="mt-4 flex items-center gap-3 text-xs"><span className="w-7 text-slate-500">{item.day}</span><div className="h-2.5 flex-1 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-blue-600" style={{ width: `${item.percentage}%` }} /></div><span className="w-8 text-right font-semibold text-slate-700">{item.percentage}%</span></div>)}</div>
          <div className="border-t border-slate-100 p-5"><p className="mb-3 text-xs font-semibold text-slate-500">Sport-wise demo attendance</p><div className="grid grid-cols-2 gap-3"><div className="rounded-lg bg-slate-50 p-3"><p className="text-xs text-slate-500">Football</p><p className="mt-1 font-bold text-slate-900">88%</p></div><div className="rounded-lg bg-slate-50 p-3"><p className="text-xs text-slate-500">Athletics</p><p className="mt-1 font-bold text-slate-900">81%</p></div></div></div>
          <div className="border-t border-slate-100 px-5 py-2"><p className="pt-3 text-xs font-semibold text-slate-500">Recent attendance activity</p>{attendanceActivity.map((activity) => <div key={activity.title} className="py-3"><p className="text-sm font-medium text-slate-800">{activity.title}</p><p className="mt-1 text-xs text-slate-500">{activity.detail}</p></div>)}</div>
        </Panel>
      </div>

      <div className="grid gap-5 xl:grid-cols-[1.45fr_1fr]" id="matches">
        <Panel title="Matches">
          {filteredMatches.length ? <div className="divide-y divide-slate-100 px-5">{filteredMatches.map((match) => <div key={match.id} className="py-4"><div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between"><div><p className="font-semibold text-slate-800">{match.title}</p><p className="mt-1 text-xs text-slate-500">{match.sport} · {new Date(`${match.date}T00:00:00`).toLocaleDateString()} · {match.time}</p></div><StatusBadge tone={match.status === "Upcoming" ? "blue" : "green"}>{match.status}</StatusBadge></div><p className="mt-2 text-xs text-slate-500">{match.participants.length} participants · {match.participants.join(", ")}</p>{match.status === "Completed" && <div className="mt-2 flex flex-wrap items-center gap-2 text-xs"><span className="font-semibold text-slate-700">{match.result}</span>{match.scores?.map((score, index) => <span key={`${match.participants[index]}-${score}`} className="rounded-full bg-slate-100 px-2 py-1 text-slate-600">{match.participants[index]}: {score}</span>)}</div>}</div>)}</div> : <EmptyState title="No assigned-sport matches" description="Select a sport with demo match records." />}
        </Panel>
        <Panel title="Player performance" id="performance">
          <div className="p-5">{topPlayers.length ? <><p className="mb-4 text-xs text-slate-500">Top recorded scores · no derived skill rating</p>{topPlayers.map((player, index) => <div key={player.name} className="mb-4 flex items-center gap-3"><span className="grid h-8 w-8 place-items-center rounded-full bg-blue-50 text-xs font-bold text-blue-700">{index + 1}</span><div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold text-slate-800">{player.name}</p><p className="text-xs text-slate-500">{player.match}</p></div><strong className="text-sm text-slate-900">{player.score}</strong></div>)}</> : <p className="text-sm text-slate-500">No recorded scores match this sport.</p>}</div>
          <div className="border-t border-slate-100 p-5">
            <p className="text-xs font-semibold text-slate-500">Recorded score trend</p>
            <div className="mt-3 flex items-end gap-2">{[62, 78, 84, 87].map((score, index) => <div key={`${score}-${index}`} className="flex flex-1 flex-col items-center gap-1"><div className="w-full rounded-t bg-blue-500" style={{ height: `${score * 0.6}px` }} /><span className="text-[10px] text-slate-500">{index + 1}</span></div>)}</div>
            <p className="mt-3 text-xs text-slate-500">Latest available match scores shown chronologically; Football 78–84, Athletics 62–87.</p>
            <div className="mt-4 grid grid-cols-2 gap-3"><div className="rounded-lg bg-slate-50 p-3"><p className="text-xs text-slate-500">Football average score</p><p className="mt-1 font-bold text-slate-900">80</p></div><div className="rounded-lg bg-slate-50 p-3"><p className="text-xs text-slate-500">Athletics average score</p><p className="mt-1 font-bold text-slate-900">75</p></div></div>
          </div>
        </Panel>
      </div>

      <div className="grid gap-5 xl:grid-cols-[1.45fr_1fr]">
        <Panel title="Recent activity">
          <div className="divide-y divide-slate-100 px-5">{[
            ["Attendance marked", "Football technical training · 12 minutes ago"],
            ["Session completed", "Morning fitness attendance closed · 1 hour ago"],
            ["Match created", "District Football League · Today"],
            ["Scores added", "City Cup recorded scores · Yesterday"],
            ["Player activity", "Kabir Singh profile updated · Yesterday"],
          ].map(([title, detail]) => <div key={title} className="py-4"><p className="text-sm font-semibold text-slate-800">{title}</p><p className="mt-1 text-xs text-slate-500">{detail}</p></div>)}</div>
        </Panel>
        <Panel title="This week's attendance" id="scores">
          <div className="p-5">{weeklyAttendance.map((item) => <div key={item.day} className="mt-3 flex items-center gap-3 text-xs"><span className="w-8 text-slate-500">{item.day}</span><div className="h-2.5 flex-1 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-blue-600" style={{ width: `${item.percentage}%` }} /></div><strong className="w-9 text-right text-slate-700">{item.percentage}%</strong></div>)}</div>
        </Panel>
      </div>
    </div>}
  </DashboardShell>;
}
