
import mongoose from "mongoose";
import { NextResponse } from "next/server";
import { z } from "zod";

import PasswordResetToken from "@/models/PasswordResetToken";
import User from "@/models/User";
import { connectDB } from "@/server/database/mongodb";
import { hashPassword } from "@/server/auth/password";
import { hashPasswordResetToken } from "@/server/auth/password-reset";
import { getLimiters } from "@/server/rate-limit/policies";
import { checkRateLimit } from "@/server/rate-limit/check";
import { extractClientIp, hmacIdentifier } from "@/server/rate-limit/identifier";

const resetSchema = z.object({
  token: z.string().min(32).max(512),
  password: z.string().min(8).max(128),
});

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = resetSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { message: "This reset link is invalid or has expired." },
      { status: 400 },
    );
  }

  const secret = process.env.RATE_LIMIT_KEY_SECRET;
  const limiters = getLimiters();

  // Fail closed when rate-limiting configuration is unavailable.
  if (!secret || secret.length < 32 || !limiters) {
    console.error("Reset-password rate limiting is not configured.");

    return NextResponse.json(
      { message: "Password recovery is temporarily unavailable." },
      {
        status: 503,
        headers: { "Retry-After": "60" },
      },
    );
  }

  const clientIp = extractClientIp(request.headers);
  const tokenHash = hashPasswordResetToken(parsed.data.token);

  // IP-based rate limiting.
  if (clientIp) {
    const ipResult = await checkRateLimit(
      limiters.resetIp,
      hmacIdentifier(secret, clientIp),
      "closed",
    );

    if (!ipResult.allowed) {
      return NextResponse.json(
        { message: "Too many attempts. Please try again later." },
        {
          status: 429,
          headers: { "Retry-After": String(ipResult.retryAfterSeconds) },
        },
      );
    }
  }

  // Token-based rate limiting.
  const tokenResult = await checkRateLimit(
    limiters.resetToken,
    hmacIdentifier(secret, tokenHash),
    "closed",
  );

  if (!tokenResult.allowed) {
    return NextResponse.json(
      { message: "Too many attempts. Please try again later." },
      {
        status: 429,
        headers: { "Retry-After": String(tokenResult.retryAfterSeconds) },
      },
    );
  }

  try {
    await connectDB();

    const passwordHash = await hashPassword(parsed.data.password);
    const database = mongoose.connection;
    const session = await database.startSession();

    try {
      let resetSucceeded = false;

      await session.withTransaction(async () => {
        const token = await PasswordResetToken.findOneAndUpdate(
          {
            tokenHash,
            consumedAt: { $exists: false },
            expiresAt: { $gt: new Date() },
          },
          { $set: { consumedAt: new Date() } },
          { new: true, session },
        );

        if (!token) {
          return;
        }

        const user = await User.findOneAndUpdate(
          {
            _id: token.userId,
            status: "ACTIVE",
          },
          {
            $set: {
              passwordHash,
              passwordSetupCompleted: true,
            },
            $inc: { authSessionVersion: 1 },
          },
          { new: true, session },
        );

        if (!user) {
          throw new Error("Account cannot be reset");
        }

        await PasswordResetToken.updateMany(
          { userId: token.userId, consumedAt: { $exists: false } },
          { $set: { consumedAt: new Date() } },
          { session },
        );

        resetSucceeded = true;
      });

      if (!resetSucceeded) {
        return NextResponse.json(
          { message: "This reset link is invalid or has expired." },
          { status: 400 },
        );
      }

      return NextResponse.json({
        message: "Password reset successfully.",
      });
    } finally {
      await session.endSession();
    }
  } catch {
    return NextResponse.json(
      { message: "Unable to reset password. Please request a new link." },
      { status: 400 },
    );
  }
}