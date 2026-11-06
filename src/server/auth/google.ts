import "server-only";

import User from "@/models/User";
import { connectDB } from "@/server/database/mongodb";

export async function authorizeGoogleAccount({
  googleSub,
  googleEmail,
}: {
  googleSub: string;
  googleEmail: string;
}): Promise<boolean> {
  if (!googleSub || !googleEmail) {
    return false;
  }

  try {
    await connectDB();
    const email = googleEmail.trim().toLowerCase();

    const conflictingSubject = await User.findOne({
      googleId: googleSub,
      email: { $ne: email },
    })
      .select("_id")
      .lean();
    if (conflictingSubject) {
      return false;
    }

    const conflictingAccount = await User.findOne({
      email,
      googleId: { $exists: true, $ne: googleSub },
    })
      .select("_id")
      .lean();
    if (conflictingAccount) {
      return false;
    }

    const user = await User.findOne({ email })
      .select("+googleId")
      .lean();
    if (!user || user.status !== "ACTIVE" || !user.emailVerified) {
      return false;
    }

    if (user.googleId && user.googleId !== googleSub) {
      return false;
    }

    if (!user.googleId) {
      const linked = await User.updateOne(
        {
          _id: user._id,
          email,
          status: "ACTIVE",
          googleId: { $exists: false },
          emailVerified: { $exists: true, $ne: null },
        },
        { $set: { googleId: googleSub } },
      );
      if (linked.matchedCount !== 1) {
        const concurrentlyLinked = await User.exists({
          _id: user._id,
          googleId: googleSub,
          status: "ACTIVE",
        });
        if (!concurrentlyLinked) {
          return false;
        }
      }
    }

    return true;
  } catch {
    return false;
  }
}
