import type { CoachMatch } from "./coachMatchesData";

export type ParticipantScoreStatus = "Not entered" | "Saved" | "Modified";

export type CoachPlayerScore = {
  playerId: string;
  score: number | null;
  participationStatus: "Participated" | "Did not participate";
  status: ParticipantScoreStatus;
  lastUpdated?: string;
};

export type CoachMatchScores = {
  matchId: string;
  scores: CoachPlayerScore[];
};

export const coachMatchScoresMock: CoachMatchScores[] = [
  {
    matchId: "MAT-3104",
    scores: [
      { playerId: "AD-1042", score: 78, participationStatus: "Participated", status: "Saved", lastUpdated: "2026-10-29 18:12" },
      { playerId: "AD-1088", score: 84, participationStatus: "Participated", status: "Saved", lastUpdated: "2026-10-29 18:12" },
      { playerId: "AD-1342", score: 62, participationStatus: "Participated", status: "Saved", lastUpdated: "2026-10-29 18:12" },
    ],
  },
  {
    matchId: "MAT-3105",
    scores: [
      { playerId: "AD-1310", score: 87, participationStatus: "Participated", status: "Saved", lastUpdated: "2026-10-24 09:20" },
      { playerId: "AD-1396", score: null, participationStatus: "Did not participate", status: "Not entered" },
    ],
  },
];

export function scoreStatusForMatch(match: CoachMatch, scoreRecords: CoachMatchScores[]) {
  const record = scoreRecords.find((item) => item.matchId === match.id);
  if (!record) return "Not entered";

  const participants = match.playerIds;
  const recordedParticipants = record.scores.filter((item) => participants.includes(item.playerId));
  const allParticipantsRecorded = participants.every((playerId) => recordedParticipants.some((item) => item.playerId === playerId));
  const nonParticipatingOrScored = recordedParticipants.every((item) =>
    item.participationStatus === "Did not participate" || item.score !== null
  );
  return allParticipantsRecorded && nonParticipatingOrScored ? "Complete" : "Pending";
}
