import { query } from "./db";

export const RATE_LIMIT = { windowSeconds: 600, max: 5 };

/**
 * Fixed-window counter per hashed IP and form. Returns true when the request is allowed.
 * A database error lets the request through: the insert that follows will fail on its own.
 */
export async function allowRequest(scope: string, ipHash: string): Promise<boolean> {
  try {
    const windowMs = RATE_LIMIT.windowSeconds * 1000;
    const windowStart = new Date(Math.floor(Date.now() / windowMs) * windowMs).toISOString();
    const rows = await query(
      `INSERT INTO rate_limits (key, window_start, count) VALUES ($1, $2, 1)
       ON CONFLICT (key, window_start) DO UPDATE SET count = rate_limits.count + 1
       RETURNING count`,
      [`${scope}:${ipHash}`, windowStart],
    );
    if (Math.random() < 0.02) {
      await query("DELETE FROM rate_limits WHERE window_start < now() - interval '1 day'");
    }
    return Number(rows[0]?.count ?? 1) <= RATE_LIMIT.max;
  } catch (error) {
    console.error("rate-limit: check failed", error instanceof Error ? error.message : error);
    return true;
  }
}
