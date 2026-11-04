"use client";

import { ChevronLeft, ChevronRight, Search, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { DashboardShell } from "../DashboardShell";
import { Panel, StatCard, StatusBadge } from "../Dashboard";
import { EmptyState, LoadingState, PageHeader } from "../DashboardUI";
import { isPlayerReady } from "../coach/coachPlayersData";
import { currentPlayer } from "./playerOverviewData";
import { playerAttendanceRecords, type PlayerAttendanceRecord } from "./playerAttendanceData";

const pageSize = 8;
const inputClass = "h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-blue-500";
const monthFormatter = new Intl.DateTimeFormat("en-IN", { month: "long", year: "numeric" });

function dateLabel(date: string) {
  return new Intl.DateTimeFormat("en-IN", { day: "2-digit", month: "short", year: "numeric", timeZone: "UTC" })
    .format(new Date(`${date}T00:00:00Z`));
}

export function PlayerAttendanceManagement() {
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [sport, setSport] = useState("All sports");
  const [status, setStatus] = useState("All statuses");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [sort, setSort] = useState("Newest first");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<PlayerAttendanceRecord | null>(null);
  const [calendarMonth, setCalendarMonth] = useState(new Date(2026, 10, 1));

  useEffect(() => {
    const timer = window.setTimeout(() => setLoading(false), 350);
    return () => window.clearTimeout(timer);
  }, []);

  const present = playerAttendanceRecords.filter((record) => record.status === "Present").length;
  const absent = playerAttendanceRecords.length - present;
  const percentage = playerAttendanceRecords.length ? Math.round(present / playerAttendanceRecords.length * 100) : 0;
  const currentStatus = percentage >= 75 ? "Good standing" : "Needs improvement";
  const ready = isPlayerReady(currentPlayer);

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    const records = playerAttendanceRecords.filter((record) =>
      (!normalized || `${record.sessionName} ${record.sport}`.toLowerCase().includes(normalized))
      && (sport === "All sports" || record.sport === sport)
      && (status === "All statuses" || record.status === status)
      && (!from || record.date >= from)
      && (!to || record.date <= to)
    );
    return [...records].sort((a, b) => sort === "Newest first" ? b.date.localeCompare(a.date) : a.date.localeCompare(b.date));
  }, [query, sport, status, from, to, sort]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paged = filtered.slice((page - 1) * pageSize, page * pageSize);

  const year = calendarMonth.getFullYear();
  const month = calendarMonth.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const leadingDays = new Date(year, month, 1).getDay();
  const monthDays = Array.from({ length: daysInMonth }, (_, index) => index + 1);
  const calendarRecords = new Map(playerAttendanceRecords.map((record) => [record.date, record]));
  const upcoming = [
    { date: "2026-11-06", sessionName: "Set Piece Training" },
    { date: "2026-11-09", sessionName: "Tactical Training" },
  ];
  const upcomingMap = new Map(upcoming.map((session) => [session.date, session.sessionName]));

  const monthlyStats = useMemo(() => {
    const months = ["2026-09", "2026-10", "2026-11"];
    return months.map((monthKey) => {
      const records = playerAttendanceRecords.filter((record) => record.date.startsWith(monthKey));
      const monthPresent = records.filter((record) => record.status === "Present").length;
      return { month: monthKey, total: records.length, present: monthPresent, absent: records.length - monthPresent, percentage: records.length ? Math.round(monthPresent / records.length * 100) : 0 };
    });
  }, []);

  const updateFilter = (setter: (value: string) => void, value: string) => {
    setter(value);
    setPage(1);
  };

  return (
    <DashboardShell role="player" title="My attendance" subtitle="View your own attendance records">
      <PageHeader title="My Attendance" description="Attendance history, calendar, and trends" />
      {loading ? <LoadingState message="Loading attendance records..." /> : (
        <div className="space-y-5">
          {playerAttendanceRecords.length === 0 ? (
            <EmptyState title="No attendance data available" description="No attendance records have been added to your player account." />
          ) : (
            <>
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
                <StatCard label="Total sessions held" value={String(playerAttendanceRecords.length)} detail="Recorded player sessions" icon="calendar" />
                <StatCard label="Present sessions" value={String(present)} detail="Present attendance records" icon="clipboard" tone="green" />
                <StatCard label="Absent sessions" value={String(absent)} detail="Absent attendance records" icon="clipboard" tone="amber" />
                <StatCard label="Attendance percentage" value={`${percentage}%`} detail={`${present} of ${playerAttendanceRecords.length} sessions`} icon="activity" tone="violet" />
                <StatCard label="Current status" value={currentStatus} detail={percentage >= 75 ? "Meets attendance threshold" : "Attendance below 75%"} icon="activity" tone={percentage >= 75 ? "green" : "amber"} />
              </div>

              <Panel title="Attendance history">
                <div className="grid gap-3 border-b border-slate-100 p-4 lg:grid-cols-[1fr_repeat(4,minmax(130px,auto))]">
                  <label className="relative"><span className="sr-only">Search attendance</span><Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" /><input value={query} onChange={(event) => updateFilter(setQuery, event.target.value)} placeholder="Search session or sport" className={`${inputClass} w-full pl-9`} /></label>
                  <label><span className="sr-only">Sport</span><select aria-label="Sport" value={sport} onChange={(event) => updateFilter(setSport, event.target.value)} className={`${inputClass} w-full`}><option>All sports</option>{[...new Set(playerAttendanceRecords.map((record) => record.sport))].map((item) => <option key={item}>{item}</option>)}</select></label>
                  <label><span className="sr-only">Status</span><select aria-label="Attendance status" value={status} onChange={(event) => updateFilter(setStatus, event.target.value)} className={`${inputClass} w-full`}><option>All statuses</option><option>Present</option><option>Absent</option></select></label>
                  <label><span className="sr-only">From date</span><input aria-label="From date" type="date" value={from} onChange={(event) => updateFilter(setFrom, event.target.value)} className={`${inputClass} w-full`} /></label>
                  <label><span className="sr-only">To date</span><input aria-label="To date" type="date" value={to} onChange={(event) => updateFilter(setTo, event.target.value)} className={`${inputClass} w-full`} /></label>
                </div>
                {filtered.length === 0 ? <EmptyState title="No matching records" description="No attendance records match the selected filters." /> : (
                  <>
                    <div className="flex justify-end border-b border-slate-100 px-4 py-2"><label className="text-xs text-slate-500">Sort <select aria-label="Sort attendance" value={sort} onChange={(event) => updateFilter(setSort, event.target.value)} className="ml-2 rounded-lg border border-slate-200 px-2 py-1 text-sm text-slate-700"><option>Newest first</option><option>Oldest first</option></select></label></div>
                    <div className="overflow-x-auto">
                      <table className="w-full min-w-[760px] text-left text-sm">
                        <thead className="bg-slate-50 text-xs uppercase text-slate-500"><tr><th className="px-5 py-3 font-medium">Session date</th><th className="px-5 py-3 font-medium">Sport</th><th className="px-5 py-3 font-medium">Session</th><th className="px-5 py-3 font-medium">Coach</th><th className="px-5 py-3 font-medium">Status</th><th className="px-5 py-3 font-medium">Remarks</th></tr></thead>
                        <tbody className="divide-y divide-slate-100">
                          {paged.map((record) => (
                            <tr key={record.id} className="cursor-pointer hover:bg-slate-50" onClick={() => setSelected(record)}>
                              <td className="px-5 py-4 font-medium text-slate-800">{dateLabel(record.date)}</td><td className="px-5 py-4 text-slate-500">{record.sport}</td><td className="px-5 py-4 text-slate-700">{record.sessionName}</td><td className="px-5 py-4 text-slate-500">{record.coach}</td><td className="px-5 py-4"><StatusBadge tone={record.status === "Present" ? "green" : "amber"}>{record.status}</StatusBadge></td><td className="px-5 py-4 text-slate-500">{record.remarks ?? "—"}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <div className="flex items-center justify-between border-t border-slate-100 px-4 py-3 text-sm"><span className="text-slate-500">{filtered.length} records</span><div className="flex items-center gap-2"><button type="button" aria-label="Previous page" disabled={page === 1} onClick={() => setPage((value) => value - 1)} className="grid h-8 w-8 place-items-center rounded border border-slate-200 disabled:opacity-40"><ChevronLeft className="h-4 w-4" /></button><span className="text-slate-600">{page} / {totalPages}</span><button type="button" aria-label="Next page" disabled={page === totalPages} onClick={() => setPage((value) => value + 1)} className="grid h-8 w-8 place-items-center rounded border border-slate-200 disabled:opacity-40"><ChevronRight className="h-4 w-4" /></button></div></div>
                  </>
                )}
              </Panel>

              <div className="grid gap-5 xl:grid-cols-[1.2fr_1fr]">
                <Panel title="Attendance calendar" action={
                  <div className="flex items-center gap-1">
                    <button type="button" aria-label="Previous month" onClick={() => setCalendarMonth((value) => new Date(value.getFullYear(), value.getMonth() - 1, 1))} className="grid h-8 w-8 place-items-center rounded-lg border border-slate-200"><ChevronLeft className="h-4 w-4" /></button>
                    <button type="button" aria-label="Next month" onClick={() => setCalendarMonth((value) => new Date(value.getFullYear(), value.getMonth() + 1, 1))} className="grid h-8 w-8 place-items-center rounded-lg border border-slate-200"><ChevronRight className="h-4 w-4" /></button>
                  </div>
                }>
                  <div className="p-4">
                    <p className="mb-3 text-center font-semibold text-slate-800">{monthFormatter.format(calendarMonth)}</p>
                    <div className="grid grid-cols-7 gap-1 text-center text-xs text-slate-500">{["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => <span key={day} className="py-2">{day}</span>)}</div>
                    <div className="grid grid-cols-7 gap-1">
                      {Array.from({ length: leadingDays }, (_, index) => <span key={`leading-${index}`} />)}
                      {monthDays.map((day) => {
                        const key = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
                        const record = calendarRecords.get(key);
                        const upcomingSession = upcomingMap.get(key);
                        return <div key={key} title={record?.sessionName ?? upcomingSession ?? "No session"} className={`min-h-16 rounded-lg border p-1 text-xs ${record?.status === "Present" ? "border-emerald-200 bg-emerald-50 text-emerald-700" : record?.status === "Absent" ? "border-amber-200 bg-amber-50 text-amber-700" : upcomingSession ? "border-blue-200 bg-blue-50 text-blue-700" : "border-slate-100 text-slate-500"}`}><span className="font-semibold">{day}</span>{record && <span className="mt-2 block text-[10px]">{record.status}</span>} {upcomingSession && <span className="mt-2 block text-[10px]">Upcoming</span>}</div>;
                      })}
                    </div>
                    <div className="mt-3 flex flex-wrap gap-4 text-xs text-slate-500"><span className="flex items-center gap-1"><i className="h-3 w-3 rounded bg-emerald-200" />Present</span><span className="flex items-center gap-1"><i className="h-3 w-3 rounded bg-amber-200" />Absent</span><span className="flex items-center gap-1"><i className="h-3 w-3 rounded bg-blue-200" />Upcoming</span></div>
                  </div>
                </Panel>

                <Panel title="Attendance trends">
                  <div className="space-y-5 p-5">
                    {monthlyStats.map((item) => (
                      <div key={item.month}>
                        <div className="flex items-center justify-between text-sm"><span className="font-medium text-slate-700">{new Intl.DateTimeFormat("en-IN", { month: "short" }).format(new Date(`${item.month}-01T00:00:00Z`))}</span><span className="font-semibold text-slate-800">{item.percentage}%</span></div>
                        <div className="mt-2 flex h-3 overflow-hidden rounded-full bg-slate-100"><div className="bg-emerald-500" style={{ width: `${item.percentage}%` }} /><div className="bg-amber-400" style={{ width: `${100 - item.percentage}%` }} /></div>
                        <p className="mt-1 text-xs text-slate-500">{item.present} present · {item.absent} absent</p>
                      </div>
                    ))}
                  </div>
                </Panel>
              </div>

              <Panel title="Readiness information">
                <div className="grid gap-4 p-5 md:grid-cols-3">
                  <div className="rounded-lg bg-slate-50 p-4"><p className="text-xs text-slate-500">Attendance requirement</p><p className={`mt-1 font-semibold ${percentage >= 75 ? "text-emerald-700" : "text-amber-700"}`}>{percentage >= 75 ? "Met" : "Not met"} · {percentage}%</p></div>
                  <div className="rounded-lg bg-slate-50 p-4"><p className="text-xs text-slate-500">Completed matches</p><p className={`mt-1 font-semibold ${currentPlayer.completedMatches >= 2 ? "text-emerald-700" : "text-amber-700"}`}>{currentPlayer.completedMatches >= 2 ? "Met" : "Not met"} · {currentPlayer.completedMatches}</p></div>
                  <div className="rounded-lg bg-slate-50 p-4"><p className="text-xs text-slate-500">Current readiness</p><p className={`mt-1 font-semibold ${ready ? "text-emerald-700" : "text-amber-700"}`}>{ready ? "Ready" : "Not Ready"}</p></div>
                </div>
              </Panel>
            </>
          )}
        </div>
      )}

      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 p-4">
          <div role="dialog" aria-modal="true" aria-labelledby="attendance-detail-title" className="w-full max-w-lg rounded-xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4"><div><p className="text-xs text-slate-500">{selected.id}</p><h2 id="attendance-detail-title" className="font-semibold text-slate-900">Attendance details</h2></div><button type="button" aria-label="Close attendance details" onClick={() => setSelected(null)} className="text-slate-400"><X className="h-5 w-5" /></button></div>
            <dl className="grid gap-4 p-5 sm:grid-cols-2">{[["Session date", dateLabel(selected.date)], ["Sport", selected.sport], ["Session name", selected.sessionName], ["Coach", selected.coach], ["Remarks", selected.remarks ?? "No remarks"]].map(([label, value], index) => <div key={label} className={index === 4 ? "sm:col-span-2" : ""}><dt className="text-xs text-slate-500">{label}</dt><dd className="mt-1 font-medium text-slate-800">{value}</dd></div>)}</dl>
            <div className="border-t border-slate-100 px-5 py-4"><StatusBadge tone={selected.status === "Present" ? "green" : "amber"}>{selected.status}</StatusBadge><p className="mt-2 text-xs text-slate-400">Read-only attendance record</p></div>
          </div>
        </div>
      )}
    </DashboardShell>
  );
}
