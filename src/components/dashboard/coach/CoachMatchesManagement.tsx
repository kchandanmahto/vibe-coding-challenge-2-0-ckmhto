"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState, type FormEvent, type ReactNode } from "react";
import { ChevronLeft, ChevronRight, Plus, Search, X } from "lucide-react";
import { DashboardShell } from "../DashboardShell";
import { EmptyState, LoadingState, PageHeader } from "../DashboardUI";
import { Panel, StatCard, StatusBadge } from "../Dashboard";

const pageSize = 5;

type MatchStatus = "UPCOMING" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";
type MatchType = "FRIENDLY" | "TOURNAMENT" | "LEAGUE";

type PlayerOption = {
  id: string;
  name: string;
  playerCode: string;
  sport: string;
};

type SessionOption = {
  id: string;
  sessionCode: string;
  sport: string;
  date: string;
  title: string;
};

type MatchItem = {
  id: string;
  matchCode: string;
  name: string;
  sport: string;
  sportId: string;
  date: string;
  time: string;
  type: MatchType;
  opponent: string;
  description: string;
  venue: string;
  status: MatchStatus;
  playerIds: PlayerOption[];
  sessionId: string;
  sessionName: string;
  createdAt: string;
  teamScore?: number;
  opponentScore?: number;
  result?: string;
};

type MatchOptions = {
  sports: { id: string; name: string }[];
  sessions: SessionOption[];
  players: PlayerOption[];
};

function getId(value: any): string {
  if (!value) return "";
  if (typeof value === "string") return value;
  return String(value._id ?? value.id ?? "");
}

function getName(value: any): string {
  if (!value) return "";
  if (typeof value === "string") return value;
  return String(value.name ?? value.title ?? "");
}

function getDate(value: any): string {
  if (!value) return "";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? String(value).slice(0, 10) : date.toISOString().slice(0, 10);
}

function getTime(value: any): string {
  if (!value) return "";
  if (typeof value === "string" && /^\d{2}:\d{2}/.test(value)) return value.slice(0, 5);
  return "";
}

function unwrapResponse(json: any): any {
  return json?.data ?? json;
}

async function apiRequest(url: string, options?: RequestInit) {
  const response = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });

  const json = await response.json().catch(() => ({}));

  if (!response.ok || json?.success === false) {
    throw new Error(json?.message ?? json?.error ?? "Something went wrong. Please try again.");
  }

  return unwrapResponse(json);
}

function mapPlayer(raw: any): PlayerOption {
  return {
    id: getId(raw),
    name: getName(raw) || "Unknown player",
    playerCode: raw?.playerCode ?? "",
    sport: getName(raw?.sportId) || "",
  };
}

function mapMatch(raw: any): MatchItem {
  const sport = raw?.sportId;
  const session = raw?.sessionId;
  const players = Array.isArray(raw?.playerIds) ? raw.playerIds : [];

  return {
    id: getId(raw),
    matchCode: raw?.matchCode ?? "",
    name: raw?.name ?? "Untitled match",
    sport: getName(sport) || "Unknown sport",
    sportId: getId(sport),
    date: getDate(raw?.date),
    time: getTime(raw?.time),
    type: raw?.type ?? "FRIENDLY",
    opponent: raw?.opponent ?? "",
    description: raw?.description ?? "",
    venue: raw?.venue ?? "",
    status: raw?.status ?? "UPCOMING",
    playerIds: players.map(mapPlayer),
    sessionId: getId(session),
    sessionName: session?.sessionCode ?? session?.title ?? "",
    createdAt: getDate(raw?.createdAt),
    teamScore: raw?.teamScore,
    opponentScore: raw?.opponentScore,
    result: raw?.result,
  };
}

function mapOptions(raw: any): MatchOptions {
  const sports = Array.isArray(raw?.sports) ? raw.sports : [];
  const sessions = Array.isArray(raw?.sessions) ? raw.sessions : [];
  const players = Array.isArray(raw?.players) ? raw.players : [];

  return {
    sports: sports.map((item: any) => ({
      id: getId(item),
      name: getName(item),
    })),
    sessions: sessions.map((item: any) => ({
      id: getId(item),
      sessionCode: item?.sessionCode ?? "",
      sport: getName(item?.sportId),
      date: getDate(item?.date),
      title: item?.title ?? "",
    })),
    players: players.map(mapPlayer),
  };
}

function statusLabel(status: MatchStatus) {
  return {
    UPCOMING: "Upcoming",
    IN_PROGRESS: "In Progress",
    COMPLETED: "Completed",
    CANCELLED: "Cancelled",
  }[status];
}

function typeLabel(type: MatchType) {
  return {
    FRIENDLY: "Friendly",
    TOURNAMENT: "Tournament",
    LEAGUE: "League",
  }[type];
}

function getStatusTone(status: MatchStatus): "green" | "slate" | "amber" | "blue" {
  if (status === "COMPLETED") return "green";
  if (status === "CANCELLED") return "slate";
  if (status === "IN_PROGRESS") return "amber";
  return "blue";
}

function Modal({
  title,
  onClose,
  children,
  wide = false,
}: {
  title: string;
  onClose: () => void;
  children: ReactNode;
  wide?: boolean;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 p-3 sm:p-6"
      onMouseDown={(event) => event.target === event.currentTarget && onClose()}
    >
      <div
        role="dialog"
        aria-modal="true"
        className={`max-h-[92vh] w-full overflow-y-auto rounded-2xl bg-white shadow-2xl ${wide ? "max-w-4xl" : "max-w-xl"
          }`}
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

export function CoachMatchesManagement() {
  const [loading, setLoading] = useState(true);
  const [matches, setMatches] = useState<MatchItem[]>([]);
  const [options, setOptions] = useState<MatchOptions>({
    sports: [],
    sessions: [],
    players: [],
  });

  const [query, setQuery] = useState("");
  const [sport, setSport] = useState("All sports");
  const [date, setDate] = useState("");
  const [status, setStatus] = useState("All statuses");
  const [sort, setSort] = useState("Newest first");
  const [page, setPage] = useState(1);

  const [createOpen, setCreateOpen] = useState(false);
  const [selected, setSelected] = useState<MatchItem | null>(null);
  const [cancelMatch, setCancelMatch] = useState<MatchItem | null>(null);
  const [confirmCreate, setConfirmCreate] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState("");

  const notify = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(""), 3000);
  };

  const loadMatches = useCallback(async () => {
    try {
      setLoading(true);

      const [matchResponse, optionsResponse] = await Promise.all([
        apiRequest("/api/matches?page=1&limit=100"),
        apiRequest("/api/matches/options"),
      ]);

      const matchRows = Array.isArray(matchResponse)
        ? matchResponse
        : matchResponse?.matches ?? matchResponse?.items ?? [];

      setMatches(matchRows.map(mapMatch));
      setOptions(mapOptions(optionsResponse));
    } catch (error) {
      notify(error instanceof Error ? error.message : "Unable to load matches.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadMatches();
  }, [loadMatches]);

  const filtered = useMemo(() => {
    return matches
      .filter((match) =>
        `${match.name} ${match.opponent} ${match.matchCode}`
          .toLowerCase()
          .includes(query.trim().toLowerCase())
      )
      .filter((match) => sport === "All sports" || match.sport === sport)
      .filter((match) => !date || match.date === date)
      .filter((match) => status === "All statuses" || statusLabel(match.status) === status)
      .sort((a, b) =>
        sort === "Oldest first"
          ? a.date.localeCompare(b.date)
          : b.date.localeCompare(a.date)
      );
  }, [matches, query, sport, date, status, sort]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
  const visible = filtered.slice((page - 1) * pageSize, page * pageSize);

  const playersParticipated = new Set(
    matches.flatMap((match) => match.playerIds.map((player) => player.id))
  ).size;

  const upcoming = matches.filter((match) => match.status === "UPCOMING").length;
  const completed = matches.filter((match) => match.status === "COMPLETED").length;
  const cancelled = matches.filter((match) => match.status === "CANCELLED").length;

  const history = matches.filter((match) =>
    (sport === "All sports" || match.sport === sport) &&
    (!date || match.date === date) &&
    (status === "All statuses" || statusLabel(match.status) === status)
  );

  const createMatch = async () => {
    if (!confirmCreate) return;

    try {
      setSaving(true);

      await apiRequest("/api/matches", {
        method: "POST",
        body: JSON.stringify(confirmCreate),
      });

      setConfirmCreate(null);
      setCreateOpen(false);
      notify("Match created successfully.");
      await loadMatches();
    } catch (error) {
      notify(error instanceof Error ? error.message : "Unable to create match.");
    } finally {
      setSaving(false);
    }
  };

  const cancelConfirmed = async () => {
    if (!cancelMatch) return;

    try {
      setSaving(true);

      await apiRequest(`/api/matches/${cancelMatch.id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status: "CANCELLED" }),
      });

      setCancelMatch(null);
      setSelected(null);
      notify("Match cancelled successfully.");
      await loadMatches();
    } catch (error) {
      notify(error instanceof Error ? error.message : "Unable to cancel match.");
    } finally {
      setSaving(false);
    }
  };

  const startMatch = async (match: MatchItem) => {
    try {
      await apiRequest(`/api/matches/${match.id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status: "IN_PROGRESS" }),
      });

      notify("Match started.");
      setSelected(null);
      await loadMatches();
    } catch (error) {
      notify(error instanceof Error ? error.message : "Unable to start match.");
    }
  };

  return (
    <DashboardShell role="coach" title="Matches" subtitle="Matches for your assigned sports">
      <PageHeader
        title="Matches Management"
        description="Create and review matches for your assigned sports"
        action={
          <button
            type="button"
            onClick={() => setCreateOpen(true)}
            className="inline-flex h-11 items-center gap-2 rounded-lg bg-blue-600 px-4 text-sm font-semibold text-white"
          >
            <Plus className="h-4 w-4" />
            Create match
          </button>
        }
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
        <LoadingState message="Loading matches..." />
      ) : (
        <div className="space-y-5">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
            <StatCard label="Total matches" value={String(matches.length)} detail="Your assigned matches" icon="trophy" tone="blue" />
            <StatCard label="Upcoming matches" value={String(upcoming)} detail="Fixtures to be played" icon="calendar" tone="green" />
            <StatCard label="Completed matches" value={String(completed)} detail="Recorded completed matches" icon="clipboard" tone="violet" />
            <StatCard label="Cancelled matches" value={String(cancelled)} detail="Cancelled fixtures" icon="activity" tone="amber" />
            <StatCard label="Players participated" value={String(playersParticipated)} detail="Unique players" icon="users" tone="blue" />
          </div>

          <Panel title="Matches">
            <div className="grid gap-3 border-b border-slate-100 p-4 lg:grid-cols-[minmax(220px,1fr)_150px_170px_170px_160px]">
              <label className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <span className="sr-only">Search matches</span>
                <input
                  value={query}
                  onChange={(event) => {
                    setQuery(event.target.value);
                    setPage(1);
                  }}
                  placeholder="Search match or opponent..."
                  className="h-10 w-full rounded-lg border border-slate-200 pl-9 pr-3 text-sm"
                />
              </label>

              <select
                aria-label="Filter by sport"
                value={sport}
                onChange={(event) => {
                  setSport(event.target.value);
                  setPage(1);
                }}
                className="h-10 rounded-lg border border-slate-200 px-3 text-sm"
              >
                <option>All sports</option>
                {options.sports.map((item) => (
                  <option key={item.id}>{item.name}</option>
                ))}
              </select>

              <input
                aria-label="Filter by date"
                type="date"
                value={date}
                onChange={(event) => {
                  setDate(event.target.value);
                  setPage(1);
                }}
                className="h-10 rounded-lg border border-slate-200 px-3 text-sm"
              />

              <select
                aria-label="Filter by status"
                value={status}
                onChange={(event) => {
                  setStatus(event.target.value);
                  setPage(1);
                }}
                className="h-10 rounded-lg border border-slate-200 px-3 text-sm"
              >
                <option>All statuses</option>
                <option>Upcoming</option>
                <option>In Progress</option>
                <option>Completed</option>
                <option>Cancelled</option>
              </select>

              <select
                aria-label="Sort matches"
                value={sort}
                onChange={(event) => setSort(event.target.value)}
                className="h-10 rounded-lg border border-slate-200 px-3 text-sm"
              >
                <option>Newest first</option>
                <option>Oldest first</option>
              </select>
            </div>

            {visible.length ? (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[920px] text-left text-sm">
                  <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                    <tr>
                      <th className="px-5 py-3">Match</th>
                      <th className="px-5 py-3">Sport</th>
                      <th className="px-5 py-3">Date</th>
                      <th className="px-5 py-3">Type</th>
                      <th className="px-5 py-3">Players</th>
                      <th className="px-5 py-3">Status</th>
                      <th className="px-5 py-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {visible.map((match) => (
                      <tr key={match.id}>
                        <td className="px-5 py-4">
                          <p className="font-semibold text-slate-900">{match.name}</p>
                          <p className="text-xs text-slate-500">
                            {match.matchCode || match.id} · vs {match.opponent}
                          </p>
                        </td>
                        <td className="px-5 py-4">{match.sport}</td>
                        <td className="px-5 py-4">
                          {new Date(`${match.date}T00:00:00`).toLocaleDateString()}
                        </td>
                        <td className="px-5 py-4">{typeLabel(match.type)}</td>
                        <td className="px-5 py-4">{match.playerIds.length}</td>
                        <td className="px-5 py-4">
                          <StatusBadge tone={getStatusTone(match.status)}>
                            {statusLabel(match.status)}
                          </StatusBadge>
                        </td>
                        <td className="px-5 py-4">
                          <button
                            type="button"
                            onClick={() => setSelected(match)}
                            className="font-semibold text-blue-600"
                          >
                            View details
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <EmptyState
                title="No matches found"
                description="No matches match the selected filters."
              />
            )}

            {filtered.length > 0 && (
              <div className="flex items-center justify-between border-t border-slate-100 px-5 py-4">
                <p className="text-xs text-slate-500">
                  {filtered.length} matches · Page {page} of {pageCount}
                </p>
                <div className="flex gap-2">
                  <button
                    type="button"
                    disabled={page === 1}
                    onClick={() => setPage((value) => Math.max(1, value - 1))}
                    aria-label="Previous page"
                    className="grid h-9 w-9 place-items-center rounded-lg border border-slate-200 disabled:opacity-40"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    disabled={page >= pageCount}
                    onClick={() => setPage((value) => Math.min(pageCount, value + 1))}
                    aria-label="Next page"
                    className="grid h-9 w-9 place-items-center rounded-lg border border-slate-200 disabled:opacity-40"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}
          </Panel>

          <Panel title="Match history">
            {history.length ? (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[760px] text-left text-sm">
                  <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                    <tr>
                      <th className="px-5 py-3">Match</th>
                      <th className="px-5 py-3">Sport</th>
                      <th className="px-5 py-3">Date</th>
                      <th className="px-5 py-3">Participants</th>
                      <th className="px-5 py-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {history.map((match) => (
                      <tr key={match.id}>
                        <td className="px-5 py-4 font-semibold">{match.name}</td>
                        <td className="px-5 py-4">{match.sport}</td>
                        <td className="px-5 py-4">{match.date}</td>
                        <td className="px-5 py-4">{match.playerIds.length}</td>
                        <td className="px-5 py-4">{statusLabel(match.status)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <EmptyState title="No match history" description="No matches match the history filters." />
            )}
          </Panel>
        </div>
      )}

      {createOpen && (
        <MatchForm
          onCancel={() => setCreateOpen(false)}
          onReview={setConfirmCreate}
          notify={notify}
        />
      )}

      {confirmCreate && (
        <Modal title="Confirm match creation" onClose={() => setConfirmCreate(null)}>
          <div className="p-5">
            <p className="text-sm text-slate-600">
              Create <strong>{confirmCreate.name}</strong> for{" "}
              {confirmCreate.playerIds.length} eligible players?
            </p>
            <div className="mt-5 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setConfirmCreate(null)}
                className="h-10 rounded-lg border border-slate-200 px-4 text-sm font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={saving}
                onClick={() => void createMatch()}
                className="h-10 rounded-lg bg-blue-600 px-4 text-sm font-semibold text-white disabled:opacity-50"
              >
                {saving ? "Creating..." : "Confirm creation"}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {selected && (
        <Modal title="Match details" onClose={() => setSelected(null)} wide>
          <div className="p-5">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <Info label="Match ID" value={selected.matchCode || selected.id} />
              <Info label="Sport" value={selected.sport} />
              <Info label="Date and time" value={`${selected.date} · ${selected.time || "Not set"}`} />
              <Info label="Type" value={typeLabel(selected.type)} />
              <Info label="Opponent" value={selected.opponent} />
              <Info label="Status" value={statusLabel(selected.status)} />
              <Info label="Created" value={selected.createdAt || "—"} />
              <Info label="Related session" value={selected.sessionName || selected.sessionId || "—"} />
              <Info label="Venue" value={selected.venue || "—"} />
            </div>

            {selected.status === "COMPLETED" && (
              <div className="mt-4 rounded-xl border border-slate-200 p-4">
                <h3 className="font-semibold">Match result</h3>
                <p className="mt-2 text-sm text-slate-700">
                  {selected.teamScore ?? 0} - {selected.opponentScore ?? 0}
                  {selected.result ? ` · ${selected.result.replace("_", " ")}` : ""}
                </p>
              </div>
            )}

            <p className="mt-5 text-sm text-slate-600">
              {selected.description || "No additional notes."}
            </p>

            <div className="mt-5 rounded-xl border border-slate-200 p-4">
              <h3 className="font-semibold">Participants</h3>
              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                {selected.playerIds.map((player) => (
                  <div
                    key={player.id}
                    className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2 text-sm"
                  >
                    <span>{player.name}</span>
                    <span className="text-xs text-slate-500">{player.playerCode}</span>
                  </div>
                ))}
                {!selected.playerIds.length && (
                  <p className="text-sm text-slate-500">No participants found.</p>
                )}
              </div>
            </div>

            <div className="mt-5 flex flex-wrap justify-end gap-3 border-t border-slate-100 pt-4">
              <Link
                href="/coach/scores"
                className="h-10 rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700"
              >
                View scores
              </Link>

              {selected.status === "UPCOMING" && (
                <button
                  type="button"
                  onClick={() => void startMatch(selected)}
                  className="h-10 rounded-lg bg-blue-600 px-4 text-sm font-semibold text-white"
                >
                  Start match
                </button>
              )}

              {selected.status !== "CANCELLED" && selected.status !== "COMPLETED" && (
                <button
                  type="button"
                  onClick={() => setCancelMatch(selected)}
                  className="h-10 rounded-lg border border-red-200 px-4 text-sm font-semibold text-red-700"
                >
                  Cancel match
                </button>
              )}
            </div>
          </div>
        </Modal>
      )}

      {cancelMatch && (
        <Modal title="Cancel match?" onClose={() => setCancelMatch(null)}>
          <div className="p-5">
            <p className="text-sm text-slate-600">
              Cancel <strong>{cancelMatch.name}</strong>? This will update the match in the database.
            </p>
            <div className="mt-5 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setCancelMatch(null)}
                className="h-10 rounded-lg border border-slate-200 px-4 text-sm font-semibold"
              >
                Keep match
              </button>
              <button
                type="button"
                disabled={saving}
                onClick={() => void cancelConfirmed()}
                className="h-10 rounded-lg bg-red-600 px-4 text-sm font-semibold text-white disabled:opacity-50"
              >
                {saving ? "Cancelling..." : "Cancel match"}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </DashboardShell>
  );
}

function MatchForm({
  onCancel,
  onReview,
  notify,
}: {
  onCancel: () => void;
  onReview: (match: any) => void;
  notify: (message: string) => void;
}) {
  const [options, setOptions] = useState<MatchOptions>({
    sports: [],
    sessions: [],
    players: [],
  });

  const [sportId, setSportId] = useState("");
  const [sessionId, setSessionId] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [playerQuery, setPlayerQuery] = useState("");
  const [loadingOptions, setLoadingOptions] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadOptions() {
      try {
        setLoadingOptions(true);
        const response = await apiRequest("/api/matches/options");
        if (!active) return;

        const mapped = mapOptions(response);
        setOptions(mapped);

        if (mapped.sports.length === 1) {
          setSportId(mapped.sports[0].id);
        }
      } catch (err) {
        if (active) {
          setError(err instanceof Error ? err.message : "Unable to load match options.");
        }
      } finally {
        if (active) setLoadingOptions(false);
      }
    }

    void loadOptions();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!sessionId) {
      setOptions((current) => ({ ...current, players: [] }));
      return;
    }

    let active = true;

    async function loadEligiblePlayers() {
      try {
        const response = await apiRequest(
          `/api/matches/options?sessionId=${encodeURIComponent(sessionId)}`
        );

        if (!active) return;

        const mapped = mapOptions(response);
        setOptions((current) => ({
          ...current,
          players: mapped.players,
        }));
        setSelectedIds([]);
      } catch (err) {
        if (active) {
          setOptions((current) => ({ ...current, players: [] }));
          setError(err instanceof Error ? err.message : "Unable to load eligible players.");
        }
      }
    }

    void loadEligiblePlayers();

    return () => {
      active = false;
    };
  }, [sessionId]);

  const selectedSport = options.sports.find((item) => item.id === sportId);
  const availableSessions = options.sessions.filter(
    (session) => getId(session.sport) === sportId || session.sport === selectedSport?.name
  );

  const visiblePlayers = options.players.filter((player) =>
    `${player.name} ${player.playerCode}`
      .toLowerCase()
      .includes(playerQuery.trim().toLowerCase())
  );

  const togglePlayer = (playerId: string) => {
    setSelectedIds((current) =>
      current.includes(playerId)
        ? current.filter((id) => id !== playerId)
        : [...current, playerId]
    );
  };

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    const formData = new FormData(event.currentTarget);

    const name = String(formData.get("name") ?? "").trim();
    const matchDate = String(formData.get("date") ?? "");
    const time = String(formData.get("time") ?? "");
    const type = String(formData.get("type") ?? "FRIENDLY") as MatchType;
    const opponent = String(formData.get("opponent") ?? "").trim();
    const venue = String(formData.get("venue") ?? "").trim();
    const description = String(formData.get("description") ?? "").trim();

    if (!name || !matchDate || !opponent) {
      setError("Match name, date and opponent are required.");
      return;
    }

    if (!sportId) {
      setError("Please select a sport.");
      return;
    }

    if (!sessionId) {
      setError("Please select a closed training session.");
      return;
    }

    if (!selectedIds.length) {
      setError("Select at least one eligible player.");
      return;
    }

    onReview({
      name,
      sportId,
      date: matchDate,
      time: time || undefined,
      type,
      opponent,
      venue: venue || undefined,
      description: description || undefined,
      playerIds: selectedIds,
      sessionId,
    });
  };

  const inputClass = "mt-1.5 h-11 w-full rounded-lg border border-slate-200 px-3 text-sm";

  return (
    <Modal title="Create match" onClose={onCancel} wide>
      <form onSubmit={submit} className="space-y-5 p-5">
        {error && (
          <div role="alert" className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {loadingOptions ? (
          <LoadingState message="Loading sports and sessions..." />
        ) : (
          <>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="text-sm font-medium">
                Match name *
                <input name="name" required className={inputClass} placeholder="e.g. Academy vs City Club" />
              </label>

              <label className="text-sm font-medium">
                Sport *
                <select
                  value={sportId}
                  onChange={(event) => {
                    setSportId(event.target.value);
                    setSessionId("");
                    setSelectedIds([]);
                  }}
                  required
                  className={inputClass}
                >
                  <option value="">Select sport</option>
                  {options.sports.map((item) => (
                    <option key={item.id} value={item.id}>{item.name}</option>
                  ))}
                </select>
              </label>

              <label className="text-sm font-medium">
                Match date *
                <input name="date" type="date" required className={inputClass} />
              </label>

              <label className="text-sm font-medium">
                Match time
                <input name="time" type="time" className={inputClass} />
              </label>

              <label className="text-sm font-medium">
                Match type *
                <select name="type" required className={inputClass}>
                  <option value="FRIENDLY">Friendly</option>
                  <option value="TOURNAMENT">Tournament</option>
                  <option value="LEAGUE">League</option>
                </select>
              </label>

              <label className="text-sm font-medium">
                Opponent *
                <input name="opponent" required className={inputClass} placeholder="Opponent team name" />
              </label>

              <label className="text-sm font-medium sm:col-span-2">
                Related training session *
                <select
                  value={sessionId}
                  onChange={(event) => {
                    setSessionId(event.target.value);
                    setSelectedIds([]);
                  }}
                  required
                  disabled={!sportId}
                  className={inputClass}
                >
                  <option value="">Select a closed session</option>
                  {availableSessions.map((session) => (
                    <option key={session.id} value={session.id}>
                      {session.sessionCode || session.title} · {session.sport} · {session.date}
                    </option>
                  ))}
                </select>
                <span className="mt-1 block text-xs text-slate-500">
                  Only closed sessions are available. Players must have Present or Late attendance.
                </span>
              </label>

              <label className="text-sm font-medium">
                Venue
                <input name="venue" className={inputClass} placeholder="Match venue" />
              </label>

              <label className="text-sm font-medium sm:col-span-2">
                Notes
                <textarea name="description" rows={3} className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" />
              </label>
            </div>

            <fieldset className="rounded-xl border border-slate-200 p-4">
              <legend className="px-1 text-sm font-semibold">Participating players</legend>

              {!sessionId ? (
                <p className="rounded-lg bg-slate-50 p-4 text-sm text-slate-500">
                  Select a training session first to load eligible players.
                </p>
              ) : (
                <>
                  <label className="relative mb-3 block">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input
                      value={playerQuery}
                      onChange={(event) => setPlayerQuery(event.target.value)}
                      placeholder="Search eligible players"
                      className="h-10 w-full rounded-lg border border-slate-200 pl-9 pr-3 text-sm"
                    />
                  </label>

                  {visiblePlayers.length ? (
                    <div className="grid gap-2 sm:grid-cols-2">
                      {visiblePlayers.map((player) => (
                        <button
                          type="button"
                          key={player.id}
                          onClick={() => togglePlayer(player.id)}
                          className={`flex items-center justify-between rounded-lg border px-3 py-2 text-left text-sm ${selectedIds.includes(player.id)
                              ? "border-blue-300 bg-blue-50"
                              : "border-slate-200"
                            }`}
                        >
                          <span>
                            <strong>{player.name}</strong>
                            <span className="block text-xs text-slate-500">{player.playerCode}</span>
                          </span>
                          <span className="text-xs font-semibold text-emerald-700">
                            {selectedIds.includes(player.id) ? "Selected" : "Eligible"}
                          </span>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <p className="rounded-lg bg-slate-50 p-4 text-sm text-slate-500">
                      No eligible players found for this session.
                    </p>
                  )}
                </>
              )}

              <p className="mt-3 text-xs text-slate-500">
                Selected players: {selectedIds.length}
              </p>
            </fieldset>
          </>
        )}

        <div className="flex justify-end gap-3 border-t border-slate-100 pt-5">
          <button
            type="button"
            onClick={onCancel}
            className="h-10 rounded-lg border border-slate-200 px-4 text-sm font-semibold"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loadingOptions}
            className="h-10 rounded-lg bg-blue-600 px-5 text-sm font-semibold text-white disabled:opacity-50"
          >
            Review match
          </button>
        </div>
      </form>
    </Modal>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-slate-50 p-4">
      <p className="text-xs text-slate-500">{label}</p>
      <p className="mt-1 break-words font-semibold text-slate-800">{value}</p>
    </div>
  );
}