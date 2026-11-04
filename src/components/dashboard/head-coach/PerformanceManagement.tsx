"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import { ChevronLeft, ChevronRight, Eye, Search, TrendingDown, TrendingUp, X } from "lucide-react";
import { DashboardShell } from "../DashboardShell";
import { EmptyState, LoadingState, PageHeader } from "../DashboardUI";
import { Panel, StatCard, StatusBadge } from "../Dashboard";

type MatchRecord = { matchId: string; match: string; date: string; score: number };
type PerformancePlayer = {
  id: string;
  name: string;
  sport: string;
  coach: string;
  ready: boolean;
  attendance: number;
  records: MatchRecord[];
};

const mockPlayers: PerformancePlayer[] = [
  { id: "AD-1042", name: "Arjun Patel", sport: "Football", coach: "Raj Kumar", ready: true, attendance: 92, records: [{ matchId: "MAT-2001", match: "District Football League", date: "2026-10-07", score: 78 }, { matchId: "MAT-2002", match: "Academy Championship", date: "2026-09-19", score: 82 }, { matchId: "MAT-2003", match: "City Cup", date: "2026-08-22", score: 76 }] },
  { id: "AD-1088", name: "Meera Shah", sport: "Football", coach: "Raj Kumar", ready: true, attendance: 88, records: [{ matchId: "MAT-2004", match: "District Football League", date: "2026-10-07", score: 84 }, { matchId: "MAT-2005", match: "Academy Championship", date: "2026-09-19", score: 81 }, { matchId: "MAT-2006", match: "City Cup", date: "2026-08-22", score: 88 }] },
  { id: "AD-1121", name: "Vihaan Rao", sport: "Cricket", coach: "Imran Ali", ready: true, attendance: 91, records: [{ matchId: "MAT-2011", match: "Academy Championship", date: "2026-10-12", score: 68 }, { matchId: "MAT-2012", match: "Junior Trophy", date: "2026-09-04", score: 74 }, { matchId: "MAT-2013", match: "City Trial", date: "2026-08-16", score: 71 }] },
  { id: "AD-1145", name: "Ishaan Verma", sport: "Swimming", coach: "Neha Rao", ready: true, attendance: 86, records: [{ matchId: "MAT-2021", match: "Junior Swimming Meet", date: "2026-10-21", score: 91 }, { matchId: "MAT-2022", match: "District Qualifier", date: "2026-09-08", score: 87 }, { matchId: "MAT-2023", match: "State Time Trial", date: "2026-08-29", score: 89 }] },
  { id: "AD-1192", name: "Kabir Singh", sport: "Athletics", coach: "Neha Rao", ready: false, attendance: 68, records: [{ matchId: "MAT-2031", match: "City Athletics Trial", date: "2026-10-18", score: 62 }] },
  { id: "AD-1257", name: "Reyansh Das", sport: "Football", coach: "Raj Kumar", ready: false, attendance: 72, records: [{ matchId: "MAT-2035", match: "City Cup", date: "2026-08-22", score: 69 }, { matchId: "MAT-2036", match: "Academy Championship", date: "2026-09-19", score: 73 }] },
];

const average = (scores: number[]) => scores.length ? scores.reduce((sum, score) => sum + score, 0) / scores.length : 0;
const displayedScore = (score: number) => Number(score.toFixed(1));
const filteredMatchRecords = (item: PerformancePlayer, from: string, to: string, match: string) =>
  item.records.filter((record) => (!from || record.date >= from) && (!to || record.date <= to) && (match === "All matches" || record.match === match));

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: ReactNode }) {
  return <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 p-3 sm:p-6" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
    <div role="dialog" aria-modal="true" aria-labelledby="performance-modal-title" className="max-h-[92vh] w-full max-w-4xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
      <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-100 bg-white px-5 py-4"><h2 id="performance-modal-title" className="font-semibold text-slate-900">{title}</h2><button aria-label="Close dialog" onClick={onClose} className="grid h-9 w-9 place-items-center rounded-lg text-slate-500 hover:bg-slate-100"><X className="h-5 w-5" /></button></div>
      {children}
    </div>
  </div>;
}

function Sparkline({ values }: { values: number[] }) {
  const width = 620;
  const height = 180;
  const max = Math.max(...values, 100);
  const min = Math.min(...values, 0);
  const points = values.map((value, index) => `${values.length === 1 ? width / 2 : index * width / (values.length - 1)},${height - ((value - min) / Math.max(max - min, 1)) * (height - 24) - 12}`).join(" ");
  return <svg viewBox={`0 0 ${width} ${height}`} className="h-44 w-full overflow-visible" role="img" aria-label={`Score trend: ${values.join(", ")}`}><line x1="0" y1={height - 12} x2={width} y2={height - 12} stroke="#e2e8f0" /><polyline points={points} fill="none" stroke="#2563eb" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />{values.map((value, index) => <circle key={index} cx={values.length === 1 ? width / 2 : index * width / (values.length - 1)} cy={height - ((value - min) / Math.max(max - min, 1)) * (height - 24) - 12} r="5" fill="#fff" stroke="#2563eb" strokeWidth="3" />)}</svg>;
}

function HorizontalBars({ data }: { data: { label: string; value: number }[] }) {
  const max = Math.max(...data.map((item) => item.value), 1);
  return <div className="space-y-4">{data.map((item) => <div key={item.label}><div className="mb-1 flex justify-between text-xs"><span className="font-medium text-slate-700">{item.label}</span><span className="font-semibold text-slate-900">{displayedScore(item.value)}</span></div><div className="h-3 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-blue-600" style={{ width: `${Math.max(4, item.value / max * 100)}%` }} /></div></div>)}</div>;
}

export function PerformanceManagement() {
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [sport, setSport] = useState("All sports");
  const [coach, setCoach] = useState("All coaches");
  const [player, setPlayer] = useState("All players");
  const [match, setMatch] = useState("All matches");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [sort, setSort] = useState("average-desc");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<PerformancePlayer | null>(null);
  const [compareIds, setCompareIds] = useState<string[]>(["AD-1042", "AD-1088"]);
  const pageSize = 5;

  useEffect(() => {
    const timer = window.setTimeout(() => setLoading(false), 350);
    return () => window.clearTimeout(timer);
  }, []);

  const filtered = useMemo(() => {
    const rows = mockPlayers.map((item) => ({ ...item, records: filteredMatchRecords(item, from, to, match) })).filter((item) =>
      item.records.length > 0 &&
      (sport === "All sports" || item.sport === sport) &&
      (coach === "All coaches" || item.coach === coach) &&
      (player === "All players" || item.name === player) &&
      (!query.trim() || `${item.name} ${item.id}`.toLowerCase().includes(query.trim().toLowerCase()))
    );
    return rows.sort((a, b) => {
      const aAverage = average(a.records.map((record) => record.score));
      const bAverage = average(b.records.map((record) => record.score));
      if (sort === "name-asc") return a.name.localeCompare(b.name);
      if (sort === "matches-desc") return b.records.length - a.records.length;
      return sort === "average-asc" ? aAverage - bAverage : bAverage - aAverage;
    });
  }, [sport, coach, player, match, from, to, query, sort]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
  const visible = filtered.slice((page - 1) * pageSize, page * pageSize);
  const allFilteredRecords = filtered.flatMap((item) => filteredMatchRecords(item, from, to, match).map((record) => ({ ...record, player: item.name, sport: item.sport })));
  const overallAverage = average(allFilteredRecords.map((record) => record.score));
  const sportSummary = ["Football", "Cricket", "Swimming", "Athletics"].map((sportName) => ({
    label: sportName,
    value: average(allFilteredRecords.filter((record) => record.sport === sportName).map((record) => record.score)),
  })).filter((item) => item.value > 0);
  const topPlayers = [...filtered].sort((a, b) => average(b.records.map((record) => record.score)) - average(a.records.map((record) => record.score))).slice(0, 5).map((item) => ({ label: item.name, value: average(item.records.map((record) => record.score)) }));
  const compared = mockPlayers.filter((item) => compareIds.includes(item.id));
  const dateError = Boolean(from && to && from > to);
  const reset = () => { setQuery(""); setSport("All sports"); setCoach("All coaches"); setPlayer("All players"); setMatch("All matches"); setFrom(""); setTo(""); setSort("average-desc"); setPage(1); };

  return <DashboardShell role="head-coach" title="Performance Management" subtitle="Demonstration data · Recorded match scores only">
    <PageHeader title="Performance Management" description="Demonstration data · Performance calculated only from mock recorded match scores" />
    <div className="mb-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <StatCard label="Players with scores" value={String(filtered.length)} detail="Players matching current filters" icon="users" />
      <StatCard label="Completed match records" value={String(allFilteredRecords.length)} detail="Recorded participant entries" icon="trophy" tone="blue" />
      <StatCard label="Average score" value={allFilteredRecords.length ? String(displayedScore(overallAverage)) : "—"} detail="Arithmetic mean of recorded scores" icon="activity" tone="green" />
      <StatCard label="Sports represented" value={String(sportSummary.length)} detail="Sports with recorded scores" icon="calendar" tone="violet" />
    </div>
    {loading ? <LoadingState message="Loading performance records..." /> : dateError ? <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-6"><h2 className="font-semibold text-red-800">Invalid date range</h2><p className="mt-1 text-sm text-red-700">The start date must be on or before the end date.</p><button onClick={() => { setFrom(""); setTo(""); }} className="mt-4 rounded-lg bg-white px-4 py-2 text-sm font-semibold text-red-700 ring-1 ring-red-200">Clear dates</button></div> : <div className="space-y-5">
      <Panel title={`Player performance (${filtered.length})`}>
        <div className="grid gap-3 border-b border-slate-100 p-4 xl:grid-cols-[minmax(210px,1fr)_140px_150px_140px_180px_132px]">
          <label className="relative"><span className="sr-only">Search players</span><Search className="absolute left-3 top-1.5 h-4 w-4 text-slate-400" /><input value={query} onChange={(event) => { setQuery(event.target.value); setPage(1); }} placeholder="Search name or player ID..." className="h-10 w-full rounded-lg border border-slate-200 pl-9 pr-3 text-sm" /></label>
          <select aria-label="Sport filter" value={sport} onChange={(event) => { setSport(event.target.value); setPage(1); }} className="h-10 rounded-lg border border-slate-200 px-3 text-sm"><option>All sports</option>{["Football", "Cricket", "Swimming", "Athletics"].map((item) => <option key={item}>{item}</option>)}</select>
          <select aria-label="Coach filter" value={coach} onChange={(event) => setCoach(event.target.value)} className="h-10 rounded-lg border border-slate-200 px-3 text-sm"><option>All coaches</option>{["Raj Kumar", "Imran Ali", "Neha Rao"].map((item) => <option key={item}>{item}</option>)}</select>
          <select aria-label="Player filter" value={player} onChange={(event) => setPlayer(event.target.value)} className="h-10 rounded-lg border border-slate-200 px-3 text-sm"><option>All players</option>{mockPlayers.map((item) => <option key={item.id}>{item.name}</option>)}</select>
          <select aria-label="Match filter" value={match} onChange={(event) => setMatch(event.target.value)} className="h-10 rounded-lg border border-slate-200 px-3 text-sm"><option>All matches</option>{Array.from(new Set(mockPlayers.flatMap((item) => item.records.map((record) => record.match)))).map((item) => <option key={item}>{item}</option>)}</select>
          <select aria-label="Sort players" value={sort} onChange={(event) => setSort(event.target.value)} className="h-10 rounded-lg border border-slate-200 px-3 text-sm"><option value="average-desc">Highest average</option><option value="average-asc">Lowest average</option><option value="matches-desc">Most matches</option><option value="name-asc">Name A-Z</option></select>
        </div>
        <div className="grid gap-3 border-b border-slate-100 px-4 py-3 sm:grid-cols-[140px_140px_auto]"><label className="text-xs font-medium text-slate-500">From<input type="date" value={from} onChange={(event) => setFrom(event.target.value)} className="mt-1 block h-10 w-full rounded-lg border border-slate-200 px-3 text-sm text-slate-800" /></label><label className="text-xs font-medium text-slate-500">To<input type="date" value={to} onChange={(event) => setTo(event.target.value)} className="mt-1 block h-10 w-full rounded-lg border border-slate-200 px-3 text-sm text-slate-800" /></label><button onClick={reset} className="mt-auto h-10 rounded-lg border border-slate-200 px-4 text-sm font-semibold text-slate-600">Reset filters</button></div>
        {visible.length ? <>
          <div className="overflow-x-auto"><table className="w-full min-w-[940px] text-left text-sm"><thead className="bg-slate-50 text-xs uppercase text-slate-500"><tr><th className="px-5 py-3">Player</th><th className="px-5 py-3">Sport / Coach</th><th className="px-5 py-3">Matches</th><th className="px-5 py-3">Total</th><th className="px-5 py-3">Average</th><th className="px-5 py-3">Latest</th><th className="px-5 py-3">Readiness</th><th className="px-5 py-3">Details</th></tr></thead><tbody className="divide-y divide-slate-100">{visible.map((item) => {
            const scores = item.records.map((record) => record.score);
            const latest = [...item.records].sort((a, b) => b.date.localeCompare(a.date))[0];
            const previous = [...item.records].sort((a, b) => b.date.localeCompare(a.date))[1];
            const trendUp = previous ? latest.score >= previous.score : null;
            return <tr key={item.id} className="hover:bg-slate-50/60"><td className="px-5 py-4"><p className="font-semibold text-slate-900">{item.name}</p><p className="text-xs text-slate-500">{item.id}</p></td><td className="px-5 py-4"><p className="text-slate-700">{item.sport}</p><p className="text-xs text-slate-500">{item.coach}</p></td><td className="px-5 py-4 font-semibold">{item.records.length}</td><td className="px-5 py-4">{scores.reduce((sum, score) => sum + score, 0)}</td><td className="px-5 py-4 font-semibold text-blue-700">{displayedScore(average(scores))}</td><td className="px-5 py-4"><span className="flex items-center gap-1">{latest.score}{trendUp !== null && (trendUp ? <TrendingUp className="h-4 w-4 text-emerald-600" /> : <TrendingDown className="h-4 w-4 text-amber-600" />)}</span><span className="block text-xs text-slate-500">{new Date(`${latest.date}T00:00:00`).toLocaleDateString()}</span></td><td className="px-5 py-4"><StatusBadge tone={item.ready ? "green" : "amber"}>{item.ready ? "Ready" : "Not Ready"}</StatusBadge></td><td className="px-5 py-4"><button aria-label={`View ${item.name} performance`} onClick={() => setSelected(item)} className="grid h-8 w-8 place-items-center rounded-lg border border-slate-200 text-slate-600"><Eye className="h-4 w-4" /></button></td></tr>;
          })}</tbody></table></div>
          <div className="flex flex-col gap-3 border-t border-slate-100 px-5 py-3 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between"><span>{(page - 1) * pageSize + 1}-{Math.min(page * pageSize, filtered.length)} of {filtered.length}</span><div className="flex items-center gap-2"><button disabled={page === 1} onClick={() => setPage((current) => Math.max(1, current - 1))} aria-label="Previous page" className="grid h-8 w-8 place-items-center rounded-lg border border-slate-200 disabled:opacity-40"><ChevronLeft className="h-4 w-4" /></button><span>Page {page} of {pageCount}</span><button disabled={page === pageCount} onClick={() => setPage((current) => Math.min(pageCount, current + 1))} aria-label="Next page" className="grid h-8 w-8 place-items-center rounded-lg border border-slate-200 disabled:opacity-40"><ChevronRight className="h-4 w-4" /></button></div></div>
        </> : <EmptyState title="No performance records" description="Change the search and filter selections to find recorded mock scores." />}
      </Panel>
      <div className="grid gap-5 xl:grid-cols-2">
        <Panel title="Performance trend"><div className="p-5"><Sparkline values={allFilteredRecords.slice().sort((a, b) => a.date.localeCompare(b.date)).map((record) => record.score)} />{!allFilteredRecords.length && <p className="text-sm text-slate-500">No recorded scores in this selection.</p>}</div></Panel>
        <Panel title="Sport-wise comparison"><div className="p-5">{sportSummary.length ? <HorizontalBars data={sportSummary} /> : <p className="text-sm text-slate-500">No sports have recorded scores in this selection.</p>}</div></Panel>
      </div>
      <div className="grid gap-5 xl:grid-cols-2">
        <Panel title="Top performing players"><div className="p-5">{topPlayers.length ? <HorizontalBars data={topPlayers} /> : <p className="text-sm text-slate-500">No players have recorded scores.</p>}</div></Panel>
        <Panel title="Score distribution"><div className="grid grid-cols-4 gap-2 p-5">{[
          ["0-49", allFilteredRecords.filter((record) => record.score < 50).length],
          ["50-69", allFilteredRecords.filter((record) => record.score >= 50 && record.score < 70).length],
          ["70-89", allFilteredRecords.filter((record) => record.score >= 70 && record.score < 90).length],
          ["90-100", allFilteredRecords.filter((record) => record.score >= 90).length],
        ].map(([label, count]) => <div key={label} className="rounded-lg bg-slate-50 p-3 text-center"><p className="text-xl font-bold text-slate-900">{count}</p><p className="mt-1 text-xs text-slate-500">{label}</p></div>)}</div><p className="px-5 pb-5 text-xs text-slate-500">Count of recorded mock scores by range.</p></Panel>
      </div>
      <Panel title="Player comparison">
        <div className="grid gap-4 border-b border-slate-100 p-5 md:grid-cols-2 xl:grid-cols-3">{mockPlayers.map((item) => <label key={item.id} className="flex items-center gap-3 rounded-lg border border-slate-200 p-3 text-sm"><input type="checkbox" checked={compareIds.includes(item.id)} disabled={!mockPlayers.some((player) => player.id === item.id && compareIds.includes(player.id)) && compareIds.length >= 3} onChange={(event) => setCompareIds((current) => event.target.checked ? [...current, item.id].slice(0, 3) : current.filter((id) => id !== item.id))} /><span><strong className="block text-slate-800">{item.name}</strong><span className="text-xs text-slate-500">{item.sport}</span></span></label>)}</div>
        <div className="p-5"><p className="mb-4 text-xs text-slate-500">Select up to three players. Available mock match statistics are shown below.</p>{compared.length ? <HorizontalBars data={compared.map((item) => ({ label: item.name, value: average(item.records.map((record) => record.score)) }))} /> : <EmptyState title="No players selected" description="Select at least one player to compare available scores." />}<div className="mt-6 overflow-x-auto"><table className="w-full min-w-[620px] text-left text-sm"><thead className="bg-slate-50 text-xs uppercase text-slate-500"><tr><th className="px-4 py-3">Player</th><th className="px-4 py-3">Matches</th><th className="px-4 py-3">Total score</th><th className="px-4 py-3">Average</th><th className="px-4 py-3">Latest</th></tr></thead><tbody className="divide-y divide-slate-100">{compared.map((item) => { const scores = item.records.map((record) => record.score); const latest = [...item.records].sort((a, b) => b.date.localeCompare(a.date))[0]; return <tr key={item.id}><td className="px-4 py-3 font-medium text-slate-800">{item.name}</td><td className="px-4 py-3">{scores.length}</td><td className="px-4 py-3">{scores.reduce((sum, score) => sum + score, 0)}</td><td className="px-4 py-3 font-semibold">{displayedScore(average(scores))}</td><td className="px-4 py-3">{latest.score}</td></tr>; })}</tbody></table></div></div>
      </Panel>
    </div>}
    {selected && <Modal title={`${selected.name} performance`} onClose={() => setSelected(null)}><div className="p-5">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{[
        ["Player ID", selected.id], ["Sport", selected.sport], ["Coach", selected.coach], ["Readiness", selected.ready ? "Ready" : "Not Ready"],
        ["Completed recorded matches", String(selected.records.length)], ["Total score", String(selected.records.reduce((sum, record) => sum + record.score, 0))], ["Average score", String(displayedScore(average(selected.records.map((record) => record.score))))], ["Attendance", `${selected.attendance}%`],
      ].map(([label, value]) => <div key={label} className="rounded-lg border border-slate-100 bg-slate-50 p-3"><p className="text-xs text-slate-500">{label}</p><p className="mt-1 font-semibold text-slate-800">{value}</p></div>)}</div>
      <div className="mt-5"><p className="text-sm font-semibold text-slate-900">Recorded score trend</p><Sparkline values={selected.records.slice().sort((a, b) => a.date.localeCompare(b.date)).map((record) => record.score)} /></div>
      <div className="mt-5 overflow-x-auto rounded-xl border border-slate-200"><table className="w-full min-w-[560px] text-left text-sm"><thead className="bg-slate-50 text-xs uppercase text-slate-500"><tr><th className="px-4 py-3">Match</th><th className="px-4 py-3">Date</th><th className="px-4 py-3">Score</th></tr></thead><tbody className="divide-y divide-slate-100">{selected.records.slice().sort((a, b) => b.date.localeCompare(a.date)).map((record) => <tr key={record.matchId}><td className="px-4 py-3"><p className="font-medium text-slate-800">{record.match}</p><p className="text-xs text-slate-500">{record.matchId}</p></td><td className="px-4 py-3 text-slate-600">{new Date(`${record.date}T00:00:00`).toLocaleDateString()}</td><td className="px-4 py-3 font-semibold text-slate-900">{record.score}</td></tr>)}</tbody></table></div>
      <div className="mt-5 flex justify-end"><button onClick={() => setSelected(null)} className="h-10 rounded-lg border border-slate-200 px-4 text-sm font-semibold text-slate-700">Close details</button></div>
    </div></Modal>}
  </DashboardShell>;
}
