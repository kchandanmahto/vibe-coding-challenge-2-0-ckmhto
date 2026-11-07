
"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { Search, X } from "lucide-react";
import { DashboardShell } from "../DashboardShell";
import { EmptyState, LoadingState, PageHeader } from "../DashboardUI";
import { Panel, StatCard, StatusBadge } from "../Dashboard";

type ApiObject = Record<string, unknown>;

type CoachPlayer = {
  id: string;
  name: string;
  playerCode: string;
  sport: string;
};

type CoachMatch = {
  id: string;
  name: string;
  sport: string;
  date: string;
  opponent: string;
  status: string;
  playerIds: string[];
};

type PlayerPerformance = {
  playerId: string;
  score: number | null;
  participationStatus: "Participated" | "Did not participate";
  lastUpdated?: string;
};

type MatchPerformanceRecord = {
  matchId: string;
  scores: PlayerPerformance[];
};

type HistoryRecord = {
  id: string;
  matchId: string;
  matchName: string;
  sport: string;
  date: string;
  playerId: string;
  playerName: string;
  score: number;
  lastUpdated: string;
};

function Modal({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: ReactNode;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 p-3 sm:p-6"
      onMouseDown={(event) =>
        event.target === event.currentTarget && onClose()
      }
    >
      <div
        role="dialog"
        aria-modal="true"
        className="max-h-[92vh] w-full max-w-4xl overflow-y-auto rounded-2xl bg-white shadow-2xl"
      >
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-100 bg-white px-5 py-4">
          <h2 className="font-semibold text-slate-900">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="grid h-9 w-9 place-items-center rounded-lg text-slate-500 hover:bg-slate-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

function getObjectId(value: unknown): string {
  if (typeof value === "string") return value;

  if (value && typeof value === "object") {
    const item = value as ApiObject;

    if (typeof item._id === "string") return item._id;
    if (typeof item.id === "string") return item.id;
  }

  return "";
}

function getObjectName(value: unknown, fallback = ""): string {
  if (typeof value === "string") return value;

  if (value && typeof value === "object") {
    const item = value as ApiObject;

    if (typeof item.name === "string") return item.name;
    if (typeof item.title === "string") return item.title;
  }

  return fallback;
}

function getArray(value: unknown): ApiObject[] {
  if (!Array.isArray(value)) return [];
  return value.filter(
    (item): item is ApiObject =>
      typeof item === "object" && item !== null
  );
}

function getResponseArray(
  data: ApiObject,
  key: string
): ApiObject[] {
  const direct = getArray(data[key]);
  if (direct.length) return direct;

  const nested = data.data;

  if (nested && typeof nested === "object") {
    return getArray((nested as ApiObject)[key]);
  }

  return [];
}

function getSportName(value: unknown): string {
  if (typeof value === "string") return value;

  if (value && typeof value === "object") {
    const item = value as ApiObject;
    return getObjectName(item, "Unknown sport");
  }

  return "Unknown sport";
}

function mapPlayer(raw: ApiObject): CoachPlayer {
  return {
    id: getObjectId(raw._id ?? raw.id),
    name: String(raw.name ?? "Unknown player"),
    playerCode: String(raw.playerCode ?? ""),
    sport: getSportName(raw.sportId ?? raw.sport),
  };
}

function mapMatch(raw: ApiObject): CoachMatch {
  const playerIds = Array.isArray(raw.playerIds)
    ? raw.playerIds.map(getObjectId).filter(Boolean)
    : [];

  const sport = getSportName(raw.sportId ?? raw.sport);

  const dateValue = raw.date;
  const date =
    dateValue instanceof Date
      ? dateValue.toISOString().slice(0, 10)
      : typeof dateValue === "string"
        ? dateValue.slice(0, 10)
        : "";

  return {
    id: getObjectId(raw._id ?? raw.id),
    name: String(raw.name ?? raw.matchCode ?? "Untitled match"),
    sport,
    date,
    opponent: String(raw.opponent ?? "—"),
    status: String(raw.status ?? "").toUpperCase(),
    playerIds,
  };
}

function mapPerformance(raw: ApiObject): PlayerPerformance {
  const participation =
    raw.participationStatus === "DID_NOT_PARTICIPATE"
      ? "Did not participate"
      : "Participated";

  return {
    playerId: getObjectId(raw.playerId),
    score:
      typeof raw.score === "number" && Number.isFinite(raw.score)
        ? raw.score
        : null,
    participationStatus: participation,
    lastUpdated:
      typeof raw.updatedAt === "string"
        ? new Date(raw.updatedAt).toLocaleString()
        : "",
  };
}

function getScoreStatus(
  match: CoachMatch,
  records: MatchPerformanceRecord[]
) {
  const record = records.find((item) => item.matchId === match.id);

  if (!record || record.scores.length === 0) return "Not entered";

  const savedIds = new Set(record.scores.map((item) => item.playerId));

  if (match.playerIds.every((id) => savedIds.has(id))) {
    return "Complete";
  }

  return "Pending";
}

export function CoachScoresManagement() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [players, setPlayers] = useState<CoachPlayer[]>([]);
  const [completedMatches, setCompletedMatches] = useState<CoachMatch[]>([]);
  const [scoreRecords, setScoreRecords] = useState<MatchPerformanceRecord[]>([]);
  const [historyRecords, setHistoryRecords] = useState<HistoryRecord[]>([]);

  const [selectedId, setSelectedId] = useState("");
  const [draft, setDraft] = useState<Record<string, string>>({});
  const [participation, setParticipation] = useState<
    Record<string, PlayerPerformance["participationStatus"]>
  >({});
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

  const notify = useCallback((message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(""), 2600);
  }, []);

  const loadHistory = useCallback(async () => {
    const response = await fetch(
      "/api/match-performance?page=1&limit=100",
      { cache: "no-store" }
    );

    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.message ?? "Unable to load score history.");
    }

    const records = getResponseArray(data, "performances");

    const mapped: HistoryRecord[] = records.flatMap((raw) => {
      const player = raw.playerId as ApiObject | undefined;
      const match = raw.matchId as ApiObject | undefined;

      if (
        typeof raw.score !== "number" ||
        !player ||
        typeof player !== "object" ||
        !match ||
        typeof match !== "object"
      ) {
        return [];
      }

      const matchDate =
        typeof match.date === "string"
          ? match.date.slice(0, 10)
          : "";

      return [{
        id: getObjectId(raw._id) || `${getObjectId(match._id)}-${getObjectId(player._id)}`,
        matchId: getObjectId(match._id),
        matchName: String(match.name ?? match.matchCode ?? "Match"),
        sport: getSportName(match.sportId ?? match.sport),
        date: matchDate,
        playerId: getObjectId(player._id),
        playerName: String(player.name ?? "Unknown player"),
        score: raw.score,
        lastUpdated:
          typeof raw.updatedAt === "string"
            ? new Date(raw.updatedAt).toLocaleString()
            : "—",
      }];
    });

    setHistoryRecords(mapped);
  }, []);

  const loadInitialData = useCallback(async () => {
    setLoading(true);

    try {
      const [matchesResponse, playersResponse] = await Promise.all([
        fetch("/api/matches?status=COMPLETED&page=1&limit=100", {
          cache: "no-store",
        }),
        fetch("/api/players?page=1&limit=100", {
          cache: "no-store",
        }),
      ]);

      const [matchesData, playersData] = await Promise.all([
        matchesResponse.json(),
        playersResponse.json(),
      ]);

      if (!matchesResponse.ok || !matchesData.success) {
        throw new Error(matchesData.message ?? "Unable to load matches.");
      }

      if (!playersResponse.ok || !playersData.success) {
        throw new Error(playersData.message ?? "Unable to load players.");
      }

      const matches = getResponseArray(matchesData, "matches")
        .map(mapMatch)
        .filter((match) => match.id && match.status === "COMPLETED");

      const mappedPlayers = getResponseArray(playersData, "players")
        .map(mapPlayer)
        .filter((player) => player.id);

      setCompletedMatches(matches);
      setPlayers(mappedPlayers);

      await loadHistory();
    } catch (error) {
      notify(
        error instanceof Error
          ? error.message
          : "Unable to load score management data."
      );
    } finally {
      setLoading(false);
    }
  }, [loadHistory, notify]);

  useEffect(() => {
    void loadInitialData();
  }, [loadInitialData]);

  const selectedMatch =
    completedMatches.find((match) => match.id === selectedId) ?? null;

  const currentRecord =
    scoreRecords.find((record) => record.matchId === selectedId);

  const participants = useMemo(() => {
    if (!selectedMatch) return [];

    return selectedMatch.playerIds.map((playerId) => {
      const player = players.find((item) => item.id === playerId);

      return player ?? {
        id: playerId,
        name: "Player",
        playerCode: playerId,
        sport: selectedMatch.sport,
      };
    });
  }, [selectedMatch, players]);

  const selectMatch = async (match: CoachMatch) => {
    setSelectedId(match.id);
    setDraft({});
    setParticipation({});
    setErrors({});

    try {
      const response = await fetch(
        `/api/match-performance?matchId=${encodeURIComponent(match.id)}`,
        { cache: "no-store" }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message ?? "Unable to load match performances.");
      }

      const rawPerformances = getResponseArray(data, "performances");
      const scores = rawPerformances.map(mapPerformance);

      const record: MatchPerformanceRecord = {
        matchId: match.id,
        scores,
      };

      setScoreRecords((current) => [
        ...current.filter((item) => item.matchId !== match.id),
        record,
      ]);

      const nextDraft: Record<string, string> = {};
      const nextParticipation: Record<
        string,
        PlayerPerformance["participationStatus"]
      > = {};

      match.playerIds.forEach((playerId) => {
        const saved = scores.find((item) => item.playerId === playerId);

        nextDraft[playerId] =
          saved?.score === null || saved?.score === undefined
            ? ""
            : String(saved.score);

        nextParticipation[playerId] =
          saved?.participationStatus ?? "Participated";
      });

      setDraft(nextDraft);
      setParticipation(nextParticipation);
    } catch (error) {
      notify(
        error instanceof Error
          ? error.message
          : "Unable to load match performances."
      );
    }
  };

  const resetChanges = () => {
    if (!selectedMatch) return;

    const record = scoreRecords.find(
      (item) => item.matchId === selectedMatch.id
    );

    const nextDraft: Record<string, string> = {};
    const nextParticipation: Record<
      string,
      PlayerPerformance["participationStatus"]
    > = {};

    selectedMatch.playerIds.forEach((playerId) => {
      const saved = record?.scores.find(
        (item) => item.playerId === playerId
      );

      nextDraft[playerId] =
        saved?.score === null || saved?.score === undefined
          ? ""
          : String(saved.score);

      nextParticipation[playerId] =
        saved?.participationStatus ?? "Participated";
    });

    setDraft(nextDraft);
    setParticipation(nextParticipation);
    setErrors({});
    notify("Unsaved changes reset.");
  };

  const validateScores = () => {
    const nextErrors: Record<string, string> = {};

    participants.forEach((player) => {
      if (participation[player.id] !== "Participated") return;

      const value = draft[player.id]?.trim() ?? "";
      const numericValue = Number(value);

      if (!value) {
        nextErrors[player.id] =
          "Score is required for participating players.";
      } else if (
        !Number.isFinite(numericValue) ||
        numericValue < 0
      ) {
        nextErrors[player.id] =
          "Enter a valid non-negative number.";
      }
    });

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const saveScores = () => {
    if (!selectedMatch || !validateScores()) return;
    setConfirmSave(true);
  };

  const confirmSaveScores = async () => {
    if (!selectedMatch || saving) return;

    setSaving(true);

    try {
      const performances = selectedMatch.playerIds.map((playerId) => ({
        playerId,
        participationStatus:
          participation[playerId] === "Did not participate"
            ? "DID_NOT_PARTICIPATE"
            : "PARTICIPATED",
        ...(participation[playerId] === "Participated"
          ? { score: Number(draft[playerId]) }
          : {}),
      }));

      const response = await fetch("/api/match-performance", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          matchId: selectedMatch.id,
          performances,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message ?? "Unable to save performances.");
      }

      const savedScores = getResponseArray(data, "performances")
        .map(mapPerformance);

      setScoreRecords((current) => [
        ...current.filter(
          (item) => item.matchId !== selectedMatch.id
        ),
        {
          matchId: selectedMatch.id,
          scores: savedScores,
        },
      ]);

      setConfirmSave(false);
      notify("Match performances saved successfully.");

      await loadHistory();
    } catch (error) {
      notify(
        error instanceof Error
          ? error.message
          : "Unable to save match performances."
      );
    } finally {
      setSaving(false);
    }
  };

  const filteredMatches = completedMatches.filter((match) => {
    const status = getScoreStatus(match, scoreRecords);

    return (
      `${match.name} ${match.id}`
        .toLowerCase()
        .includes(query.trim().toLowerCase()) &&
      (sport === "All sports" || match.sport === sport) &&
      (scoreFilter === "All score statuses" || status === scoreFilter)
    );
  });

  const filteredHistory = historyRecords.filter((record) => {
    return (
      (historySport === "All sports" || record.sport === historySport) &&
      (historyMatch === "All matches" || record.matchName === historyMatch) &&
      (historyPlayer === "All players" || record.playerName === historyPlayer) &&
      (!historyFrom || record.date >= historyFrom) &&
      (!historyTo || record.date <= historyTo)
    );
  });

  const withScores = completedMatches.filter(
    (match) => getScoreStatus(match, scoreRecords) === "Complete"
  ).length;

  const pendingMatches = completedMatches.length - withScores;

  const totalScoreRecords = historyRecords.length;

  const sports = Array.from(
    new Set([
      ...completedMatches.map((match) => match.sport),
      ...players.map((player) => player.sport),
    ])
  ).filter((item) => item && item !== "Unknown sport");

  const matchNames = Array.from(
    new Set(historyRecords.map((record) => record.matchName))
  );

  const playerNames = Array.from(
    new Set(historyRecords.map((record) => record.playerName))
  );

  return (
    <DashboardShell
      role="coach"
      title="Scores"
      subtitle="Match score and player performance management"
    >
      <PageHeader
        title="Scores Management"
        description="Enter and review numeric match scores for your completed matches"
      />

      {toast && (
        <div
          role="status"
          className="fixed bottom-5 right-5 z-[60] rounded-lg bg-slate-900 px-4 py-3 text-sm text-white shadow-xl"
        >
          {toast}
        </div>
      )}

      {loading ? (
        <LoadingState message="Loading scores..." />
      ) : (
        <div className="space-y-5">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              label="Completed matches"
              value={String(completedMatches.length)}
              detail="Matches in your coach scope"
              icon="trophy"
              tone="blue"
            />
            <StatCard
              label="Matches with scores"
              value={String(withScores)}
              detail="All participants scored"
              icon="clipboard"
              tone="green"
            />
            <StatCard
              label="Matches pending scores"
              value={String(pendingMatches)}
              detail="Require score review"
              icon="activity"
              tone="amber"
            />
            <StatCard
              label="Player score records"
              value={String(totalScoreRecords)}
              detail="Saved numeric scores"
              icon="users"
              tone="violet"
            />
          </div>

          <Panel title="Completed matches">
            <div className="grid gap-3 border-b border-slate-100 p-4 md:grid-cols-[minmax(220px,1fr)_160px_180px]">
              <label className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <span className="sr-only">Search matches</span>
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search completed matches..."
                  className="h-10 w-full rounded-lg border border-slate-200 pl-9 pr-3 text-sm"
                />
              </label>

              <select
                aria-label="Filter scores by sport"
                value={sport}
                onChange={(event) => setSport(event.target.value)}
                className="h-10 rounded-lg border border-slate-200 px-3 text-sm"
              >
                <option>All sports</option>
                {sports.map((item) => (
                  <option key={item}>{item}</option>
                ))}
              </select>

              <select
                aria-label="Filter by score status"
                value={scoreFilter}
                onChange={(event) => setScoreFilter(event.target.value)}
                className="h-10 rounded-lg border border-slate-200 px-3 text-sm"
              >
                <option>All score statuses</option>
                <option>Complete</option>
                <option>Pending</option>
                <option>Not entered</option>
              </select>
            </div>

            {filteredMatches.length ? (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[800px] text-left text-sm">
                  <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                    <tr>
                      <th className="px-5 py-3">Match</th>
                      <th className="px-5 py-3">Sport</th>
                      <th className="px-5 py-3">Date</th>
                      <th className="px-5 py-3">Participants</th>
                      <th className="px-5 py-3">Status</th>
                      <th className="px-5 py-3">Score status</th>
                      <th className="px-5 py-3">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredMatches.map((match) => {
                      const status = getScoreStatus(match, scoreRecords);

                      return (
                        <tr
                          key={match.id}
                          className={
                            selectedId === match.id
                              ? "bg-blue-50/50"
                              : ""
                          }
                        >
                          <td className="px-5 py-4">
                            <p className="font-semibold text-slate-900">
                              {match.name}
                            </p>
                            <p className="text-xs text-slate-500">
                              {match.id}
                            </p>
                          </td>
                          <td className="px-5 py-4">{match.sport}</td>
                          <td className="px-5 py-4">
                            {match.date
                              ? new Date(
                                `${match.date}T00:00:00`
                              ).toLocaleDateString()
                              : "—"}
                          </td>
                          <td className="px-5 py-4">
                            {match.playerIds.length}
                          </td>
                          <td className="px-5 py-4">
                            <StatusBadge tone="green">
                              Completed
                            </StatusBadge>
                          </td>
                          <td className="px-5 py-4">
                            <StatusBadge
                              tone={
                                status === "Complete"
                                  ? "green"
                                  : status === "Pending"
                                    ? "amber"
                                    : "slate"
                              }
                            >
                              {status}
                            </StatusBadge>
                          </td>
                          <td className="px-5 py-4">
                            <button
                              type="button"
                              onClick={() => void selectMatch(match)}
                              className="font-semibold text-blue-600 hover:text-blue-800"
                            >
                              Manage scores
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <EmptyState
                title="No completed matches found"
                description="Try changing the search or score status filters."
              />
            )}
          </Panel>

          <Panel
            title={
              selectedMatch
                ? `Score entry · ${selectedMatch.name}`
                : "Score entry"
            }
          >
            {!selectedMatch ? (
              <EmptyState
                title="No match selected"
                description="Select a completed match above to enter or edit participant scores."
              />
            ) : participants.length === 0 ? (
              <EmptyState
                title="No participants"
                description="This match has no registered player participants."
              />
            ) : (
              <div className="space-y-4 p-4 sm:p-5">
                <div className="grid gap-2 rounded-lg bg-slate-50 p-4 text-sm sm:grid-cols-3">
                  <p>
                    <span className="text-slate-500">Sport:</span>{" "}
                    <strong>{selectedMatch.sport}</strong>
                  </p>
                  <p>
                    <span className="text-slate-500">Date:</span>{" "}
                    <strong>{selectedMatch.date || "—"}</strong>
                  </p>
                  <p>
                    <span className="text-slate-500">Opponents:</span>{" "}
                    <strong>{selectedMatch.opponent}</strong>
                  </p>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full min-w-[760px] text-left text-sm">
                    <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                      <tr>
                        <th className="px-4 py-3">Player</th>
                        <th className="px-4 py-3">Sport</th>
                        <th className="px-4 py-3">Participation</th>
                        <th className="px-4 py-3">Score</th>
                        <th className="px-4 py-3">Status</th>
                        <th className="px-4 py-3">Details</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {participants.map((player) => {
                        const saved = currentRecord?.scores.find(
                          (item) => item.playerId === player.id
                        );

                        const modified =
                          (saved?.score === null ||
                            saved?.score === undefined
                            ? ""
                            : String(saved.score)) !==
                          (draft[player.id] ?? "");

                        return (
                          <tr key={player.id}>
                            <td className="px-4 py-4">
                              <p className="font-semibold text-slate-900">
                                {player.name}
                              </p>
                              <p className="text-xs text-slate-500">
                                {player.playerCode}
                              </p>
                            </td>
                            <td className="px-4 py-4">
                              {player.sport}
                            </td>
                            <td className="px-4 py-4">
                              <select
                                aria-label={`${player.name} participation`}
                                value={
                                  participation[player.id] ??
                                  "Participated"
                                }
                                onChange={(event) =>
                                  setParticipation((current) => ({
                                    ...current,
                                    [player.id]: event.target.value as PlayerPerformance["participationStatus"],
                                  }))
                                }
                                className="h-10 rounded-lg border border-slate-200 px-3"
                              >
                                <option>Participated</option>
                                <option>Did not participate</option>
                              </select>
                            </td>
                            <td className="px-4 py-4">
                              <input
                                aria-label={`${player.name} score`}
                                type="number"
                                min="0"
                                step="any"
                                disabled={
                                  participation[player.id] ===
                                  "Did not participate"
                                }
                                value={draft[player.id] ?? ""}
                                onChange={(event) =>
                                  setDraft((current) => ({
                                    ...current,
                                    [player.id]: event.target.value,
                                  }))
                                }
                                className="h-10 w-28 rounded-lg border border-slate-200 px-3 disabled:bg-slate-100"
                              />
                              {errors[player.id] && (
                                <p className="mt-1 max-w-32 text-xs text-red-600">
                                  {errors[player.id]}
                                </p>
                              )}
                            </td>
                            <td className="px-4 py-4">
                              <StatusBadge
                                tone={
                                  modified
                                    ? "amber"
                                    : saved
                                      ? "green"
                                      : "slate"
                                }
                              >
                                {modified
                                  ? "Modified"
                                  : saved
                                    ? "Saved"
                                    : "New"}
                              </StatusBadge>
                            </td>
                            <td className="px-4 py-4">
                              <button
                                type="button"
                                onClick={() =>
                                  setDetailsMatch(selectedMatch)
                                }
                                className="text-blue-600 hover:text-blue-800"
                              >
                                View details
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                <div className="flex flex-wrap justify-end gap-2 border-t border-slate-100 pt-4">
                  <button
                    type="button"
                    onClick={() => setSelectedId("")}
                    className="h-10 rounded-lg border border-slate-200 px-4 text-sm font-semibold text-slate-700"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={resetChanges}
                    className="h-10 rounded-lg border border-slate-200 px-4 text-sm font-semibold text-slate-700"
                  >
                    Reset changes
                  </button>
                  <button
                    type="button"
                    onClick={saveScores}
                    disabled={saving}
                    className="h-10 rounded-lg bg-blue-600 px-4 text-sm font-semibold text-white disabled:opacity-60"
                  >
                    Save scores
                  </button>
                </div>
              </div>
            )}
          </Panel>

          <Panel title="Score history">
            <div className="grid gap-3 border-b border-slate-100 p-4 md:grid-cols-5">
              <select
                aria-label="History sport filter"
                value={historySport}
                onChange={(event) => setHistorySport(event.target.value)}
                className="h-10 rounded-lg border border-slate-200 px-3 text-sm"
              >
                <option>All sports</option>
                {sports.map((item) => (
                  <option key={item}>{item}</option>
                ))}
              </select>

              <select
                aria-label="History match filter"
                value={historyMatch}
                onChange={(event) => setHistoryMatch(event.target.value)}
                className="h-10 rounded-lg border border-slate-200 px-3 text-sm"
              >
                <option>All matches</option>
                {matchNames.map((item) => (
                  <option key={item}>{item}</option>
                ))}
              </select>

              <select
                aria-label="History player filter"
                value={historyPlayer}
                onChange={(event) => setHistoryPlayer(event.target.value)}
                className="h-10 rounded-lg border border-slate-200 px-3 text-sm"
              >
                <option>All players</option>
                {playerNames.map((item) => (
                  <option key={item}>{item}</option>
                ))}
              </select>

              <input
                aria-label="History from date"
                type="date"
                value={historyFrom}
                onChange={(event) => setHistoryFrom(event.target.value)}
                className="h-10 rounded-lg border border-slate-200 px-3 text-sm"
              />

              <input
                aria-label="History to date"
                type="date"
                value={historyTo}
                onChange={(event) => setHistoryTo(event.target.value)}
                className="h-10 rounded-lg border border-slate-200 px-3 text-sm"
              />
            </div>

            {filteredHistory.length ? (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[760px] text-left text-sm">
                  <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                    <tr>
                      <th className="px-5 py-3">Match</th>
                      <th className="px-5 py-3">Player</th>
                      <th className="px-5 py-3">Sport</th>
                      <th className="px-5 py-3">Date</th>
                      <th className="px-5 py-3">Score</th>
                      <th className="px-5 py-3">Last updated</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredHistory.map((record) => (
                      <tr key={record.id}>
                        <td className="px-5 py-4 font-medium">
                          {record.matchName}
                        </td>
                        <td className="px-5 py-4">
                          {record.playerName}
                        </td>
                        <td className="px-5 py-4">
                          {record.sport}
                        </td>
                        <td className="px-5 py-4">
                          {record.date || "—"}
                        </td>
                        <td className="px-5 py-4 font-semibold">
                          {record.score}
                        </td>
                        <td className="px-5 py-4 text-slate-500">
                          {record.lastUpdated}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <EmptyState
                title="No scores entered"
                description="No saved score history matches the selected filters."
              />
            )}
          </Panel>
        </div>
      )}

      {confirmSave && selectedMatch && (
        <Modal
          title="Confirm score save"
          onClose={() => setConfirmSave(false)}
        >
          <div className="space-y-4 p-5">
            <p className="text-sm text-slate-600">
              Save the numeric scores for{" "}
              <strong>{selectedMatch.name}</strong>? This will update
              the match performance records in the database.
            </p>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setConfirmSave(false)}
                disabled={saving}
                className="h-10 rounded-lg border border-slate-200 px-4 text-sm font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => void confirmSaveScores()}
                disabled={saving}
                className="h-10 rounded-lg bg-blue-600 px-4 text-sm font-semibold text-white disabled:opacity-60"
              >
                {saving ? "Saving..." : "Confirm save"}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {detailsMatch && (
        <Modal
          title="Match score details"
          onClose={() => setDetailsMatch(null)}
        >
          <div className="space-y-4 p-5">
            <div className="grid gap-3 rounded-lg bg-slate-50 p-4 text-sm sm:grid-cols-3">
              <p><strong>{detailsMatch.name}</strong></p>
              <p>{detailsMatch.sport}</p>
              <p>{detailsMatch.date}</p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[520px] text-left text-sm">
                <thead className="text-xs uppercase text-slate-500">
                  <tr>
                    <th className="px-3 py-2">Player</th>
                    <th className="px-3 py-2">Score</th>
                    <th className="px-3 py-2">Participation</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {detailsMatch.playerIds.map((playerId) => {
                    const player = players.find(
                      (item) => item.id === playerId
                    );

                    const score = scoreRecords
                      .find((record) => record.matchId === detailsMatch.id)
                      ?.scores.find(
                        (item) => item.playerId === playerId
                      );

                    return (
                      <tr key={playerId}>
                        <td className="px-3 py-3">
                          {player?.name ?? playerId}
                        </td>
                        <td className="px-3 py-3">
                          {score?.score ?? "Not entered"}
                        </td>
                        <td className="px-3 py-3">
                          {score?.participationStatus ?? "Participated"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="flex justify-end">
              <Link
                href="/coach/matches"
                className="text-sm font-semibold text-blue-600"
              >
                Open match details
              </Link>
            </div>
          </div>
        </Modal>
      )}
    </DashboardShell>
  );
}
