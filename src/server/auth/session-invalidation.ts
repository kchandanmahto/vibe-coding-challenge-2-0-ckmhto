import "server-only";

import mongoose from "mongoose";

import User from "@/models/User";
import { connectDB } from "@/server/database/mongodb";

export interface SessionInvalidationResult {
  success: boolean;
  notFound: boolean;
}

export async function invalidateUserSessions(
  userId: string,
): Promise<SessionInvalidationResult> {
  if (!mongoose.isValidObjectId(userId)) {
    return { success: false, notFound: true };
  }

  try {
    await connectDB();
    const result = await User.findByIdAndUpdate(
      userId,
      { $inc: { authSessionVersion: 1 } },
      { new: false },
    ).lean();

    return result
      ? { success: true, notFound: false }
      : { success: false, notFound: true };
  } catch {
    return { success: false, notFound: false };
  }
}
