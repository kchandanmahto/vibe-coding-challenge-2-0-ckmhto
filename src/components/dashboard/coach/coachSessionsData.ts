export type CoachSessionStatus = "Open" | "Closed";

export type CoachSession = {
  id: string;
  title: string;
  date: string;
  sport: "Football" | "Athletics";
  coach: string;
  playerIds: string[];
  present: number;
  absent: number;
  status: CoachSessionStatus;
  notes?: string;
};

export const coachSessionsMock: CoachSession[] = [
  { id: "SES-1108", title: "Morning Fitness", date: "2026-11-04", sport: "Football", coach: "Raj Kumar", playerIds: ["AD-1042", "AD-1088", "AD-1265", "AD-1342"], present: 16, absent: 2, status: "Open" },
  { id: "SES-1109", title: "Technical Training", date: "2026-11-04", sport: "Football", coach: "Raj Kumar", playerIds: ["AD-1042", "AD-1088", "AD-1265", "AD-1342"], present: 19, absent: 3, status: "Open" },
  { id: "SES-1110", title: "Speed Conditioning", date: "2026-11-04", sport: "Athletics", coach: "Raj Kumar", playerIds: ["AD-1310", "AD-1396"], present: 11, absent: 1, status: "Closed" },
  { id: "SES-1104", title: "Football Fundamentals", date: "2026-11-03", sport: "Football", coach: "Raj Kumar", playerIds: ["AD-1042", "AD-1088", "AD-1265", "AD-1342"], present: 15, absent: 3, status: "Closed" },
  { id: "SES-1101", title: "Track Practice", date: "2026-11-02", sport: "Athletics", coach: "Raj Kumar", playerIds: ["AD-1310", "AD-1396"], present: 10, absent: 2, status: "Closed" },
  { id: "SES-1112", title: "Set Piece Training", date: "2026-11-06", sport: "Football", coach: "Raj Kumar", playerIds: ["AD-1042", "AD-1088", "AD-1265", "AD-1342"], present: 0, absent: 0, status: "Open" },
  { id: "SES-1113", title: "Relay Practice", date: "2026-11-07", sport: "Athletics", coach: "Raj Kumar", playerIds: ["AD-1310", "AD-1396"], present: 0, absent: 0, status: "Open" },
];
