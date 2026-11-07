import "server-only";

import { headers } from "next/headers";

import User from "@/models/User";
import { connectDB } from "@/server/database/mongodb";
import { verifyPassword } from "@/server/auth/password";
import { credentialsSchema } from "@/server/auth/schemas";
import { getLimiters } from "@/server/rate-limit/policies";
import { checkRateLimit } from "@/server/rate-limit/check";
import {
  extractClientIp,
  hmacIdentifier,
  normalizeEmail,
} from "@/server/rate-limit/identifier";

export interface TrustedCredentialsUser {
  id: string;
  name: string;
  email: string;
  role: "HEAD_COACH" | "COACH" | "SCOUT" | "PLAYER";
  academyId: string;
  status: "ACTIVE" | "INACTIVE" | "SUSPENDED";
}

export async function authorizeCredentials(
  credentials: Record<string, unknown> | undefined,
): Promise<TrustedCredentialsUser | null> {
  const parsed = credentialsSchema.safeParse(credentials);
  if (!parsed.success) {
    return null;
  }

  const secret = process.env.RATE_LIMIT_KEY_SECRET;
  const limiters = getLimiters();

  // Login rate limits are enforced here (post-CSRF, inside Auth.js flow).
  // Fail-open for login: Upstash outages must not lock everyone out.
  if (secret) {
    const emailKey = hmacIdentifier(secret, normalizeEmail(parsed.data.email));
    const emailResult = await checkRateLimit(
      limiters?.loginEmail ?? null,
      emailKey,
      "open",
    );
    if (!emailResult.allowed) {
      return null;
    }

    let clientIp: string | null = null;
    try {
      const requestHeaders = await headers();
      clientIp = extractClientIp(requestHeaders);
    } catch {
      clientIp = null;
    }

    if (clientIp) {
      const ipKey = hmacIdentifier(secret, clientIp);
      const ipResult = await checkRateLimit(
        limiters?.loginIp ?? null,
        ipKey,
        "open",
      );
      if (!ipResult.allowed) {
        return null;
      }
    }
  }

  try {
    await connectDB();
    const user = await User.findOne({ email: parsed.data.email })
      .select("+passwordHash")
      .lean();

    if (
      !user ||
      !user.passwordHash ||
      user.status !== "ACTIVE" ||
      (user.role === "PLAYER" && user.passwordSetupCompleted === false)) {
      return null;
    }

    const passwordMatches = await verifyPassword(
      user.passwordHash,
      parsed.data.password,
    );
    if (!passwordMatches) {
      return null;
    }

    return {
      id: String(user._id),
      name: user.name,
      email: user.email,
      role: user.role,
      academyId: String(user.academyId),
      status: user.status,
    };
  } catch (error) {
    console.error("[CREDENTIALS LOGIN ERROR]", error);
    return null;
  }
}
