export type CoachPlayer = {
  id: string;
  name: string;
  initials: string;
  age: number;
  gender: "Male" | "Female";
  sport: "Football" | "Athletics";
  phone: string;
  email: string;
  address: string;
  attendance: number;
  presentSessions: number;
  absentSessions: number;
  completedMatches: number;
  status: "Active" | "Inactive";
  attendanceHistory: { date: string; status: "Present" | "Absent" }[];
  matchHistory: { title: string; date: string; score: number }[];
};

export const coachPlayers: CoachPlayer[] = [
  {
    id: "AD-1042", name: "Arjun Patel", initials: "AP", age: 16, gender: "Male", sport: "Football",
    phone: "+91 98765 41042", email: "arjun.patel@example.com", address: "12 Stadium Road, Pune",
    attendance: 92, presentSessions: 23, absentSessions: 2, completedMatches: 4, status: "Active",
    attendanceHistory: [{ date: "04 Nov 2026", status: "Present" }, { date: "02 Nov 2026", status: "Present" }, { date: "31 Oct 2026", status: "Absent" }],
    matchHistory: [{ title: "City Cup", date: "29 Oct 2026", score: 78 }, { title: "Academy League", date: "24 Oct 2026", score: 81 }, { title: "District Trial", date: "18 Oct 2026", score: 76 }, { title: "Friendly Match", date: "12 Oct 2026", score: 72 }],
  },
  {
    id: "AD-1088", name: "Meera Shah", initials: "MS", age: 15, gender: "Female", sport: "Football",
    phone: "+91 98765 41088", email: "meera.shah@example.com", address: "8 Green Park, Pune",
    attendance: 88, presentSessions: 22, absentSessions: 3, completedMatches: 3, status: "Active",
    attendanceHistory: [{ date: "04 Nov 2026", status: "Present" }, { date: "02 Nov 2026", status: "Absent" }, { date: "31 Oct 2026", status: "Present" }],
    matchHistory: [{ title: "City Cup", date: "29 Oct 2026", score: 84 }, { title: "Academy League", date: "24 Oct 2026", score: 80 }, { title: "District Trial", date: "18 Oct 2026", score: 79 }],
  },
  {
    id: "AD-1265", name: "Kabir Singh", initials: "KS", age: 14, gender: "Male", sport: "Football",
    phone: "+91 98765 41265", email: "kabir.singh@example.com", address: "30 Sports Colony, Pune",
    attendance: 74, presentSessions: 17, absentSessions: 6, completedMatches: 2, status: "Inactive",
    attendanceHistory: [{ date: "04 Nov 2026", status: "Absent" }, { date: "02 Nov 2026", status: "Present" }, { date: "31 Oct 2026", status: "Absent" }],
    matchHistory: [{ title: "Academy League", date: "24 Oct 2026", score: 68 }, { title: "District Trial", date: "18 Oct 2026", score: 71 }],
  },
  {
    id: "AD-1310", name: "Aisha Khan", initials: "AK", age: 15, gender: "Female", sport: "Athletics",
    phone: "+91 98765 41310", email: "aisha.khan@example.com", address: "21 Lake View, Pune",
    attendance: 81, presentSessions: 17, absentSessions: 4, completedMatches: 3, status: "Active",
    attendanceHistory: [{ date: "04 Nov 2026", status: "Present" }, { date: "02 Nov 2026", status: "Present" }, { date: "31 Oct 2026", status: "Present" }],
    matchHistory: [{ title: "Athletics Trial", date: "24 Oct 2026", score: 87 }, { title: "City Athletics Meet", date: "17 Oct 2026", score: 82 }, { title: "Academy Sprint", date: "10 Oct 2026", score: 79 }],
  },
  {
    id: "AD-1342", name: "Rohan Das", initials: "RD", age: 16, gender: "Male", sport: "Football",
    phone: "+91 98765 41342", email: "rohan.das@example.com", address: "55 East Road, Pune",
    attendance: 69, presentSessions: 16, absentSessions: 7, completedMatches: 1, status: "Inactive",
    attendanceHistory: [{ date: "04 Nov 2026", status: "Absent" }, { date: "02 Nov 2026", status: "Absent" }, { date: "31 Oct 2026", status: "Present" }],
    matchHistory: [{ title: "Friendly Match", date: "12 Oct 2026", score: 62 }],
  },
  {
    id: "AD-1396", name: "Sara Ahmed", initials: "SA", age: 14, gender: "Female", sport: "Athletics",
    phone: "+91 98765 41396", email: "sara.ahmed@example.com", address: "6 Garden Lane, Pune",
    attendance: 76, presentSessions: 16, absentSessions: 5, completedMatches: 2, status: "Active",
    attendanceHistory: [{ date: "04 Nov 2026", status: "Present" }, { date: "02 Nov 2026", status: "Present" }, { date: "31 Oct 2026", status: "Absent" }],
    matchHistory: [{ title: "Athletics Trial", date: "24 Oct 2026", score: 73 }, { title: "Academy Sprint", date: "10 Oct 2026", score: 70 }],
  },
];

export function isPlayerReady(player: CoachPlayer) {
  return player.attendance >= 75 && player.completedMatches >= 2;
}
