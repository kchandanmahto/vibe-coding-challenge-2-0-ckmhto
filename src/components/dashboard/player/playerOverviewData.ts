import { coachMatchesMock } from "../coach/coachMatchesData";
import { coachMatchScoresMock } from "../coach/coachScoresData";
import { coachPlayers, type CoachPlayer } from "../coach/coachPlayersData";

export const currentPlayer = coachPlayers.find((player) => player.id === "AD-1042") ?? coachPlayers[0];

export type PlayerOverviewMatch = {
  id: string;
  name: string;
  sport: string;
  date: string;
  status: "Upcoming" | "In Progress" | "Completed" | "Cancelled";
  score: number | null;
};

export function getPlayerOverviewMatches(player: CoachPlayer): PlayerOverviewMatch[] {
  return coachMatchesMock
    .filter((match) => match.playerIds.includes(player.id))
    .map((match) => {
      const scoreRecord = coachMatchScoresMock
        .find((item) => item.matchId === match.id)
        ?.scores.find((item) => item.playerId === player.id);

      return {
        id: match.id,
        name: match.name,
        sport: match.sport,
        date: match.date,
        status: match.status,
        score: match.status === "Completed" ? scoreRecord?.score ?? null : null,
      };
    });
}
