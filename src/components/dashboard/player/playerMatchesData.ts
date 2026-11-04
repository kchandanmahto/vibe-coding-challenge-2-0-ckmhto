import { coachMatchesMock } from "../coach/coachMatchesData";
import { coachMatchScoresMock } from "../coach/coachScoresData";

export const currentPlayerId = "AD-1042";

export const playerMatches = coachMatchesMock
  .filter((match) => match.playerIds.includes(currentPlayerId))
  .map((match) => {
    const scoreRecord = coachMatchScoresMock
      .find((item) => item.matchId === match.id)
      ?.scores.find((item) => item.playerId === currentPlayerId);

    return {
      ...match,
      participationStatus: "Registered" as const,
      score: scoreRecord?.score ?? null,
      scoreStatus: scoreRecord?.status === "Saved" && scoreRecord.score !== null
        ? "Available"
        : match.status === "Completed"
          ? "Not available"
          : "Not applicable",
      lastUpdated: scoreRecord?.lastUpdated,
    };
  });
