"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, type FormEvent, type ReactNode } from "react";
import { ChevronLeft, ChevronRight, Plus, Search, X } from "lucide-react";
import { DashboardShell } from "../DashboardShell";
import { EmptyState, LoadingState, PageHeader } from "../DashboardUI";
import { Panel, StatCard, StatusBadge } from "../Dashboard";
import { coachPlayers } from "./coachPlayersData";
import { coachMatchesMock, type CoachMatch } from "./coachMatchesData";

const pageSize = 5;

function Modal({ title, onClose, children, wide = false }: { title: string; onClose: () => void; children: ReactNode; wide?: boolean }) {
  return <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 p-3 sm:p-6" onMouseDown={(event) => event.target === event.currentTarget && onClose()}><div role="dialog" aria-modal="true" className={`max-h-[92vh] w-full overflow-y-auto rounded-2xl bg-white shadow-2xl ${wide ? "max-w-4xl" : "max-w-xl"}`}><div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-100 bg-white px-5 py-4"><h2 className="font-semibold text-slate-900">{title}</h2><button type="button" onClick={onClose} aria-label="Close dialog" className="grid h-9 w-9 place-items-center rounded-lg text-slate-500 hover:bg-slate-100"><X className="h-5 w-5" /></button></div>{children}</div></div>;
}

export function CoachMatchesManagement() {
  const [loading, setLoading] = useState(true);
  const [matches, setMatches] = useState(coachMatchesMock);
  const [query, setQuery] = useState("");
  const [sport, setSport] = useState("All sports");
  const [date, setDate] = useState("");
  const [status, setStatus] = useState("All statuses");
  const [sort, setSort] = useState("Newest first");
  const [page, setPage] = useState(1);
  const [createOpen, setCreateOpen] = useState(false);
  const [selected, setSelected] = useState<CoachMatch | null>(null);
  const [cancelMatch, setCancelMatch] = useState<CoachMatch | null>(null);
  const [confirmCreate, setConfirmCreate] = useState<CoachMatch | null>(null);
  const [toast, setToast] = useState("");

  useEffect(() => { const timer = window.setTimeout(() => setLoading(false), 350); return () => window.clearTimeout(timer); }, []);
  const notify = (message: string) => { setToast(message); window.setTimeout(() => setToast(""), 2600); };

  const filtered = useMemo(() => matches.filter((match) =>
    `${match.name} ${match.opponent}`.toLowerCase().includes(query.trim().toLowerCase())
    && (sport === "All sports" || match.sport === sport)
    && (!date || match.date === date)
    && (status === "All statuses" || match.status === status)
  ).sort((a, b) => sort === "Oldest first" ? a.date.localeCompare(b.date) : b.date.localeCompare(a.date)), [matches, query, sport, date, status, sort]);
  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
  const visible = filtered.slice((page - 1) * pageSize, page * pageSize);

  const playersParticipated = new Set(matches.flatMap((match) => match.playerIds)).size;
  const upcoming = matches.filter((match) => match.status === "Upcoming").length;
  const completed = matches.filter((match) => match.status === "Completed").length;
  const cancelled = matches.filter((match) => match.status === "Cancelled").length;

  const createMatch = (draft: CoachMatch) => {
    setMatches((current) => [draft, ...current]);
    setConfirmCreate(null);
    setCreateOpen(false);
    notify("Match created in the local mock preview.");
  };

  const cancelConfirmed = () => {
    if (!cancelMatch) return;
    setMatches((current) => current.map((match) => match.id === cancelMatch.id ? { ...match, status: "Cancelled" } : match));
    setCancelMatch(null);
    setSelected(null);
    notify("Match cancelled in the mock preview.");
  };

  const history = matches.filter((match) =>
    (sport === "All sports" || match.sport === sport)
    && (!date || match.date === date)
    && (status === "All statuses" || match.status === status)
  );

  return (
    <DashboardShell role="coach" title="Matches" subtitle="Mock matches for assigned sports">
      <PageHeader title="Matches Management" description="Create and review matches for your assigned sports" action={<button type="button" onClick={() => setCreateOpen(true)} className="inline-flex h-11 items-center gap-2 rounded-lg bg-blue-600 px-4 text-sm font-semibold text-white"><Plus className="h-4 w-4" />Create match</button>} />
      {toast && <div role="status" className="fixed bottom-5 right-5 z-[60] rounded-lg bg-slate-900 px-4 py-3 text-sm text-white shadow-xl">{toast}</div>}
      {loading ? <LoadingState message="Loading matches..." /> : (
        <div className="space-y-5">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
            <StatCard label="Total matches" value={String(matches.length)} detail="Coach scope mock data" icon="trophy" tone="blue" />
            <StatCard label="Upcoming matches" value={String(upcoming)} detail="Fixtures to be played" icon="calendar" tone="green" />
            <StatCard label="Completed matches" value={String(completed)} detail="Recorded completed matches" icon="clipboard" tone="violet" />
            <StatCard label="Cancelled matches" value={String(cancelled)} detail="Cancelled mock fixtures" icon="activity" tone="amber" />
            <StatCard label="Players participated" value={String(playersParticipated)} detail="Unique assigned players" icon="users" tone="blue" />
          </div>

          <Panel title="Matches">
            <div className="grid gap-3 border-b border-slate-100 p-4 lg:grid-cols-[minmax(220px,1fr)_150px_170px_170px_160px]">
              <label className="relative"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" /><span className="sr-only">Search matches</span><input value={query} onChange={(event) => { setQuery(event.target.value); setPage(1); }} placeholder="Search match or opponent..." className="h-10 w-full rounded-lg border border-slate-200 pl-9 pr-3 text-sm" /></label>
              <select aria-label="Filter by sport" value={sport} onChange={(event) => { setSport(event.target.value); setPage(1); }} className="h-10 rounded-lg border border-slate-200 px-3 text-sm"><option>All sports</option><option>Football</option><option>Athletics</option></select>
              <input aria-label="Filter by date" type="date" value={date} onChange={(event) => { setDate(event.target.value); setPage(1); }} className="h-10 rounded-lg border border-slate-200 px-3 text-sm" />
              <select aria-label="Filter by status" value={status} onChange={(event) => { setStatus(event.target.value); setPage(1); }} className="h-10 rounded-lg border border-slate-200 px-3 text-sm"><option>All statuses</option><option>Upcoming</option><option>In Progress</option><option>Completed</option><option>Cancelled</option></select>
              <select aria-label="Sort matches" value={sort} onChange={(event) => setSort(event.target.value)} className="h-10 rounded-lg border border-slate-200 px-3 text-sm"><option>Newest first</option><option>Oldest first</option></select>
            </div>
            {visible.length ? <div className="overflow-x-auto"><table className="w-full min-w-[920px] text-left text-sm"><thead className="bg-slate-50 text-xs uppercase text-slate-500"><tr><th className="px-5 py-3">Match</th><th className="px-5 py-3">Sport</th><th className="px-5 py-3">Date</th><th className="px-5 py-3">Type</th><th className="px-5 py-3">Players</th><th className="px-5 py-3">Status</th><th className="px-5 py-3">Actions</th></tr></thead><tbody className="divide-y divide-slate-100">{visible.map((match) => <tr key={match.id}><td className="px-5 py-4"><p className="font-semibold text-slate-900">{match.name}</p><p className="text-xs text-slate-500">{match.id} · vs {match.opponent}</p></td><td className="px-5 py-4">{match.sport}</td><td className="px-5 py-4">{new Date(`${match.date}T00:00:00`).toLocaleDateString()}</td><td className="px-5 py-4">{match.type}</td><td className="px-5 py-4">{match.playerIds.length}</td><td className="px-5 py-4"><StatusBadge tone={match.status === "Completed" ? "green" : match.status === "Cancelled" ? "slate" : match.status === "In Progress" ? "amber" : "blue"}>{match.status}</StatusBadge></td><td className="px-5 py-4"><button type="button" onClick={() => setSelected(match)} className="font-semibold text-blue-600">View details</button></td></tr>)}</tbody></table></div> : <EmptyState title="No matches found" description="No matches match the selected filters." />}
            {filtered.length > 0 && <div className="flex items-center justify-between border-t border-slate-100 px-5 py-4"><p className="text-xs text-slate-500">{filtered.length} matches · Page {page} of {pageCount}</p><div className="flex gap-2"><button type="button" disabled={page === 1} onClick={() => setPage((value) => Math.max(1, value - 1))} aria-label="Previous page" className="grid h-9 w-9 place-items-center rounded-lg border border-slate-200 disabled:opacity-40"><ChevronLeft className="h-4 w-4" /></button><button type="button" disabled={page >= pageCount} onClick={() => setPage((value) => Math.min(pageCount, value + 1))} aria-label="Next page" className="grid h-9 w-9 place-items-center rounded-lg border border-slate-200 disabled:opacity-40"><ChevronRight className="h-4 w-4" /></button></div></div>}
          </Panel>

          <Panel title="Match history">
            {history.length ? <div className="overflow-x-auto"><table className="w-full min-w-[760px] text-left text-sm"><thead className="bg-slate-50 text-xs uppercase text-slate-500"><tr><th className="px-5 py-3">Match</th><th className="px-5 py-3">Sport</th><th className="px-5 py-3">Date</th><th className="px-5 py-3">Participants</th><th className="px-5 py-3">Status</th></tr></thead><tbody className="divide-y divide-slate-100">{history.map((match) => <tr key={match.id}><td className="px-5 py-4 font-semibold">{match.name}</td><td className="px-5 py-4">{match.sport}</td><td className="px-5 py-4">{match.date}</td><td className="px-5 py-4">{match.playerIds.length}</td><td className="px-5 py-4">{match.status}</td></tr>)}</tbody></table></div> : <EmptyState title="No match history" description="No matches match the history filters." />}
          </Panel>
        </div>
      )}

      {createOpen && <MatchForm matches={matches} onCancel={() => setCreateOpen(false)} onReview={setConfirmCreate} />}
      {confirmCreate && <Modal title="Confirm match creation" onClose={() => setConfirmCreate(null)}><div className="p-5"><p className="text-sm text-slate-600">Create <strong>{confirmCreate.name}</strong> for {confirmCreate.playerIds.length} eligible players? This preview does not persist to a database.</p><div className="mt-5 flex justify-end gap-3"><button type="button" onClick={() => setConfirmCreate(null)} className="h-10 rounded-lg border border-slate-200 px-4 text-sm font-semibold">Cancel</button><button type="button" onClick={() => createMatch(confirmCreate)} className="h-10 rounded-lg bg-blue-600 px-4 text-sm font-semibold text-white">Confirm creation</button></div></div></Modal>}
      {selected && <Modal title="Match details" onClose={() => setSelected(null)} wide><div className="p-5"><div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"><Info label="Match ID" value={selected.id} /><Info label="Sport" value={selected.sport} /><Info label="Date and time" value={`${selected.date} · ${selected.time}`} /><Info label="Type" value={selected.type} /><Info label="Opponent" value={selected.opponent} /><Info label="Status" value={selected.status} /><Info label="Created" value={selected.createdAt} /><Info label="Related session" value={selected.sessionId ?? "Not linked"} /></div><p className="mt-5 text-sm text-slate-600">{selected.description || "No additional notes."}</p><div className="mt-5 rounded-xl border border-slate-200 p-4"><h3 className="font-semibold">Participants</h3><div className="mt-3 grid gap-2 sm:grid-cols-2">{selected.playerIds.map((id) => { const player = coachPlayers.find((item) => item.id === id); return player ? <div key={id} className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2 text-sm"><span>{player.name}</span><span className="text-xs text-emerald-700">Eligible</span></div> : null; })}</div></div>{selected.sessionId && <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800">Frontend preview only: the database schema does not currently define a match-to-session relationship. Attendance eligibility for this display is shown only from mock session data.</div>}<div className="mt-5 flex flex-wrap justify-end gap-3 border-t border-slate-100 pt-4"><Link href="/coach/scores" className="h-10 rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700">View scores</Link>{selected.status !== "Cancelled" && selected.status !== "Completed" && <button type="button" onClick={() => setCancelMatch(selected)} className="h-10 rounded-lg border border-red-200 px-4 text-sm font-semibold text-red-700">Cancel match</button>}</div></div></Modal>}
      {cancelMatch && <Modal title="Cancel match?" onClose={() => setCancelMatch(null)}><div className="p-5"><p className="text-sm text-slate-600">Cancel <strong>{cancelMatch.name}</strong>? Completed match records are not modified.</p><div className="mt-5 flex justify-end gap-3"><button type="button" onClick={() => setCancelMatch(null)} className="h-10 rounded-lg border border-slate-200 px-4 text-sm font-semibold">Keep match</button><button type="button" onClick={cancelConfirmed} className="h-10 rounded-lg bg-red-600 px-4 text-sm font-semibold text-white">Cancel match</button></div></div></Modal>}
    </DashboardShell>
  );
}

function MatchForm({ matches, onCancel, onReview }: { matches: CoachMatch[]; onCancel: () => void; onReview: (match: CoachMatch) => void }) {
  const [sport, setSport] = useState<"Football" | "Athletics">("Football");
  const [sessionId, setSessionId] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [error, setError] = useState("");
  const [playerQuery, setPlayerQuery] = useState("");
  const attendanceBySession: Record<string, Record<string, "Present" | "Absent">> = {
    "SES-1108": { "AD-1042": "Present", "AD-1088": "Present", "AD-1265": "Absent", "AD-1342": "Present" },
    "SES-1110": { "AD-1310": "Present", "AD-1396": "Absent" },
    "SES-1104": { "AD-1042": "Present", "AD-1088": "Present", "AD-1265": "Absent", "AD-1342": "Present" },
  };
  const eligiblePlayers = coachPlayers.filter((player) => player.sport === sport && (!playerQuery.trim() || `${player.name} ${player.id}`.toLowerCase().includes(playerQuery.trim().toLowerCase())));
  const playerEligibility = (playerId: string) => sessionId ? attendanceBySession[sessionId]?.[playerId] ?? "Not Eligible" : "Eligible";
  const togglePlayer = (playerId: string) => {
    const eligibility = playerEligibility(playerId);
    if (eligibility !== "Eligible" && eligibility !== "Present") return;
    setSelectedIds((current) => current.includes(playerId) ? current.filter((id) => id !== playerId) : [...current, playerId]);
  };
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const name = String(data.get("name") ?? "").trim();
    const matchDate = String(data.get("date") ?? "");
    const time = String(data.get("time") ?? "");
    if (!name || !matchDate || !time) { setError("Match name, date and time are required."); return; }
    if (!selectedIds.length) { setError("Select at least one eligible player."); return; }
    if (matches.some((match) => match.name.toLowerCase() === name.toLowerCase() && match.date === matchDate)) { setError("A match with this name and date already exists."); return; }
    const draft: CoachMatch = { id: `MAT-${3200 + matches.length}`, name, sport, date: matchDate, time, type: String(data.get("type")), opponent: String(data.get("opponent") ?? "").trim(), description: String(data.get("description") ?? "").trim(), status: "Upcoming", playerIds: selectedIds, sessionId: sessionId || undefined, createdAt: "2026-11-04" };
    onReview(draft);
  };
  const inputClass = "mt-1.5 h-11 w-full rounded-lg border border-slate-200 px-3 text-sm";
  return <Modal title="Create match" onClose={onCancel} wide><form onSubmit={submit} className="space-y-5 p-5">{error && <div role="alert" className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}<div className="grid gap-4 sm:grid-cols-2"><label className="text-sm font-medium">Match name *<input name="name" required className={inputClass} /></label><label className="text-sm font-medium">Sport<select value={sport} onChange={(event) => { setSport(event.target.value as "Football" | "Athletics"); setSelectedIds([]); setSessionId(""); }} className={inputClass}><option>Football</option><option>Athletics</option></select></label><label className="text-sm font-medium">Match date *<input name="date" type="date" required className={inputClass} /></label><label className="text-sm font-medium">Match time *<input name="time" type="time" required className={inputClass} /></label><label className="text-sm font-medium">Match type<select name="type" className={inputClass}><option>League</option><option>Tournament</option><option>Trial</option><option>Meet</option><option>Friendly</option></select></label><label className="text-sm font-medium">Opponent<input name="opponent" className={inputClass} /></label><label className="text-sm font-medium sm:col-span-2">Related session<select value={sessionId} onChange={(event) => { setSessionId(event.target.value); setSelectedIds([]); }} className={inputClass}><option value="">No session linked</option>{sport === "Football" ? <><option value="SES-1108">SES-1108 · Football · 04 Nov 2026</option><option value="SES-1104">SES-1104 · Football · 03 Nov 2026</option></> : <option value="SES-1110">SES-1110 · Athletics · 04 Nov 2026</option>}</select></label><label className="text-sm font-medium sm:col-span-2">Notes<textarea name="description" rows={3} className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" /></label></div><div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800">The database schema does not define a match-to-session field. Session linking is a frontend preview only; attendance eligibility still follows mock records for the explicitly selected session.</div><fieldset className="rounded-xl border border-slate-200 p-4"><legend className="px-1 text-sm font-semibold">Participating players</legend><label className="relative mb-3 block"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" /><input value={playerQuery} onChange={(event) => setPlayerQuery(event.target.value)} placeholder="Search eligible players" className="h-10 w-full rounded-lg border border-slate-200 pl-9 pr-3 text-sm" /></label>{eligiblePlayers.length ? <div className="grid gap-2 sm:grid-cols-2">{eligiblePlayers.map((player) => { const eligibility = playerEligibility(player.id); const selectable = eligibility === "Eligible" || eligibility === "Present"; return <button type="button" key={player.id} disabled={!selectable} onClick={() => togglePlayer(player.id)} className={`flex items-center justify-between rounded-lg border px-3 py-2 text-left text-sm ${selectedIds.includes(player.id) ? "border-blue-300 bg-blue-50" : "border-slate-200"} disabled:cursor-not-allowed disabled:bg-slate-50 disabled:opacity-70`}><span><strong>{player.name}</strong><span className="block text-xs text-slate-500">{player.id}</span></span><span className={`text-xs font-semibold ${eligibility === "Present" || eligibility === "Eligible" ? "text-emerald-700" : eligibility === "Absent" ? "text-red-700" : "text-slate-500"}`}>{eligibility}</span></button>; })}</div> : <div className="rounded-lg bg-slate-50 p-4 text-sm text-slate-500">No eligible players found for this sport.</div>}</fieldset><div className="flex justify-end gap-3 border-t border-slate-100 pt-5"><button type="button" onClick={onCancel} className="h-10 rounded-lg border border-slate-200 px-4 text-sm font-semibold">Cancel</button><button type="submit" className="h-10 rounded-lg bg-blue-600 px-5 text-sm font-semibold text-white">Review match</button></div></form></Modal>;
}

function Info({ label, value }: { label: string; value: string }) {
  return <div className="rounded-lg bg-slate-50 p-4"><p className="text-xs text-slate-500">{label}</p><p className="mt-1 font-semibold text-slate-800">{value}</p></div>;
}
