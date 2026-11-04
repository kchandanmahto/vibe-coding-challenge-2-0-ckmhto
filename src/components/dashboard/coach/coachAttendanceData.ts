import type { CoachSession } from "./coachSessionsData";

export type AttendanceStatus = "Present" | "Absent" | "Not marked";

export type CoachAttendanceRecord = {
  playerId: string;
  status: AttendanceStatus;
  markedAt?: string;
};

export const coachAttendanceSessions: Array<CoachSession & { held: boolean }> = [
  { id: "SES-1108", title: "Morning Fitness", date: "2026-11-04", sport: "Football", coach: "Raj Kumar", playerIds: ["AD-1042", "AD-1088", "AD-1265", "AD-1342"], present: 16, absent: 2, status: "Open", held: false },
  { id: "SES-1109", title: "Technical Training", date: "2026-11-04", sport: "Football", coach: "Raj Kumar", playerIds: ["AD-1042", "AD-1088", "AD-1265"], present: 19, absent: 3, status: "Open", held: false },
  { id: "SES-1110", title: "Speed Conditioning", date: "2026-11-04", sport: "Athletics", coach: "Raj Kumar", playerIds: ["AD-1310", "AD-1396"], present: 11, absent: 1, status: "Closed", held: true },
  { id: "SES-1104", title: "Football Fundamentals", date: "2026-11-03", sport: "Football", coach: "Raj Kumar", playerIds: ["AD-1042", "AD-1088", "AD-1265", "AD-1342"], present: 15, absent: 3, status: "Closed", held: true },
  { id: "SES-1101", title: "Track Practice", date: "2026-11-02", sport: "Athletics", coach: "Raj Kumar", playerIds: ["AD-1310", "AD-1396"], present: 10, absent: 2, status: "Closed", held: true },
];

export const initialCoachAttendance: Record<string, CoachAttendanceRecord[]> = {
  "SES-1108": [
    { playerId: "AD-1042", status: "Present", markedAt: "2026-11-04 07:42 AM" },
    { playerId: "AD-1088", status: "Absent", markedAt: "2026-11-04 07:45 AM" },
    { playerId: "AD-1265", status: "Not marked" },
    { playerId: "AD-1342", status: "Present", markedAt: "2026-11-04 07:48 AM" },
  ],
  "SES-1109": [
    { playerId: "AD-1042", status: "Present", markedAt: "2026-11-04 04:12 PM" },
    { playerId: "AD-1088", status: "Present", markedAt: "2026-11-04 04:12 PM" },
    { playerId: "AD-1265", status: "Not marked" },
  ],
  "SES-1110": [
    { playerId: "AD-1310", status: "Present", markedAt: "2026-11-04 07:05 AM" },
    { playerId: "AD-1396", status: "Absent", markedAt: "2026-11-04 07:06 AM" },
  ],
  "SES-1104": [
    { playerId: "AD-1042", status: "Present", markedAt: "2026-11-03 08:02 AM" },
    { playerId: "AD-1088", status: "Present", markedAt: "2026-11-03 08:03 AM" },
    { playerId: "AD-1265", status: "Absent", markedAt: "2026-11-03 08:04 AM" },
    { playerId: "AD-1342", status: "Present", markedAt: "2026-11-03 08:06 AM" },
  ],
  "SES-1101": [
    { playerId: "AD-1310", status: "Present", markedAt: "2026-11-02 06:58 AM" },
    { playerId: "AD-1396", status: "Present", markedAt: "2026-11-02 06:59 AM" },
  ],
};
