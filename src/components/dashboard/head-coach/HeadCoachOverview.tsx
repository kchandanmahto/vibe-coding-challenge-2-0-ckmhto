"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { BarChart3, CalendarDays, CircleUserRound, Dumbbell, Filter, Medal, Users } from "lucide-react";
import { DashboardShell } from "../DashboardShell";
import { EmptyState, LoadingState } from "../DashboardUI";
import { Panel, StatusBadge } from "../Dashboard";

const sports = ["All sports", "Football", "Cricket", "Swimming", "Athletics"];

const attendanceBySport = [
  { sport: "Football", present: 86, absent: 14 },
  { sport: "Cricket", present: 82, absent: 18 },
  { sport: "Swimming", present: 91, absent: 9 },
  { sport: "Athletics", present: 78, absent: 22 },
];

const performanceBySport = [
  { sport: "Football", players: 68, score: 82 },
  { sport: "Cricket", players: 54, score: 78 },
  { sport: "Swimming", players: 32, score: 86 },
  { sport: "Athletics", players: 41, score: 74 },
];

const coaches = [
  { name: "Raj Kumar", initials: "RK", sports: "Football, Athletics", players: 48, status: "Active" },
  { name: "Neha Rao", initials: "NR", sports: "Swimming", players: 32, status: "Active" },
  { name: "Imran Ali", initials: "IA", sports: "Cricket", players: 36, status: "Active" },
];

export function HeadCoachOverview() {
  const [sport, setSport] = useState("All sports");
  const [period, setPeriod] = useState("This month");
  const [loading, setLoading] = useState(true);
  const filteredAttendance = useMemo(
    () => attendanceBySport.filter((item) => sport === "All sports" || item.sport === sport),
    [sport],
  );
  const filteredPerformance = useMemo(
    () => performanceBySport.filter((item) => sport === "All sports" || item.sport === sport),
    [sport],
  );

  useEffect(() => {
    const timer = window.setTimeout(() => setLoading(false), 350);
    return () => window.clearTimeout(timer);
  }, [sport, period]);

  const overviewCards = [
    { label: "Total players", value: "248", detail: "12 registered this month", href: "/head-coach/players", icon: Users, tone: "bg-blue-50 text-blue-600" },
    { label: "Active players", value: "231", detail: "17 inactive profiles", href: "/head-coach/players", icon: CircleUserRound, tone: "bg-emerald-50 text-emerald-600" },
    { label: "Total coaches", value: "18", detail: "16 active assignments", href: "/head-coach/coaches", icon: CircleUserRound, tone: "bg-violet-50 text-violet-600" },
    { label: "Total sports", value: "6", detail: "5 currently active", href: "/head-coach/sports", icon: Dumbbell, tone: "bg-amber-50 text-amber-600" },
    { label: "Ready players", value: "142", detail: "57% of active players", href: "/head-coach/readiness", icon: Medal, tone: "bg-emerald-50 text-emerald-600" },
    { label: "Total sessions", value: "42", detail: "This selected period", href: "/head-coach/sessions", icon: CalendarDays, tone: "bg-blue-50 text-blue-600" },
    { label: "Completed matches", value: "36", detail: "Verified demo records", href: "/head-coach/matches", icon: BarChart3, tone: "bg-violet-50 text-violet-600" },
  ];

  const actions = [
    ["Add Player", "/head-coach/players"],
    ["Add Coach", "/head-coach/coaches"],
    ["Create Session", "/head-coach/sessions"],
    ["Mark Attendance", "/head-coach/attendance"],
    ["Create Match", "/head-coach/matches"],
  ];

  return (
    <DashboardShell role="head-coach" title="Academy overview" subtitle="Demo dashboard · Monday, 4 November 2026">
      <div className="mb-6 flex flex-col justify-between gap-4 xl:flex-row xl:items-end">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-bold text-slate-900">Academy Desk Performance</h2>
            <StatusBadge tone="blue">Demo data</StatusBadge>
          </div>
          <p className="mt-1 text-sm text-slate-500">Welcome back, Raj. Here is your academy snapshot.</p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <label className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-500">
            <Filter className="h-4 w-4" />
            <span className="sr-only">Filter by sport</span>
            <select value={sport} onChange={(event) => setSport(event.target.value)} className="h-10 bg-transparent text-slate-700 outline-none">
              {sports.map((item) => <option key={item}>{item}</option>)}
            </select>
          </label>
          <label>
            <span className="sr-only">Filter by date period</span>
            <select value={period} onChange={(event) => setPeriod(event.target.value)} className="h-[42px] w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none sm:w-auto">
              <option>This week</option><option>This month</option><option>This quarter</option>
            </select>
          </label>
        </div>
      </div>

      {loading ? <LoadingState message="Loading demo overview..." /> : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4 2xl:grid-cols-7">
            {overviewCards.map(({ label, value, detail, href, icon: Icon, tone }) => (
              <Link key={label} href={href} className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500">
                <div className="flex items-start justify-between gap-2">
                  <div><p className="text-sm font-medium text-slate-500">{label}</p><p className="mt-2 text-3xl font-bold text-slate-900">{value}</p></div>
                  <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-lg ${tone}`}><Icon className="h-5 w-5" /></span>
                </div>
                <p className="mt-3 text-xs text-slate-500">{detail}</p>
              </Link>
            ))}
          </div>

          <div className="mt-5 rounded-xl border border-slate-200 bg-white p-4">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-400">Quick actions</p>
            <div className="flex flex-wrap gap-2">{actions.map(([label, href]) => <Link key={label} href={href} className="rounded-lg bg-blue-50 px-3 py-2 text-sm font-semibold text-blue-700 transition hover:bg-blue-100">{label}</Link>)}</div>
          </div>

          {!filteredAttendance.length ? <div className="mt-5"><EmptyState title="No overview data" description="No demo records match the selected filters." /></div> : (
            <>
              <div className="mt-5 grid gap-5 xl:grid-cols-[1.5fr_1fr]">
                <Panel title="Attendance overview">
                  <div className="grid gap-6 p-5 lg:grid-cols-[180px_1fr]">
                    <div className="flex flex-col justify-center rounded-xl bg-slate-950 p-5 text-white">
                      <p className="text-sm text-slate-300">Overall attendance</p>
                      <p className="mt-2 text-4xl font-bold">86%</p>
                      <div className="mt-5 space-y-2 text-sm"><p className="flex justify-between"><span className="text-slate-300">Present</span><strong>1,204</strong></p><p className="flex justify-between"><span className="text-slate-300">Absent</span><strong>196</strong></p></div>
                    </div>
                    <div>
                      <p className="text-xs font-medium uppercase tracking-wider text-slate-400">Weekly attendance</p>
                      <div className="mt-6 flex h-44 items-end gap-3">
                        {[82, 76, 88, 91, 86].map((value, index) => (
                          <div key={["Mon", "Tue", "Wed", "Thu", "Fri"][index]} className="flex h-full flex-1 flex-col items-center justify-end gap-2">
                            <span className="text-xs font-semibold text-slate-600">{value}%</span>
                            <div className="w-full rounded-t-md bg-blue-600" style={{ height: `${value}%` }} />
                            <span className="text-xs text-slate-500">{["Mon", "Tue", "Wed", "Thu", "Fri"][index]}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </Panel>
                <Panel title="Readiness summary" action={<Link href="/head-coach/readiness" className="text-xs font-semibold text-blue-600">View all</Link>}>
                  <div className="p-5">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="rounded-xl bg-emerald-50 p-4"><p className="text-xs text-emerald-700">Ready</p><p className="mt-2 text-3xl font-bold text-emerald-900">142</p></div>
                      <div className="rounded-xl bg-amber-50 p-4"><p className="text-xs text-amber-700">Not ready</p><p className="mt-2 text-3xl font-bold text-amber-900">106</p></div>
                    </div>
                    {[["Attendance eligibility", 86], ["Completed match eligibility", 64]].map(([label, value]) => (
                      <div key={String(label)} className="mt-5"><div className="mb-2 flex justify-between text-sm"><span className="text-slate-600">{label}</span><strong>{value}%</strong></div><div className="h-2 rounded-full bg-slate-100"><div className="h-full rounded-full bg-blue-600" style={{ width: `${value}%` }} /></div></div>
                    ))}
                  </div>
                </Panel>
              </div>

              <div className="mt-5 grid gap-5 xl:grid-cols-2">
                <Panel title="Sport-wise attendance">
                  <div className="divide-y divide-slate-100 px-5">{filteredAttendance.map((item) => <div key={item.sport} className="py-4"><div className="mb-2 flex justify-between text-sm"><span className="font-medium text-slate-700">{item.sport}</span><span className="font-semibold text-slate-900">{item.present}% present</span></div><div className="flex h-2 overflow-hidden rounded-full bg-slate-100"><div className="bg-blue-600" style={{ width: `${item.present}%` }} /><div className="bg-amber-400" style={{ width: `${item.absent}%` }} /></div></div>)}</div>
                </Panel>
                <Panel title="Academy performance">
                  <div className="p-5">
                    {[["Overall score", 79], ["Attendance impact", 86], ["Match participation", 72]].map(([label, value]) => <div key={String(label)} className="mb-5 last:mb-0"><div className="mb-2 flex justify-between text-sm"><span className="text-slate-600">{label}</span><strong>{value}%</strong></div><div className="h-2 rounded-full bg-slate-100"><div className="h-full rounded-full bg-violet-500" style={{ width: `${value}%` }} /></div></div>)}
                  </div>
                </Panel>
              </div>

              <div className="mt-5 grid gap-5 xl:grid-cols-[1.3fr_1fr]">
                <Panel title="Performance by sport">
                  {filteredPerformance.length ? <div className="overflow-x-auto"><table className="w-full min-w-[500px] text-left text-sm"><thead className="bg-slate-50 text-xs uppercase text-slate-500"><tr><th className="px-5 py-3">Sport</th><th className="px-5 py-3">Players</th><th className="px-5 py-3">Performance score</th><th className="px-5 py-3">Trend</th></tr></thead><tbody className="divide-y divide-slate-100">{filteredPerformance.map((item) => <tr key={item.sport}><td className="px-5 py-4 font-medium text-slate-800">{item.sport}</td><td className="px-5 py-4 text-slate-600">{item.players}</td><td className="px-5 py-4 font-semibold">{item.score}/100</td><td className="px-5 py-4 text-emerald-600">↑ Monthly</td></tr>)}</tbody></table></div> : <EmptyState title="No sport performance" description="Select a sport with demo records." />}
                </Panel>
                <Panel title="Monthly performance trend">
                  <div className="flex h-64 items-end gap-3 px-5 pb-5 pt-8">
                    {[68, 71, 69, 76, 79, 82].map((value, index) => <div key={index} className="flex h-full flex-1 flex-col items-center justify-end gap-2"><span className="text-xs text-slate-500">{value}</span><div className="w-full rounded-t-md bg-blue-600" style={{ height: `${value}%` }} /><span className="text-xs text-slate-400">{["Jun", "Jul", "Aug", "Sep", "Oct", "Nov"][index]}</span></div>)}
                  </div>
                </Panel>
              </div>

              <div className="mt-5 grid gap-5 xl:grid-cols-2">
                <Panel title="Coach management summary" action={<Link href="/head-coach/coaches" className="text-xs font-semibold text-blue-600">Manage coaches</Link>}>
                  <div className="divide-y divide-slate-100 px-5">{coaches.map((coach) => <div key={coach.name} className="flex items-center gap-3 py-4"><div className="grid h-10 w-10 place-items-center rounded-full bg-blue-100 text-xs font-bold text-blue-700">{coach.initials}</div><div className="min-w-0 flex-1"><p className="font-medium text-slate-800">{coach.name}</p><p className="truncate text-xs text-slate-500">{coach.sports}</p></div><div className="text-right"><p className="text-xs text-slate-500">{coach.players} players</p><StatusBadge>{coach.status}</StatusBadge></div></div>)}</div>
                </Panel>
                <Panel title="Recent activity">
                  <div className="divide-y divide-slate-100 px-5">{[["Attendance marked", "Football squad · 10 min ago"], ["Player registered", "Kabir Singh joined Athletics · 32 min ago"], ["Session created", "Cricket practice · 1 hr ago"], ["Match completed", "District League · 3 hr ago"], ["Score updated", "Arjun Patel · 5 hr ago"]].map(([action, detail]) => <div key={action} className="py-3.5"><p className="text-sm font-medium text-slate-800">{action}</p><p className="mt-1 text-xs text-slate-500">{detail}</p></div>)}</div>
                </Panel>
              </div>

              <div className="mt-5 grid gap-5 xl:grid-cols-2">
                <Panel title="Recent matches" action={<Link href="/head-coach/matches" className="text-xs font-semibold text-blue-600">View matches</Link>}><div className="divide-y divide-slate-100 px-5">{[["District League", "Won 3–1", "Football"], ["Academy Cup", "Draw 2–2", "Cricket"], ["Junior Meet", "Won 2–0", "Swimming"]].map(([match, result, sportName]) => <div key={match} className="flex items-center justify-between py-4"><div><p className="text-sm font-medium text-slate-800">{match}</p><p className="mt-1 text-xs text-slate-500">{sportName}</p></div><StatusBadge tone={result.startsWith("Won") ? "green" : "blue"}>{result}</StatusBadge></div>)}</div></Panel>
                <Panel title="Upcoming matches"><div className="divide-y divide-slate-100 px-5">{[["07 Nov", "Football", "Rising Stars FC"], ["12 Nov", "Cricket", "City Academy"], ["15 Nov", "Swimming", "Blue Dolphins"]].map(([date, sportName, opponent]) => <div key={date} className="flex items-center gap-4 py-4"><div className="rounded-lg bg-blue-50 px-3 py-2 text-xs font-bold text-blue-700">{date}</div><div><p className="text-sm font-medium text-slate-800">{opponent}</p><p className="mt-1 text-xs text-slate-500">{sportName}</p></div></div>)}</div></Panel>
              </div>
            </>
          )}
        </>
      )}
    </DashboardShell>
  );
}
