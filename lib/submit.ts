import { contactEmail } from "@/content/site";

export type FormState = {
  status: "idle" | "success" | "error";
  message?: string;
  fieldErrors?: Record<string, string>;
};

export const idleState: FormState = { status: "idle" };

export const ENQUIRY_ENDPOINT = "/api/enquiry.php";
export const CONTACT_ENDPOINT = "/api/contact.php";

const NETWORK_ERROR = `We could not reach the server. Please check your connection and try again, or email ${contactEmail}.`;
const SERVER_ERROR = `Sorry, something went wrong and your request was not sent. Please try again, or email ${contactEmail}.`;

/** Fields the PHP scripts do not know under the form's own name. */
const RENAMED: Record<string, string> = { "cf-turnstile-response": "turnstileToken" };
const CHECKBOXES = new Set(["marketingConsent", "privacyAck"]);

/** Turns the form into the JSON body the PHP scripts expect. Checkboxes become booleans. */
export function buildPayload(data: FormData): Record<string, string | boolean> {
  const payload: Record<string, string | boolean> = {};
  for (const [name, value] of data.entries()) {
    if (typeof value !== "string") continue;
    payload[RENAMED[name] ?? name] = CHECKBOXES.has(name) ? value === "on" : value;
  }
  // An unticked checkbox is absent from FormData; send it explicitly as false.
  for (const name of CHECKBOXES) payload[name] ??= false;
  return payload;
}

type Fetch = typeof fetch;

/**
 * POSTs the form as JSON and maps the reply onto the form state.
 * The PHP scripts answer `{ ok: true }` or `{ ok: false, message?, fieldErrors? }`.
 */
export async function postForm(url: string, data: FormData, doFetch: Fetch = fetch): Promise<FormState> {
  let response: Response;
  try {
    response = await doFetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(buildPayload(data)),
    });
  } catch {
    return { status: "error", message: NETWORK_ERROR };
  }

  let body: { ok?: boolean; message?: string; fieldErrors?: Record<string, string> } | null = null;
  try {
    body = await response.json();
  } catch {
    // Not JSON: the script crashed or the URL is not served by PHP (for example a Vercel preview).
  }
  if (body?.ok === true) return { status: "success" };
  if (body && (body.fieldErrors || body.message)) {
    // The scripts never hold the public address; add it to messages about a server problem.
    const message = response.status >= 500 && body.message ? `${body.message} Or email ${contactEmail}.` : body.message;
    return { status: "error", message, fieldErrors: body.fieldErrors };
  }
  return { status: "error", message: SERVER_ERROR };
}
