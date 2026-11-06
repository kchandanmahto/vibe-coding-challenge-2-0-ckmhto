import "server-only";

import { Ratelimit } from "@upstash/ratelimit";

import { getRedis } from "./upstash";

export interface RateLimiters {
  loginIp: Ratelimit;
  loginEmail: Ratelimit;
  forgotIp: Ratelimit;
  forgotEmail: Ratelimit;
  resetIp: Ratelimit;
  resetToken: Ratelimit;
}

let cached: RateLimiters | null | undefined;

export function getLimiters(): RateLimiters | null {
  if (cached !== undefined) {
    return cached;
  }

  const redis = getRedis();
  if (!redis) {
    cached = null;
    return null;
  }

  cached = {
    loginIp: new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(5, "15 m"),
      timeout: 2000,
      prefix: "ad:rl:login:ip",
    }),
    loginEmail: new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(20, "1 h"),
      timeout: 2000,
      prefix: "ad:rl:login:email",
    }),
    forgotIp: new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(5, "1 h"),
      timeout: 2000,
      prefix: "ad:rl:forgot:ip",
    }),
    forgotEmail: new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(3, "1 h"),
      timeout: 2000,
      prefix: "ad:rl:forgot:email",
    }),
    resetIp: new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(10, "1 h"),
      timeout: 2000,
      prefix: "ad:rl:reset:ip",
    }),
    resetToken: new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(5, "15 m"),
      timeout: 2000,
      prefix: "ad:rl:reset:token",
    }),
  };

  return cached;
}
