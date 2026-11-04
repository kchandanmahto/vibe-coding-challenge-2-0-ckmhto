"use client";

import { useEffect, useMemo, useState, type FormEvent, type ReactNode } from "react";
import { ChevronLeft, ChevronRight, Eye, Pencil, Plus, RotateCcw, Search, ShieldAlert, X } from "lucide-react";
import { DashboardShell } from "../DashboardShell";
import { EmptyState, LoadingState, PageHeader } from "../DashboardUI";
import { Panel, StatCard, StatusBadge } from "../Dashboard";

type MatchStatus = "Upcoming" | "Completed";
type Player = { id: string; name: string; sport: string; attendance: boolean; ready: boolean; score: number | ""; };
type Match = { id: string; title: string; sport: string; date: string; type: string; sessionId: string; opponent: string; description: string; status: MatchStatus; result: string; participants: Player[] };

const players: Player[] = [
  { id: "AD-1042", name: "Arjun Patel", sport: "Football", attendance: true, ready: true, score: 3 },
  { id: "AD-1088", name: "Meera Shah", sport: "Football", attendance: true, ready: true, score: 2 },
  { id: "AD-1257", name: "Reyansh Das", sport: "Football", attendance: false, ready: false, score: "" },
  { id: "AD-1121", name: "Vihaan Rao", sport: "Cricket", attendance: true, ready: true, score: 68 },
  { id: "AD-1218", name: "Anaya Nair", sport: "Cricket", attendance: false, ready: false, score: "" },
  { id: "AD-1145", name: "Ishaan Verma", sport: "Swimming", attendance: true, ready: true, score: 91 },
  { id: "AD-1192", name: "Kabir Singh", sport: "Athletics", attendance: false, ready: false, score: "" },
];
const initialMatches: Match[] = [
  { id: "MAT-2001", title: "District Football League", sport: "Football", date: "2026-11-18", type: "League", sessionId: "SES-1108", opponent: "Rising Stars FC", description: "Academy district league fixture.", status: "Upcoming", result: "To be played", participants: players.filter((player) => player.sport === "Football" && player.attendance).map((player) => ({ ...player })) },
  { id: "MAT-2002", title: "Academy Championship", sport: "Cricket", date: "2026-10-28", type: "Tournament", sessionId: "SES-1107", opponent: "City Academy", description: "Academy championship match.", status: "Completed", result: "Won 4-2", participants: players.filter((player) => player.sport === "Cricket" && player.attendance).map((player) => ({ ...player })) },
  { id: "MAT-2003", title: "Junior Swimming Meet", sport: "Swimming", date: "2026-10-21", type: "Meet", sessionId: "SES-1106", opponent: "Blue Dolphins", description: "Junior inter-academy swimming meet.", status: "Completed", result: "1st overall", participants: players.filter((player) => player.sport === "Swimming" && player.attendance).map((player) => ({ ...player })) },
  { id: "MAT-2004", title: "City Athletics Trial", sport: "Athletics", date: "2026-12-02", type: "Trial", sessionId: "SES-1105", opponent: "City Athletics Club", description: "City-level player trial.", status: "Upcoming", result: "To be played", participants: [] },
];
const sessions = [
  { id: "SES-1108", label: "SES-1108 · Football · 04 Nov 2026" },
  { id: "SES-1107", label: "SES-1107 · Cricket · 04 Nov 2026" },
  { id: "SES-1106", label: "SES-1106 · Swimming · 03 Nov 2026" },
  { id: "SES-1105", label: "SES-1105 · Athletics · 02 Nov 2026" },
];
const pageSize = 5;

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: ReactNode }) {
  return <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 p-3 sm:p-6" onMouseDown={(event) => event.target === event.currentTarget && onClose()}><div role="dialog" aria-modal="true" aria-labelledby="match-modal-title" className="max-h-[92vh] w-full max-w-4xl overflow-y-auto rounded-2xl bg-white shadow-2xl"><div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-100 bg-white px-5 py-4"><h2 id="match-modal-title" className="font-semibold text-slate-900">{title}</h2><button onClick={onClose} aria-label="Close dialog" className="grid h-9 w-9 place-items-center rounded-lg text-slate-500 hover:bg-slate-100"><X className="h-5 w-5" /></button></div>{children}</div></div>;
}

function MatchForm({ match, matches, onCancel, onSave }: { match?: Match; matches: Match[]; onCancel: () => void; onSave: (match: Match) => void }) {
  const [sport, setSport] = useState(match?.sport ?? "Football");
  const [selectedIds, setSelectedIds] = useState<string[]>(match?.participants.map((player) => player.id) ?? []);
  const [scores, setScores] = useState<Record<string, string>>(Object.fromEntries(match?.participants.map((player) => [player.id, player.score === "" ? "" : String(player.score)]) ?? []));
  const [error, setError] = useState("");
  const [playerQuery, setPlayerQuery] = useState("");
  const sportPlayers = players.filter((player) => player.sport === sport && (!playerQuery.trim() || `${player.name} ${player.id}`.toLowerCase().includes(playerQuery.trim().toLowerCase())));

  const togglePlayer = (player: Player) => {
    if (!player.attendance) return;
    setSelectedIds((current) => current.includes(player.id) ? current.filter((id) => id !== player.id) : [...current, player.id]);
  };
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const title = String(data.get("title") ?? "").trim();
    const opponent = String(data.get("opponent") ?? "").trim();
    const date = String(data.get("date") ?? "");
    const sessionId = String(data.get("sessionId") ?? "");
    if (!title || !opponent || !date || !sessionId) {
      setError("Title, opponent, date and relevant session are required.");
      return;
    }
    if (!selectedIds.length) {
      setError("Select at least one eligible player.");
      return;
    }
    const invalidScore = selectedIds.some((id) => scores[id] !== undefined && scores[id] !== "" && (!Number.isFinite(Number(scores[id])) || Number(scores[id]) < 0));
    if (invalidScore) {
      setError("Player scores cannot be negative.");
      return;
    }
    const participants = selectedIds.map((id) => {
      const player = players.find((item) => item.id === id);
      return player ? { ...player, score: scores[id] ? Number(scores[id]) : "" } : null;
    }).filter((player): player is Player => player !== null);
    onSave({
      id: match?.id ?? `MAT-${2005 + matches.length}`,
      title, opponent, date, sport, sessionId,
      type: String(data.get("type")),
      description: String(data.get("description") ?? "").trim(),
      status: match?.status ?? "Upcoming",
      result: match?.result ?? "To be played",
      participants,
    });
  };
  const inputClass = "mt-1.5 h-11 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100";
  return <form onSubmit={submit} className="space-y-5 p-5">
    {error && <div role="alert" className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
    <div className="grid gap-4 sm:grid-cols-2">
      <label className="text-sm font-medium text-slate-700">Match title *<input name="title" defaultValue={match?.title} required className={inputClass} /></label>
      <label className="text-sm font-medium text-slate-700">Opponent *<input name="opponent" defaultValue={match?.opponent} required className={inputClass} /></label>
      <label className="text-sm font-medium text-slate-700">Sport<select value={sport} onChange={(event) => { setSport(event.target.value); setSelectedIds([]); setScores({}); }} className={inputClass}>{["Football", "Cricket", "Swimming", "Athletics"].map((item) => <option key={item}>{item}</option>)}</select></label>
      <label className="text-sm font-medium text-slate-700">Match date *<input name="date" type="date" defaultValue={match?.date} required className={inputClass} /></label>
      <label className="text-sm font-medium text-slate-700">Match type<select name="type" defaultValue={match?.type ?? "League"} className={inputClass}><option>League</option><option>Tournament</option><option>Trial</option><option>Meet</option><option>Friendly</option></select></label>
      <label className="text-sm font-medium text-slate-700">Relevant session *<select name="sessionId" defaultValue={match?.sessionId ?? sessions.find((item) => item.id.includes(sport === "Football" ? "1108" : sport === "Cricket" ? "1107" : sport === "Swimming" ? "1106" : "1105"))?.id} className={inputClass}>{sessions.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}</select></label>
      <label className="text-sm font-medium text-slate-700 sm:col-span-2">Match description<textarea name="description" defaultValue={match?.description} rows={3} className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" /></label>
      {match && <label className="text-sm font-medium text-slate-700">Match status<select name="status" defaultValue={match.status} className={inputClass}><option>Upcoming</option><option>Completed</option></select></label>}
    </div>
    <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs leading-5 text-amber-800"><ShieldAlert className="mr-2 inline h-4 w-4" /><strong>Eligibility link:</strong> the documented match schema has no session reference. This preview uses an explicitly selected relevant session for demonstration; the production API requires a defined match-session relationship and must not assume a same-day session.</div>
    <div className="rounded-xl border border-slate-200">
      <div className="border-b border-slate-100 p-4"><label className="relative block"><span className="sr-only">Search eligible players</span><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" /><input value={playerQuery} onChange={(event) => setPlayerQuery(event.target.value)} placeholder="Search players..." className="h-10 w-full rounded-lg border border-slate-200 pl-9 pr-3 text-sm" /></label></div>
      <div className="divide-y divide-slate-100">{sportPlayers.map((player) => <div key={player.id} className="flex flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center"><label className={`flex flex-1 items-center gap-3 ${player.attendance ? "cursor-pointer" : "cursor-not-allowed opacity-60"}`}><input type="checkbox" checked={selectedIds.includes(player.id)} disabled={!player.attendance} onChange={() => togglePlayer(player)} /><span><span className="block text-sm font-semibold text-slate-800">{player.name}</span><span className="text-xs text-slate-500">{player.id} · {player.attendance ? "Session attendance eligible" : "Absent in relevant session"}</span></span></label><StatusBadge tone={player.ready ? "green" : "amber"}>{player.ready ? "Ready" : "Not ready"}</StatusBadge>{selectedIds.includes(player.id) && player.attendance && <input aria-label={`${player.name} score`} type="number" min="0" value={scores[player.id] ?? ""} onChange={(event) => setScores((current) => ({ ...current, [player.id]: event.target.value }))} placeholder="Score" className="h-9 w-24 rounded-lg border border-slate-200 px-2 text-sm" />}</div>)}</div>
    </div>
    <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end"><button type="button" onClick={onCancel} className="h-11 rounded-lg border border-slate-200 px-4 text-sm font-semibold text-slate-700">Cancel</button><button type="submit" className="h-11 rounded-lg bg-blue-600 px-5 text-sm font-semibold text-white">{match ? "Save match" : "Create match"}</button></div>
  </form>;
}

export function MatchesManagement() {
  const [matches, setMatches] = useState(initialMatches);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [sport, setSport] = useState("All sports");
  const [status, setStatus] = useState("All statuses");
  const [date, setDate] = useState("");
  const [playerFilter, setPlayerFilter] = useState("All players");
  const [page, setPage] = useState(1);
  const [modal, setModal] = useState<"add" | "edit" | "view" | "scores" | null>(null);
  const [selected, setSelected] = useState(initialMatches[0]);
  const [toast, setToast] = useState("");

  useEffect(() => { const timer = window.setTimeout(() => setLoading(false), 350); return () => window.clearTimeout(timer); }, []);
  const notify = (message: string) => { setToast(message); window.setTimeout(() => setToast(""), 2600); };
  const filtered = useMemo(() => [...matches].filter((item) =>
    (!query.trim() || `${item.id} ${item.title} ${item.opponent}`.toLowerCase().includes(query.trim().toLowerCase())) &&
    (sport === "All sports" || item.sport === sport) &&
    (status === "All statuses" || item.status === status) &&
    (!date || item.date === date) &&
    (playerFilter === "All players" || item.participants.some((participant) => participant.name === playerFilter))
  ).sort((a, b) => b.date.localeCompare(a.date)), [matches, query, sport, status, date, playerFilter]);
  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
  const visible = filtered.slice((page - 1) * pageSize, page * pageSize);
  const upcoming = matches.filter((item) => item.status === "Upcoming").length;
  const completed = matches.filter((item) => item.status === "Completed").length;
  const participants = new Set(matches.flatMap((item) => item.participants.map((player) => player.id))).size;
  const reset = () => { setQuery(""); setSport("All sports"); setStatus("All statuses"); setDate(""); setPlayerFilter("All players"); setPage(1); };
  const saveMatch = (match: Match) => {
    const exists = matches.some((item) => item.id === match.id);
    setMatches((current) => exists ? current.map((item) => item.id === match.id ? match : item) : [match, ...current]);
    setModal(null);
    notify(exists ? "Match changes previewed locally." : "Match created in the local demonstration list.");
  };

  return <DashboardShell role="head-coach" title="Matches Management" subtitle="Demonstration data · Manage matches, participants and scores">
    <PageHeader title="Matches Management" description="Demonstration data · Manage match records and player eligibility" action={<button onClick={() => setModal("add")} className="inline-flex h-11 items-center gap-2 rounded-lg bg-blue-600 px-4 text-sm font-semibold text-white"><Plus className="h-4 w-4" />Create match</button>} />
    <div className="mb-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
      <StatCard label="Total matches" value={String(matches.length)} detail="Demonstration records" icon="trophy" />
      <StatCard label="Upcoming" value={String(upcoming)} detail="Scheduled matches" icon="calendar" tone="blue" />
      <StatCard label="Completed" value={String(completed)} detail="Finished matches" icon="activity" tone="green" />
      <StatCard label="Football matches" value={String(matches.filter((item) => item.sport === "Football").length)} detail="Sport-wise count" icon="trophy" tone="violet" />
      <StatCard label="Participating players" value={String(participants)} detail="Unique eligible players" icon="users" tone="amber" />
    </div>
    {loading ? <LoadingState message="Loading matches..." /> : <Panel title={`Matches (${filtered.length})`}>
      <div className="grid gap-3 border-b border-slate-100 p-4 xl:grid-cols-[minmax(220px,1fr)_150px_150px_150px_180px_44px]">
        <label className="relative"><span className="sr-only">Search matches</span><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" /><input value={query} onChange={(event) => { setQuery(event.target.value); setPage(1); }} placeholder="Search match, ID or opponent..." className="h-10 w-full rounded-lg border border-slate-200 pl-9 pr-3 text-sm" /></label>
        <select aria-label="Filter by sport" value={sport} onChange={(event) => { setSport(event.target.value); setPage(1); }} className="h-10 rounded-lg border border-slate-200 px-3 text-sm"><option>All sports</option>{["Football", "Cricket", "Swimming", "Athletics"].map((item) => <option key={item}>{item}</option>)}</select>
        <select aria-label="Filter by status" value={status} onChange={(event) => { setStatus(event.target.value); setPage(1); }} className="h-10 rounded-lg border border-slate-200 px-3 text-sm"><option>All statuses</option><option>Upcoming</option><option>Completed</option></select>
        <input aria-label="Filter by date" type="date" value={date} onChange={(event) => { setDate(event.target.value); setPage(1); }} className="h-10 rounded-lg border border-slate-200 px-3 text-sm" />
        <select aria-label="Filter by player" value={playerFilter} onChange={(event) => setPlayerFilter(event.target.value)} className="h-10 rounded-lg border border-slate-200 px-3 text-sm"><option>All players</option>{players.filter((item) => item.attendance).map((item) => <option key={item.id}>{item.name}</option>)}</select>
        <button onClick={reset} aria-label="Reset filters" className="grid h-10 place-items-center rounded-lg border border-slate-200 text-slate-500"><RotateCcw className="h-4 w-4" /></button>
      </div>
      {visible.length ? <>
        <div className="overflow-x-auto"><table className="w-full min-w-[930px] text-left text-sm"><thead className="bg-slate-50 text-xs uppercase text-slate-500"><tr><th className="px-5 py-3">Match</th><th className="px-5 py-3">Sport</th><th className="px-5 py-3">Date</th><th className="px-5 py-3">Players</th><th className="px-5 py-3">Status</th><th className="px-5 py-3">Result</th><th className="px-5 py-3">Actions</th></tr></thead><tbody className="divide-y divide-slate-100">{visible.map((item) => <tr key={item.id} className="hover:bg-slate-50/60"><td className="px-5 py-4"><p className="font-semibold text-slate-900">{item.title}</p><p className="text-xs text-slate-500">{item.id} · vs {item.opponent}</p></td><td className="px-5 py-4 text-slate-600">{item.sport}</td><td className="px-5 py-4 text-slate-600">{new Date(`${item.date}T00:00:00`).toLocaleDateString()}</td><td className="px-5 py-4 font-semibold">{item.participants.length}</td><td className="px-5 py-4"><StatusBadge tone={item.status === "Completed" ? "green" : "blue"}>{item.status}</StatusBadge></td><td className="px-5 py-4 font-medium text-slate-700">{item.result}</td><td className="px-5 py-4"><div className="flex gap-2"><button onClick={() => { setSelected(item); setModal("view"); }} aria-label={`View ${item.title}`} className="grid h-8 w-8 place-items-center rounded-lg border border-slate-200 text-slate-600"><Eye className="h-4 w-4" /></button><button onClick={() => { setSelected(item); setModal("edit"); }} aria-label={`Edit ${item.title}`} className="grid h-8 w-8 place-items-center rounded-lg border border-slate-200 text-slate-600"><Pencil className="h-4 w-4" /></button><button onClick={() => { setSelected(item); setModal("scores"); }} className="h-8 rounded-lg border border-slate-200 px-2 text-xs font-semibold text-slate-600">Scores</button></div></td></tr>)}</tbody></table></div>
        <div className="flex flex-col gap-3 border-t border-slate-100 px-5 py-3 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between"><span>Showing {(page - 1) * pageSize + 1}-{Math.min(page * pageSize, filtered.length)} of {filtered.length}</span><div className="flex items-center gap-2"><button disabled={page === 1} onClick={() => setPage((current) => Math.max(1, current - 1))} aria-label="Previous page" className="grid h-8 w-8 place-items-center rounded-lg border border-slate-200 disabled:opacity-40"><ChevronLeft className="h-4 w-4" /></button><span>Page {page} of {pageCount}</span><button disabled={page === pageCount} onClick={() => setPage((current) => Math.min(pageCount, current + 1))} aria-label="Next page" className="grid h-8 w-8 place-items-center rounded-lg border border-slate-200 disabled:opacity-40"><ChevronRight className="h-4 w-4" /></button></div></div>
      </> : <EmptyState title="No matches found" description="Change the search, player or filter selections." action={<button onClick={reset} className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700">Reset filters</button>} />}
    </Panel>}
    {(modal === "add" || modal === "edit") && <Modal title={modal === "add" ? "Create match" : `Edit ${selected.title}`} onClose={() => setModal(null)}><MatchForm match={modal === "edit" ? selected : undefined} matches={matches} onCancel={() => setModal(null)} onSave={saveMatch} /></Modal>}
    {modal === "view" && <Modal title="Match details" onClose={() => setModal(null)}><div className="p-5"><div className="grid gap-4 sm:grid-cols-2">{[["Match", selected.title], ["Match ID", selected.id], ["Sport", selected.sport], ["Type", selected.type], ["Date", new Date(`${selected.date}T00:00:00`).toLocaleDateString()], ["Opponent", selected.opponent], ["Relevant session", selected.sessionId], ["Result", selected.result]].map(([label, value]) => <div key={label} className="rounded-lg border border-slate-100 p-3"><p className="text-xs text-slate-500">{label}</p><p className="mt-1 font-semibold text-slate-800">{value}</p></div>)}</div><p className="mt-5 text-sm text-slate-600">{selected.description || "No match description provided."}</p><div className="mt-5 overflow-x-auto rounded-xl border border-slate-200"><table className="w-full min-w-[460px] text-left text-sm"><thead className="bg-slate-50 text-xs uppercase text-slate-500"><tr><th className="px-4 py-3">Participant</th><th className="px-4 py-3">Eligibility</th><th className="px-4 py-3">Score</th></tr></thead><tbody className="divide-y divide-slate-100">{selected.participants.map((player) => <tr key={player.id}><td className="px-4 py-3 font-medium text-slate-800">{player.name}</td><td className="px-4 py-3"><StatusBadge tone={player.attendance ? "green" : "amber"}>{player.attendance ? "Eligible" : "Ineligible"}</StatusBadge></td><td className="px-4 py-3 font-semibold">{player.score === "" ? "—" : player.score}</td></tr>)}</tbody></table>{!selected.participants.length && <EmptyState title="No participants" description="No eligible players were selected for this match." />}</div><div className="mt-5 flex justify-end"><button onClick={() => setModal(null)} className="h-10 rounded-lg border border-slate-200 px-4 text-sm font-semibold text-slate-700">Close details</button></div></div></Modal>}
    {modal === "scores" && <ScoresModal match={selected} onClose={() => setModal(null)} onSave={(players) => { setMatches((current) => current.map((item) => item.id === selected.id ? { ...item, participants: players } : item)); setModal(null); notify("Player scores saved in the local mock preview."); }} />}
    {toast && <div role="status" className="fixed bottom-5 right-5 z-[60] rounded-xl bg-slate-900 px-4 py-3 text-sm font-medium text-white shadow-xl">{toast}</div>}
  </DashboardShell>;
}

function ScoresModal({ match, onClose, onSave }: { match: Match; onClose: () => void; onSave: (players: Player[]) => void }) {
  const [scores, setScores] = useState<Record<string, string>>(Object.fromEntries(match.participants.map((player) => [player.id, player.score === "" ? "" : String(player.score)])));
  const [error, setError] = useState("");
  const submit = () => {
    if (Object.values(scores).some((score) => score !== "" && (!Number.isFinite(Number(score)) || Number(score) < 0))) { setError("Scores cannot be negative."); return; }
    onSave(match.participants.map((player) => ({ ...player, score: scores[player.id] === "" ? "" : Number(scores[player.id]) })));
  };
  return <Modal title={`${match.title} scores`} onClose={onClose}><div className="p-5">{error && <div role="alert" className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}<div className="space-y-3">{match.participants.map((player) => <label key={player.id} className="flex items-center justify-between gap-4 rounded-lg border border-slate-100 px-4 py-3"><span><span className="block text-sm font-semibold text-slate-800">{player.name}</span><span className="text-xs text-slate-500">{player.id}</span></span><input aria-label={`${player.name} score`} type="number" min="0" value={scores[player.id] ?? ""} onChange={(event) => setScores((current) => ({ ...current, [player.id]: event.target.value }))} className="h-10 w-28 rounded-lg border border-slate-200 px-3 text-sm" /></label>)}</div>{!match.participants.length && <EmptyState title="No participants" description="Add eligible participants before recording scores." />}<div className="mt-5 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end"><button onClick={onClose} className="h-10 rounded-lg border border-slate-200 px-4 text-sm font-semibold text-slate-700">Cancel</button><button onClick={submit} disabled={!match.participants.length} className="h-10 rounded-lg bg-blue-600 px-4 text-sm font-semibold text-white disabled:opacity-50">Save scores</button></div></div></Modal>;
}
