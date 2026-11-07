
"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  CalendarDays,
  ClipboardCheck,
  Medal,
  UserRound,
} from "lucide-react";

import { DashboardShell } from "../DashboardShell";
import { Panel, StatCard, StatusBadge } from "../Dashboard";
import { LoadingState } from "../DashboardUI";

interface AttendanceRecord {
  id: string;
  date: string;
  sessionTitle: string;
  sport: string;
  status: "PRESENT" | "ABSENT" | "LATE" | "EXCUSED";
  remarks?: string;
}

interface MatchRecord {
  id: string;
  name: string;
  sport: string;
  date: string;
  status: "UPCOMING" | "IN_PROGRESS" | "COMPLETED";
  score: number | null;
  teamScore?: number | null;
  opponentScore?: number | null;
  result?: string | null;
  participationStatus?: string | null;
}

interface PlayerOverviewData {
  player: {
    id: string;
    playerCode: string;
    name: string;
    email: string;
    phone: string;
    gender: string;
    age: number | null;
    dateOfBirth: string | null;
    sport: string;
    status: string;
    address: string;
    emergencyContact: string;
  };
  attendance: {
    percentage: number;
    totalSessions: number;
    presentSessions: number;
    absentSessions: number;
    lateSessions: number;
    excusedSessions: number;
    history: AttendanceRecord[];
  };
  matches: {
    upcoming: MatchRecord[];
    completed: MatchRecord[];
    total: number;
  };
  performance: {
    totalRecords: number;
    records: unknown[];
  };
  readiness: {
    ready: boolean;
    conditions: {
      attendance: boolean;
      completedMatches: boolean;
    };
  };
}

function formatDate(date: string) {
  if (!date) return "—";

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) return "—";

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(parsedDate);
}

function getInitials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

function getAttendanceTone(status: AttendanceRecord["status"]) {
  switch (status) {
    case "PRESENT":
      return "green";
    case "LATE":
      return "amber";
    case "EXCUSED":
      return "blue";
    default:
      return "amber";
  }
}

function getMatchStatus(status: MatchRecord["status"]) {
  switch (status) {
    case "IN_PROGRESS":
      return "In Progress";
    case "COMPLETED":
      return "Completed";
    default:
      return "Upcoming";
  }
}

export function PlayerOverview() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [data, setData] = useState<PlayerOverviewData | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    async function fetchOverview() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch("/api/player/overview", {
          method: "GET",
          cache: "no-store",
          signal: controller.signal,
        });

        const result = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(
            result.message || "Unable to load your dashboard."
          );
        }

        setData(result);
      } catch (err) {
        if (err instanceof Error && err.name === "AbortError") return;

        setError(
          err instanceof Error
            ? err.message
            : "Something went wrong. Please try again."
        );
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    fetchOverview();

    return () => controller.abort();
  }, []);

  const player = data?.player;
  const attendance = data?.attendance;
  const upcomingMatches = data?.matches.upcoming ?? [];
  const completedMatches = data?.matches.completed ?? [];
  const ready = data?.readiness.ready ?? false;

  const attendanceCondition =
    data?.readiness.conditions.attendance ?? false;

  const matchesCondition =
    data?.readiness.conditions.completedMatches ?? false;

  return (
    <DashboardShell
      role="player"
      title="Player overview"
      subtitle="Your training, attendance and match performance"
    >
      {loading ? (
        <LoadingState message="Loading your dashboard..." />
      ) : error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 p-5">
          <p className="font-semibold text-red-800">
            Unable to load dashboard
          </p>
          <p className="mt-1 text-sm text-red-700">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-3 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
          >
            Try again
          </button>
        </div>
      ) : !data || !player || !attendance ? (
        <div className="rounded-xl border border-slate-200 bg-white p-6 text-sm text-slate-500">
          Player dashboard data is unavailable.
        </div>
      ) : (
        <>
          {/* Player Welcome */}
          <div className="mb-6 rounded-xl border border-slate-200/80 bg-white p-5 shadow-sm">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              <div className="grid h-16 w-16 shrink-0 place-items-center rounded-full bg-blue-100 text-xl font-bold text-blue-700">
                {getInitials(player.name)}
              </div>

              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-2xl font-bold text-slate-900">
                    Welcome back, {player.name}
                  </h2>
                  <StatusBadge tone="blue">
                    {player.status}
                  </StatusBadge>
                </div>

                <p className="mt-1 text-sm capitalize text-slate-500">
                  {player.age !== null && player.age <= 16
                    ? "U-16"
                    : "Academy player"}{" "}
                  · {player.sport}
                </p>
              </div>
            </div>
          </div>

          {/* Statistics */}
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
            <StatCard
              label="Attendance"
              value={`${attendance.percentage}%`}
              detail={`${attendance.presentSessions} present sessions`}
              icon="clipboard"
            />

            <StatCard
              label="Total sessions"
              value={String(attendance.totalSessions)}
              detail="Recorded sessions"
              icon="calendar"
            />

            <StatCard
              label="Present sessions"
              value={String(attendance.presentSessions)}
              detail="Present attendance records"
              icon="clipboard"
              tone="green"
            />

            <StatCard
              label="Absent sessions"
              value={String(attendance.absentSessions)}
              detail="Absent attendance records"
              icon="clipboard"
              tone="amber"
            />

            <StatCard
              label="Completed matches"
              value={String(completedMatches.length)}
              detail="Recorded matches"
              icon="trophy"
              tone="violet"
            />

            <StatCard
              label="Readiness"
              value={ready ? "Ready" : "Not Ready"}
              detail={
                ready
                  ? "Both conditions met"
                  : "See requirements below"
              }
              icon="activity"
              tone={ready ? "green" : "amber"}
            />
          </div>

          {/* Readiness */}
          <div
            className={`mt-5 rounded-xl border px-5 py-4 ${ready
                ? "border-emerald-200 bg-emerald-50"
                : "border-amber-200 bg-amber-50"
              }`}
            id="readiness"
          >
            <p
              className={`font-semibold ${ready ? "text-emerald-900" : "text-amber-900"
                }`}
            >
              {ready
                ? "Readiness achieved"
                : "Readiness requirements"}
            </p>

            <p
              className={`mt-1 text-sm ${ready ? "text-emerald-700" : "text-amber-700"
                }`}
            >
              {attendanceCondition
                ? `Attendance requirement met (${attendance.percentage}%).`
                : `Attendance is below 75% (${attendance.percentage}%).`}

              {" "}

              {matchesCondition
                ? `${completedMatches.length} completed matches recorded.`
                : `At least 2 completed matches are required. Current: ${completedMatches.length}.`}
            </p>
          </div>

          {/* Attendance */}
          <div
            className="mt-5 grid gap-5 xl:grid-cols-[1.4fr_1fr]"
            id="attendance"
          >
            <Panel title="Recent attendance">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[480px] text-left text-sm">
                  <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                    <tr>
                      <th className="px-5 py-3 font-medium">
                        Session date
                      </th>
                      <th className="px-5 py-3 font-medium">
                        Sport
                      </th>
                      <th className="px-5 py-3 font-medium">
                        Status
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100">
                    {attendance.history.length ? (
                      attendance.history.map((record) => (
                        <tr key={record.id}>
                          <td className="px-5 py-4">
                            <div className="font-medium text-slate-800">
                              {formatDate(record.date)}
                            </div>
                            <p className="mt-1 text-xs text-slate-500">
                              {record.sessionTitle}
                            </p>
                          </td>

                          <td className="px-5 py-4 capitalize text-slate-500">
                            {record.sport}
                          </td>

                          <td className="px-5 py-4">
                            <StatusBadge
                              tone={getAttendanceTone(record.status)}
                            >
                              {record.status}
                            </StatusBadge>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan={3}
                          className="px-5 py-8 text-center text-slate-500"
                        >
                          No attendance records found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </Panel>

            <Panel title="Attendance trend">
              <div className="p-5">
                {attendance.history.length ? (
                  <div className="flex h-48 items-end gap-3">
                    {[...attendance.history]
                      .reverse()
                      .map((record) => {
                        const isPresent = record.status === "PRESENT";
                        const isLate = record.status === "LATE";
                        const height =
                          isPresent || isLate ? "100%" : "35%";

                        return (
                          <div
                            key={record.id}
                            className="flex h-full min-w-0 flex-1 flex-col items-center justify-end gap-2"
                          >
                            <span className="text-center text-xs font-semibold text-slate-600">
                              {record.status}
                            </span>

                            <div
                              className={`w-full rounded-t-md ${isPresent
                                  ? "bg-emerald-500"
                                  : isLate
                                    ? "bg-amber-400"
                                    : "bg-slate-300"
                                }`}
                              style={{ height }}
                            />

                            <span className="text-center text-[11px] text-slate-500">
                              {new Date(record.date).toLocaleDateString(
                                "en-IN",
                                { day: "2-digit", month: "short" }
                              )}
                            </span>
                          </div>
                        );
                      })}
                  </div>
                ) : (
                  <p className="py-8 text-sm text-slate-500">
                    Attendance trend will appear here.
                  </p>
                )}
              </div>
            </Panel>
          </div>

          {/* Matches */}
          <div className="mt-5 grid gap-5 xl:grid-cols-2" id="matches">
            <Panel title="Upcoming matches">
              {upcomingMatches.length ? (
                <div className="divide-y divide-slate-100">
                  {upcomingMatches.map((match) => (
                    <div
                      key={match.id}
                      className="flex items-center gap-3 px-5 py-4"
                    >
                      <CalendarDays className="h-5 w-5 text-blue-600" />

                      <div className="min-w-0 flex-1">
                        <p className="truncate font-medium text-slate-800">
                          {match.name}
                        </p>
                        <p className="text-xs capitalize text-slate-500">
                          {match.sport} · {formatDate(match.date)}
                        </p>
                      </div>

                      <StatusBadge tone="blue">
                        {getMatchStatus(match.status)}
                      </StatusBadge>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="px-5 py-8 text-sm text-slate-500">
                  No upcoming matches are scheduled.
                </p>
              )}
            </Panel>

            <Panel title="Completed matches and scores">
              {completedMatches.length ? (
                <div className="divide-y divide-slate-100">
                  {completedMatches.map((match) => (
                    <div
                      key={match.id}
                      className="flex items-center gap-3 px-5 py-4"
                    >
                      <Medal className="h-5 w-5 text-violet-600" />

                      <div className="min-w-0 flex-1">
                        <p className="truncate font-medium text-slate-800">
                          {match.name}
                        </p>

                        <p className="text-xs capitalize text-slate-500">
                          {match.sport} · {formatDate(match.date)}
                        </p>

                        {match.teamScore !== null &&
                          match.teamScore !== undefined &&
                          match.opponentScore !== null &&
                          match.opponentScore !== undefined && (
                            <p className="mt-1 text-xs font-medium text-slate-600">
                              Team: {match.teamScore} · Opponent:{" "}
                              {match.opponentScore}
                            </p>
                          )}
                      </div>

                      <StatusBadge
                        tone={
                          match.score === null ? "slate" : "green"
                        }
                      >
                        {match.score === null
                          ? "Score unavailable"
                          : `Score: ${match.score}`}
                      </StatusBadge>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="px-5 py-8 text-sm text-slate-500">
                  No completed match records are available.
                </p>
              )}
            </Panel>
          </div>

          {/* Profile and Navigation */}
          <div
            className="mt-5 grid gap-5 lg:grid-cols-[1fr_2fr]"
            id="performance"
          >
            <Panel title="My profile">
              <div
                id="profile"
                className="space-y-3 p-5 text-sm"
              >
                <div className="flex justify-between gap-4">
                  <span className="text-slate-500">Player ID</span>
                  <strong className="text-slate-800">
                    {player.playerCode}
                  </strong>
                </div>

                <div className="flex justify-between gap-4">
                  <span className="text-slate-500">Sport</span>
                  <strong className="capitalize text-slate-800">
                    {player.sport}
                  </strong>
                </div>

                <div className="flex justify-between gap-4">
                  <span className="text-slate-500">Email</span>
                  <strong className="break-all text-right text-slate-800">
                    {player.email || "—"}
                  </strong>
                </div>

                <div className="flex justify-between gap-4">
                  <span className="text-slate-500">Phone</span>
                  <strong className="text-slate-800">
                    {player.phone || "—"}
                  </strong>
                </div>

                <div className="flex justify-between gap-4">
                  <span className="text-slate-500">Account status</span>
                  <strong className="text-slate-800">
                    {player.status}
                  </strong>
                </div>
              </div>
            </Panel>

            <Panel title="Quick navigation">
              <div className="grid gap-3 p-5 sm:grid-cols-2">
                {[
                  {
                    label: "My Profile",
                    href: "/player#profile",
                    icon: UserRound,
                  },
                  {
                    label: "My Attendance",
                    href: "/player#attendance",
                    icon: ClipboardCheck,
                  },
                  {
                    label: "My Matches",
                    href: "/player#matches",
                    icon: CalendarDays,
                  },
                  {
                    label: "My Performance",
                    href: "/player#performance",
                    icon: Medal,
                  },
                ].map(({ label, href, icon: ItemIcon }) => (
                  <Link
                    key={label}
                    href={href}
                    className="flex items-center gap-3 rounded-lg border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
                  >
                    <ItemIcon className="h-5 w-5" />
                    {label}
                  </Link>
                ))}
              </div>
            </Panel>
          </div>
        </>
      )}
    </DashboardShell>
  );
}
