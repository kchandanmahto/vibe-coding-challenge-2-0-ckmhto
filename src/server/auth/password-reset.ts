import "server-only";

import { createHash, randomBytes } from "crypto";

export const PASSWORD_RESET_TTL_MS = 30 * 60 * 1000;

export function createPasswordResetToken(): string {
  return randomBytes(32).toString("base64url");
}

export function hashPasswordResetToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}
