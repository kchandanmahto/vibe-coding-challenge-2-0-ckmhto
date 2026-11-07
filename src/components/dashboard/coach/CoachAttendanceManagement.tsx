
"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import {
  Check,
  LockKeyhole,
  Play,
  RefreshCw,
  Search,
  X,
} from "lucide-react";

import { DashboardShell } from "../DashboardShell";
import { EmptyState, LoadingState, PageHeader } from "../DashboardUI";
import { Panel, StatCard, StatusBadge } from "../Dashboard";

import type {
  AttendanceStatus,
  CoachAttendanceRecord,
  CoachAttendanceSession,
  CoachSessionStatus,
} from "./coachAttendanceData";

type PlayerRow = {
  id: string;
  name: string;
  playerCode: string;
};

type ApiSession = {
  _id: string;
  sessionCode: string;
  title: string;
  sportId: { _id: string; name: string } | string;
  playerIds: Array<{
    _id: string;
    name: string;
    playerCode: string;
  } | string>;
  date: string;
  startTime: string;
  endTime: string;
  status: CoachSessionStatus;
};

type ApiAttendanceRecord = {
  playerId: string;
  status: AttendanceStatus;
  markedAt?: string;
  remarks?: string;
};

type ModalProps = {
  title: string;
  onClose: () => void;
  children: ReactNode;
};

const attendanceStatuses: AttendanceStatus[] = [
  "PRESENT",
  "ABSENT",
  "LATE",
  "EXCUSED",
];

function Modal({ title, onClose, children }: ModalProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 p-3 sm:p-6"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="max-h-[92vh] w-full max-w-xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
        <div className="sticky top-0 flex items-center justify-between border-b border-slate-100 bg-white px-5 py-4">
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

function getStatusLabel(status?: AttendanceStatus) {
  if (!status) return "Not marked";

  return status.charAt(0) + status.slice(1).toLowerCase();
}

function getStatusTone(
  status?: AttendanceStatus,
): "blue" | "green" | "amber" | "slate" {
  switch (status) {
    case "PRESENT":
      return "green";
    case "ABSENT":
      return "amber";
    case "LATE":
    case "EXCUSED":
      return "blue";
    default:
      return "slate";
  }
}

function formatDate(date: string) {
  if (!date) return "—";

  return new Date(`${date.slice(0, 10)}T00:00:00`).toLocaleDateString();
}

function mapApiSession(session: ApiSession): CoachAttendanceSession {
  const players: PlayerRow[] = (session.playerIds ?? []).map(
    (player): PlayerRow => {
      if (typeof player === "string") {
        return {
          id: player,
          name: "Unknown player",
          playerCode: "",
        };
      }

      return {
        id: player._id,
        name: player.name ?? "Unknown player",
        playerCode: player.playerCode ?? "",
      };
    },
  );

  const sport =
    typeof session.sportId === "string"
      ? session.sportId
      : session.sportId.name;

  return {
    id: session._id,
    sessionCode: session.sessionCode,
    title: session.title,
    date: session.date.slice(0, 10),
    startTime: session.startTime,
    endTime: session.endTime,
    sport,
    status: session.status,
    players,
    present: 0,
    absent: 0,
    late: 0,
    excused: 0,
    total: players.length,
  };
}

export function CoachAttendanceManagement() {
  const [sessions, setSessions] = useState<CoachAttendanceSession[]>([]);
  const [selectedSessionId, setSelectedSessionId] = useState("");

  const [records, setRecords] = useState<
    Record<string, CoachAttendanceRecord>
  >({});

  const [loading, setLoading] = useState(true);
  const [attendanceLoading, setAttendanceLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [starting, setStarting] = useState(false);

  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All statuses");

  const [historySport, setHistorySport] = useState("All sports");
  const [historyFrom, setHistoryFrom] = useState("");
  const [historyTo, setHistoryTo] = useState("");

  const [confirmSave, setConfirmSave] = useState(false);
  const [toast, setToast] = useState("");
  const [error, setError] = useState("");

  const notify = useCallback((message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(""), 3000);
  }, []);

  const selectedSession = sessions.find(
    (session) => session.id === selectedSessionId,
  );

  const locked =
    selectedSession?.status === "CLOSED" ||
    selectedSession?.status === "CANCELLED";

  const sessionRecords = useMemo(
    () => Object.values(records),
    [records],
  );

  const presentCount = sessionRecords.filter(
    (record) => record.status === "PRESENT",
  ).length;

  const absentCount = sessionRecords.filter(
    (record) => record.status === "ABSENT",
  ).length;

  const lateCount = sessionRecords.filter(
    (record) => record.status === "LATE",
  ).length;

  const excusedCount = sessionRecords.filter(
    (record) => record.status === "EXCUSED",
  ).length;

  const markedCount =
    presentCount + absentCount + lateCount + excusedCount;

  const filteredPlayers = useMemo(() => {
    if (!selectedSession) return [];

    return selectedSession.players.filter((player: PlayerRow) => {
      const matchesQuery =
        `${player.name} ${player.playerCode}`
          .toLowerCase()
          .includes(query.trim().toLowerCase());

      const status = records[player.id]?.status;

      const matchesStatus =
        statusFilter === "All statuses"
          ? true
          : statusFilter === "Not marked"
            ? !status
            : status === statusFilter;

      return matchesQuery && matchesStatus;
    });
  }, [selectedSession, query, statusFilter, records]);

  const history = useMemo(() => {
    return sessions
      .filter((session) => session.status === "CLOSED")
      .filter(
        (session) =>
          historySport === "All sports" ||
          session.sport === historySport,
      )
      .filter(
        (session) => !historyFrom || session.date >= historyFrom,
      )
      .filter(
        (session) => !historyTo || session.date <= historyTo,
      );
  }, [sessions, historySport, historyFrom, historyTo]);

  const sports = useMemo(
    () => [...new Set(sessions.map((session) => session.sport))],
    [sessions],
  );

  const openSessions = sessions.filter(
    (session) => session.status === "OPEN",
  ).length;

  const closedSessions = sessions.filter(
    (session) => session.status === "CLOSED",
  ).length;

  const scheduledSessions = sessions.filter(
    (session) => session.status === "SCHEDULED",
  ).length;

  // Fetch sessions assigned to the logged-in coach.
  const fetchSessions = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(
        "/api/sessions?page=1&limit=100",
        { cache: "no-store" },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to load sessions.");
      }

      const apiSessions: ApiSession[] = Array.isArray(data.sessions)
        ? data.sessions
        : [];

      const mapped: CoachAttendanceSession[] =
        apiSessions.map(mapApiSession);

      setSessions(mapped);

      setSelectedSessionId((current: string) => {
        if (
          current &&
          mapped.some(
            (item: CoachAttendanceSession) => item.id === current,
          )
        ) {
          return current;
        }

        return mapped[0]?.id ?? "";
      });
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to load sessions.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch attendance records for the selected session.
  const fetchAttendance = useCallback(async (sessionId: string) => {
    if (!sessionId) {
      setRecords({});
      return;
    }

    setAttendanceLoading(true);
    setError("");

    try {
      const response = await fetch(
        `/api/attendance?sessionId=${encodeURIComponent(sessionId)}`,
        { cache: "no-store" },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to load attendance.");
      }

      const nextRecords: Record<string, CoachAttendanceRecord> = {};

      const apiRecords: ApiAttendanceRecord[] = Array.isArray(data.records)
        ? data.records
        : [];

      for (const record of apiRecords) {
        nextRecords[record.playerId] = {
          playerId: record.playerId,
          status: record.status,
          markedAt: record.markedAt,
          remarks: record.remarks ?? "",
        };
      }

      setRecords(nextRecords);

      setSessions((current) =>
        current.map((item) =>
          item.id === sessionId
            ? {
              ...item,
              ...data.session,
              id: sessionId,
            }
            : item,
        ),
      );
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to load attendance.",
      );
      setRecords({});
    } finally {
      setAttendanceLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchSessions();
  }, [fetchSessions]);

  useEffect(() => {
    if (selectedSessionId) {
      setQuery("");
      setStatusFilter("All statuses");
      void fetchAttendance(selectedSessionId);
    } else {
      setRecords({});
    }
  }, [selectedSessionId, fetchAttendance]);

  // Start a scheduled session.
  const startSession = async () => {
    if (!selectedSession) return;

    setStarting(true);
    setError("");

    try {
      const response = await fetch(
        `/api/sessions/${encodeURIComponent(selectedSession.id)}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            status: "OPEN",
          }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to start session.");
      }

      await fetchSessions();
      await fetchAttendance(selectedSession.id);

      notify("Session started. You can now mark attendance.");
    } catch (err) {
      notify(
        err instanceof Error ? err.message : "Unable to start session.",
      );
    } finally {
      setStarting(false);
    }
  };

  // Update one player's attendance locally.
  const setPlayerStatus = (
    playerId: string,
    status: AttendanceStatus,
  ) => {
    if (!selectedSession || locked) return;

    setRecords((current) => ({
      ...current,
      [playerId]: {
        playerId,
        status,
        markedAt: new Date().toISOString(),
        remarks: current[playerId]?.remarks ?? "",
      },
    }));
  };

  // Mark all selected players with the same status.
  const markAll = (status: AttendanceStatus) => {
    if (!selectedSession || locked) return;

    setRecords((current) => {
      const next = { ...current };

      for (const player of selectedSession.players) {
        next[player.id] = {
          playerId: player.id,
          status,
          markedAt: new Date().toISOString(),
          remarks: next[player.id]?.remarks ?? "",
        };
      }

      return next;
    });
  };

  // Save attendance in MongoDB.
  const saveAttendance = async () => {
    if (!selectedSession || locked) return;

    const missing = selectedSession.players.filter(
      (player) => !records[player.id]?.status,
    );

    if (missing.length) {
      notify(
        `Mark attendance for all players. ${missing.length} remaining.`,
      );
      setConfirmSave(false);
      return;
    }

    setSaving(true);
    setError("");

    try {
      const payload = {
        sessionId: selectedSession.id,
        records: selectedSession.players.map((player) => ({
          playerId: player.id,
          status: records[player.id].status,
          remarks: records[player.id].remarks ?? "",
        })),
      };

      const response = await fetch("/api/attendance", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to save attendance.");
      }

      setConfirmSave(false);

      await fetchAttendance(selectedSession.id);
      await fetchSessions();

      notify("Attendance saved successfully.");
    } catch (err) {
      notify(
        err instanceof Error ? err.message : "Unable to save attendance.",
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <DashboardShell
      role="coach"
      title="Attendance"
      subtitle="Manage attendance for your assigned training sessions"
    >
      <PageHeader
        title="Attendance Management"
        description="Mark and review player attendance for your assigned sessions"
        action={
          <button
            type="button"
            onClick={() => {
              void fetchSessions();

              if (selectedSessionId) {
                void fetchAttendance(selectedSessionId);
              }
            }}
            className="inline-flex h-10 items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </button>
        }
      />

      {toast && (
        <div
          role="status"
          className="fixed bottom-5 right-5 z-[60] rounded-xl bg-slate-900 px-4 py-3 text-sm font-medium text-white shadow-xl"
        >
          {toast}
        </div>
      )}

      {loading ? (
        <LoadingState message="Loading attendance sessions..." />
      ) : (
        <div className="space-y-5">
          {error && (
            <div
              role="alert"
              className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
            >
              {error}
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
            <StatCard
              label="Total sessions"
              value={String(sessions.length)}
              detail="Your assigned sessions"
              icon="calendar"
              tone="blue"
            />

            <StatCard
              label="Scheduled sessions"
              value={String(scheduledSessions)}
              detail="Waiting to start"
              icon="calendar"
              tone="amber"
            />

            <StatCard
              label="Open sessions"
              value={String(openSessions)}
              detail="Attendance editable"
              icon="clipboard"
              tone="green"
            />

            <StatCard
              label="Closed sessions"
              value={String(closedSessions)}
              detail="Attendance locked"
              icon="clipboard"
              tone="blue"
            />

            <StatCard
              label="Present"
              value={String(presentCount)}
              detail="Selected session"
              icon="users"
              tone="green"
            />
          </div>

          {sessions.length === 0 ? (
            <EmptyState
              title="No sessions available"
              description="Create a training session first. Your assigned sessions will appear here."
            />
          ) : (
            <>
              <Panel title="Session selection">
                <div className="grid gap-4 p-4 sm:grid-cols-2 lg:grid-cols-4">
                  <div>
                    <p className="text-sm font-medium text-slate-700">
                      Session date
                    </p>
                    <p className="mt-1.5 text-sm text-slate-500">
                      {selectedSession
                        ? formatDate(selectedSession.date)
                        : "—"}
                    </p>
                  </div>

                  <label className="text-sm font-medium text-slate-700">
                    Sport
                    <select
                      value={selectedSession?.sport ?? ""}
                      onChange={(event) => {
                        const match = sessions.find(
                          (item: CoachAttendanceSession) =>
                            item.sport === event.target.value,
                        );

                        if (match) {
                          setSelectedSessionId(match.id);
                        }
                      }}
                      className="mt-1.5 h-10 w-full rounded-lg border border-slate-200 px-3 text-sm font-normal"
                    >
                      <option value="">Select sport</option>

                      {sports.map((item: string) => (
                        <option key={item} value={item}>
                          {item}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="text-sm font-medium text-slate-700">
                    Session
                    <select
                      value={selectedSessionId}
                      onChange={(event) =>
                        setSelectedSessionId(event.target.value)
                      }
                      className="mt-1.5 h-10 w-full rounded-lg border border-slate-200 px-3 text-sm font-normal"
                    >
                      {sessions
                        .filter(
                          (item: CoachAttendanceSession) =>
                            item.sport === selectedSession?.sport,
                        )
                        .map((item: CoachAttendanceSession) => (
                          <option key={item.id} value={item.id}>
                            {item.sessionCode} · {item.title}
                          </option>
                        ))}
                    </select>
                  </label>

                  <div>
                    <p className="text-sm font-medium text-slate-700">
                      Session status
                    </p>
                    <div className="mt-2">
                      <StatusBadge
                        tone={
                          selectedSession?.status === "OPEN"
                            ? "green"
                            : selectedSession?.status === "SCHEDULED"
                              ? "amber"
                              : "slate"
                        }
                      >
                        {selectedSession?.status ?? "—"}
                      </StatusBadge>
                    </div>
                  </div>
                </div>
              </Panel>

              {selectedSession && (
                <>
                  {selectedSession.status === "SCHEDULED" && (
                    <div className="flex flex-col gap-3 rounded-xl border border-blue-200 bg-blue-50 p-4 sm:flex-row sm:items-center">
                      <Play className="h-5 w-5 shrink-0 text-blue-700" />

                      <div className="flex-1">
                        <p className="text-sm font-semibold text-blue-900">
                          This session has not started yet.
                        </p>
                        <p className="mt-1 text-xs text-blue-700">
                          Start the session to enable attendance marking.
                        </p>
                      </div>

                      <button
                        type="button"
                        disabled={starting}
                        onClick={() => void startSession()}
                        className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 text-sm font-semibold text-white disabled:opacity-50"
                      >
                        <Play className="h-4 w-4" />
                        {starting ? "Starting..." : "Start session"}
                      </button>
                    </div>
                  )}

                  {locked && (
                    <div className="flex items-center gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4">
                      <LockKeyhole className="h-5 w-5 shrink-0 text-amber-700" />

                      <div>
                        <p className="text-sm font-semibold text-amber-900">
                          Attendance locked
                        </p>
                        <p className="mt-1 text-xs text-amber-700">
                          This session is closed or cancelled. Attendance is read-only.
                        </p>
                      </div>
                    </div>
                  )}

                  <Panel
                    title={`${selectedSession.sessionCode} · ${selectedSession.title}`}
                    action={
                      selectedSession.status === "OPEN" ? (
                        <div className="flex flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={() => markAll("PRESENT")}
                            className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700"
                          >
                            Mark all present
                          </button>

                          <button
                            type="button"
                            onClick={() => markAll("ABSENT")}
                            className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-700"
                          >
                            Mark all absent
                          </button>
                        </div>
                      ) : undefined
                    }
                  >
                    <div className="grid gap-3 border-b border-slate-100 p-4 sm:grid-cols-4">
                      <div className="rounded-lg bg-emerald-50 p-3">
                        <p className="text-xs text-slate-500">Present</p>
                        <p className="mt-1 text-xl font-bold text-emerald-700">
                          {presentCount}
                        </p>
                      </div>

                      <div className="rounded-lg bg-red-50 p-3">
                        <p className="text-xs text-slate-500">Absent</p>
                        <p className="mt-1 text-xl font-bold text-red-700">
                          {absentCount}
                        </p>
                      </div>

                      <div className="rounded-lg bg-blue-50 p-3">
                        <p className="text-xs text-slate-500">Late</p>
                        <p className="mt-1 text-xl font-bold text-blue-700">
                          {lateCount}
                        </p>
                      </div>

                      <div className="rounded-lg bg-slate-100 p-3">
                        <p className="text-xs text-slate-500">Excused</p>
                        <p className="mt-1 text-xl font-bold text-slate-700">
                          {excusedCount}
                        </p>
                      </div>
                    </div>

                    <div className="grid gap-3 border-b border-slate-100 p-4 md:grid-cols-[minmax(220px,1fr)_180px]">
                      <label className="relative">
                        <span className="sr-only">Search players</span>
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                        <input
                          value={query}
                          onChange={(event) =>
                            setQuery(event.target.value)
                          }
                          placeholder="Search player name or ID..."
                          className="h-10 w-full rounded-lg border border-slate-200 pl-9 pr-3 text-sm"
                        />
                      </label>

                      <select
                        aria-label="Filter attendance status"
                        value={statusFilter}
                        onChange={(event) =>
                          setStatusFilter(event.target.value)
                        }
                        className="h-10 rounded-lg border border-slate-200 px-3 text-sm"
                      >
                        <option>All statuses</option>
                        <option value="PRESENT">Present</option>
                        <option value="ABSENT">Absent</option>
                        <option value="LATE">Late</option>
                        <option value="EXCUSED">Excused</option>
                        <option>Not marked</option>
                      </select>
                    </div>

                    {attendanceLoading ? (
                      <LoadingState message="Loading player attendance..." />
                    ) : filteredPlayers.length ? (
                      <div className="overflow-x-auto">
                        <table className="w-full min-w-[850px] text-left text-sm">
                          <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                            <tr>
                              <th className="px-5 py-3">Player</th>
                              <th className="px-5 py-3">Status</th>
                              <th className="px-5 py-3">Marked at</th>
                              <th className="px-5 py-3">Actions</th>
                            </tr>
                          </thead>

                          <tbody className="divide-y divide-slate-100">
                            {filteredPlayers.map((player: PlayerRow) => {
                              const record = records[player.id];

                              return (
                                <tr key={player.id}>
                                  <td className="px-5 py-4">
                                    <p className="font-semibold text-slate-900">
                                      {player.name}
                                    </p>
                                    <p className="text-xs text-slate-500">
                                      {player.playerCode}
                                    </p>
                                  </td>

                                  <td className="px-5 py-4">
                                    <StatusBadge
                                      tone={getStatusTone(record?.status)}
                                    >
                                      {getStatusLabel(record?.status)}
                                    </StatusBadge>
                                  </td>

                                  <td className="px-5 py-4 text-xs text-slate-500">
                                    {record?.markedAt
                                      ? new Date(
                                        record.markedAt,
                                      ).toLocaleString()
                                      : "Not marked"}
                                  </td>

                                  <td className="px-5 py-4">
                                    <div className="flex flex-wrap gap-1">
                                      {attendanceStatuses.map(
                                        (value: AttendanceStatus) => (
                                          <button
                                            key={value}
                                            type="button"
                                            disabled={
                                              locked ||
                                              selectedSession.status !== "OPEN"
                                            }
                                            onClick={() =>
                                              setPlayerStatus(
                                                player.id,
                                                value,
                                              )
                                            }
                                            className={`rounded-md px-2 py-1.5 text-xs font-semibold disabled:cursor-not-allowed disabled:opacity-40 ${record?.status === value
                                              ? "bg-blue-600 text-white"
                                              : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                                              }`}
                                          >
                                            {value.charAt(0) +
                                              value.slice(1).toLowerCase()}
                                          </button>
                                        ),
                                      )}
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
                        title="No players found"
                        description="No selected players match the current filters."
                      />
                    )}

                    {selectedSession.status === "OPEN" && (
                      <div className="flex flex-col gap-3 border-t border-slate-100 p-4 sm:flex-row sm:items-center sm:justify-between">
                        <p className="text-xs text-slate-500">
                          {markedCount} of {selectedSession.total} players marked
                        </p>

                        <button
                          type="button"
                          disabled={saving || attendanceLoading}
                          onClick={() => setConfirmSave(true)}
                          className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 text-sm font-semibold text-white disabled:opacity-50"
                        >
                          <Check className="h-4 w-4" />
                          Save attendance
                        </button>
                      </div>
                    )}
                  </Panel>
                </>
              )}

              <Panel title="Attendance history">
                <div className="grid gap-3 border-b border-slate-100 p-4 md:grid-cols-3">
                  <input
                    aria-label="History from date"
                    type="date"
                    value={historyFrom}
                    onChange={(event) =>
                      setHistoryFrom(event.target.value)
                    }
                    className="h-10 rounded-lg border border-slate-200 px-3 text-sm"
                  />

                  <input
                    aria-label="History to date"
                    type="date"
                    value={historyTo}
                    onChange={(event) =>
                      setHistoryTo(event.target.value)
                    }
                    className="h-10 rounded-lg border border-slate-200 px-3 text-sm"
                  />

                  <select
                    aria-label="History sport filter"
                    value={historySport}
                    onChange={(event) =>
                      setHistorySport(event.target.value)
                    }
                    className="h-10 rounded-lg border border-slate-200 px-3 text-sm"
                  >
                    <option>All sports</option>

                    {sports.map((item: string) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                  </select>
                </div>

                {history.length ? (
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[760px] text-left text-sm">
                      <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                        <tr>
                          <th className="px-5 py-3">Date</th>
                          <th className="px-5 py-3">Sport</th>
                          <th className="px-5 py-3">Session</th>
                          <th className="px-5 py-3">Players</th>
                          <th className="px-5 py-3">Status</th>
                        </tr>
                      </thead>

                      <tbody className="divide-y divide-slate-100">
                        {history.map(
                          (session: CoachAttendanceSession) => (
                            <tr key={session.id}>
                              <td className="px-5 py-4">
                                {formatDate(session.date)}
                              </td>

                              <td className="px-5 py-4">
                                {session.sport}
                              </td>

                              <td className="px-5 py-4">
                                <p className="font-semibold">
                                  {session.title}
                                </p>
                                <p className="text-xs text-slate-500">
                                  {session.sessionCode}
                                </p>
                              </td>

                              <td className="px-5 py-4">
                                {session.total}
                              </td>

                              <td className="px-5 py-4">
                                <StatusBadge tone="slate">
                                  {session.status}
                                </StatusBadge>
                              </td>
                            </tr>
                          ),
                        )}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <EmptyState
                    title="No attendance history"
                    description="Closed sessions matching your filters will appear here."
                  />
                )}
              </Panel>
            </>
          )}
        </div>
      )}

      {confirmSave && selectedSession && (
        <Modal
          title="Save attendance?"
          onClose={() => {
            if (!saving) setConfirmSave(false);
          }}
        >
          <div className="p-5">
            <p className="text-sm text-slate-600">
              Save attendance for{" "}
              <strong>{selectedSession.sessionCode}</strong>?
              <br />
              Present: {presentCount} · Absent: {absentCount} · Late:{" "}
              {lateCount} · Excused: {excusedCount}
            </p>

            <div className="mt-5 flex justify-end gap-3">
              <button
                type="button"
                disabled={saving}
                onClick={() => setConfirmSave(false)}
                className="h-10 rounded-lg border border-slate-200 px-4 text-sm font-semibold"
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={saving}
                onClick={() => void saveAttendance()}
                className="h-10 rounded-lg bg-blue-600 px-4 text-sm font-semibold text-white disabled:opacity-50"
              >
                {saving ? "Saving..." : "Confirm save"}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </DashboardShell>
  );
}
