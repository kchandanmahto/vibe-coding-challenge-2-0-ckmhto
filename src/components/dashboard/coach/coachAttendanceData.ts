
export type AttendanceStatus =
  | "PRESENT"
  | "ABSENT"
  | "LATE"
  | "EXCUSED";

export type CoachAttendanceRecord = {
  playerId: string;
  status: AttendanceStatus;
  markedAt?: string;
  remarks?: string;
};

export type CoachSessionStatus =
  | "SCHEDULED"
  | "OPEN"
  | "CLOSED"
  | "CANCELLED";

export type CoachAttendancePlayer = {
  id: string;
  name: string;
  playerCode: string;
};

export type CoachAttendanceSession = {
  id: string;
  sessionCode: string;
  title: string;
  date: string;
  startTime: string;
  endTime: string;
  sport: string;
  status: CoachSessionStatus;
  players: CoachAttendancePlayer[];
  present: number;
  absent: number;
  late: number;
  excused: number;
  total: number;
};

export type AttendanceApiResponse = {
  session: CoachAttendanceSession;
  records: CoachAttendanceRecord[];
};

/**
 * Legacy type used by CoachMatchesManagement.
 * Attendance page itself uses the real attendance API.
 */
export type LegacyMatchAttendanceRecord = {
  playerId: string;
  status: "Present" | "Absent" | "Not marked";
  markedAt?: string;
};

/**
 * Empty compatibility object.
 * No demo attendance records are included.
 */
export const initialCoachAttendance: Record<
  string,
  LegacyMatchAttendanceRecord[]
> = {};
