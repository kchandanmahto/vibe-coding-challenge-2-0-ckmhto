export type CoachMatchStatus = "Upcoming" | "In Progress" | "Completed" | "Cancelled";

export type CoachMatch = {
  id: string;
  name: string;
  sport: "Football" | "Athletics";
  date: string;
  time: string;
  type: string;
  opponent: string;
  description: string;
  status: CoachMatchStatus;
  playerIds: string[];
  sessionId?: string;
  createdAt: string;
};

export const coachMatchesMock: CoachMatch[] = [
  { id: "MAT-3101", name: "District Football League", sport: "Football", date: "2026-11-18", time: "16:00", type: "League", opponent: "Rising Stars FC", description: "District league fixture.", status: "Upcoming", playerIds: ["AD-1042", "AD-1088", "AD-1265"], sessionId: "SES-1108", createdAt: "2026-10-28" },
  { id: "MAT-3102", name: "City Athletics Trial", sport: "Athletics", date: "2026-11-09", time: "07:30", type: "Trial", opponent: "City Athletics Club", description: "City-level player trial.", status: "Upcoming", playerIds: ["AD-1310", "AD-1396"], sessionId: "SES-1110", createdAt: "2026-11-01" },
  { id: "MAT-3103", name: "Academy Cup Final", sport: "Football", date: "2026-11-04", time: "15:30", type: "Tournament", opponent: "Central Academy", description: "Academy Cup fixture.", status: "In Progress", playerIds: ["AD-1042", "AD-1088"], createdAt: "2026-10-20" },
  { id: "MAT-3104", name: "Academy Football League", sport: "Football", date: "2026-10-29", time: "16:30", type: "League", opponent: "North Side Sports", description: "Academy league match.", status: "Completed", playerIds: ["AD-1042", "AD-1088", "AD-1342"], createdAt: "2026-10-18" },
  { id: "MAT-3105", name: "Junior Athletics Meet", sport: "Athletics", date: "2026-10-24", time: "06:45", type: "Meet", opponent: "Green Park Academy", description: "Junior athletics meet.", status: "Completed", playerIds: ["AD-1310", "AD-1396"], createdAt: "2026-10-15" },
  { id: "MAT-3106", name: "Friendly Football Fixture", sport: "Football", date: "2026-10-20", time: "17:00", type: "Friendly", opponent: "West Club", description: "Cancelled due to academy scheduling.", status: "Cancelled", playerIds: ["AD-1042"], createdAt: "2026-10-12" },
];
