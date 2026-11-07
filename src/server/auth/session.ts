import "server-only";

import User from "@/models/User";
import { auth } from "@/server/auth/auth";
import { connectDB } from "@/server/database/mongodb";

export interface SafeAuthenticatedUser {
  id: string;
  name: string;
  email: string;
  role: "HEAD_COACH" | "COACH" | "SCOUT" | "PLAYER";
  academyId: string;
  status: "ACTIVE";
}

export interface SafeAuthenticatedSession {
  user: SafeAuthenticatedUser;
}

export async function getValidatedSession(): Promise<SafeAuthenticatedSession | null> {
  const session = await auth();
  const sessionUser = session?.user;
  if (!sessionUser?.id) {
    return null;
  }

  try {
    await connectDB();
    const databaseUser = await User.findById(sessionUser.id).lean();
    if (
      !databaseUser ||
      databaseUser.status !== "ACTIVE" ||
      (databaseUser.role === "PLAYER" &&
        databaseUser.passwordSetupCompleted === false) ||
      typeof sessionUser.academyId !== "string" ||
      typeof sessionUser.role !== "string" ||
      sessionUser.academyId !== String(databaseUser.academyId) ||
      sessionUser.role !== databaseUser.role
    ) {
      return null;
    }

    const tokenSessionVersion = sessionUser.sessionVersion;
    const databaseSessionVersion = databaseUser.authSessionVersion ?? 0;
    if (
      typeof tokenSessionVersion !== "number" ||
      tokenSessionVersion !== databaseSessionVersion
    ) {
      return null;
    }

    return {
      user: {
        id: String(databaseUser._id),
        name: databaseUser.name,
        email: databaseUser.email,
        role: databaseUser.role,
        academyId: String(databaseUser.academyId),
        status: "ACTIVE",
      },
    };
  } catch {
    return null;
  }
}
