
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
  LockKeyhole,
  Plus,
  RotateCcw,
  Search,
  X,
} from "lucide-react";

import { DashboardShell } from "../DashboardShell";
import {
  EmptyState,
  LoadingState,
  PageHeader,
} from "../DashboardUI";
import {
  Panel,
  StatCard,
  StatusBadge,
} from "../Dashboard";

type SessionStatus =
  | "SCHEDULED"
  | "OPEN"
  | "CLOSED"
  | "CANCELLED";

type AttendanceCounts = {
  present: number;
  absent: number;
  late: number;
  excused: number;
  total: number;
};

type Session = {
  id: string;
  sessionCode: string;
  title: string;
  date: string;
  startTime: string;
  endTime: string;
  sport: string;
  coach: string;
  players: number;
  status: SessionStatus;
  attendance: AttendanceCounts;
};

type Option = {
  id: string;
  name: string;
};

type PlayerOption = {
  id: string;
  name: string;
  playerCode: string;
};

type ApiSession = {
  _id: string;
  sessionCode: string;
  title: string;
  date: string;
  startTime: string;
  endTime: string;
  status: SessionStatus;
  sportId?: string | { _id: string; name: string };
  coachId?: string | { _id: string; name: string };
  playerIds?: Array<
    string | { _id: string; name: string; playerCode: string }
  >;
  attendance?: Partial<AttendanceCounts>;
};

type SessionOptionsResponse = {
  sports: Option[];
  coaches: Option[];
  players: PlayerOption[];
};

const emptyAttendance: AttendanceCounts = {
  present: 0,
  absent: 0,
  late: 0,
  excused: 0,
  total: 0,
};

function getName(
  value?: string | { _id: string; name: string },
) {
  if (!value) return "—";
  return typeof value === "string" ? value : value.name;
}

function getId(
  value: string | { _id: string },
) {
  return typeof value === "string" ? value : value._id;
}

function formatDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "—";

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatStatus(status: SessionStatus) {
  switch (status) {
    case "SCHEDULED":
      return "Scheduled";
    case "OPEN":
      return "Open";
    case "CLOSED":
      return "Closed";
    case "CANCELLED":
      return "Cancelled";
  }
}

function getStatusTone(status: SessionStatus) {
  switch (status) {
    case "OPEN":
      return "blue";
    case "CLOSED":
      return "slate";
    case "CANCELLED":
      return "slate";
    default:
      return "amber";
  }
}

function mapSession(item: ApiSession): Session {
  const attendance = {
    present: item.attendance?.present ?? 0,
    absent: item.attendance?.absent ?? 0,
    late: item.attendance?.late ?? 0,
    excused: item.attendance?.excused ?? 0,
    total: item.attendance?.total ?? 0,
  };

  return {
    id: item._id,
    sessionCode: item.sessionCode,
    title: item.title,
    date: item.date,
    startTime: item.startTime,
    endTime: item.endTime,
    sport: getName(item.sportId),
    coach: getName(item.coachId),
    players: item.playerIds?.length ?? 0,
    status: item.status,
    attendance,
  };
}

async function readError(response: Response) {
  const data = await response.json().catch(() => null);
  return data?.message || "Something went wrong.";
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
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl"
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

function CreateSessionForm({
  onCancel,
  onCreate,
}: {
  onCancel: () => void;
  onCreate: () => Promise<void>;
}) {
  const [options, setOptions] =
    useState<SessionOptionsResponse>({
      sports: [],
      coaches: [],
      players: [],
    });

  const [sportId, setSportId] = useState("");
  const [coachId, setCoachId] = useState("");
  const [playerIds, setPlayerIds] = useState<string[]>([]);

  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("07:00");
  const [endTime, setEndTime] = useState("08:00");
  const [notes, setNotes] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const loadOptions = useCallback(
    async (selectedSportId?: string) => {
      try {
        const url = selectedSportId
          ? `/api/sessions/options?sportId=${encodeURIComponent(selectedSportId)}`
          : "/api/sessions/options";

        const response = await fetch(url, {
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error(await readError(response));
        }

        const data: SessionOptionsResponse =
          await response.json();

        setOptions(data);

        if (!selectedSportId && data.sports.length) {
          setSportId(data.sports[0].id);
        }

        if (selectedSportId && data.coaches.length) {
          setCoachId(data.coaches[0].id);
        }

        if (!selectedSportId) {
          setCoachId(data.coaches[0]?.id ?? "");
        }

        setPlayerIds([]);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Unable to load session options.",
        );
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  useEffect(() => {
    void loadOptions();
  }, [loadOptions]);

  const changeSport = async (nextSportId: string) => {
    setSportId(nextSportId);
    setCoachId("");
    setPlayerIds([]);
    setOptions((current) => ({
      ...current,
      coaches: [],
      players: [],
    }));

    await loadOptions(nextSportId);
  };

  const togglePlayer = (id: string) => {
    setPlayerIds((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id],
    );
  };

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    if (
      !title.trim() ||
      !sportId ||
      !coachId ||
      !date ||
      !startTime ||
      !endTime ||
      !playerIds.length
    ) {
      setError("Please complete all required fields and select players.");
      return;
    }

    if (endTime <= startTime) {
      setError("End time must be later than start time.");
      return;
    }

    setSaving(true);

    try {
      const response = await fetch("/api/sessions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: title.trim(),
          sportId,
          coachId,
          playerIds,
          date,
          startTime,
          endTime,
          notes: notes.trim(),
        }),
      });

      if (!response.ok) {
        throw new Error(await readError(response));
      }

      await onCreate();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to create session.",
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8">
        <LoadingState message="Loading sports, coaches and players..." />
      </div>
    );
  }

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

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="text-sm font-medium text-slate-700 sm:col-span-2">
          Session title *
          <input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            required
            maxLength={100}
            placeholder="Morning Football Practice"
            className="mt-1.5 h-11 w-full rounded-lg border border-slate-200 px-3 text-sm"
          />
        </label>

        <label className="text-sm font-medium text-slate-700">
          Sport *
          <select
            value={sportId}
            onChange={(event) => void changeSport(event.target.value)}
            required
            className="mt-1.5 h-11 w-full rounded-lg border border-slate-200 px-3 text-sm"
          >
            <option value="">Select sport</option>
            {options.sports.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>
        </label>

        <label className="text-sm font-medium text-slate-700">
          Assigned coach *
          <select
            value={coachId}
            onChange={(event) => setCoachId(event.target.value)}
            required
            className="mt-1.5 h-11 w-full rounded-lg border border-slate-200 px-3 text-sm"
          >
            <option value="">Select coach</option>
            {options.coaches.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>
        </label>

        <label className="text-sm font-medium text-slate-700">
          Session date *
          <input
            type="date"
            value={date}
            onChange={(event) => setDate(event.target.value)}
            required
            className="mt-1.5 h-11 w-full rounded-lg border border-slate-200 px-3 text-sm"
          />
        </label>

        <div className="grid grid-cols-2 gap-3">
          <label className="text-sm font-medium text-slate-700">
            Start time *
            <input
              type="time"
              value={startTime}
              onChange={(event) => setStartTime(event.target.value)}
              required
              className="mt-1.5 h-11 w-full rounded-lg border border-slate-200 px-2 text-sm"
            />
          </label>

          <label className="text-sm font-medium text-slate-700">
            End time *
            <input
              type="time"
              value={endTime}
              onChange={(event) => setEndTime(event.target.value)}
              required
              className="mt-1.5 h-11 w-full rounded-lg border border-slate-200 px-2 text-sm"
            />
          </label>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 p-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-slate-900">
            Select players *
          </h3>
          <span className="text-xs text-slate-500">
            {playerIds.length} selected
          </span>
        </div>

        <div className="mt-3 max-h-56 space-y-2 overflow-y-auto">
          {options.players.length ? (
            options.players.map((player) => (
              <label
                key={player.id}
                className="flex cursor-pointer items-center gap-3 rounded-lg bg-slate-50 px-3 py-2.5 text-sm text-slate-700"
              >
                <input
                  type="checkbox"
                  checked={playerIds.includes(player.id)}
                  onChange={() => togglePlayer(player.id)}
                  className="h-4 w-4 rounded border-slate-300"
                />
                <span className="flex-1">{player.name}</span>
                <span className="text-xs text-slate-500">
                  {player.playerCode}
                </span>
              </label>
            ))
          ) : (
            <p className="py-4 text-center text-sm text-slate-500">
              No active players available for this sport.
            </p>
          )}
        </div>
      </div>

      <label className="block text-sm font-medium text-slate-700">
        Notes
        <textarea
          value={notes}
          onChange={(event) => setNotes(event.target.value)}
          rows={3}
          maxLength={1000}
          placeholder="Optional session instructions..."
          className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
        />
      </label>

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
          disabled={saving || !options.sports.length}
          className="h-11 rounded-lg bg-blue-600 px-5 text-sm font-semibold text-white disabled:opacity-50"
        >
          {saving ? "Creating..." : "Create session"}
        </button>
      </div>
    </form>
  );
}

export function SessionsManagement() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [query, setQuery] = useState("");
  const [sport, setSport] = useState("All sports");
  const [status, setStatus] = useState("All statuses");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const [page, setPage] = useState(1);
  const [createOpen, setCreateOpen] = useState(false);
  const [selected, setSelected] = useState<Session | null>(null);
  const [confirmClose, setConfirmClose] = useState<Session | null>(null);
  const [closing, setClosing] = useState(false);
  const [toast, setToast] = useState("");

  const pageSize = 5;

  const notify = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(""), 2600);
  };

  const loadSessions = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(
        "/api/sessions?page=1&limit=100",
        { cache: "no-store" },
      );

      if (!response.ok) {
        throw new Error(await readError(response));
      }

      const data = await response.json();

      setSessions(
        (data.sessions ?? []).map((item: ApiSession) =>
          mapSession(item),
        ),
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load sessions.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadSessions();
  }, [loadSessions]);

  const filtered = useMemo(() => {
    return [...sessions]
      .filter((item) => {
        const searchMatch =
          !query.trim() ||
          `${item.sessionCode} ${item.title} ${item.sport} ${item.coach}`
            .toLowerCase()
            .includes(query.trim().toLowerCase());

        const sportMatch =
          sport === "All sports" || item.sport === sport;

        const statusMatch =
          status === "All statuses" ||
          formatStatus(item.status) === status;

        const fromMatch = !fromDate || item.date.slice(0, 10) >= fromDate;
        const toMatch = !toDate || item.date.slice(0, 10) <= toDate;

        return (
          searchMatch &&
          sportMatch &&
          statusMatch &&
          fromMatch &&
          toMatch
        );
      })
      .sort(
        (a, b) =>
          b.date.localeCompare(a.date) ||
          b.sessionCode.localeCompare(a.sessionCode),
      );
  }, [sessions, query, sport, status, fromDate, toDate]);

  const pageCount = Math.max(
    1,
    Math.ceil(filtered.length / pageSize),
  );

  const visible = filtered.slice(
    (page - 1) * pageSize,
    page * pageSize,
  );

  const openCount = sessions.filter(
    (item) => item.status === "OPEN",
  ).length;

  const scheduledCount = sessions.filter(
    (item) => item.status === "SCHEDULED",
  ).length;

  const closedCount = sessions.filter(
    (item) => item.status === "CLOSED",
  ).length;

  const today = new Date().toISOString().slice(0, 10);

  const todayCount = sessions.filter(
    (item) => item.date.slice(0, 10) === today,
  ).length;

  const sports = [
    ...new Set(sessions.map((item) => item.sport)),
  ].filter((item) => item !== "—");

  const reset = () => {
    setQuery("");
    setSport("All sports");
    setStatus("All statuses");
    setFromDate("");
    setToDate("");
    setPage(1);
  };

  const handleCreate = async () => {
    setCreateOpen(false);
    await loadSessions();
    notify("Session created successfully.");
  };

  const closeSession = async () => {
    if (!confirmClose) return;

    setClosing(true);

    try {
      const response = await fetch(
        `/api/sessions/${confirmClose.id}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ status: "CLOSED" }),
        },
      );

      if (!response.ok) {
        throw new Error(await readError(response));
      }

      setConfirmClose(null);
      setSelected(null);

      await loadSessions();
      notify("Session closed successfully.");
    } catch (err) {
      notify(
        err instanceof Error
          ? err.message
          : "Unable to close session.",
      );
    } finally {
      setClosing(false);
    }
  };

  const refresh = async () => {
    await loadSessions();
    notify("Sessions refreshed.");
  };

  return (
    <DashboardShell
      role="head-coach"
      title="Sessions Management"
      subtitle="Manage practice sessions and attendance status"
    >
      <PageHeader
        title="Sessions Management"
        description="Manage training sessions and monitor real attendance records"
        action={
          <div className="flex gap-2">
            <button
              onClick={() => void refresh()}
              className="inline-flex h-11 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              <RotateCcw className="h-4 w-4" />
              Refresh
            </button>

            <button
              onClick={() => setCreateOpen(true)}
              className="inline-flex h-11 items-center gap-2 rounded-lg bg-blue-600 px-4 text-sm font-semibold text-white shadow-sm hover:bg-blue-700"
            >
              <Plus className="h-4 w-4" />
              Create session
            </button>
          </div>
        }
      />

      <div className="mb-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total sessions"
          value={String(sessions.length)}
          detail="Database session records"
          icon="calendar"
        />

        <StatCard
          label="Sessions today"
          value={String(todayCount)}
          detail="Based on today's date"
          icon="activity"
          tone="blue"
        />

        <StatCard
          label="Open sessions"
          value={String(openCount)}
          detail={`${scheduledCount} scheduled`}
          icon="clipboard"
          tone="green"
        />

        <StatCard
          label="Closed sessions"
          value={String(closedCount)}
          detail="Attendance locked"
          icon="clipboard"
          tone="amber"
        />
      </div>

      <div className="mb-5 flex flex-wrap gap-2">
        {sports.map((item) => (
          <span
            key={item}
            className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-600"
          >
            {item}
            <strong className="ml-1 text-slate-900">
              {sessions.filter((session) => session.sport === item).length}
            </strong>
          </span>
        ))}
      </div>

      {error && (
        <div
          role="alert"
          className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          {error}
          <button
            onClick={() => void loadSessions()}
            className="ml-3 font-semibold underline"
          >
            Retry
          </button>
        </div>
      )}

      {loading ? (
        <LoadingState message="Loading sessions from database..." />
      ) : (
        <Panel title={`Sessions (${filtered.length})`}>
          <div className="grid gap-3 border-b border-slate-100 p-4 xl:grid-cols-[minmax(220px,1fr)_150px_150px_150px_150px_44px]">
            <label className="relative">
              <span className="sr-only">Search sessions</span>
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="search"
                value={query}
                onChange={(event) => {
                  setQuery(event.target.value);
                  setPage(1);
                }}
                placeholder="Search ID, sport or coach..."
                className="h-10 w-full rounded-lg border border-slate-200 pl-9 pr-3 text-sm outline-none focus:border-blue-500"
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
                <option key={item}>{item}</option>
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
              <option>Scheduled</option>
              <option>Open</option>
              <option>Closed</option>
              <option>Cancelled</option>
            </select>

            <label>
              <span className="sr-only">From date</span>
              <input
                aria-label="From date"
                type="date"
                value={fromDate}
                onChange={(event) => {
                  setFromDate(event.target.value);
                  setPage(1);
                }}
                className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm"
              />
            </label>

            <label>
              <span className="sr-only">To date</span>
              <input
                aria-label="To date"
                type="date"
                value={toDate}
                onChange={(event) => {
                  setToDate(event.target.value);
                  setPage(1);
                }}
                className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm"
              />
            </label>

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
                <table className="w-full min-w-[1100px] text-left text-sm">
                  <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                    <tr>
                      <th className="px-5 py-3">Session</th>
                      <th className="px-5 py-3">Date</th>
                      <th className="px-5 py-3">Sport</th>
                      <th className="px-5 py-3">Coach</th>
                      <th className="px-5 py-3">Players</th>
                      <th className="px-5 py-3">Present</th>
                      <th className="px-5 py-3">Absent</th>
                      <th className="px-5 py-3">Late</th>
                      <th className="px-5 py-3">Excused</th>
                      <th className="px-5 py-3">Status</th>
                      <th className="px-5 py-3">Actions</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100">
                    {visible.map((item) => (
                      <tr
                        key={item.id}
                        className="hover:bg-slate-50/60"
                      >
                        <td className="px-5 py-4">
                          <p className="font-semibold text-slate-900">
                            {item.sessionCode}
                          </p>
                          <p className="mt-1 text-xs text-slate-500">
                            {item.title}
                          </p>
                        </td>

                        <td className="px-5 py-4 text-slate-600">
                          {formatDate(item.date)}
                        </td>

                        <td className="px-5 py-4 text-slate-700">
                          {item.sport}
                        </td>

                        <td className="px-5 py-4 text-slate-600">
                          {item.coach}
                        </td>

                        <td className="px-5 py-4 font-semibold">
                          {item.players}
                        </td>

                        <td className="px-5 py-4 font-semibold text-emerald-700">
                          {item.attendance.present}
                        </td>

                        <td className="px-5 py-4 font-semibold text-red-600">
                          {item.attendance.absent}
                        </td>

                        <td className="px-5 py-4 text-amber-700">
                          {item.attendance.late}
                        </td>

                        <td className="px-5 py-4 text-blue-700">
                          {item.attendance.excused}
                        </td>

                        <td className="px-5 py-4">
                          <StatusBadge tone={getStatusTone(item.status)}>
                            {formatStatus(item.status)}
                          </StatusBadge>
                        </td>

                        <td className="px-5 py-4">
                          <div className="flex gap-2">
                            <button
                              onClick={() => setSelected(item)}
                              aria-label={`View ${item.sessionCode}`}
                              className="grid h-8 w-8 place-items-center rounded-lg border border-slate-200 text-slate-600"
                            >
                              <Eye className="h-4 w-4" />
                            </button>

                            {item.status === "OPEN" && (
                              <button
                                onClick={() => setConfirmClose(item)}
                                className="inline-flex h-8 items-center gap-1 rounded-lg border border-slate-200 px-2 text-xs font-medium text-slate-600"
                              >
                                <LockKeyhole className="h-3.5 w-3.5" />
                                Close
                              </button>
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
                      setPage((current) =>
                        Math.min(pageCount, current + 1),
                      )
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
              title="No sessions found"
              description="No matching database sessions. Change your filters or create a session."
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

      {createOpen && (
        <Modal
          title="Create session"
          onClose={() => setCreateOpen(false)}
        >
          <CreateSessionForm
            onCancel={() => setCreateOpen(false)}
            onCreate={handleCreate}
          />
        </Modal>
      )}

      {selected && (
        <Modal
          title="Session details"
          onClose={() => setSelected(null)}
        >
          <div className="p-5">
            <div className="grid gap-4 sm:grid-cols-2">
              {[
                ["Session ID", selected.sessionCode],
                ["Title", selected.title],
                ["Date", formatDate(selected.date)],
                ["Time", `${selected.startTime} - ${selected.endTime}`],
                ["Sport", selected.sport],
                ["Assigned coach", selected.coach],
                ["Registered players", String(selected.players)],
                ["Status", formatStatus(selected.status)],
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

            <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {[
                ["Present", selected.attendance.present, "text-emerald-700"],
                ["Absent", selected.attendance.absent, "text-red-600"],
                ["Late", selected.attendance.late, "text-amber-700"],
                ["Excused", selected.attendance.excused, "text-blue-700"],
              ].map(([label, value, color]) => (
                <div
                  key={String(label)}
                  className="rounded-xl bg-slate-50 p-4"
                >
                  <p className="text-xs text-slate-500">{label}</p>
                  <p className={`mt-2 text-xl font-bold ${color}`}>
                    {value}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-4 rounded-xl border border-slate-200 p-4">
              <p className="text-sm text-slate-500">
                Attendance completion
              </p>

              <p className="mt-1 text-xl font-bold text-blue-700">
                {selected.players
                  ? Math.round(
                    (selected.attendance.total / selected.players) *
                    100,
                  )
                  : 0}
                %
              </p>

              <p className="mt-1 text-xs text-slate-500">
                {selected.attendance.total} of {selected.players} players marked
              </p>
            </div>

            {selected.status === "CLOSED" && (
              <div className="mt-5 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
                This session is closed and attendance is locked.
              </div>
            )}

            <div className="mt-5 flex justify-end">
              <button
                onClick={() => setSelected(null)}
                className="h-10 rounded-lg border border-slate-200 px-4 text-sm font-semibold text-slate-700"
              >
                Close details
              </button>
            </div>
          </div>
        </Modal>
      )}

      {confirmClose && (
        <Modal
          title="Close session"
          onClose={() => !closing && setConfirmClose(null)}
        >
          <div className="p-5">
            <p className="text-sm text-slate-600">
              Close{" "}
              <strong className="text-slate-900">
                {confirmClose.sessionCode}
              </strong>
              ? Attendance records will be locked after closure.
            </p>

            <div className="mt-5 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                disabled={closing}
                onClick={() => setConfirmClose(null)}
                className="h-10 rounded-lg border border-slate-200 px-4 text-sm font-semibold text-slate-700"
              >
                Cancel
              </button>

              <button
                disabled={closing}
                onClick={() => void closeSession()}
                className="h-10 rounded-lg bg-blue-600 px-4 text-sm font-semibold text-white disabled:opacity-50"
              >
                {closing ? "Closing..." : "Confirm close"}
              </button>
            </div>
          </div>
        </Modal>
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
