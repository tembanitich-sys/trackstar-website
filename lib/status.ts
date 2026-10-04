import { cookies } from "next/headers";
import type { InstaTicketsStatus } from "@/content/compose";

export const PREVIEW_COOKIE = "ts_it_preview";

/**
 * Current InstaTickets status. Phase 3 reads `site_settings.instatickets_status`;
 * until then it is always `prelaunch`. In development only, the proxy sets a
 * preview cookie from `?it=live|prelaunch` so both states can be viewed.
 */
export async function getInstaTicketsStatus(): Promise<InstaTicketsStatus> {
  if (process.env.NODE_ENV !== "production") {
    const preview = (await cookies()).get(PREVIEW_COOKIE)?.value;
    if (preview === "live" || preview === "prelaunch") return preview;
  }
  return "prelaunch";
}
