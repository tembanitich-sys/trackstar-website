import "server-only";
import { headers } from "next/headers";
import { allowRequest } from "@/lib/rate-limit";
import { clientIp, hashIp } from "@/lib/security";
import { verifyTurnstile } from "@/lib/turnstile";
import { sendEmail } from "./email";
import type { Deps } from "./process";
import { insertContactEnquiry, insertOperatorEnquiry } from "./store";

/**
 * Production wiring for the enquiry pipeline. Must be called inside a request.
 * The IP hash is derived lazily so validation errors never depend on server configuration.
 */
export async function requestDeps(): Promise<Deps> {
  const ip = clientIp(await headers());
  return {
    verifyTurnstile,
    allowRequest: (scope) => allowRequest(scope, hashIp(ip)),
    insertOperator: insertOperatorEnquiry,
    insertContact: insertContactEnquiry,
    sendEmail,
    log: (message, detail) => console.error(message, detail ?? ""),
    now: () => new Date(),
  };
}
