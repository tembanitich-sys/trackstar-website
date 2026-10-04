import { createHmac } from "node:crypto";

/** Client IP from the proxy headers. Used only to derive a hash; never stored or logged. */
export function clientIp(headers: Headers): string {
  const forwarded = headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  return forwarded || headers.get("x-real-ip") || "unknown";
}

function salt(): string {
  const value = process.env.IP_HASH_SALT;
  if (value) return value;
  if (process.env.NODE_ENV === "production") throw new Error("IP_HASH_SALT is not set");
  return "development-only-salt";
}

/** Salted HMAC so raw IP addresses are never stored. */
export function hashIp(ip: string): string {
  return createHmac("sha256", salt()).update(ip).digest("hex");
}
