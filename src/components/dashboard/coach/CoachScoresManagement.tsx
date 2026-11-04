"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { Search, X } from "lucide-react";
import { DashboardShell } from "../DashboardShell";
import { EmptyState, LoadingState, PageHeader } from "../DashboardUI";
import { Panel, StatCard, StatusBadge } from "../Dashboard";
import { coachPlayers } from "./coachPlayersData";
import { coachMatchesMock, type CoachMatch } from "./coachMatchesData";
import { coachMatchScoresMock, scoreStatusForMatch, type CoachMatchScores, type CoachPlayerScore } from "./coachScoresData";

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 p-3 sm:p-6" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <div role="dialog" aria-modal="true" className="max-h-[92vh] w-full max-w-4xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-100 bg-white px-5 py-4">
          <h2 className="font-semibold text-slate-900">{title}</h2>
          <button type="button" onClick={onClose} aria-label="Close dialog" className="grid h-9 w-9 place-items-center rounded-lg text-slate-500 hover:bg-slate-100"><X className="h-5 w-5" /></button>
        </div>
        {children}
      </div>
    </div>
  );
}

export function CoachScoresManagement() {
  const [loading, setLoading] = useState(true);
  const [scoreRecords, setScoreRecords] = useState<CoachMatchScores[]>(coachMatchScoresMock);
  const [selectedId, setSelectedId] = useState("");
  const [draft, setDraft] = useState<Record<string, string>>({});
  const [participation, setParticipation] = useState<Record<string, CoachPlayerScore["participationStatus"]>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [query, setQuery] = useState("");
  const [sport, setSport] = useState("All sports");
  const [scoreFilter, setScoreFilter] = useState("All score statuses");
  const [historySport, setHistorySport] = useState("All sports");
  const [historyMatch, setHistoryMatch] = useState("All matches");
  const [historyPlayer, setHistoryPlayer] = useState("All players");
  const [historyFrom, setHistoryFrom] = useState("");
  const [historyTo, setHistoryTo] = useState("");
  const [detailsMatch, setDetailsMatch] = useState<CoachMatch | null>(null);
  const [confirmSave, setConfirmSave] = useState(false);
  const [toast, setToast] = useState("");

  useEffect(() => {
    const timer = window.setTimeout(() => setLoading(false), 350);
    return () => window.clearTimeout(timer);
  }, []);

  const completedMatches = coachMatchesMock.filter((match) => match.status === "Completed");
  const selectedMatch = completedMatches.find((match) => match.id === selectedId) ?? null;
  const scoreStatus = (match: CoachMatch) => scoreStatusForMatch(match, scoreRecords);

  const notify = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(""), 2600);
  };

  const filteredMatches = completedMatches.filter((match) => {
    const status = scoreStatus(match);
    return `${match.name} ${match.id}`.toLowerCase().includes(query.trim().toLowerCase())
      && (sport === "All sports" || match.sport === sport)
      && (scoreFilter === "All score statuses" || status === scoreFilter);
  });

  const currentRecord = scoreRecords.find((record) => record.matchId === selectedId);
  const participants = selectedMatch?.playerIds.map((playerId) => coachPlayers.find((player) => player.id === playerId)).filter((player) => player !== undefined) ?? [];

  const selectMatch = (match: CoachMatch) => {
    setSelectedId(match.id);
    const record = scoreRecords.find((item) => item.matchId === match.id);
    const nextDraft: Record<string, string> = {};
    const nextParticipation: Record<string, CoachPlayerScore["participationStatus"]> = {};
    match.playerIds.forEach((playerId) => {
      const saved = record?.scores.find((score) => score.playerId === playerId);
      nextDraft[playerId] = saved?.score === null || saved?.score === undefined ? "" : String(saved.score);
      nextParticipation[playerId] = saved?.participationStatus ?? "Participated";
    });
    setDraft(nextDraft);
    setParticipation(nextParticipation);
    setErrors({});
  };

  const resetChanges = () => {
    if (!selectedMatch) return;
    selectMatch(selectedMatch);
    notify("Unsaved score changes reset.");
  };

  const validateScores = () => {
    const nextErrors: Record<string, string> = {};
    participants.forEach((player) => {
      if (!player) return;
      if (participation[player.id] !== "Participated") return;
      const value = draft[player.id]?.trim() ?? "";
      const numericValue = Number(value);
      if (!value) nextErrors[player.id] = "Score is required for participating players.";
      else if (!Number.isFinite(numericValue) || numericValue < 0) nextErrors[player.id] = "Enter a valid non-negative number.";
    });
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const saveScores = () => {
    if (!selectedMatch || !validateScores()) return;
    setConfirmSave(true);
  };

  const confirmSaveScores = () => {
    if (!selectedMatch) return;
    const updatedAt = "2026-11-04 21:43";
    const nextScores: CoachPlayerScore[] = selectedMatch.playerIds.map((playerId) => ({
      playerId,
      score: participation[playerId] === "Participated" ? Number(draft[playerId]) : null,
      participationStatus: participation[playerId] ?? "Participated",
      status: "Saved",
      lastUpdated: updatedAt,
    }));
    setScoreRecords((current) => [
      ...current.filter((record) => record.matchId !== selectedMatch.id),
      { matchId: selectedMatch.id, scores: nextScores },
    ]);
    setConfirmSave(false);
    notify("Match scores saved in the local mock preview.");
  };

  const historyRecords = useMemo(() => scoreRecords.flatMap((record) => {
    const match = coachMatchesMock.find((item) => item.id === record.matchId);
    if (!match) return [];
    return record.scores.flatMap((item) => {
      const player = coachPlayers.find((candidate) => candidate.id === item.playerId);
      if (!player || item.score === null) return [];
      if (historySport !== "All sports" && player.sport !== historySport) return [];
      if (historyMatch !== "All matches" && match.name !== historyMatch) return [];
      if (historyPlayer !== "All players" && player.name !== historyPlayer) return [];
      if (historyFrom && match.date < historyFrom) return [];
      if (historyTo && match.date > historyTo) return [];
      return [{ ...item, match, player }];
    });
  }).sort((a, b) => b.match.date.localeCompare(a.match.date)), [scoreRecords, historySport, historyMatch, historyPlayer, historyFrom, historyTo]);

  const withScores = completedMatches.filter((match) => scoreStatus(match) === "Complete").length;
  const pendingMatches = completedMatches.length - withScores;
  const totalScoreRecords = scoreRecords.reduce((sum, record) => sum + record.scores.filter((item) => item.score !== null).length, 0);

  return (
    <DashboardShell role="coach" title="Scores" subtitle="Mock score management for assigned matches">
      <PageHeader title="Scores Management" description="Enter and review numeric match scores for your completed matches" />
      {toast && <div role="status" className="fixed bottom-5 right-5 z-[60] rounded-lg bg-slate-900 px-4 py-3 text-sm text-white shadow-xl">{toast}</div>}
      {loading ? <LoadingState message="Loading scores..." /> : (
        <div className="space-y-5">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard label="Completed matches" value={String(completedMatches.length)} detail="Coach scope mock data" icon="trophy" tone="blue" />
            <StatCard label="Matches with scores" value={String(withScores)} detail="All participants scored" icon="clipboard" tone="green" />
            <StatCard label="Matches pending scores" value={String(pendingMatches)} detail="Require score review" icon="activity" tone="amber" />
            <StatCard label="Player score records" value={String(totalScoreRecords)} detail="Saved numeric scores" icon="users" tone="violet" />
          </div>

          <Panel title="Completed matches">
            <div className="grid gap-3 border-b border-slate-100 p-4 md:grid-cols-[minmax(220px,1fr)_160px_180px]">
              <label className="relative"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" /><span className="sr-only">Search matches</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search completed matches..." className="h-10 w-full rounded-lg border border-slate-200 pl-9 pr-3 text-sm" /></label>
              <select aria-label="Filter scores by sport" value={sport} onChange={(event) => setSport(event.target.value)} className="h-10 rounded-lg border border-slate-200 px-3 text-sm"><option>All sports</option><option>Football</option><option>Athletics</option></select>
              <select aria-label="Filter by score status" value={scoreFilter} onChange={(event) => setScoreFilter(event.target.value)} className="h-10 rounded-lg border border-slate-200 px-3 text-sm"><option>All score statuses</option><option>Complete</option><option>Pending</option><option>Not entered</option></select>
            </div>
            {filteredMatches.length ? (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[800px] text-left text-sm">
                  <thead className="bg-slate-50 text-xs uppercase text-slate-500"><tr><th className="px-5 py-3">Match</th><th className="px-5 py-3">Sport</th><th className="px-5 py-3">Date</th><th className="px-5 py-3">Participants</th><th className="px-5 py-3">Status</th><th className="px-5 py-3">Score status</th><th className="px-5 py-3">Action</th></tr></thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredMatches.map((match) => (
                      <tr key={match.id} className={selectedId === match.id ? "bg-blue-50/50" : ""}>
                        <td className="px-5 py-4"><p className="font-semibold text-slate-900">{match.name}</p><p className="text-xs text-slate-500">{match.id}</p></td>
                        <td className="px-5 py-4">{match.sport}</td>
                        <td className="px-5 py-4">{new Date(`${match.date}T00:00:00`).toLocaleDateString()}</td>
                        <td className="px-5 py-4">{match.playerIds.length}</td>
                        <td className="px-5 py-4"><StatusBadge tone="green">{match.status}</StatusBadge></td>
                        <td className="px-5 py-4"><StatusBadge tone={scoreStatus(match) === "Complete" ? "green" : scoreStatus(match) === "Pending" ? "amber" : "slate"}>{scoreStatus(match)}</StatusBadge></td>
                        <td className="px-5 py-4"><button type="button" onClick={() => selectMatch(match)} className="font-semibold text-blue-600 hover:text-blue-800">Manage scores</button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : <EmptyState title="No completed matches found" description="Try changing the search or score status filters." />}
          </Panel>

          <Panel title={selectedMatch ? `Score entry · ${selectedMatch.name}` : "Score entry"}>
            {!selectedMatch ? (
              <EmptyState title="No match selected" description="Select a completed match above to enter or edit participant scores." />
            ) : participants.length === 0 ? (
              <EmptyState title="No participants" description="This match has no registered player participants." />
            ) : (
              <div className="space-y-4 p-4 sm:p-5">
                <div className="grid gap-2 rounded-lg bg-slate-50 p-4 text-sm sm:grid-cols-3">
                  <p><span className="text-slate-500">Sport:</span> <strong>{selectedMatch.sport}</strong></p>
                  <p><span className="text-slate-500">Date:</span> <strong>{new Date(`${selectedMatch.date}T00:00:00`).toLocaleDateString()}</strong></p>
                  <p><span className="text-slate-500">Opponents:</span> <strong>{selectedMatch.opponent}</strong></p>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[760px] text-left text-sm">
                    <thead className="bg-slate-50 text-xs uppercase text-slate-500"><tr><th className="px-4 py-3">Player</th><th className="px-4 py-3">Sport</th><th className="px-4 py-3">Participation</th><th className="px-4 py-3">Score</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Details</th></tr></thead>
                    <tbody className="divide-y divide-slate-100">
                      {participants.map((player) => {
                        if (!player) return null;
                        const saved = currentRecord?.scores.find((item) => item.playerId === player.id);
                        const modified = saved?.score !== null && saved?.score !== undefined && draft[player.id] !== String(saved.score);
                        return (
                          <tr key={player.id}>
                            <td className="px-4 py-4"><p className="font-semibold text-slate-900">{player.name}</p><p className="text-xs text-slate-500">{player.id}</p></td>
                            <td className="px-4 py-4">{player.sport}</td>
                            <td className="px-4 py-4"><select aria-label={`${player.name} participation`} value={participation[player.id] ?? "Participated"} onChange={(event) => setParticipation((current) => ({ ...current, [player.id]: event.target.value as CoachPlayerScore["participationStatus"] }))} className="h-10 rounded-lg border border-slate-200 px-3"><option>Participated</option><option>Did not participate</option></select></td>
                            <td className="px-4 py-4"><input aria-label={`${player.name} score`} type="number" min="0" step="any" disabled={participation[player.id] === "Did not participate"} value={draft[player.id] ?? ""} onChange={(event) => setDraft((current) => ({ ...current, [player.id]: event.target.value }))} className="h-10 w-28 rounded-lg border border-slate-200 px-3 disabled:bg-slate-100" />{errors[player.id] && <p className="mt-1 max-w-32 text-xs text-red-600">{errors[player.id]}</p>}</td>
                            <td className="px-4 py-4"><StatusBadge tone={modified ? "amber" : saved?.score !== null && saved?.score !== undefined ? "green" : "slate"}>{modified ? "Modified" : saved?.score !== null && saved?.score !== undefined ? "Saved" : "New"}</StatusBadge></td>
                            <td className="px-4 py-4"><button type="button" onClick={() => setDetailsMatch(selectedMatch)} className="text-blue-600 hover:text-blue-800">View details</button></td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                <div className="flex flex-wrap justify-end gap-2 border-t border-slate-100 pt-4">
                  <button type="button" onClick={() => setSelectedId("")} className="h-10 rounded-lg border border-slate-200 px-4 text-sm font-semibold text-slate-700">Cancel</button>
                  <button type="button" onClick={resetChanges} className="h-10 rounded-lg border border-slate-200 px-4 text-sm font-semibold text-slate-700">Reset changes</button>
                  <button type="button" onClick={saveScores} className="h-10 rounded-lg bg-blue-600 px-4 text-sm font-semibold text-white">Save scores</button>
                </div>
              </div>
            )}
          </Panel>

          <Panel title="Score history">
            <div className="grid gap-3 border-b border-slate-100 p-4 md:grid-cols-5">
              <select aria-label="History sport filter" value={historySport} onChange={(event) => setHistorySport(event.target.value)} className="h-10 rounded-lg border border-slate-200 px-3 text-sm"><option>All sports</option><option>Football</option><option>Athletics</option></select>
              <select aria-label="History match filter" value={historyMatch} onChange={(event) => setHistoryMatch(event.target.value)} className="h-10 rounded-lg border border-slate-200 px-3 text-sm"><option>All matches</option>{completedMatches.map((match) => <option key={match.id}>{match.name}</option>)}</select>
              <select aria-label="History player filter" value={historyPlayer} onChange={(event) => setHistoryPlayer(event.target.value)} className="h-10 rounded-lg border border-slate-200 px-3 text-sm"><option>All players</option>{coachPlayers.map((player) => <option key={player.id}>{player.name}</option>)}</select>
              <input aria-label="History from date" type="date" value={historyFrom} onChange={(event) => setHistoryFrom(event.target.value)} className="h-10 rounded-lg border border-slate-200 px-3 text-sm" />
              <input aria-label="History to date" type="date" value={historyTo} onChange={(event) => setHistoryTo(event.target.value)} className="h-10 rounded-lg border border-slate-200 px-3 text-sm" />
            </div>
            {historyRecords.length ? (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[760px] text-left text-sm">
                  <thead className="bg-slate-50 text-xs uppercase text-slate-500"><tr><th className="px-5 py-3">Match</th><th className="px-5 py-3">Player</th><th className="px-5 py-3">Sport</th><th className="px-5 py-3">Date</th><th className="px-5 py-3">Score</th><th className="px-5 py-3">Last updated</th></tr></thead>
                  <tbody className="divide-y divide-slate-100">{historyRecords.map((record) => <tr key={`${record.match.id}-${record.playerId}`}><td className="px-5 py-4 font-medium">{record.match.name}</td><td className="px-5 py-4">{record.player.name}</td><td className="px-5 py-4">{record.match.sport}</td><td className="px-5 py-4">{record.match.date}</td><td className="px-5 py-4 font-semibold">{record.score}</td><td className="px-5 py-4 text-slate-500">{record.lastUpdated ?? "Mock entry"}</td></tr>)}</tbody>
                </table>
              </div>
            ) : <EmptyState title="No scores entered" description="No saved score history matches the selected filters." />}
          </Panel>
        </div>
      )}

      {confirmSave && selectedMatch && (
        <Modal title="Confirm score save" onClose={() => setConfirmSave(false)}>
          <div className="space-y-4 p-5">
            <p className="text-sm text-slate-600">Save the numeric scores for <strong>{selectedMatch.name}</strong>? This is a frontend-only mock update.</p>
            <div className="flex justify-end gap-2"><button type="button" onClick={() => setConfirmSave(false)} className="h-10 rounded-lg border border-slate-200 px-4 text-sm font-semibold">Cancel</button><button type="button" onClick={confirmSaveScores} className="h-10 rounded-lg bg-blue-600 px-4 text-sm font-semibold text-white">Confirm save</button></div>
          </div>
        </Modal>
      )}

      {detailsMatch && (
        <Modal title="Match score details" onClose={() => setDetailsMatch(null)}>
          <div className="space-y-4 p-5">
            <div className="grid gap-3 rounded-lg bg-slate-50 p-4 text-sm sm:grid-cols-3"><p><strong>{detailsMatch.name}</strong></p><p>{detailsMatch.sport}</p><p>{detailsMatch.date}</p></div>
            <div className="overflow-x-auto"><table className="w-full min-w-[520px] text-left text-sm"><thead className="text-xs uppercase text-slate-500"><tr><th className="px-3 py-2">Player</th><th className="px-3 py-2">Score</th><th className="px-3 py-2">Status</th></tr></thead><tbody className="divide-y divide-slate-100">{detailsMatch.playerIds.map((playerId) => {
              const player = coachPlayers.find((item) => item.id === playerId);
              const score = scoreRecords.find((record) => record.matchId === detailsMatch.id)?.scores.find((item) => item.playerId === playerId);
              return <tr key={playerId}><td className="px-3 py-3">{player?.name ?? playerId}</td><td className="px-3 py-3">{score?.score ?? "Not entered"}</td><td className="px-3 py-3">{score?.participationStatus ?? "Participated"}</td></tr>;
            })}</tbody></table></div>
            <div className="flex justify-end"><Link href="/coach/matches" className="text-sm font-semibold text-blue-600">Open match details</Link></div>
          </div>
        </Modal>
      )}
    </DashboardShell>
  );
}
