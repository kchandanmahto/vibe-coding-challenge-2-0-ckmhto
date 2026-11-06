
import { NextResponse } from "next/server";
import { z } from "zod";

import PasswordResetToken from "@/models/PasswordResetToken";
import User from "@/models/User";
import { connectDB } from "@/server/database/mongodb";
import {
  createPasswordResetToken,
  hashPasswordResetToken,
  PASSWORD_RESET_TTL_MS,
} from "@/server/auth/password-reset";
import { sendPasswordResetEmail } from "@/server/email/password-reset";
import { getLimiters } from "@/server/rate-limit/policies";
import { checkRateLimit } from "@/server/rate-limit/check";
import { extractClientIp, hmacIdentifier } from "@/server/rate-limit/identifier";

const requestSchema = z.object({
  email: z.email().trim().toLowerCase().max(254),
});

const genericResponse = {
  message:
    "If an eligible account exists for that email, a password reset link will be sent.",
};

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = requestSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(genericResponse);
  }

  const secret = process.env.RATE_LIMIT_KEY_SECRET;
  const limiters = getLimiters();

  // Fail closed when rate-limiting configuration is unavailable.
  if (!secret || secret.length < 32 || !limiters) {
    console.error("Forgot-password rate limiting is not configured.");

    return NextResponse.json(
      { message: "Password recovery is temporarily unavailable." },
      {
        status: 503,
        headers: { "Retry-After": "60" },
      },
    );
  }

  const clientIp = extractClientIp(request.headers);

  // IP-based rate limiting.
  if (clientIp) {
    const ipResult = await checkRateLimit(
      limiters.forgotIp,
      hmacIdentifier(secret, clientIp),
      "closed",
    );

    if (!ipResult.allowed) {
      return NextResponse.json(genericResponse, {
        status: 429,
        headers: { "Retry-After": String(ipResult.retryAfterSeconds) },
      });
    }
  }

  // Email-based rate limiting.
  const emailResult = await checkRateLimit(
    limiters.forgotEmail,
    hmacIdentifier(secret, parsed.data.email),
    "closed",
  );

  if (!emailResult.allowed) {
    return NextResponse.json(genericResponse, {
      status: 429,
      headers: { "Retry-After": String(emailResult.retryAfterSeconds) },
    });
  }

  try {
    await connectDB();

    const user = await User.findOne({
      email: parsed.data.email,
      status: "ACTIVE",
    }).lean();

    if (user) {
      const rawToken = createPasswordResetToken();
      const tokenHash = hashPasswordResetToken(rawToken);

      await PasswordResetToken.updateMany(
        { userId: user._id, consumedAt: { $exists: false } },
        { $set: { consumedAt: new Date() } },
      );

      await PasswordResetToken.create({
        userId: user._id,
        tokenHash,
        expiresAt: new Date(Date.now() + PASSWORD_RESET_TTL_MS),
      });

      const appUrl =
        process.env.AUTH_URL ?? process.env.NEXT_PUBLIC_APP_URL;

      if (appUrl) {
        const resetUrl = `${appUrl.replace(/\/$/, "")}/reset-password?token=${encodeURIComponent(rawToken)}`;

        await sendPasswordResetEmail({
          to: user.email,
          resetUrl,
        });
      }
    }
  } catch {
    // Keep the response generic to avoid revealing account existence.
  }

  return NextResponse.json(genericResponse);
}
