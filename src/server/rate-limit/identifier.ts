import "server-only";

import { createHash, createHmac } from "node:crypto";
import net from "node:net";

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function isValidIp(ip: string): boolean {
  return net.isIP(ip) !== 0;
}

export function extractClientIp(headers: Headers): string | null {
  const candidates = [
    headers.get("x-vercel-forwarded-for"),
    headers.get("x-forwarded-for"),
    headers.get("x-real-ip"),
  ];

  for (const candidate of candidates) {
    if (!candidate) continue;
    const first = candidate.split(",")[0]?.trim();
    if (first && isValidIp(first)) {
      return first;
    }
  }

  return null;
}

export function hmacIdentifier(secret: string, value: string): string {
  return createHmac("sha256", secret).update(value).digest("hex");
}

export function sha256Hex(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}
