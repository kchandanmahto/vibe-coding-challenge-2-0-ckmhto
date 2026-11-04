"use client";

import { useEffect, useState, type ReactNode } from "react";
import { Download, Printer, RotateCcw, Search } from "lucide-react";
import { DashboardShell } from "../DashboardShell";
import { EmptyState, LoadingState, PageHeader } from "../DashboardUI";
import { Panel, StatusBadge } from "../Dashboard";

type ReportType = "Academy Summary" | "Player Reports" | "Attendance Reports" | "Match Reports" | "Performance Reports";
type Player = { id: string; name: string; sport: string; coach: string; attendance: number; matches: number; ready: boolean };
type Attendance = { id: string; date: string; player: string; sport: string; coach: string; status: "Present" | "Absent" };
type Match = { id: string; title: string; sport: string; coach: string; date: string; result: string; participants: { id: string; name: string; score: number }[] };
type Performance = { playerId: string; name: string; sport: string; coach: string; scores: { matchId: string; date: string; score: number }[] };

const reportPlayers: Player[] = [
  { id: "AD-1042", name: "Arjun Patel", sport: "Football", coach: "Raj Kumar", attendance: 92, matches: 12, ready: true },
  { id: "AD-1088", name: "Meera Shah", sport: "Football", coach: "Raj Kumar", attendance: 88, matches: 9, ready: true },
  { id: "AD-1121", name: "Vihaan Rao", sport: "Cricket", coach: "Imran Ali", attendance: 75, matches: 1, ready: false },
  { id: "AD-1145", name: "Ishaan Verma", sport: "Swimming", coach: "Neha Rao", attendance: 86, matches: 6, ready: true },
  { id: "AD-1192", name: "Kabir Singh", sport: "Athletics", coach: "Neha Rao", attendance: 68, matches: 1, ready: false },
];
const attendanceRows: Attendance[] = [
  { id: "ATR-01", date: "2026-10-28", player: "Arjun Patel", sport: "Football", coach: "Raj Kumar", status: "Present" },
  { id: "ATR-02", date: "2026-10-28", player: "Meera Shah", sport: "Football", coach: "Raj Kumar", status: "Present" },
  { id: "ATR-03", date: "2026-10-28", player: "Vihaan Rao", sport: "Cricket", coach: "Imran Ali", status: "Absent" },
  { id: "ATR-04", date: "2026-10-27", player: "Ishaan Verma", sport: "Swimming", coach: "Neha Rao", status: "Present" },
  { id: "ATR-05", date: "2026-10-27", player: "Kabir Singh", sport: "Athletics", coach: "Neha Rao", status: "Absent" },
  { id: "ATR-06", date: "2026-10-21", player: "Arjun Patel", sport: "Football", coach: "Raj Kumar", status: "Absent" },
];
const matches: Match[] = [
  { id: "MAT-2001", title: "District Football League", sport: "Football", coach: "Raj Kumar", date: "2026-10-07", result: "4-2 win", participants: [{ id: "AD-1042", name: "Arjun Patel", score: 78 }, { id: "AD-1088", name: "Meera Shah", score: 84 }] },
  { id: "MAT-2011", title: "Academy Cricket Championship", sport: "Cricket", coach: "Imran Ali", date: "2026-10-12", result: "16-run win", participants: [{ id: "AD-1121", name: "Vihaan Rao", score: 68 }] },
  { id: "MAT-2021", title: "Junior Swimming Meet", sport: "Swimming", coach: "Neha Rao", date: "2026-10-21", result: "1st overall", participants: [{ id: "AD-1145", name: "Ishaan Verma", score: 91 }] },
  { id: "MAT-2031", title: "City Athletics Trial", sport: "Athletics", coach: "Neha Rao", date: "2026-10-18", result: "Participation recorded", participants: [{ id: "AD-1192", name: "Kabir Singh", score: 62 }] },
];
const performance: Performance[] = [
  { playerId: "AD-1042", name: "Arjun Patel", sport: "Football", coach: "Raj Kumar", scores: [{ matchId: "MAT-2001", date: "2026-10-07", score: 78 }, { matchId: "MAT-2002", date: "2026-09-19", score: 82 }, { matchId: "MAT-2003", date: "2026-08-22", score: 76 }] },
  { playerId: "AD-1088", name: "Meera Shah", sport: "Football", coach: "Raj Kumar", scores: [{ matchId: "MAT-2001", date: "2026-10-07", score: 84 }, { matchId: "MAT-2002", date: "2026-09-19", score: 81 }] },
  { playerId: "AD-1121", name: "Vihaan Rao", sport: "Cricket", coach: "Imran Ali", scores: [{ matchId: "MAT-2011", date: "2026-10-12", score: 68 }] },
  { playerId: "AD-1145", name: "Ishaan Verma", sport: "Swimming", coach: "Neha Rao", scores: [{ matchId: "MAT-2021", date: "2026-10-21", score: 91 }, { matchId: "MAT-2024", date: "2026-09-08", score: 87 }] },
  { playerId: "AD-1192", name: "Kabir Singh", sport: "Athletics", coach: "Neha Rao", scores: [{ matchId: "MAT-2031", date: "2026-10-18", score: 62 }] },
];

const reports: ReportType[] = ["Academy Summary", "Player Reports", "Attendance Reports", "Match Reports", "Performance Reports"];

function Metric({ label, value }: { label: string; value: ReactNode }) {
  return <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 print:border-slate-300"><p className="text-xs font-medium text-slate-500">{label}</p><p className="mt-2 text-2xl font-bold text-slate-900">{value}</p></div>;
}

function HorizontalBars({ rows }: { rows: { label: string; value: number }[] }) {
  const max = Math.max(...rows.map((row) => row.value), 1);
  return <div className="space-y-3">{rows.map((row) => <div key={row.label}><div className="mb-1 flex justify-between text-xs"><span className="text-slate-600">{row.label}</span><strong>{row.value}</strong></div><div className="h-2.5 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-blue-600" style={{ width: `${row.value / max * 100}%` }} /></div></div>)}</div>;
}

export function ReportsManagement() {
  const [loading, setLoading] = useState(true);
  const [report, setReport] = useState<ReportType>("Academy Summary");
  const [sport, setSport] = useState("All sports");
  const [coach, setCoach] = useState("All coaches");
  const [player, setPlayer] = useState("All players");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [query, setQuery] = useState("");
  const [period, setPeriod] = useState("All attendance");
  const [currentDate, setCurrentDate] = useState("Pending generation");

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setLoading(false);
      setCurrentDate(new Date().toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" }));
    }, 350);
    return () => window.clearTimeout(timer);
  }, []);
  const dateError = Boolean(from && to && from > to);
  const playerRows = reportPlayers.filter((row) => (sport === "All sports" || row.sport === sport) && (coach === "All coaches" || row.coach === coach) && (player === "All players" || row.name === player) && (!query.trim() || `${row.name} ${row.id}`.toLowerCase().includes(query.trim().toLowerCase())));
  const attendanceRowsFiltered = attendanceRows.filter((row) => (sport === "All sports" || row.sport === sport) && (coach === "All coaches" || row.coach === coach) && (player === "All players" || row.player === player) && (!from || row.date >= from) && (!to || row.date <= to));
  const matchRows = matches.filter((row) => (sport === "All sports" || row.sport === sport) && (coach === "All coaches" || row.coach === coach) && (!from || row.date >= from) && (!to || row.date <= to) && (player === "All players" || row.participants.some((participant) => participant.name === player)));
  const performanceRows = performance.filter((row) => (sport === "All sports" || row.sport === sport) && (coach === "All coaches" || row.coach === coach) && (player === "All players" || row.name === player));
  const attendanceRate = attendanceRowsFiltered.length ? Math.round(attendanceRowsFiltered.filter((row) => row.status === "Present").length / attendanceRowsFiltered.length * 100) : 0;
  const sports = ["Football", "Cricket", "Swimming", "Athletics"];
  const coaches = ["Raj Kumar", "Imran Ali", "Neha Rao"];

  const reset = () => { setSport("All sports"); setCoach("All coaches"); setPlayer("All players"); setFrom(""); setTo(""); setQuery(""); setPeriod("All attendance"); };
  const resultCount = report === "Player Reports" ? playerRows.length : report === "Attendance Reports" ? attendanceRowsFiltered.length : report === "Match Reports" ? matchRows.length : report === "Performance Reports" ? performanceRows.length : 1;
  const preview = () => {
    if (report === "Player Reports") return playerRows.length ? <div className="overflow-x-auto"><table className="w-full min-w-[760px] text-left text-sm"><thead className="bg-slate-50 text-xs uppercase text-slate-500"><tr><th className="px-4 py-3">Player</th><th className="px-4 py-3">Sport</th><th className="px-4 py-3">Coach</th><th className="px-4 py-3">Attendance</th><th className="px-4 py-3">Completed matches</th><th className="px-4 py-3">Readiness</th></tr></thead><tbody className="divide-y divide-slate-100">{playerRows.map((row) => <tr key={row.id}><td className="px-4 py-3"><strong className="block text-slate-800">{row.name}</strong><span className="text-xs text-slate-500">{row.id}</span></td><td className="px-4 py-3">{row.sport}</td><td className="px-4 py-3">{row.coach}</td><td className="px-4 py-3">{row.attendance}%</td><td className="px-4 py-3">{row.matches}</td><td className="px-4 py-3"><StatusBadge tone={row.ready ? "green" : "amber"}>{row.ready ? "Ready" : "Not Ready"}</StatusBadge></td></tr>)}</tbody></table></div> : <EmptyState title="No player report records" description="Change the report filters to include demonstration player records." />;
    if (report === "Attendance Reports") return attendanceRowsFiltered.length ? <><div className="grid gap-3 sm:grid-cols-3"><Metric label={`${period} records`} value={attendanceRowsFiltered.length} /><Metric label="Present" value={attendanceRowsFiltered.filter((row) => row.status === "Present").length} /><Metric label="Attendance" value={`${attendanceRate}%`} /></div><div className="mt-5 overflow-x-auto rounded-xl border border-slate-200"><table className="w-full min-w-[720px] text-left text-sm"><thead className="bg-slate-50 text-xs uppercase text-slate-500"><tr><th className="px-4 py-3">Date</th><th className="px-4 py-3">Player</th><th className="px-4 py-3">Sport</th><th className="px-4 py-3">Coach</th><th className="px-4 py-3">Status</th></tr></thead><tbody className="divide-y divide-slate-100">{attendanceRowsFiltered.map((row) => <tr key={row.id}><td className="px-4 py-3">{new Date(`${row.date}T00:00:00`).toLocaleDateString()}</td><td className="px-4 py-3 font-medium">{row.player}</td><td className="px-4 py-3">{row.sport}</td><td className="px-4 py-3">{row.coach}</td><td className="px-4 py-3"><StatusBadge tone={row.status === "Present" ? "green" : "amber"}>{row.status}</StatusBadge></td></tr>)}</tbody></table></div></> : <EmptyState title="No attendance records" description="No mock attendance records match the selected report filters." />;
    if (report === "Match Reports") return matchRows.length ? <div className="overflow-x-auto"><table className="w-full min-w-[820px] text-left text-sm"><thead className="bg-slate-50 text-xs uppercase text-slate-500"><tr><th className="px-4 py-3">Match</th><th className="px-4 py-3">Sport</th><th className="px-4 py-3">Date</th><th className="px-4 py-3">Participants and scores</th><th className="px-4 py-3">Result</th></tr></thead><tbody className="divide-y divide-slate-100">{matchRows.map((row) => <tr key={row.id}><td className="px-4 py-3"><strong className="block text-slate-800">{row.title}</strong><span className="text-xs text-slate-500">{row.id}</span></td><td className="px-4 py-3">{row.sport}</td><td className="px-4 py-3">{new Date(`${row.date}T00:00:00`).toLocaleDateString()}</td><td className="px-4 py-3">{row.participants.map((participant) => `${participant.name}: ${participant.score}`).join("; ")}</td><td className="px-4 py-3">{row.result}</td></tr>)}</tbody></table></div> : <EmptyState title="No match report records" description="No mock completed matches match the selected filters." />;
    if (report === "Performance Reports") {
      const performanceWithScores = performanceRows.filter((row) => row.scores.length);
      return performanceWithScores.length ? <><div className="grid gap-5 lg:grid-cols-2"><Panel title="Player average scores"><div className="p-5"><HorizontalBars rows={performanceWithScores.map((row) => ({ label: row.name, value: Number((row.scores.reduce((sum, score) => sum + score.score, 0) / row.scores.length).toFixed(1)) }))} /></div></Panel><Panel title="Sport-wise average"><div className="p-5"><HorizontalBars rows={sports.map((sportName) => { const scores = performanceWithScores.filter((row) => row.sport === sportName).flatMap((row) => row.scores.map((score) => score.score)); return { label: sportName, value: scores.length ? Number((scores.reduce((sum, score) => sum + score, 0) / scores.length).toFixed(1)) : 0 }; }).filter((row) => row.value > 0)} /></div></Panel></div><div className="mt-5 overflow-x-auto rounded-xl border border-slate-200"><table className="w-full min-w-[700px] text-left text-sm"><thead className="bg-slate-50 text-xs uppercase text-slate-500"><tr><th className="px-4 py-3">Player</th><th className="px-4 py-3">Sport</th><th className="px-4 py-3">Recorded scores</th><th className="px-4 py-3">Average</th></tr></thead><tbody className="divide-y divide-slate-100">{performanceWithScores.map((row) => <tr key={row.playerId}><td className="px-4 py-3 font-medium">{row.name}</td><td className="px-4 py-3">{row.sport}</td><td className="px-4 py-3">{row.scores.map((score) => score.score).join(", ")}</td><td className="px-4 py-3 font-semibold">{(row.scores.reduce((sum, score) => sum + score.score, 0) / row.scores.length).toFixed(1)}</td></tr>)}</tbody></table></div></> : <EmptyState title="No performance records" description="No mock performance scores match these filters." />;
    }
    return <><div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4"><Metric label="Total players" value={playerRows.length} /><Metric label="Coaches represented" value={new Set(playerRows.map((row) => row.coach)).size} /><Metric label="Sports represented" value={new Set(playerRows.map((row) => row.sport)).size} /><Metric label="Ready players" value={playerRows.filter((row) => row.ready).length} /><Metric label="Sessions with records" value={new Set(attendanceRowsFiltered.map((row) => row.id)).size} /><Metric label="Attendance" value={`${attendanceRate}%`} /><Metric label="Completed matches" value={matchRows.length} /><Metric label="Not ready players" value={playerRows.filter((row) => !row.ready).length} /></div><div className="mt-5 grid gap-5 lg:grid-cols-2"><Panel title="Players by sport"><div className="p-5"><HorizontalBars rows={sports.map((sportName) => ({ label: sportName, value: playerRows.filter((row) => row.sport === sportName).length })).filter((row) => row.value > 0)} /></div></Panel><Panel title="Readiness summary"><div className="p-5"><HorizontalBars rows={[{ label: "Ready", value: playerRows.filter((row) => row.ready).length }, { label: "Not Ready", value: playerRows.filter((row) => !row.ready).length }]} /></div></Panel></div></>;
  };

  return <DashboardShell role="head-coach" title="Reports" subtitle="Demonstration data · Print-ready report previews">
    <PageHeader title="Reports Management" description="Demonstration data · Generate and print filtered report previews" action={<button onClick={() => window.print()} className="inline-flex h-11 items-center gap-2 rounded-lg bg-blue-600 px-4 text-sm font-semibold text-white"><Printer className="h-4 w-4" />Print report</button>} />
    {loading ? <LoadingState message="Preparing report preview..." /> : dateError ? <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-6"><h2 className="font-semibold text-red-800">Invalid date range</h2><p className="mt-1 text-sm text-red-700">The start date must be on or before the end date.</p><button onClick={() => { setFrom(""); setTo(""); }} className="mt-4 rounded-lg bg-white px-4 py-2 text-sm font-semibold text-red-700">Clear dates</button></div> : <div className="space-y-5">
      <Panel title="Report filters">
        <div className="grid gap-3 p-4 lg:grid-cols-[minmax(180px,1fr)_150px_150px_150px_140px_140px]">
          <label className="relative"><span className="sr-only">Search report data</span><Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search player or ID..." className="h-10 w-full rounded-lg border border-slate-200 pl-9 pr-3 text-sm" /></label>
          <select aria-label="Report type" value={report} onChange={(event) => setReport(event.target.value as ReportType)} className="h-10 rounded-lg border border-slate-200 px-3 text-sm">{reports.map((item) => <option key={item}>{item}</option>)}</select>
          <select aria-label="Sport filter" value={sport} onChange={(event) => setSport(event.target.value)} className="h-10 rounded-lg border border-slate-200 px-3 text-sm"><option>All sports</option>{sports.map((item) => <option key={item}>{item}</option>)}</select>
          <select aria-label="Coach filter" value={coach} onChange={(event) => setCoach(event.target.value)} className="h-10 rounded-lg border border-slate-200 px-3 text-sm"><option>All coaches</option>{coaches.map((item) => <option key={item}>{item}</option>)}</select>
          <input aria-label="Date from" type="date" value={from} onChange={(event) => setFrom(event.target.value)} className="h-10 rounded-lg border border-slate-200 px-3 text-sm" />
          <input aria-label="Date to" type="date" value={to} onChange={(event) => setTo(event.target.value)} className="h-10 rounded-lg border border-slate-200 px-3 text-sm" />
        </div>
        <div className="grid gap-3 border-t border-slate-100 px-4 py-3 sm:grid-cols-[minmax(180px,1fr)_minmax(180px,1fr)_auto_auto] print:hidden">
          <select aria-label="Player filter" value={player} onChange={(event) => setPlayer(event.target.value)} className="h-10 rounded-lg border border-slate-200 px-3 text-sm"><option>All players</option>{reportPlayers.map((row) => <option key={row.id}>{row.name}</option>)}</select>
          <select aria-label="Attendance period" value={period} onChange={(event) => setPeriod(event.target.value)} className="h-10 rounded-lg border border-slate-200 px-3 text-sm"><option>All attendance</option><option>Daily</option><option>Weekly</option><option>Monthly</option><option>Sport-wise</option><option>Player-wise</option></select>
          <button onClick={reset} className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-slate-200 px-3 text-sm font-semibold text-slate-600"><RotateCcw className="h-4 w-4" />Reset</button>
          <button disabled title="PDF export is not implemented" className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-slate-200 px-3 text-sm font-semibold text-slate-400"><Download className="h-4 w-4" />Export unavailable</button>
        </div>
      </Panel>
      <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-4 border-b border-slate-100 px-5 py-5 sm:flex-row sm:items-start sm:justify-between">
          <div><p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-600">Academy Desk · Demonstration Report</p><h2 className="mt-2 text-2xl font-bold text-slate-900">{report}</h2><p className="mt-1 text-sm text-slate-500">{from || "Any start"} to {to || "Any end"}</p></div><div className="text-left text-xs text-slate-500 sm:text-right"><p>Generated</p><strong className="mt-1 block text-slate-800">{currentDate}</strong><p className="mt-1">{resultCount} filtered result{resultCount === 1 ? "" : "s"}</p></div>
        </div>
        <div className="border-b border-slate-100 bg-slate-50 px-5 py-3 text-xs text-slate-500"><strong className="text-slate-700">Selected filters:</strong> Sport: {sport}; Coach: {coach}; Player: {player}; {report === "Attendance Reports" ? `Period: ${period};` : ""} Date: {from || "Any"}–{to || "Any"}</div>
        <div className="p-4 sm:p-6">{preview()}</div>
        <div className="border-t border-slate-100 px-5 py-4 text-xs text-slate-500">Mock data only. This report preview does not represent verified academy operations and no backend reporting API has been used.</div>
      </section>
    </div>}
  </DashboardShell>;
}
