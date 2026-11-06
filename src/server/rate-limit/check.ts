
import "server-only";

import type { Ratelimit } from "@upstash/ratelimit";

export type RateLimitResult = {
  allowed: boolean;
  retryAfterSeconds: number;
};

export async function checkRateLimit(
  limiter: Ratelimit | null,
  key: string,
  failMode: "open" | "closed",
): Promise<RateLimitResult> {
  // If the limiter is unavailable, respect the operation's failure policy.
  if (!limiter) {
    if (process.env.NODE_ENV === "production") {
      console.error("Rate limiter is not configured or unavailable.");
    }

    return failMode === "open"
      ? { allowed: true, retryAfterSeconds: 0 }
      : { allowed: false, retryAfterSeconds: 60 };
  }

  try {
    const response = await limiter.limit(key);

    if (!response.success) {
      return {
        allowed: false,
        retryAfterSeconds: Math.max(
          1,
          Math.ceil((response.reset - Date.now()) / 1000),
        ),
      };
    }

    if (response.reason === "timeout" && failMode === "closed") {
      return {
        allowed: false,
        retryAfterSeconds: 60,
      };
    }

    return {
      allowed: true,
      retryAfterSeconds: 0,
    };
  } catch (error) {
    console.error("Rate limit check failed:", error);

    return failMode === "open"
      ? { allowed: true, retryAfterSeconds: 0 }
      : { allowed: false, retryAfterSeconds: 60 };
  }
}
