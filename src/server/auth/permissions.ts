import "server-only";

import mongoose from "mongoose";

import CoachAssignment from "@/models/CoachAssignment";
import Player from "@/models/Player";

import {
  getValidatedSession,
  type SafeAuthenticatedUser,
} from "@/server/auth/session";

export class AuthorizationError extends Error {
  constructor(
    public readonly code: "UNAUTHENTICATED" | "FORBIDDEN",
  ) {
    super(
      code === "UNAUTHENTICATED"
        ? "Authentication required"
        : "Forbidden"
    );
    this.name = "AuthorizationError";
  }
}

export type ApplicationRole = SafeAuthenticatedUser["role"];

export async function requireAuthenticatedUser(): Promise<SafeAuthenticatedUser> {
  const session = await getValidatedSession();

  if (!session) {
    throw new AuthorizationError("UNAUTHENTICATED");
  }

  return session.user;
}

export async function requireRole(
  allowedRoles: readonly ApplicationRole[],
): Promise<SafeAuthenticatedUser> {
  const user = await requireAuthenticatedUser();

  if (!allowedRoles.includes(user.role)) {
    throw new AuthorizationError("FORBIDDEN");
  }

  return user;
}

export async function requireAcademyAccess(
  academyId: string,
): Promise<SafeAuthenticatedUser> {
  const user = await requireAuthenticatedUser();

  if (
    !mongoose.isValidObjectId(academyId) ||
    user.academyId !== academyId
  ) {
    throw new AuthorizationError("FORBIDDEN");
  }

  return user;
}

export async function requireCoachAccess(): Promise<SafeAuthenticatedUser> {
  const user = await requireRole(["COACH"]);

  const assignment = await CoachAssignment.exists({
    academyId: new mongoose.Types.ObjectId(user.academyId),
    coachId: new mongoose.Types.ObjectId(user.id),
    isHeadCoach: false,
  });

  if (!assignment) {
    throw new AuthorizationError("FORBIDDEN");
  }

  return user;
}

export async function requirePlayerAccess(
  playerId: string,
): Promise<SafeAuthenticatedUser> {
  const user = await requireRole(["PLAYER"]);

  if (!mongoose.isValidObjectId(playerId)) {
    throw new AuthorizationError("FORBIDDEN");
  }

  const player = await Player.exists({
    _id: new mongoose.Types.ObjectId(playerId),
    userId: new mongoose.Types.ObjectId(user.id),
    academyId: new mongoose.Types.ObjectId(user.academyId),
  });

  if (!player) {
    throw new AuthorizationError("FORBIDDEN");
  }

  return user;
}

export async function requireScoutAccess(): Promise<SafeAuthenticatedUser> {
  return requireRole(["SCOUT"]);
}