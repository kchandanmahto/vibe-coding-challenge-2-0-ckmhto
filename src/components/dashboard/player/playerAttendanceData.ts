import { currentPlayer } from "./playerOverviewData";

export type PlayerAttendanceStatus = "Present" | "Absent";

export type PlayerAttendanceRecord = {
  id: string;
  date: string;
  sport: string;
  sessionName: string;
  coach: string;
  status: PlayerAttendanceStatus;
  remarks?: string;
};

const attendanceFixtures: Array<[string, PlayerAttendanceStatus, string, string]> = [
  ["2026-11-04", "Present", "Morning Fitness", "Regular attendance"],
  ["2026-11-02", "Present", "Technical Training", "Regular attendance"],
  ["2026-10-31", "Absent", "Weekend Conditioning", "Player absence recorded"],
  ["2026-10-29", "Present", "Football Fundamentals", ""],
  ["2026-10-27", "Present", "Passing Drills", ""],
  ["2026-10-24", "Present", "Team Shape Practice", ""],
  ["2026-10-22", "Present", "Speed and Agility", ""],
  ["2026-10-20", "Present", "Match Preparation", ""],
  ["2026-10-17", "Absent", "Recovery Training", "Player absence recorded"],
  ["2026-10-15", "Present", "Set Piece Training", ""],
  ["2026-10-13", "Present", "Ball Control", ""],
  ["2026-10-10", "Present", "Tactical Training", ""],
  ["2026-10-08", "Present", "Fitness Circuit", ""],
  ["2026-10-06", "Present", "Technical Training", ""],
  ["2026-10-03", "Present", "Weekend Training", ""],
  ["2026-09-29", "Present", "Passing Drills", ""],
  ["2026-09-26", "Present", "Football Fundamentals", ""],
  ["2026-09-24", "Present", "Defensive Shape", ""],
  ["2026-09-22", "Present", "Ball Control", ""],
  ["2026-09-19", "Present", "Tactical Practice", ""],
  ["2026-09-17", "Present", "Speed Training", ""],
  ["2026-09-15", "Present", "Team Training", ""],
  ["2026-09-12", "Present", "Match Preparation", ""],
  ["2026-09-10", "Present", "Fitness Training", ""],
  ["2026-09-08", "Present", "Academy Fundamentals", ""],
];

export const playerAttendanceRecords: PlayerAttendanceRecord[] = attendanceFixtures.map(([date, status, sessionName, remarks], index) => ({
  id: `ATT-${String(index + 1).padStart(4, "0")}`,
  date,
  sport: currentPlayer.sport,
  sessionName,
  coach: "Raj Kumar",
  status,
  remarks: remarks || undefined,
}));
