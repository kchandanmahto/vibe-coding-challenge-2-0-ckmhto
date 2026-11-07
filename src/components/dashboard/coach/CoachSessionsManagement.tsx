"use client";

import Link from "next/link";
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
  LockKeyhole,
  Plus,
  Search,
  X,
} from "lucide-react";

import { DashboardShell } from "../DashboardShell";
import { EmptyState, LoadingState, PageHeader } from "../DashboardUI";
import { Panel, StatCard, StatusBadge } from "../Dashboard";

const pageSize = 5;

type ApiStatus = "SCHEDULED" | "OPEN" | "CLOSED" | "CANCELLED";
type UiStatus = "Scheduled" | "Open" | "Closed" | "Cancelled";

type Option = {
  id: string;
  name: string;
  email?: string;
  playerCode?: string;
};

type SessionOptions = {
  sports: Option[];
  coaches: Option[];
  players: Option[];
};

type PopulatedRef = {
  _id: string;
  name?: string;
  email?: string;
  playerCode?: string;
};

type AttendanceCounts = {
  present?: number;
  absent?: number;
  late?: number;
  excused?: number;
  total?: number;
};

type ApiSession = {
  _id: string;
  sessionCode: string;
  title: string;
  sportId: PopulatedRef | string;
  coachId: PopulatedRef | string;
  playerIds: (PopulatedRef | string)[];
  date: string;
  startTime: string;
  endTime: string;
  status: ApiStatus;
  notes?: string;
  attendance?: AttendanceCounts;
};

type CoachSession = {
  databaseId: string;
  id: string;
  title: string;
  date: string;
  sport: string;
  coach: string;
  playerIds: string[];
  playerNames: string[];
  present: number;
  absent: number;
  late: number;
  excused: number;
  status: UiStatus;
  notes?: string;
  startTime: string;
  endTime: string;
};

function getStatus(status: ApiStatus): UiStatus {
  const map: Record<ApiStatus, UiStatus> = {
    SCHEDULED: "Scheduled",
    OPEN: "Open",
    CLOSED: "Closed",
    CANCELLED: "Cancelled",
  };

  return map[status];
}

function getRefId(value: PopulatedRef | string): string {
  return typeof value === "string" ? value : value._id;
}

function mapSession(session: ApiSession): CoachSession {
  const sport =
    typeof session.sportId === "string"
      ? session.sportId
      : session.sportId.name ?? "Unknown sport";

  const coach =
    typeof session.coachId === "string"
      ? "Assigned coach"
      : session.coachId.name ?? "Assigned coach";

  const players = session.playerIds ?? [];

  return {
    databaseId: session._id,
    id: session.sessionCode,
    title: session.title,
    date: session.date.slice(0, 10),
    sport,
    coach,
    playerIds: players.map(getRefId),
    playerNames: players.map((player) =>
      typeof player === "string"
        ? player
        : player.name ?? player.playerCode ?? player._id,
    ),
    present: session.attendance?.present ?? 0,
    absent: session.attendance?.absent ?? 0,
    late: session.attendance?.late ?? 0,
    excused: session.attendance?.excused ?? 0,
    status: getStatus(session.status),
    notes: session.notes,
    startTime: session.startTime,
    endTime: session.endTime,
  };
}

function Modal({
  title,
  children,
  onClose,
  wide = false,
}: {
  title: string;
  children: ReactNode;
  onClose: () => void;
  wide?: boolean;
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
        className={`max-h-[92vh] w-full overflow-y-auto rounded-2xl bg-white shadow-2xl ${wide ? "max-w-4xl" : "max-w-2xl"
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

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-slate-50 p-4">
      <p className="text-xs text-slate-500">{label}</p>
      <p className="mt-1 font-semibold text-slate-800">{value}</p>
    </div>
  );
}

function formatDate(date: string) {
  return new Date(`${date}T00:00:00`).toLocaleDateString();
}

export function CoachSessionsManagement() {
  const [sessions, setSessions] = useState<CoachSession[]>([]);

  const [options, setOptions] = useState<SessionOptions>({
    sports: [],
    coaches: [],
    players: [],
  });

  const [loading, setLoading] = useState(true);
  const [optionsLoading, setOptionsLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [closing, setClosing] = useState(false);

  const [query, setQuery] = useState("");
  const [sport, setSport] = useState("All sports");
  const [status, setStatus] = useState("All statuses");
  const [date, setDate] = useState("");
  const [sort, setSort] = useState("Newest first");
  const [page, setPage] = useState(1);

  const [createOpen, setCreateOpen] = useState(false);
  const [selected, setSelected] = useState<CoachSession | null>(null);
  const [closeSession, setCloseSession] = useState<CoachSession | null>(null);

  const [toast, setToast] = useState("");
  const [formError, setFormError] = useState("");
  const [selectedSportId, setSelectedSportId] = useState("");

  const notify = useCallback((message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(""), 3000);
  }, []);

  const fetchSessions = useCallback(async () => {
    setLoading(true);

    try {
      const firstResponse = await fetch(
        "/api/sessions?page=1&limit=100",
        { cache: "no-store" },
      );

      const firstData = await firstResponse.json();

      if (!firstResponse.ok) {
        throw new Error(firstData.message || "Unable to load sessions.");
      }

      let allSessions: ApiSession[] = firstData.sessions ?? [];
      const totalPages = firstData.totalPages ?? 1;

      for (let currentPage = 2; currentPage <= totalPages; currentPage++) {
        const response = await fetch(
          `/api/sessions?page=${currentPage}&limit=100`,
          { cache: "no-store" },
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Unable to load sessions.");
        }

        allSessions = [...allSessions, ...(data.sessions ?? [])];
      }

      setSessions(allSessions.map(mapSession));
    } catch (error) {
      notify(
        error instanceof Error ? error.message : "Unable to load sessions.",
      );
    } finally {
      setLoading(false);
    }
  }, [notify]);

  const fetchOptions = useCallback(async (sportId?: string) => {
    setOptionsLoading(true);

    try {
      const url = sportId
        ? `/api/sessions/options?sportId=${encodeURIComponent(sportId)}`
        : "/api/sessions/options";

      const response = await fetch(url, { cache: "no-store" });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to load session options.");
      }

      setOptions({
        sports: data.sports ?? [],
        coaches: data.coaches ?? [],
        players: data.players ?? [],
      });

      return true;
    } catch (error) {
      setFormError(
        error instanceof Error
          ? error.message
          : "Unable to load sports and players.",
      );
      return false;
    } finally {
      setOptionsLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchSessions();
    void fetchOptions();
  }, [fetchSessions, fetchOptions]);

  const filtered = useMemo(() => {
    return [...sessions]
      .filter(
        (session) =>
          (!query.trim() ||
            `${session.id} ${session.title} ${session.coach}`
              .toLowerCase()
              .includes(query.trim().toLowerCase())) &&
          (sport === "All sports" || session.sport === sport) &&
          (status === "All statuses" || session.status === status) &&
          (!date || session.date === date),
      )
      .sort((a, b) =>
        sort === "Oldest first"
          ? a.date.localeCompare(b.date)
          : b.date.localeCompare(a.date),
      );
  }, [sessions, query, sport, status, date, sort]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, pageCount);

  const visible = filtered.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );

  const today = new Date().toLocaleDateString("en-CA");

  const todayCount = sessions.filter(
    (session) => session.date === today,
  ).length;

  const upcomingCount = sessions.filter(
    (session) => session.date > today,
  ).length;

  const openCount = sessions.filter(
    (session) => session.status === "Open",
  ).length;

  const closedCount = sessions.filter(
    (session) => session.status === "Closed",
  ).length;

  const handleSportChange = async (sportId: string) => {
    setSelectedSportId(sportId);
    setFormError("");

    if (!sportId) {
      setOptions((current) => ({
        ...current,
        coaches: [],
        players: [],
      }));
      return;
    }

    setOptions((current) => ({
      ...current,
      coaches: [],
      players: [],
    }));

    await fetchOptions(sportId);
  };

  const createSession = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError("");

    const form = event.currentTarget;
    const data = new FormData(form);

    const selectedPlayers = data.getAll("player").map(String);
    const title = String(data.get("title") ?? "").trim();
    const sessionDate = String(data.get("date") ?? "");
    const startTime = String(data.get("startTime") ?? "");
    const endTime = String(data.get("endTime") ?? "");
    const notes = String(data.get("notes") ?? "").trim();

    if (!selectedSportId || !sessionDate || !title || !startTime || !endTime) {
      setFormError("Please complete all required fields.");
      return;
    }

    if (endTime <= startTime) {
      setFormError("End time must be later than start time.");
      return;
    }

    if (!selectedPlayers.length) {
      setFormError("Select at least one player.");
      return;
    }

    const payload = {
      title,
      sportId: selectedSportId,
      playerIds: selectedPlayers,
      date: sessionDate,
      startTime,
      endTime,
      notes,
    };

    setSaving(true);

    try {
      const response = await fetch("/api/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok) {
        const validationErrors = result.errors?.fieldErrors;

        const firstValidationError = validationErrors
          ? Object.values(validationErrors).flat()[0]
          : null;

        throw new Error(
          firstValidationError ||
          result.message ||
          "Unable to create session.",
        );
      }

      setCreateOpen(false);
      setSelectedSportId("");

      setOptions((current) => ({
        ...current,
        players: [],
        coaches: [],
      }));

      form.reset();

      await fetchSessions();
      notify("Session created successfully.");
    } catch (error) {
      setFormError(
        error instanceof Error ? error.message : "Unable to create session.",
      );
    } finally {
      setSaving(false);
    }
  };

  const closeConfirmed = async () => {
    if (!closeSession) return;

    setClosing(true);

    try {
      const response = await fetch(
        `/api/sessions/${encodeURIComponent(closeSession.databaseId)}/status`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: "CLOSED" }),
        },
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Unable to close session.");
      }

      setCloseSession(null);
      setSelected(null);

      await fetchSessions();
      notify("Session closed successfully.");
    } catch (error) {
      notify(
        error instanceof Error ? error.message : "Unable to close session.",
      );
    } finally {
      setClosing(false);
    }
  };

  const resetFilters = () => {
    setQuery("");
    setSport("All sports");
    setStatus("All statuses");
    setDate("");
    setPage(1);
  };

  const openCreateModal = async () => {
    setFormError("");
    setSelectedSportId("");

    setOptions((current) => ({
      ...current,
      coaches: [],
      players: [],
    }));

    setCreateOpen(true);
    await fetchOptions();
  };

  return (
    <DashboardShell
      role="coach"
      title="Sessions"
      subtitle="Manage your assigned training sessions"
    >
      <PageHeader
        title="Sessions Management"
        description="Create, review and close sessions for your assigned sports"
        action={
          <button
            type="button"
            onClick={() => void openCreateModal()}
            className="inline-flex h-11 items-center gap-2 rounded-lg bg-blue-600 px-4 text-sm font-semibold text-white shadow-sm"
          >
            <Plus className="h-4 w-4" />
            Create session
          </button>
        }
      />

      {toast && (
        <div
          role="status"
          className="fixed right-4 top-20 z-[60] rounded-lg bg-slate-900 px-4 py-3 text-sm text-white shadow-lg"
        >
          {toast}
        </div>
      )}

      {loading ? (
        <LoadingState message="Loading assigned sessions..." />
      ) : (
        <div className="space-y-5">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
            <StatCard
              label="Total sessions"
              value={String(sessions.length)}
              detail="Your assigned sessions"
              icon="calendar"
              tone="blue"
            />

            <StatCard
              label="Today's sessions"
              value={String(todayCount)}
              detail={today}
              icon="calendar"
              tone="green"
            />

            <StatCard
              label="Upcoming sessions"
              value={String(upcomingCount)}
              detail="Future sessions"
              icon="activity"
              tone="violet"
            />

            <StatCard
              label="Open sessions"
              value={String(openCount)}
              detail="Attendance editable"
              icon="clipboard"
              tone="amber"
            />

            <StatCard
              label="Closed sessions"
              value={String(closedCount)}
              detail="Attendance locked"
              icon="clipboard"
              tone="blue"
            />
          </div>

          <Panel title="Session history">
            <div className="grid gap-3 border-b border-slate-100 p-4 lg:grid-cols-[minmax(220px,1fr)_160px_170px_170px_160px_auto]">
              <label className="relative">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <span className="sr-only">Search sessions</span>
                <input
                  type="search"
                  value={query}
                  onChange={(event) => {
                    setQuery(event.target.value);
                    setPage(1);
                  }}
                  placeholder="Search session ID, title or coach"
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
                className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm"
              >
                <option>All sports</option>
                {options.sports.map((item) => (
                  <option key={item.id} value={item.name}>
                    {item.name}
                  </option>
                ))}
                {sessions
                  .map((session) => session.sport)
                  .filter(
                    (item, index, array) =>
                      !options.sports.some(
                        (option) => option.name === item,
                      ) && array.indexOf(item) === index,
                  )
                  .map((item) => (
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
                className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm"
              >
                <option>All statuses</option>
                <option>Scheduled</option>
                <option>Open</option>
                <option>Closed</option>
                <option>Cancelled</option>
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
                aria-label="Sort sessions"
                value={sort}
                onChange={(event) => setSort(event.target.value)}
                className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm"
              >
                <option>Newest first</option>
                <option>Oldest first</option>
              </select>

              <button
                type="button"
                onClick={resetFilters}
                className="h-10 rounded-lg border border-slate-200 px-3 text-sm font-semibold text-slate-600"
              >
                Reset
              </button>
            </div>

            {visible.length ? (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[1450px] text-left text-sm">
                  <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                    <tr>
                      <th className="px-5 py-3">Session</th>
                      <th className="px-5 py-3">Date</th>
                      <th className="px-5 py-3">Time</th>
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
                    {visible.map((session) => {
                      const tone =
                        session.status === "Open"
                          ? "blue"
                          : session.status === "Scheduled"
                            ? "amber"
                            : "slate";

                      return (
                        <tr key={session.databaseId}>
                          <td className="px-5 py-3.5">
                            <p className="font-semibold text-slate-800">
                              {session.title}
                            </p>
                            <p className="text-xs text-slate-500">
                              {session.id}
                            </p>
                          </td>

                          <td className="px-5 py-3.5">
                            {formatDate(session.date)}
                          </td>

                          <td className="px-5 py-3.5">
                            {session.startTime} - {session.endTime}
                          </td>

                          <td className="px-5 py-3.5">{session.sport}</td>
                          <td className="px-5 py-3.5">{session.coach}</td>

                          <td className="px-5 py-3.5">
                            {session.playerIds.length}
                          </td>

                          <td className="px-5 py-3.5 font-semibold text-emerald-700">
                            {session.present}
                          </td>

                          <td className="px-5 py-3.5 font-semibold text-red-700">
                            {session.absent}
                          </td>

                          <td className="px-5 py-3.5 font-semibold text-amber-700">
                            {session.late}
                          </td>

                          <td className="px-5 py-3.5 font-semibold text-blue-700">
                            {session.excused}
                          </td>

                          <td className="px-5 py-3.5">
                            <StatusBadge tone={tone}>
                              {session.status}
                            </StatusBadge>
                          </td>

                          <td className="px-5 py-3.5">
                            <div className="flex flex-wrap gap-3">
                              <button
                                type="button"
                                onClick={() => setSelected(session)}
                                className="font-semibold text-blue-600"
                              >
                                View
                              </button>

                              {(session.status === "Open" ||
                                session.status === "Scheduled") && (
                                  <button
                                    type="button"
                                    onClick={() => setCloseSession(session)}
                                    className="font-semibold text-slate-700"
                                  >
                                    Close
                                  </button>
                                )}

                              <Link
                                href="/coach#attendance"
                                className="font-semibold text-slate-600"
                              >
                                Attendance
                              </Link>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <EmptyState
                title="No sessions found"
                description="Change or reset the search and filters."
              />
            )}

            {filtered.length > 0 && (
              <div className="flex items-center justify-between border-t border-slate-100 px-5 py-4">
                <p className="text-xs text-slate-500">
                  {filtered.length} sessions · Page {currentPage} of {pageCount}
                </p>

                <div className="flex gap-2">
                  <button
                    type="button"
                    aria-label="Previous page"
                    disabled={currentPage === 1}
                    onClick={() =>
                      setPage((value) => Math.max(1, value - 1))
                    }
                    className="grid h-9 w-9 place-items-center rounded-lg border border-slate-200 disabled:opacity-40"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>

                  <button
                    type="button"
                    aria-label="Next page"
                    disabled={currentPage >= pageCount}
                    onClick={() =>
                      setPage((value) => Math.min(pageCount, value + 1))
                    }
                    className="grid h-9 w-9 place-items-center rounded-lg border border-slate-200 disabled:opacity-40"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}
          </Panel>

          <div className="grid gap-5 lg:grid-cols-2">
            <Panel title="Sport-wise history">
              <div className="grid grid-cols-2 gap-3 p-5">
                {options.sports.map((item) => {
                  const matching = sessions.filter(
                    (session) => session.sport === item.name,
                  );

                  return (
                    <div
                      key={item.id}
                      className="rounded-xl bg-slate-50 p-4"
                    >
                      <p className="text-sm font-medium text-slate-700">
                        {item.name}
                      </p>

                      <p className="mt-2 text-2xl font-bold text-slate-900">
                        {matching.length}
                      </p>

                      <p className="text-xs text-slate-500">
                        {
                          matching.filter(
                            (session) => session.status === "Closed",
                          ).length
                        }{" "}
                        closed ·{" "}
                        {
                          matching.filter(
                            (session) => session.status === "Open",
                          ).length
                        }{" "}
                        open
                      </p>
                    </div>
                  );
                })}
              </div>
            </Panel>

            <Panel title="Date-wise history">
              <div className="space-y-3 p-5">
                {sessions
                  .filter((session) => session.status === "Closed")
                  .slice(0, 4)
                  .map((session) => (
                    <button
                      type="button"
                      key={session.databaseId}
                      onClick={() => setSelected(session)}
                      className="flex w-full items-center justify-between rounded-lg border border-slate-200 px-3 py-2.5 text-left text-sm"
                    >
                      <span>
                        <strong>{session.title}</strong>
                        <span className="block text-xs text-slate-500">
                          {session.date} · {session.sport}
                        </span>
                      </span>

                      <span className="text-xs text-slate-500">View</span>
                    </button>
                  ))}

                {!sessions.some(
                  (session) => session.status === "Closed",
                ) && (
                    <p className="text-sm text-slate-500">
                      No closed sessions yet.
                    </p>
                  )}
              </div>
            </Panel>
          </div>
        </div>
      )}

      {createOpen && (
        <Modal
          title="Create session"
          onClose={() => {
            if (!saving) setCreateOpen(false);
          }}
          wide
        >
          <form onSubmit={createSession} className="space-y-5 p-5">
            {formError && (
              <div
                role="alert"
                className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
              >
                {formError}
              </div>
            )}

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="text-sm font-medium">
                Sport *
                <select
                  required
                  value={selectedSportId}
                  onChange={(event) =>
                    void handleSportChange(event.target.value)
                  }
                  className="mt-1.5 h-11 w-full rounded-lg border border-slate-200 px-3"
                >
                  <option value="">Select assigned sport</option>
                  {options.sports.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name}
                    </option>
                  ))}
                </select>
              </label>

              <label className="text-sm font-medium">
                Session date *
                <input
                  name="date"
                  type="date"
                  required
                  min={new Date().toLocaleDateString("en-CA")}
                  className="mt-1.5 h-11 w-full rounded-lg border border-slate-200 px-3"
                />
              </label>

              <label className="text-sm font-medium">
                Start time *
                <input
                  name="startTime"
                  type="time"
                  required
                  className="mt-1.5 h-11 w-full rounded-lg border border-slate-200 px-3"
                />
              </label>

              <label className="text-sm font-medium">
                End time *
                <input
                  name="endTime"
                  type="time"
                  required
                  className="mt-1.5 h-11 w-full rounded-lg border border-slate-200 px-3"
                />
              </label>

              <label className="text-sm font-medium sm:col-span-2">
                Session title *
                <input
                  name="title"
                  required
                  maxLength={120}
                  placeholder="e.g. Morning Football Training"
                  className="mt-1.5 h-11 w-full rounded-lg border border-slate-200 px-3"
                />
              </label>

              <label className="text-sm font-medium sm:col-span-2">
                Notes
                <textarea
                  name="notes"
                  rows={3}
                  maxLength={1000}
                  className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2"
                />
              </label>
            </div>

            <fieldset className="rounded-xl border border-slate-200 p-4">
              <legend className="px-1 text-sm font-semibold text-slate-800">
                Relevant players *
              </legend>

              {!selectedSportId ? (
                <p className="text-sm text-slate-500">
                  Select a sport first to load your assigned players.
                </p>
              ) : optionsLoading ? (
                <p className="text-sm text-slate-500">Loading players...</p>
              ) : options.players.length ? (
                <div className="grid gap-2 sm:grid-cols-2">
                  {options.players.map((player) => (
                    <label
                      key={player.id}
                      className="flex items-center gap-3 rounded-lg bg-slate-50 px-3 py-2 text-sm"
                    >
                      <input
                        name="player"
                        type="checkbox"
                        value={player.id}
                        className="h-4 w-4"
                      />

                      <span>
                        <strong>{player.name}</strong>
                        <span className="block text-xs text-slate-500">
                          {player.playerCode ?? player.id}
                        </span>
                      </span>
                    </label>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-500">
                  No active players are available for this sport.
                </p>
              )}
            </fieldset>

            <div className="flex justify-end gap-3 border-t border-slate-100 pt-5">
              <button
                type="button"
                disabled={saving}
                onClick={() => setCreateOpen(false)}
                className="h-11 rounded-lg border border-slate-200 px-4 text-sm font-semibold disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={saving || optionsLoading}
                className="h-11 rounded-lg bg-blue-600 px-5 text-sm font-semibold text-white disabled:opacity-50"
              >
                {saving ? "Creating..." : "Create session"}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {selected && (
        <Modal
          title="Session details"
          onClose={() => setSelected(null)}
          wide
        >
          <div className="p-5">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <Info label="Session ID" value={selected.id} />
              <Info label="Sport" value={selected.sport} />
              <Info label="Date" value={selected.date} />
              <Info
                label="Time"
                value={`${selected.startTime} - ${selected.endTime}`}
              />
              <Info label="Coach" value={selected.coach} />
              <Info label="Status" value={selected.status} />
            </div>

            <div className="mt-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
              <div className="rounded-lg bg-emerald-50 p-4">
                <p className="text-xs text-slate-500">Present</p>
                <p className="mt-1 text-xl font-bold text-emerald-700">
                  {selected.present}
                </p>
              </div>

              <div className="rounded-lg bg-red-50 p-4">
                <p className="text-xs text-slate-500">Absent</p>
                <p className="mt-1 text-xl font-bold text-red-700">
                  {selected.absent}
                </p>
              </div>

              <div className="rounded-lg bg-amber-50 p-4">
                <p className="text-xs text-slate-500">Late</p>
                <p className="mt-1 text-xl font-bold text-amber-700">
                  {selected.late}
                </p>
              </div>

              <div className="rounded-lg bg-blue-50 p-4">
                <p className="text-xs text-slate-500">Excused</p>
                <p className="mt-1 text-xl font-bold text-blue-700">
                  {selected.excused}
                </p>
              </div>
            </div>

            <div className="mt-3 rounded-lg bg-slate-50 p-4">
              <p className="text-xs text-slate-500">Attendance marked</p>
              <p className="mt-1 font-semibold text-slate-800">
                {selected.present +
                  selected.absent +
                  selected.late +
                  selected.excused}{" "}
                of {selected.playerIds.length} players
              </p>
            </div>

            <div className="mt-5 rounded-xl border border-slate-200 p-4">
              <h3 className="font-semibold">Relevant players</h3>

              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                {selected.playerNames.map((name, index) => (
                  <div
                    key={`${selected.playerIds[index]}-${index}`}
                    className="rounded-lg bg-slate-50 px-3 py-2 text-sm"
                  >
                    {name}
                  </div>
                ))}
              </div>
            </div>

            {selected.notes && (
              <p className="mt-4 text-sm text-slate-600">
                <strong>Notes:</strong> {selected.notes}
              </p>
            )}

            <div className="mt-5 flex flex-wrap justify-end gap-3 border-t border-slate-100 pt-4">
              {(selected.status === "Open" ||
                selected.status === "Scheduled") && (
                  <button
                    type="button"
                    onClick={() => setCloseSession(selected)}
                    className="inline-flex h-10 items-center gap-2 rounded-lg border border-slate-200 px-4 text-sm font-semibold"
                  >
                    <LockKeyhole className="h-4 w-4" />
                    Close session
                  </button>
                )}

              <Link
                href="/coach#attendance"
                className="inline-flex h-10 items-center rounded-lg bg-blue-600 px-4 text-sm font-semibold text-white"
              >
                View attendance
              </Link>
            </div>
          </div>
        </Modal>
      )}

      {closeSession && (
        <Modal
          title="Close session?"
          onClose={() => {
            if (!closing) setCloseSession(null);
          }}
        >
          <div className="p-5">
            <p className="text-sm text-slate-600">
              Closing <strong>{closeSession.title}</strong> locks its
              attendance. Attendance will not be editable while the session
              remains closed.
            </p>

            <div className="mt-5 flex justify-end gap-3">
              <button
                type="button"
                disabled={closing}
                onClick={() => setCloseSession(null)}
                className="h-10 rounded-lg border border-slate-200 px-4 text-sm font-semibold"
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={closing}
                onClick={() => void closeConfirmed()}
                className="h-10 rounded-lg bg-slate-900 px-4 text-sm font-semibold text-white disabled:opacity-50"
              >
                {closing ? "Closing..." : "Close and lock attendance"}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </DashboardShell>
  );
}