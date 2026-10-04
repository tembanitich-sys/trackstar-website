import { contactEmail, operatorEmail } from "./email";
import type { OutgoingEmail } from "./email";
import type { ContactEnquiry, FormState, OperatorEnquiry } from "./types";
import { parseContactEnquiry, parseOperatorEnquiry } from "./validation";
import type { ParseResult } from "./validation";

export type Deps = {
  verifyTurnstile: (token: string | null) => Promise<boolean>;
  /** True when the request is within the rate limit. */
  allowRequest: (scope: string) => Promise<boolean>;
  insertOperator: (e: OperatorEnquiry) => Promise<string>;
  insertContact: (e: ContactEnquiry) => Promise<string>;
  sendEmail: (m: OutgoingEmail) => Promise<void>;
  log: (message: string, detail?: unknown) => void;
  now: () => Date;
};

const GENERIC_ERROR =
  "Sorry, something went wrong and your request was not sent. Please try again, or email info@trackstar.co.zw.";

function turnstileToken(formData: FormData): string | null {
  const value = formData.get("cf-turnstile-response");
  return typeof value === "string" && value ? value : null;
}

async function run<T>(
  scope: "operator" | "contact",
  formData: FormData,
  parse: () => ParseResult<T>,
  insert: (data: T) => Promise<string>,
  buildEmail: (data: T, id: string) => OutgoingEmail,
  deps: Deps,
): Promise<FormState> {
  const parsed = parse();
  if (!parsed.ok) {
    return {
      status: "error",
      message: "Please check the highlighted fields.",
      fieldErrors: parsed.fieldErrors,
      values: parsed.values,
    };
  }

  if (!(await deps.allowRequest(scope))) {
    return { status: "error", message: "Too many requests. Please wait a few minutes and try again.", values: parsed.values };
  }
  if (!(await deps.verifyTurnstile(turnstileToken(formData)))) {
    return { status: "error", message: "We could not confirm you are human. Please try again.", values: parsed.values };
  }

  // Store first. The enquiry must never depend on email delivery.
  let id: string;
  try {
    id = await insert(parsed.data);
  } catch (error) {
    deps.log(`${scope} enquiry: database insert failed`, error instanceof Error ? error.message : error);
    return { status: "error", message: GENERIC_ERROR, values: parsed.values };
  }

  try {
    await deps.sendEmail(buildEmail(parsed.data, id));
  } catch (error) {
    deps.log(`${scope} enquiry ${id}: email failed`, error instanceof Error ? error.message : error);
  }
  return { status: "success" };
}

export function processOperatorEnquiry(formData: FormData, deps: Deps): Promise<FormState> {
  return run(
    "operator",
    formData,
    () => parseOperatorEnquiry(formData, deps.now()),
    deps.insertOperator,
    operatorEmail,
    deps,
  );
}

export function processContactEnquiry(formData: FormData, deps: Deps): Promise<FormState> {
  return run("contact", formData, () => parseContactEnquiry(formData), deps.insertContact, contactEmail, deps);
}
