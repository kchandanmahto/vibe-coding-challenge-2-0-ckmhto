import { coachPlayers } from "../coach/coachPlayersData";

export const currentPlayerProfile = coachPlayers.find((player) => player.id === "AD-1042") ?? coachPlayers[0];

export const playerProfileDetails = {
  dateOfBirth: "2010-04-18",
  emergencyContact: "Meera Patel · +91 98765 41043",
  academyName: "Academy Desk",
  assignedCoach: "Raj Kumar",
  joiningDate: "12 Aug 2025",
};
