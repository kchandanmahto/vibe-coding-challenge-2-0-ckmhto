
"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type FormEvent,
  type ReactNode,
} from "react";

import {
  ChevronLeft,
  ChevronRight,
  Eye,
  Pencil,
  Plus,
  RotateCcw,
  Search,
  X,
  Trophy,
  Users,
  Calendar,
  Activity,
} from "lucide-react";

import { DashboardShell } from "../DashboardShell";
import { EmptyState, LoadingState, PageHeader } from "../DashboardUI";
import { Panel, StatCard, StatusBadge } from "../Dashboard";

type MatchStatus = "UPCOMING" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";
type MatchType = "FRIENDLY" | "TOURNAMENT" | "LEAGUE";

type Player = {
  id: string;
  name: string;
  playerCode: string;
};

type SportOption = {
  id: string;
  name: string;
};

type SessionOption = {
  id: string;
  sessionCode: string;
  title: string;
  sportId: string;
  sportName: string;
  date: string;
};

type Match = {
  id: string;
  code: string;
  title: string;
  sport: string;
  sportId: string;
  date: string;
  time: string;
  type: MatchType;
  sessionId: string;
  sessionName: string;
  opponent: string;
  description: string;
  venue: string;
  status: MatchStatus;
  teamScore?: number;
  opponentScore?: number;
  result: string;
  participants: Player[];
};

const pageSize = 5;

function getId(value: unknown): string {
  if (value && typeof value === "object" && "_id" in value) {
    return String((value as { _id: unknown })._id);
  }

  return String(value ?? "");
}

function formatDate(value: string) {
  if (!value) return "—";

  return new Date(`${value.slice(0, 10)}T00:00:00`).toLocaleDateString();
}

function formatStatus(status: MatchStatus) {
  switch (status) {
    case "UPCOMING":
      return "Upcoming";
    case "IN_PROGRESS":
      return "In progress";
    case "COMPLETED":
      return "Completed";
    case "CANCELLED":
      return "Cancelled";
  }
}

function formatType(type: MatchType) {
  return type.charAt(0) + type.slice(1).toLowerCase();
}

function getResult(match: {
  status: MatchStatus;
  teamScore?: number;
  opponentScore?: number;
  result?: string;
}) {
  if (match.status === "CANCELLED") return "Cancelled";

  if (
    match.status !== "COMPLETED" ||
    match.teamScore === undefined ||
    match.opponentScore === undefined
  ) {
    return match.status === "IN_PROGRESS" ? "In progress" : "To be played";
  }

  return `${match.result ?? "NO_RESULT"} · ${match.teamScore}-${match.opponentScore}`;
}

function mapMatch(raw: Record<string, unknown>): Match {
  const sport = raw.sportId as Record<string, unknown> | string | undefined;
  const session = raw.sessionId as Record<string, unknown> | string | undefined;
  const players = Array.isArray(raw.playerIds) ? raw.playerIds : [];

  const status = String(raw.status ?? "UPCOMING") as MatchStatus;

  return {
    id: String(raw._id ?? ""),
    code: String(raw.matchCode ?? ""),
    title: String(raw.name ?? ""),
    sport: sport && typeof sport === "object" ? String(sport.name ?? "") : "",
    sportId: getId(sport),
    date: String(raw.date ?? "").slice(0, 10),
    time: String(raw.time ?? ""),
    type: String(raw.type ?? "FRIENDLY") as MatchType,
    sessionId: getId(session),
    sessionName:
      session && typeof session === "object"
        ? String(session.title ?? session.sessionCode ?? "")
        : getId(session),
    opponent: String(raw.opponent ?? ""),
    description: String(raw.description ?? ""),
    venue: String(raw.venue ?? ""),
    status,
    teamScore:
      typeof raw.teamScore === "number" ? raw.teamScore : undefined,
    opponentScore:
      typeof raw.opponentScore === "number" ? raw.opponentScore : undefined,
    result: getResult({
      status,
      teamScore: typeof raw.teamScore === "number" ? raw.teamScore : undefined,
      opponentScore:
        typeof raw.opponentScore === "number" ? raw.opponentScore : undefined,
      result: typeof raw.result === "string" ? raw.result : undefined,
    }),
    participants: players.map((player) => {
      const item = player as Record<string, unknown>;

      return {
        id: getId(item),
        name: String(item.name ?? "Player"),
        playerCode: String(item.playerCode ?? ""),
      };
    }),
  };
}

async function apiRequest(url: string, options?: RequestInit) {
  const response = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok || data.success === false) {
    throw new Error(data.message ?? "Something went wrong.");
  }

  return data;
}

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

function MatchForm({
  match,
  onCancel,
  onSave,
}: {
  match?: Match;
  onCancel: () => void;
  onSave: (data: Record<string, unknown>) => Promise<void>;
}) {
  const [sports, setSports] = useState<SportOption[]>([]);
  const [sessions, setSessions] = useState<SessionOption[]>([]);
  const [players, setPlayers] = useState<Player[]>([]);

  const [sportId, setSportId] = useState(match?.sportId ?? "");
  const [sessionId, setSessionId] = useState(match?.sessionId ?? "");
  const [selectedIds, setSelectedIds] = useState<string[]>(
    match?.participants.map((player) => player.id) ?? [],
  );

  const [playerQuery, setPlayerQuery] = useState("");
  const [loadingOptions, setLoadingOptions] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadOptions() {
      try {
        setLoadingOptions(true);

        const data = await apiRequest(
          `/api/matches/options${sessionId ? `?sessionId=${encodeURIComponent(sessionId)}` : ""}`,
        );

        if (!active) return;

        setSports(data.sports ?? []);
        setSessions(data.sessions ?? []);
        setPlayers(data.players ?? []);

        if (!sportId && data.sports?.length) {
          setSportId(data.sports[0].id);
        }
      } catch (err) {
        if (active) {
          setError(
            err instanceof Error ? err.message : "Unable to load form options.",
          );
        }
      } finally {
        if (active) setLoadingOptions(false);
      }
    }

    loadOptions();

    return () => {
      active = false;
    };
  }, [sessionId]);

  const availableSessions = sessions.filter(
    (session) => !sportId || session.sportId === sportId,
  );

  const filteredPlayers = players.filter((player) =>
    `${player.name} ${player.playerCode}`
      .toLowerCase()
      .includes(playerQuery.trim().toLowerCase()),
  );

  const togglePlayer = (id: string) => {
    setSelectedIds((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id],
    );
  };

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    const formData = new FormData(event.currentTarget);

    if (!sportId || !sessionId) {
      setError("Please select a sport and a closed training session.");
      return;
    }

    if (!selectedIds.length) {
      setError("Select at least one eligible player.");
      return;
    }

    const payload = {
      name: String(formData.get("name") ?? "").trim(),
      opponent: String(formData.get("opponent") ?? "").trim(),
      sportId,
      sessionId,
      date: String(formData.get("date") ?? ""),
      time: String(formData.get("time") ?? "") || undefined,
      type: String(formData.get("type") ?? "FRIENDLY"),
      venue: String(formData.get("venue") ?? "").trim() || undefined,
      description:
        String(formData.get("description") ?? "").trim() || undefined,
      playerIds: selectedIds,
    };

    try {
      setSaving(true);
      await onSave(payload);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to save match.");
    } finally {
      setSaving(false);
    }
  };

  const inputClass =
    "mt-1.5 h-11 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100";

  return (
    <form onSubmit={submit} className="space-y-5 p-5">
      {error && (
        <div
          role="alert"
          className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          {error}
        </div>
      )}

      {loadingOptions && <LoadingState message="Loading sports and sessions..." />}

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="text-sm font-medium text-slate-700">
          Match title *
          <input
            name="name"
            defaultValue={match?.title}
            required
            maxLength={120}
            className={inputClass}
          />
        </label>

        <label className="text-sm font-medium text-slate-700">
          Opponent *
          <input
            name="opponent"
            defaultValue={match?.opponent}
            required
            maxLength={120}
            className={inputClass}
          />
        </label>

        <label className="text-sm font-medium text-slate-700">
          Sport *
          <select
            value={sportId}
            onChange={(event) => {
              setSportId(event.target.value);
              setSessionId("");
              setSelectedIds([]);
              setPlayers([]);
            }}
            required
            className={inputClass}
          >
            <option value="">Select sport</option>
            {sports.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>
        </label>

        <label className="text-sm font-medium text-slate-700">
          Match date *
          <input
            name="date"
            type="date"
            defaultValue={match?.date}
            required
            className={inputClass}
          />
        </label>

        <label className="text-sm font-medium text-slate-700">
          Match type *
          <select
            name="type"
            defaultValue={match?.type ?? "FRIENDLY"}
            className={inputClass}
          >
            <option value="FRIENDLY">Friendly</option>
            <option value="TOURNAMENT">Tournament</option>
            <option value="LEAGUE">League</option>
          </select>
        </label>

        <label className="text-sm font-medium text-slate-700">
          Match time
          <input
            name="time"
            type="time"
            defaultValue={match?.time}
            className={inputClass}
          />
        </label>

        <label className="text-sm font-medium text-slate-700 sm:col-span-2">
          Relevant closed training session *
          <select
            value={sessionId}
            onChange={(event) => {
              setSessionId(event.target.value);
              setSelectedIds([]);
              setPlayers([]);
            }}
            required
            className={inputClass}
          >
            <option value="">Select training session</option>
            {availableSessions.map((item) => (
              <option key={item.id} value={item.id}>
                {item.sessionCode} · {item.title} · {item.sportName} ·{" "}
                {formatDate(String(item.date))}
              </option>
            ))}
          </select>
          {!availableSessions.length && (
            <span className="mt-1 block text-xs text-amber-700">
              No closed sessions are available for this sport.
            </span>
          )}
        </label>

        <label className="text-sm font-medium text-slate-700 sm:col-span-2">
          Venue
          <input
            name="venue"
            defaultValue={match?.venue}
            maxLength={200}
            className={inputClass}
          />
        </label>

        <label className="text-sm font-medium text-slate-700 sm:col-span-2">
          Match description
          <textarea
            name="description"
            defaultValue={match?.description}
            rows={3}
            maxLength={1000}
            className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
          />
        </label>
      </div>

      <div className="rounded-lg border border-blue-100 bg-blue-50 p-3 text-xs leading-5 text-blue-800">
        Player eligibility is checked against the selected closed training
        session. Only players marked PRESENT or LATE can be selected.
      </div>

      {sessionId && (
        <div className="rounded-xl border border-slate-200">
          <div className="border-b border-slate-100 p-4">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-800">
                Eligible players
              </h3>
              <span className="text-xs text-slate-500">
                {selectedIds.length} selected
              </span>
            </div>

            <label className="relative block">
              <span className="sr-only">Search eligible players</span>
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                value={playerQuery}
                onChange={(event) => setPlayerQuery(event.target.value)}
                placeholder="Search players..."
                className="h-10 w-full rounded-lg border border-slate-200 pl-9 pr-3 text-sm"
              />
            </label>
          </div>

          <div className="divide-y divide-slate-100">
            {filteredPlayers.map((player) => (
              <label
                key={player.id}
                className="flex cursor-pointer items-center gap-3 px-4 py-3"
              >
                <input
                  type="checkbox"
                  checked={selectedIds.includes(player.id)}
                  onChange={() => togglePlayer(player.id)}
                />
                <span>
                  <span className="block text-sm font-semibold text-slate-800">
                    {player.name}
                  </span>
                  <span className="text-xs text-slate-500">
                    {player.playerCode}
                  </span>
                </span>
                <span className="ml-auto">
                  <StatusBadge tone="green">Eligible</StatusBadge>
                </span>
              </label>
            ))}

            {!filteredPlayers.length && (
              <p className="p-5 text-center text-sm text-slate-500">
                No eligible players found for this session.
              </p>
            )}
          </div>
        </div>
      )}

      <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end">
        <button
          type="button"
          onClick={onCancel}
          className="h-11 rounded-lg border border-slate-200 px-4 text-sm font-semibold text-slate-700"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={saving || loadingOptions}
          className="h-11 rounded-lg bg-blue-600 px-5 text-sm font-semibold text-white disabled:opacity-50"
        >
          {saving ? "Saving..." : match ? "Save match" : "Create match"}
        </button>
      </div>
    </form>
  );
}

function ScoresModal({
  match,
  onClose,
  onSave,
}: {
  match: Match;
  onClose: () => void;
  onSave: (teamScore: number, opponentScore: number) => Promise<void>;
}) {
  const [teamScore, setTeamScore] = useState(
    match.teamScore === undefined ? "" : String(match.teamScore),
  );
  const [opponentScore, setOpponentScore] = useState(
    match.opponentScore === undefined ? "" : String(match.opponentScore),
  );
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const submit = async () => {
    if (
      teamScore === "" ||
      opponentScore === "" ||
      !Number.isInteger(Number(teamScore)) ||
      !Number.isInteger(Number(opponentScore)) ||
      Number(teamScore) < 0 ||
      Number(opponentScore) < 0
    ) {
      setError("Enter valid non-negative whole-number scores.");
      return;
    }

    try {
      setSaving(true);
      setError("");
      await onSave(Number(teamScore), Number(opponentScore));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to save scores.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal title={`${match.title} · Match scores`} onClose={onClose}>
      <div className="p-5">
        {error && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="text-sm font-medium text-slate-700">
            Academy team score
            <input
              type="number"
              min="0"
              step="1"
              value={teamScore}
              onChange={(event) => setTeamScore(event.target.value)}
              className="mt-1.5 h-12 w-full rounded-lg border border-slate-200 px-3"
            />
          </label>

          <label className="text-sm font-medium text-slate-700">
            Opponent score
            <input
              type="number"
              min="0"
              step="1"
              value={opponentScore}
              onChange={(event) => setOpponentScore(event.target.value)}
              className="mt-1.5 h-12 w-full rounded-lg border border-slate-200 px-3"
            />
          </label>
        </div>

        <p className="mt-3 text-xs text-slate-500">
          Saving scores will mark this match as completed.
        </p>

        <div className="mt-5 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            onClick={onClose}
            className="h-10 rounded-lg border border-slate-200 px-4 text-sm font-semibold text-slate-700"
          >
            Cancel
          </button>
          <button
            onClick={submit}
            disabled={saving}
            className="h-10 rounded-lg bg-blue-600 px-4 text-sm font-semibold text-white disabled:opacity-50"
          >
            {saving ? "Saving..." : "Complete match"}
          </button>
        </div>
      </div>
    </Modal>
  );
}

export function MatchesManagement() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [sports, setSports] = useState<SportOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [sport, setSport] = useState("All sports");
  const [status, setStatus] = useState("All statuses");
  const [date, setDate] = useState("");
  const [playerFilter, setPlayerFilter] = useState("All players");
  const [page, setPage] = useState(1);
  const [modal, setModal] = useState<
    "add" | "edit" | "view" | "scores" | null
  >(null);
  const [selected, setSelected] = useState<Match | null>(null);
  const [toast, setToast] = useState("");
  const [error, setError] = useState("");

  const loadMatches = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const [matchData, optionData] = await Promise.all([
        apiRequest("/api/matches?page=1&limit=100"),
        apiRequest("/api/matches/options"),
      ]);

      setMatches((matchData.matches ?? []).map(mapMatch));
      setSports(optionData.sports ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load matches.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadMatches();
  }, [loadMatches]);

  const notify = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(""), 2600);
  };

  const filtered = useMemo(
    () =>
      [...matches]
        .filter(
          (item) =>
            (!query.trim() ||
              `${item.code} ${item.title} ${item.opponent}`
                .toLowerCase()
                .includes(query.trim().toLowerCase())) &&
            (sport === "All sports" || item.sport === sport) &&
            (status === "All statuses" || item.status === status) &&
            (!date || item.date === date) &&
            (playerFilter === "All players" ||
              item.participants.some(
                (participant) => participant.name === playerFilter,
              )),
        )
        .sort((a, b) => b.date.localeCompare(a.date)),
    [matches, query, sport, status, date, playerFilter],
  );

  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
  const visible = filtered.slice((page - 1) * pageSize, page * pageSize);

  const upcoming = matches.filter((item) => item.status === "UPCOMING").length;
  const completed = matches.filter(
    (item) => item.status === "COMPLETED",
  ).length;
  const participants = new Set(
    matches.flatMap((item) => item.participants.map((player) => player.id)),
  ).size;

  const playerNames = Array.from(
    new Set(matches.flatMap((item) => item.participants.map((p) => p.name))),
  ).sort();

  const reset = () => {
    setQuery("");
    setSport("All sports");
    setStatus("All statuses");
    setDate("");
    setPlayerFilter("All players");
    setPage(1);
  };

  const saveMatch = async (payload: Record<string, unknown>) => {
    const isEdit = modal === "edit" && selected;

    const data = await apiRequest(
      isEdit ? `/api/matches/${selected.id}` : "/api/matches",
      {
        method: isEdit ? "PATCH" : "POST",
        body: JSON.stringify(payload),
      },
    );

    await loadMatches();
    setModal(null);
    notify(isEdit ? "Match updated successfully." : "Match created successfully.");
    return data;
  };

  const startMatch = async (match: Match) => {
    try {
      await apiRequest(`/api/matches/${match.id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status: "IN_PROGRESS" }),
      });

      await loadMatches();
      notify("Match started successfully.");
    } catch (err) {
      notify(err instanceof Error ? err.message : "Unable to start match.");
    }
  };

  const cancelMatch = async (match: Match) => {
    if (!window.confirm(`Cancel "${match.title}"?`)) return;

    try {
      await apiRequest(`/api/matches/${match.id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status: "CANCELLED" }),
      });

      await loadMatches();
      notify("Match cancelled.");
    } catch (err) {
      notify(err instanceof Error ? err.message : "Unable to cancel match.");
    }
  };

  const saveScores = async (teamScore: number, opponentScore: number) => {
    if (!selected) return;

    await apiRequest(`/api/matches/${selected.id}/status`, {
      method: "PATCH",
      body: JSON.stringify({
        status: "COMPLETED",
        teamScore,
        opponentScore,
      }),
    });

    await loadMatches();
    setModal(null);
    notify("Match scores saved successfully.");
  };

  const tone = (value: MatchStatus) => {
    if (value === "COMPLETED") return "green";
    if (value === "CANCELLED") return "slate";
    if (value === "IN_PROGRESS") return "amber";
    return "blue";
  };

  return (
    <DashboardShell
      role="head-coach"
      title="Matches Management"
      subtitle="Manage academy matches, participants and scores"
    >
      <PageHeader
        title="Matches Management"
        description="Manage match records, player eligibility and results"
        action={
          <button
            onClick={() => {
              setSelected(null);
              setModal("add");
            }}
            className="inline-flex h-11 items-center gap-2 rounded-lg bg-blue-600 px-4 text-sm font-semibold text-white"
          >
            <Plus className="h-4 w-4" />
            Create match
          </button>
        }
      />

      <div className="mb-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <StatCard
          label="Total matches"
          value={String(matches.length)}
          detail="Academy match records"
          icon="trophy"
        />
        <StatCard
          label="Upcoming"
          value={String(upcoming)}
          detail="Scheduled matches"
          icon="calendar"
          tone="blue"
        />
        <StatCard
          label="Completed"
          value={String(completed)}
          detail="Finished matches"
          icon="activity"
          tone="green"
        />
        <StatCard
          label="Sports"
          value={String(sports.length)}
          detail="Active academy sports"
          icon="trophy"
          tone="violet"
        />
        <StatCard
          label="Participating players"
          value={String(participants)}
          detail="Unique match players"
          icon="users"
          tone="amber"
        />
      </div>

      {error && (
        <div
          role="alert"
          className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          {error}
          <button
            onClick={loadMatches}
            className="ml-3 font-semibold underline"
          >
            Retry
          </button>
        </div>
      )}

      {loading ? (
        <LoadingState message="Loading matches..." />
      ) : (
        <Panel title={`Matches (${filtered.length})`}>
          <div className="grid gap-3 border-b border-slate-100 p-4 xl:grid-cols-[minmax(220px,1fr)_150px_150px_150px_180px_44px]">
            <label className="relative">
              <span className="sr-only">Search matches</span>
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                value={query}
                onChange={(event) => {
                  setQuery(event.target.value);
                  setPage(1);
                }}
                placeholder="Search match, ID or opponent..."
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
              {sports.map((item) => (
                <option key={item.id}>{item.name}</option>
              ))}
            </select>

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
              <option value="UPCOMING">Upcoming</option>
              <option value="IN_PROGRESS">In progress</option>
              <option value="COMPLETED">Completed</option>
              <option value="CANCELLED">Cancelled</option>
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
              aria-label="Filter by player"
              value={playerFilter}
              onChange={(event) => {
                setPlayerFilter(event.target.value);
                setPage(1);
              }}
              className="h-10 rounded-lg border border-slate-200 px-3 text-sm"
            >
              <option>All players</option>
              {playerNames.map((name) => (
                <option key={name}>{name}</option>
              ))}
            </select>

            <button
              onClick={reset}
              aria-label="Reset filters"
              className="grid h-10 place-items-center rounded-lg border border-slate-200 text-slate-500"
            >
              <RotateCcw className="h-4 w-4" />
            </button>
          </div>

          {visible.length ? (
            <>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[1000px] text-left text-sm">
                  <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                    <tr>
                      <th className="px-5 py-3">Match</th>
                      <th className="px-5 py-3">Sport</th>
                      <th className="px-5 py-3">Date</th>
                      <th className="px-5 py-3">Players</th>
                      <th className="px-5 py-3">Status</th>
                      <th className="px-5 py-3">Result</th>
                      <th className="px-5 py-3">Actions</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100">
                    {visible.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-50/60">
                        <td className="px-5 py-4">
                          <p className="font-semibold text-slate-900">
                            {item.title}
                          </p>
                          <p className="text-xs text-slate-500">
                            {item.code} · vs {item.opponent}
                          </p>
                        </td>

                        <td className="px-5 py-4 text-slate-600">
                          {item.sport}
                        </td>

                        <td className="px-5 py-4 text-slate-600">
                          {formatDate(item.date)}
                        </td>

                        <td className="px-5 py-4 font-semibold">
                          {item.participants.length}
                        </td>

                        <td className="px-5 py-4">
                          <StatusBadge tone={tone(item.status)}>
                            {formatStatus(item.status)}
                          </StatusBadge>
                        </td>

                        <td className="px-5 py-4 font-medium text-slate-700">
                          {item.result}
                        </td>

                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => {
                                setSelected(item);
                                setModal("view");
                              }}
                              aria-label={`View ${item.title}`}
                              className="grid h-8 w-8 place-items-center rounded-lg border border-slate-200 text-slate-600"
                            >
                              <Eye className="h-4 w-4" />
                            </button>

                            {item.status === "UPCOMING" && (
                              <>
                                <button
                                  onClick={() => {
                                    setSelected(item);
                                    setModal("edit");
                                  }}
                                  aria-label={`Edit ${item.title}`}
                                  className="grid h-8 w-8 place-items-center rounded-lg border border-slate-200 text-slate-600"
                                >
                                  <Pencil className="h-4 w-4" />
                                </button>

                                <button
                                  onClick={() => startMatch(item)}
                                  className="h-8 rounded-lg border border-blue-200 px-2 text-xs font-semibold text-blue-700"
                                >
                                  Start
                                </button>

                                <button
                                  onClick={() => cancelMatch(item)}
                                  className="h-8 rounded-lg border border-red-200 px-2 text-xs font-semibold text-red-600"
                                >
                                  Cancel
                                </button>
                              </>
                            )}

                            {item.status === "IN_PROGRESS" && (
                              <>
                                <button
                                  onClick={() => {
                                    setSelected(item);
                                    setModal("scores");
                                  }}
                                  className="h-8 rounded-lg border border-slate-200 px-2 text-xs font-semibold text-slate-600"
                                >
                                  Scores
                                </button>

                                <button
                                  onClick={() => cancelMatch(item)}
                                  className="h-8 rounded-lg border border-red-200 px-2 text-xs font-semibold text-red-600"
                                >
                                  Cancel
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex flex-col gap-3 border-t border-slate-100 px-5 py-3 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">
                <span>
                  Showing {(page - 1) * pageSize + 1}-
                  {Math.min(page * pageSize, filtered.length)} of{" "}
                  {filtered.length}
                </span>

                <div className="flex items-center gap-2">
                  <button
                    disabled={page === 1}
                    onClick={() =>
                      setPage((current) => Math.max(1, current - 1))
                    }
                    aria-label="Previous page"
                    className="grid h-8 w-8 place-items-center rounded-lg border border-slate-200 disabled:opacity-40"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>

                  <span>
                    Page {page} of {pageCount}
                  </span>

                  <button
                    disabled={page === pageCount}
                    onClick={() =>
                      setPage((current) => Math.min(pageCount, current + 1))
                    }
                    aria-label="Next page"
                    className="grid h-8 w-8 place-items-center rounded-lg border border-slate-200 disabled:opacity-40"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </>
          ) : (
            <EmptyState
              title="No matches found"
              description="Create a match or change the search and filter selections."
              action={
                <button
                  onClick={reset}
                  className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700"
                >
                  Reset filters
                </button>
              }
            />
          )}
        </Panel>
      )}

      {(modal === "add" || modal === "edit") && (
        <Modal
          title={
            modal === "add"
              ? "Create match"
              : `Edit ${selected?.title ?? "match"}`
          }
          onClose={() => setModal(null)}
        >
          <MatchForm
            key={`${modal}-${selected?.id ?? "new"}`}
            match={modal === "edit" ? selected ?? undefined : undefined}
            onCancel={() => setModal(null)}
            onSave={saveMatch}
          />
        </Modal>
      )}

      {modal === "view" && selected && (
        <Modal title="Match details" onClose={() => setModal(null)}>
          <div className="p-5">
            <div className="grid gap-4 sm:grid-cols-2">
              {[
                ["Match", selected.title],
                ["Match ID", selected.code],
                ["Sport", selected.sport],
                ["Type", formatType(selected.type)],
                ["Date", formatDate(selected.date)],
                ["Time", selected.time || "—"],
                ["Opponent", selected.opponent],
                ["Venue", selected.venue || "—"],
                ["Training session", selected.sessionName],
                ["Status", formatStatus(selected.status)],
                ["Result", selected.result],
              ].map(([label, value]) => (
                <div
                  key={label}
                  className="rounded-lg border border-slate-100 p-3"
                >
                  <p className="text-xs text-slate-500">{label}</p>
                  <p className="mt-1 font-semibold text-slate-800">
                    {value}
                  </p>
                </div>
              ))}
            </div>

            <p className="mt-5 text-sm text-slate-600">
              {selected.description || "No match description provided."}
            </p>

            <div className="mt-5 overflow-x-auto rounded-xl border border-slate-200">
              <table className="w-full min-w-[400px] text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                  <tr>
                    <th className="px-4 py-3">Participant</th>
                    <th className="px-4 py-3">Player code</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {selected.participants.map((player) => (
                    <tr key={player.id}>
                      <td className="px-4 py-3 font-medium text-slate-800">
                        {player.name}
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        {player.playerCode}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {!selected.participants.length && (
                <EmptyState
                  title="No participants"
                  description="No players were selected for this match."
                />
              )}
            </div>

            <div className="mt-5 flex justify-end">
              <button
                onClick={() => setModal(null)}
                className="h-10 rounded-lg border border-slate-200 px-4 text-sm font-semibold text-slate-700"
              >
                Close details
              </button>
            </div>
          </div>
        </Modal>
      )}

      {modal === "scores" && selected && (
        <ScoresModal
          match={selected}
          onClose={() => setModal(null)}
          onSave={saveScores}
        />
      )}

      {toast && (
        <div
          role="status"
          className="fixed bottom-5 right-5 z-[60] rounded-xl bg-slate-900 px-4 py-3 text-sm font-medium text-white shadow-xl"
        >
          {toast}
        </div>
      )}
    </DashboardShell>
  );
}
