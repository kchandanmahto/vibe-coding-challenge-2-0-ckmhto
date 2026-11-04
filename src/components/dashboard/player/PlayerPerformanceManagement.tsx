"use client";

import { ChevronLeft, ChevronRight, Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { DashboardShell } from "../DashboardShell";
import { Panel, StatCard, StatusBadge } from "../Dashboard";
import { EmptyState, LoadingState, PageHeader } from "../DashboardUI";
import { currentPlayer } from "./playerOverviewData";
import { playerAttendanceRecords } from "./playerAttendanceData";

const pageSize = 7;

type HistoryRecord = {
  id: string;
  date: string;
  type: "Attendance" | "Match score";
  sport: string;
  name: string;
  result: string;
};

const inputClass = "h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-blue-500";

function formatDate(date: string) {
  return new Intl.DateTimeFormat("en-IN", { day: "2-digit", month: "short", year: "numeric", timeZone: "UTC" })
    .format(new Date(`${date}T00:00:00Z`));
}

export function PlayerPerformanceManagement() {
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [sport, setSport] = useState("All sports");
  const [recordType, setRecordType] = useState("All records");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [sort, setSort] = useState("Newest first");
  const [page, setPage] = useState(1);

  useEffect(() => {
    const timer = window.setTimeout(() => setLoading(false), 350);
    return () => window.clearTimeout(timer);
  }, []);

  const present = playerAttendanceRecords.filter((record) => record.status === "Present").length;
  const absent = playerAttendanceRecords.filter((record) => record.status === "Absent").length;
  const totalSessions = present + absent;
  const attendance = totalSessions ? Math.round((present / totalSessions) * 100) : 0;
  const completedMatches = currentPlayer.completedMatches;
  const availableScores = currentPlayer.matchHistory.length;
  const ready = attendance >= 75 && completedMatches >= 2;

  const history = useMemo<HistoryRecord[]>(() => {
    const attendanceHistory: HistoryRecord[] = playerAttendanceRecords.map((record) => ({
      id: record.id,
      date: record.date,
      type: "Attendance",
      sport: record.sport,
      name: record.sessionName,
      result: record.status,
    }));
    const scoreHistory: HistoryRecord[] = currentPlayer.matchHistory.map((match, index) => {
      const parsed = new Date(`${match.date.replace(/ (\d{4})$/, "-$1").replace(/ /, "-")}`);
      const isoDate = Number.isNaN(parsed.getTime())
        ? match.date
        : parsed.toISOString().slice(0, 10);
      return {
        id: `SCR-${index + 1}`,
        date: isoDate,
        type: "Match score",
        sport: currentPlayer.sport,
        name: match.title,
        result: String(match.score),
      };
    });
    return [...attendanceHistory, ...scoreHistory];
  }, []);

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    const records = history.filter((record) =>
      (!normalized || record.name.toLowerCase().includes(normalized) || record.result.toLowerCase().includes(normalized))
      && (sport === "All sports" || record.sport === sport)
      && (recordType === "All records" || record.type === recordType)
      && (!from || record.date >= from)
      && (!to || record.date <= to)
    );
    return [...records].sort((a, b) => sort === "Newest first" ? b.date.localeCompare(a.date) : a.date.localeCompare(b.date));
  }, [history, query, sport, recordType, from, to, sort]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
  const visible = filtered.slice((page - 1) * pageSize, page * pageSize);

  const monthlyAttendance = useMemo(() => {
    const months = ["Sep 2026", "Oct 2026", "Nov 2026"];
    return months.map((label) => {
      const [monthName, year] = label.split(" ");
      const monthIndex = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"].indexOf(monthName) + 1;
      const records = playerAttendanceRecords.filter((record) => {
        const [recordYear, recordMonth] = record.date.split("-");
        return Number(recordYear) === Number(year) && Number(recordMonth) === monthIndex;
      });
      const presentCount = records.filter((record) => record.status === "Present").length;
      return {
        label,
        percentage: records.length ? Math.round((presentCount / records.length) * 100) : 0,
        present: presentCount,
        absent: records.length - presentCount,
      };
    });
  }, []);

  const latestMatch = [...currentPlayer.matchHistory].reverse()[0];

  const updateFilter = (setter: (value: string) => void, value: string) => {
    setter(value);
    setPage(1);
  };

  return (
    <DashboardShell role="player" title="My performance" subtitle="Your attendance and match performance">
      <PageHeader title="My Performance" description="Read-only performance records for your player account" />
      {loading ? <LoadingState message="Loading performance data..." /> : (
        <div className="space-y-5">
          {totalSessions === 0 && availableScores === 0 ? <EmptyState title="No performance records" description="No attendance or match score records are available yet." /> : (
            <>
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
                <StatCard label="Attendance percentage" value={`${attendance}%`} detail="From held sessions" icon="clipboard" tone="blue" />
                <StatCard label="Total sessions" value={String(totalSessions)} detail="Held attendance records" icon="calendar" />
                <StatCard label="Completed matches" value={String(completedMatches)} detail="From performance mock data" icon="trophy" tone="violet" />
                <StatCard label="Available match scores" value={String(availableScores)} detail="Your individual scores" icon="activity" tone="green" />
                <StatCard label="Readiness" value={ready ? "Ready" : "Not Ready"} detail={ready ? "All conditions met" : "One or more conditions unmet"} icon="activity" tone={ready ? "green" : "amber"} />
              </div>

              <div className="grid gap-5 xl:grid-cols-2">
                <Panel title="Attendance performance">
                  <div className="grid grid-cols-2 gap-3 p-5 sm:grid-cols-4">
                    {[["Held sessions", totalSessions], ["Present", present], ["Absent", absent], ["Attendance", `${attendance}%`]].map(([label, value]) => <div key={String(label)} className="rounded-lg bg-slate-50 p-3"><p className="text-xs text-slate-500">{label}</p><p className="mt-1 text-xl font-bold text-slate-800">{value}</p></div>)}
                  </div>
                  <div className="border-t border-slate-100 p-5">
                    <h3 className="mb-4 text-sm font-semibold text-slate-700">Monthly attendance trend</h3>
                    <div className="flex h-44 items-end gap-3">
                      {monthlyAttendance.map((month) => <div key={month.label} className="flex flex-1 flex-col items-center justify-end gap-2"><span className="text-xs font-semibold text-slate-600">{month.percentage}%</span><div title={`${month.present} present, ${month.absent} absent`} className="w-full rounded-t bg-blue-500" style={{ height: `${Math.max(month.percentage, 4) * 1.15}px`, maxHeight: "140px" }} /><span className="text-center text-[11px] text-slate-500">{month.label}</span></div>)}
                    </div>
                  </div>
                </Panel>
                <Panel title="Attendance composition">
                  <div className="p-5">
                    <div className="flex h-10 overflow-hidden rounded-lg bg-slate-100" aria-label={`${present} present and ${absent} absent sessions`}>
                      <div className="bg-emerald-500" style={{ width: `${totalSessions ? present / totalSessions * 100 : 0}%` }} />
                      <div className="bg-amber-400" style={{ width: `${totalSessions ? absent / totalSessions * 100 : 0}%` }} />
                    </div>
                    <div className="mt-4 grid grid-cols-2 gap-3"><div className="rounded-lg border border-slate-200 p-4"><span className="inline-block h-2.5 w-2.5 rounded-full bg-emerald-500" /><p className="mt-2 text-sm text-slate-500">Present sessions</p><p className="text-2xl font-bold text-slate-800">{present}</p></div><div className="rounded-lg border border-slate-200 p-4"><span className="inline-block h-2.5 w-2.5 rounded-full bg-amber-400" /><p className="mt-2 text-sm text-slate-500">Absent sessions</p><p className="text-2xl font-bold text-slate-800">{absent}</p></div></div>
                  </div>
                </Panel>
              </div>

              <div className="grid gap-5 xl:grid-cols-[1fr_1.2fr]">
                <Panel title="Match performance">
                  {availableScores ? (
                    <div className="space-y-4 p-5">
                      <div className="grid grid-cols-2 gap-3"><div className="rounded-lg bg-slate-50 p-4"><p className="text-xs text-slate-500">Completed matches</p><p className="mt-1 text-2xl font-bold">{completedMatches}</p></div><div className="rounded-lg bg-slate-50 p-4"><p className="text-xs text-slate-500">Latest completed match</p><p className="mt-1 font-semibold">{latestMatch?.title ?? "Unavailable"}</p></div></div>
                      <div>
                        <p className="text-sm font-semibold text-slate-700">Football match score history</p>
                        <div className="mt-3 space-y-2">{[...currentPlayer.matchHistory].reverse().map((match) => <div key={`${match.title}-${match.date}`} className="flex items-center justify-between rounded-lg border border-slate-100 px-3 py-2 text-sm"><span><strong className="text-slate-700">{match.title}</strong><span className="ml-2 text-xs text-slate-500">{match.date}</span></span><span className="font-bold text-blue-700">{match.score}</span></div>)}</div>
                      </div>
                    </div>
                  ) : <EmptyState title="No score data available" description="No individual match scores are available for this player." />}
                </Panel>
                <Panel title="Score history">
                  {availableScores ? (
                    <div className="p-5">
                      <div className="flex h-44 items-end gap-3">
                        {[...currentPlayer.matchHistory].reverse().map((match) => <div key={`${match.title}-${match.date}`} className="flex h-full flex-1 flex-col items-center justify-end gap-2"><span className="text-xs font-semibold">{match.score}</span><div className="w-full rounded-t bg-violet-500" style={{ height: `${match.score}px`, maxHeight: "130px" }} title={match.title} /><span className="max-w-full truncate text-[10px] text-slate-500">{match.title}</span></div>)}
                      </div>
                    </div>
                  ) : <EmptyState title="No comparable scores" description="Match scores are shown only when the scoring format is comparable." />}
                </Panel>
              </div>

              <div className="grid gap-5 xl:grid-cols-[1.15fr_.85fr]">
                <Panel title="Readiness status">
                  <div className="p-5">
                    <div className="flex items-center justify-between rounded-xl bg-slate-50 p-4"><div><p className="text-sm font-medium text-slate-600">Current readiness</p><p className="mt-1 text-2xl font-bold text-slate-900">{ready ? "Ready" : "Not Ready"}</p></div><StatusBadge tone={ready ? "green" : "amber"}>{ready ? "Criteria met" : "Criteria not met"}</StatusBadge></div>
                    <div className="mt-3 space-y-2">
                      {[{ label: "Attendance >= 75%", met: attendance >= 75, detail: `${attendance}% recorded attendance` }, { label: "At least 2 completed matches", met: completedMatches >= 2, detail: `${completedMatches} completed matches` }].map((condition) => <div key={condition.label} className="flex items-center justify-between rounded-lg border border-slate-100 px-3 py-3 text-sm"><span><strong className="block text-slate-700">{condition.label}</strong><span className="text-xs text-slate-500">{condition.detail}</span></span><StatusBadge tone={condition.met ? "green" : "amber"}>{condition.met ? "Met" : "Not met"}</StatusBadge></div>)}
                    </div>
                  </div>
                </Panel>
                <Panel title="Performance insights">
                  <div className="space-y-3 p-5 text-sm text-slate-600">
                    <p className="rounded-lg bg-blue-50 p-3">Attendance is <strong className="text-blue-700">{attendance >= 75 ? "above" : "below"}</strong> the 75% readiness threshold at {attendance}%.</p>
                    <p className="rounded-lg bg-violet-50 p-3">Your mock performance record includes <strong className="text-violet-700">{completedMatches} completed matches</strong>.</p>
                    <p className="rounded-lg bg-slate-50 p-3">{ready ? "Both readiness conditions are currently satisfied." : "Readiness remains Not Ready until every documented condition is satisfied."}</p>
                  </div>
                </Panel>
              </div>

              <Panel title="Performance history">
                <div className="grid gap-3 border-b border-slate-100 p-4 lg:grid-cols-[1fr_repeat(4,minmax(130px,auto))]">
                  <label className="relative"><span className="sr-only">Search performance history</span><Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" /><input value={query} onChange={(event) => updateFilter(setQuery, event.target.value)} placeholder="Search record" className={`${inputClass} w-full pl-9`} /></label>
                  <select aria-label="Sport filter" value={sport} onChange={(event) => updateFilter(setSport, event.target.value)} className={inputClass}><option>All sports</option><option>Football</option><option>Athletics</option></select>
                  <select aria-label="Record type filter" value={recordType} onChange={(event) => updateFilter(setRecordType, event.target.value)} className={inputClass}><option>All records</option><option>Attendance</option><option>Match score</option></select>
                  <input aria-label="History from date" type="date" value={from} onChange={(event) => updateFilter(setFrom, event.target.value)} className={inputClass} />
                  <input aria-label="History to date" type="date" value={to} onChange={(event) => updateFilter(setTo, event.target.value)} className={inputClass} />
                </div>
                {filtered.length ? (
                  <>
                    <div className="flex justify-end border-b border-slate-100 px-4 py-2"><select aria-label="Sort performance history" value={sort} onChange={(event) => updateFilter(setSort, event.target.value)} className="rounded-lg border border-slate-200 px-2 py-1 text-sm"><option>Newest first</option><option>Oldest first</option></select></div>
                    <div className="overflow-x-auto">
                      <table className="w-full min-w-[700px] text-left text-sm">
                        <thead className="bg-slate-50 text-xs uppercase text-slate-500"><tr><th className="px-5 py-3 font-medium">Date</th><th className="px-5 py-3 font-medium">Record type</th><th className="px-5 py-3 font-medium">Sport</th><th className="px-5 py-3 font-medium">Match or session</th><th className="px-5 py-3 font-medium text-right">Attendance / score</th></tr></thead>
                        <tbody className="divide-y divide-slate-100">{visible.map((record) => {
                          const displayDate = /^\d{4}-\d{2}-\d{2}$/.test(record.date) ? formatDate(record.date) : record.date;
                          return <tr key={record.id}><td className="px-5 py-4 text-slate-500">{displayDate}</td><td className="px-5 py-4"><StatusBadge tone={record.type === "Attendance" ? "blue" : "amber"}>{record.type}</StatusBadge></td><td className="px-5 py-4 text-slate-500">{record.sport}</td><td className="px-5 py-4 font-medium text-slate-800">{record.name}</td><td className="px-5 py-4 text-right font-semibold text-slate-700">{record.result}</td></tr>;
                        })}</tbody>
                      </table>
                    </div>
                    <div className="flex items-center justify-between border-t border-slate-100 px-4 py-3 text-sm"><span className="text-slate-500">{filtered.length} records</span><div className="flex items-center gap-2"><button type="button" aria-label="Previous page" disabled={page === 1} onClick={() => setPage((value) => value - 1)} className="grid h-8 w-8 place-items-center rounded border border-slate-200 disabled:opacity-40"><ChevronLeft className="h-4 w-4" /></button><span>{page} / {pageCount}</span><button type="button" aria-label="Next page" disabled={page === pageCount} onClick={() => setPage((value) => value + 1)} className="grid h-8 w-8 place-items-center rounded border border-slate-200 disabled:opacity-40"><ChevronRight className="h-4 w-4" /></button></div></div>
                  </>
                ) : <EmptyState title="No matching records" description="No performance records match the selected filters." />}
              </Panel>
            </>
          )}
        </div>
      )}
    </DashboardShell>
  );
}
