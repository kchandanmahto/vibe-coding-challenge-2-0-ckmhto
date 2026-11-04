"use client";

import { ChevronLeft, ChevronRight, Search, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { DashboardShell } from "../DashboardShell";
import { Panel, StatCard, StatusBadge } from "../Dashboard";
import { EmptyState, LoadingState, PageHeader } from "../DashboardUI";
import { playerMatches } from "./playerMatchesData";

const pageSize = 6;
const inputClass = "h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-blue-500";
const monthFormatter = new Intl.DateTimeFormat("en-IN", { month: "long", year: "numeric" });

function formatDate(date: string) {
  return new Intl.DateTimeFormat("en-IN", { day: "2-digit", month: "short", year: "numeric", timeZone: "UTC" })
    .format(new Date(`${date}T00:00:00Z`));
}

export function PlayerMatchesManagement() {
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [sport, setSport] = useState("All sports");
  const [status, setStatus] = useState("All statuses");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [sort, setSort] = useState("Newest first");
  const [page, setPage] = useState(1);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [historySport, setHistorySport] = useState("All sports");
  const [historyFrom, setHistoryFrom] = useState("");
  const [historyTo, setHistoryTo] = useState("");
  const [calendarMonth, setCalendarMonth] = useState(new Date(2026, 10, 1));

  useEffect(() => {
    const timer = window.setTimeout(() => setLoading(false), 350);
    return () => window.clearTimeout(timer);
  }, []);

  const counts = {
    total: playerMatches.length,
    upcoming: playerMatches.filter((match) => match.status === "Upcoming").length,
    completed: playerMatches.filter((match) => match.status === "Completed").length,
    cancelled: playerMatches.filter((match) => match.status === "Cancelled").length,
    withScores: playerMatches.filter((match) => match.scoreStatus === "Available").length,
  };

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    const matches = playerMatches.filter((match) =>
      (!normalized || match.name.toLowerCase().includes(normalized))
      && (sport === "All sports" || match.sport === sport)
      && (status === "All statuses" || match.status === status)
      && (!from || match.date >= from)
      && (!to || match.date <= to)
    );
    return [...matches].sort((a, b) => sort === "Newest first" ? b.date.localeCompare(a.date) : a.date.localeCompare(b.date));
  }, [query, sport, status, from, to, sort]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paged = filtered.slice((page - 1) * pageSize, page * pageSize);
  const selectedMatch = selectedId ? playerMatches.find((match) => match.id === selectedId) ?? null : null;
  const upcomingMatches = playerMatches.filter((match) => match.status === "Upcoming");
  const completedMatches = playerMatches.filter((match) => match.status === "Completed");
  const scoreHistory = completedMatches.filter((match) =>
    match.score !== null
    && (historySport === "All sports" || match.sport === historySport)
    && (!historyFrom || match.date >= historyFrom)
    && (!historyTo || match.date <= historyTo)
  );

  const year = calendarMonth.getFullYear();
  const month = calendarMonth.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const leadingDays = new Date(year, month, 1).getDay();

  const matchStatusTone = (matchStatus: string) => {
    if (matchStatus === "Completed") return "green";
    if (matchStatus === "Cancelled") return "slate";
    if (matchStatus === "In Progress") return "amber";
    return "blue";
  };

  const updateFilter = (setter: (value: string) => void, value: string) => {
    setter(value);
    setPage(1);
  };

  return (
    <DashboardShell role="player" title="My matches" subtitle="View your own match participation and scores">
      <PageHeader title="My Matches" description="Read-only match history and upcoming fixtures" />
      {loading ? <LoadingState message="Loading your matches..." /> : (
        <div className="space-y-5">
          {playerMatches.length === 0 ? (
            <EmptyState title="No match history" description="You have no registered match records yet." />
          ) : (
            <>
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
                <StatCard label="Total matches" value={String(counts.total)} detail="Registered participation" icon="trophy" />
                <StatCard label="Upcoming matches" value={String(counts.upcoming)} detail="Future registered fixtures" icon="calendar" tone="blue" />
                <StatCard label="Completed matches" value={String(counts.completed)} detail="Completed participation" icon="clipboard" tone="green" />
                <StatCard label="Cancelled matches" value={String(counts.cancelled)} detail="Cancelled fixtures" icon="calendar" tone="amber" />
                <StatCard label="Matches with scores" value={String(counts.withScores)} detail="Your available scores" icon="activity" tone="violet" />
              </div>

              <Panel title="Match history">
                <div className="grid gap-3 border-b border-slate-100 p-4 lg:grid-cols-[1fr_repeat(4,minmax(130px,auto))]">
                  <label className="relative"><span className="sr-only">Search matches</span><Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" /><input value={query} onChange={(event) => updateFilter(setQuery, event.target.value)} placeholder="Search match name" className={`${inputClass} w-full pl-9`} /></label>
                  <select aria-label="Sport filter" value={sport} onChange={(event) => updateFilter(setSport, event.target.value)} className={inputClass}><option>All sports</option><option>Football</option><option>Athletics</option></select>
                  <select aria-label="Match status filter" value={status} onChange={(event) => updateFilter(setStatus, event.target.value)} className={inputClass}><option>All statuses</option><option>Upcoming</option><option>In Progress</option><option>Completed</option><option>Cancelled</option></select>
                  <input aria-label="From date" type="date" value={from} onChange={(event) => updateFilter(setFrom, event.target.value)} className={inputClass} />
                  <input aria-label="To date" type="date" value={to} onChange={(event) => updateFilter(setTo, event.target.value)} className={inputClass} />
                </div>
                {filtered.length === 0 ? <EmptyState title="No matching matches" description="No registered matches match the selected filters." /> : (
                  <>
                    <div className="flex justify-end border-b border-slate-100 px-4 py-2"><label className="text-xs text-slate-500">Sort<select aria-label="Sort matches" value={sort} onChange={(event) => updateFilter(setSort, event.target.value)} className="ml-2 rounded-lg border border-slate-200 px-2 py-1 text-sm text-slate-700"><option>Newest first</option><option>Oldest first</option></select></label></div>
                    <div className="overflow-x-auto">
                      <table className="w-full min-w-[820px] text-left text-sm">
                        <thead className="bg-slate-50 text-xs uppercase text-slate-500"><tr><th className="px-5 py-3 font-medium">Match name</th><th className="px-5 py-3 font-medium">Sport</th><th className="px-5 py-3 font-medium">Date</th><th className="px-5 py-3 font-medium">Type</th><th className="px-5 py-3 font-medium">Participation</th><th className="px-5 py-3 font-medium">Status</th><th className="px-5 py-3 font-medium">Score</th><th className="px-5 py-3 font-medium text-right">Action</th></tr></thead>
                        <tbody className="divide-y divide-slate-100">
                          {paged.map((match) => (
                            <tr key={match.id}>
                              <td className="px-5 py-4 font-medium text-slate-800">{match.name}</td><td className="px-5 py-4 text-slate-500">{match.sport}</td><td className="px-5 py-4 text-slate-500">{formatDate(match.date)}</td><td className="px-5 py-4 text-slate-500">{match.type}</td><td className="px-5 py-4"><StatusBadge tone="blue">{match.participationStatus}</StatusBadge></td><td className="px-5 py-4"><StatusBadge tone={matchStatusTone(match.status)}>{match.status}</StatusBadge></td><td className="px-5 py-4 text-slate-500">{match.scoreStatus}</td><td className="px-5 py-4 text-right"><button type="button" onClick={() => setSelectedId(match.id)} className="text-sm font-semibold text-blue-600 hover:text-blue-800">{match.status === "Completed" ? "View details" : "View match"}</button></td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <div className="flex items-center justify-between border-t border-slate-100 px-4 py-3 text-sm"><span className="text-slate-500">{filtered.length} matches</span><div className="flex items-center gap-2"><button type="button" aria-label="Previous page" disabled={page === 1} onClick={() => setPage((value) => value - 1)} className="grid h-8 w-8 place-items-center rounded border border-slate-200 disabled:opacity-40"><ChevronLeft className="h-4 w-4" /></button><span>{page} / {totalPages}</span><button type="button" aria-label="Next page" disabled={page === totalPages} onClick={() => setPage((value) => value + 1)} className="grid h-8 w-8 place-items-center rounded border border-slate-200 disabled:opacity-40"><ChevronRight className="h-4 w-4" /></button></div></div>
                  </>
                )}
              </Panel>

              <Panel title="Upcoming matches">
                {upcomingMatches.length ? (
                  <div className="grid gap-3 p-5 md:grid-cols-2">
                    {upcomingMatches.map((match) => (
                      <article key={match.id} className="rounded-xl border border-slate-200 p-4">
                        <div className="flex items-start justify-between gap-3"><div><h3 className="font-semibold text-slate-900">{match.name}</h3><p className="mt-1 text-sm text-slate-500">{match.sport} · {formatDate(match.date)}</p></div><StatusBadge tone="blue">{match.status}</StatusBadge></div>
                        <div className="mt-4 flex flex-wrap items-center justify-between gap-2 text-sm"><span className="text-slate-500">Time: <strong className="text-slate-700">{match.time}</strong></span><span className="text-slate-500">Registered participant</span></div>
                      </article>
                    ))}
                  </div>
                ) : <EmptyState title="No upcoming matches" description="No upcoming fixtures are registered for you." />}
              </Panel>

              <div className="grid gap-5 xl:grid-cols-[1fr_1.25fr]">
                <Panel title="Match calendar" action={
                  <div className="flex gap-1"><button type="button" aria-label="Previous month" onClick={() => setCalendarMonth((value) => new Date(value.getFullYear(), value.getMonth() - 1, 1))} className="grid h-8 w-8 place-items-center rounded border border-slate-200"><ChevronLeft className="h-4 w-4" /></button><button type="button" aria-label="Next month" onClick={() => setCalendarMonth((value) => new Date(value.getFullYear(), value.getMonth() + 1, 1))} className="grid h-8 w-8 place-items-center rounded border border-slate-200"><ChevronRight className="h-4 w-4" /></button></div>
                }>
                  <div className="p-4">
                    <p className="mb-3 text-center font-semibold text-slate-800">{monthFormatter.format(calendarMonth)}</p>
                    <div className="grid grid-cols-7 text-center text-xs text-slate-500">{["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => <span key={day} className="py-2">{day}</span>)}</div>
                    <div className="grid grid-cols-7 gap-1">
                      {Array.from({ length: leadingDays }, (_, index) => <span key={`empty-${index}`} />)}
                      {Array.from({ length: daysInMonth }, (_, index) => {
                        const day = index + 1;
                        const key = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
                        const match = playerMatches.find((item) => item.date === key);
                        const color = match?.status === "Completed" ? "border-emerald-200 bg-emerald-50 text-emerald-700" : match?.status === "Cancelled" ? "border-slate-300 bg-slate-100 text-slate-600" : match ? "border-blue-200 bg-blue-50 text-blue-700" : "border-slate-100 text-slate-500";
                        return <div key={key} title={match?.name ?? "No match"} className={`min-h-14 rounded border p-1 text-xs ${color}`}><span className="font-semibold">{day}</span>{match && <span className="mt-2 block truncate">{match.status}</span>}</div>;
                      })}
                    </div>
                    <div className="mt-3 flex flex-wrap gap-4 text-xs text-slate-500"><span>● Upcoming/In progress</span><span>● Completed</span><span>● Cancelled</span></div>
                  </div>
                </Panel>

                <Panel title="Score history">
                  <div className="grid gap-2 border-b border-slate-100 p-4 sm:grid-cols-3">
                    <select aria-label="Score history sport" value={historySport} onChange={(event) => setHistorySport(event.target.value)} className={inputClass}><option>All sports</option><option>Football</option><option>Athletics</option></select>
                    <input aria-label="Score history from date" type="date" value={historyFrom} onChange={(event) => setHistoryFrom(event.target.value)} className={inputClass} />
                    <input aria-label="Score history to date" type="date" value={historyTo} onChange={(event) => setHistoryTo(event.target.value)} className={inputClass} />
                  </div>
                  {scoreHistory.length ? (
                    <div className="divide-y divide-slate-100">
                      {scoreHistory.map((match) => (
                        <div key={match.id} className="flex items-center justify-between gap-3 px-5 py-4 text-sm"><div><p className="font-medium text-slate-800">{match.name}</p><p className="mt-1 text-xs text-slate-500">{match.sport} · {formatDate(match.date)}</p></div><div className="text-right"><p className="font-semibold text-slate-800">{match.score}</p><p className="mt-1 text-xs text-slate-500">{match.lastUpdated ?? "Updated unavailable"}</p></div></div>
                      ))}
                    </div>
                  ) : <EmptyState title="No scores available" description="No available score records match the selected filters." />}
                </Panel>
              </div>
            </>
          )}
        </div>
      )}

      {selectedMatch && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 p-4">
          <div role="dialog" aria-modal="true" aria-labelledby="match-detail-title" className="w-full max-w-lg rounded-xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4"><div><p className="text-xs text-slate-500">{selectedMatch.id}</p><h2 id="match-detail-title" className="font-semibold text-slate-900">{selectedMatch.name}</h2></div><button type="button" aria-label="Close match details" onClick={() => setSelectedId(null)} className="text-slate-400"><X className="h-5 w-5" /></button></div>
            <dl className="grid gap-4 p-5 sm:grid-cols-2">
              {[["Sport", selectedMatch.sport], ["Match date", formatDate(selectedMatch.date)], ["Match type", selectedMatch.type], ["Participation", "Registered player"], ["Match status", selectedMatch.status], ["Score status", selectedMatch.scoreStatus], ["Your score", selectedMatch.score === null ? "Not available" : String(selectedMatch.score)], ["Last updated", selectedMatch.lastUpdated ?? "Unavailable"]].map(([label, value]) => <div key={label}><dt className="text-xs text-slate-500">{label}</dt><dd className="mt-1 font-medium text-slate-800">{value}</dd></div>)}
            </dl>
            <p className="border-t border-slate-100 px-5 py-4 text-xs text-slate-400">Read-only match and score record. No other player scores are shown.</p>
          </div>
        </div>
      )}
    </DashboardShell>
  );
}
