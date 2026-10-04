import { z } from "zod";
import { countryOptions } from "@/lib/countries";
import { toE164 } from "@/lib/phone";
import { contact, getTrackStar, privacyNoticeVersion } from "@/content/site";
import type { ContactEnquiry, OperatorEnquiry } from "./types";

export type ParseResult<T> =
  | { ok: true; data: T; values: Record<string, string> }
  | { ok: false; fieldErrors: Record<string, string>; values: Record<string, string> };

const oneOf = (options: readonly { value: string }[]) => options.map((o) => o.value);

function text(formData: FormData, name: string): string {
  const value = formData.get(name);
  return typeof value === "string" ? value.trim() : "";
}

function isTicked(formData: FormData, name: string): boolean {
  return formData.get(name) === "on";
}

function firstErrors(error: z.ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? "form");
    if (!(key in out)) out[key] = issue.message;
  }
  return out;
}

const required = (label: string) => z.string().min(1, `Please enter your ${label}.`);

const operatorSchema = z.object({
  fullName: required("full name").max(120, "Please use 120 characters or fewer."),
  company: required("company name").max(160, "Please use 160 characters or fewer."),
  email: z.email("Please enter a valid email address.").max(254, "That email address is too long."),
  country: z.enum(countryOptions.map((c) => c.code) as [string, ...string[]], "Please choose your country."),
  fleetSize: z.enum(oneOf(getTrackStar.fleetSizes) as [string, ...string[]], "Please choose your fleet size."),
  helpType: z.enum(oneOf(getTrackStar.helpTypes) as [string, ...string[]], "Please tell us how we can help."),
  currentTicketing: z.enum(oneOf(getTrackStar.currentTicketing) as [string, ...string[]], "Please choose an option."),
  currentSystemName: z.string().max(120, "Please use 120 characters or fewer."),
  message: z.string().max(2000, "Please keep your message under 2000 characters."),
  privacyAck: z.literal(true, "Please confirm you have read the Privacy Notice."),
});

const OPERATOR_FIELDS = [
  "fullName", "company", "mobileNational", "mobileCountry", "email", "country", "fleetSize",
  "helpType", "currentTicketing", "currentSystemName", "message",
] as const;

export function parseOperatorEnquiry(
  formData: FormData,
  now: Date = new Date(),
): ParseResult<OperatorEnquiry> {
  const values: Record<string, string> = Object.fromEntries(OPERATOR_FIELDS.map((f) => [f, text(formData, f)]));
  const marketing = isTicked(formData, "marketingConsent");
  const privacyAck = isTicked(formData, "privacyAck");
  if (marketing) values.marketingConsent = "on";
  if (privacyAck) values.privacyAck = "on";

  const parsed = operatorSchema.safeParse({ ...values, privacyAck: privacyAck || undefined });
  const fieldErrors = parsed.success ? {} : firstErrors(parsed.error);

  const phone = toE164(values.mobileNational, values.mobileCountry);
  if (!phone) fieldErrors.mobile = "Please enter a valid mobile number for the selected country.";

  if (!parsed.success || !phone || Object.keys(fieldErrors).length) {
    return { ok: false, fieldErrors, values };
  }
  const d = parsed.data;
  const countryName = countryOptions.find((c) => c.code === d.country)?.name ?? d.country;
  return {
    ok: true,
    values,
    data: {
      fullName: d.fullName,
      company: d.company,
      phoneE164: phone,
      email: d.email,
      country: countryName,
      fleetSize: d.fleetSize,
      helpType: d.helpType,
      currentTicketing: d.currentTicketing,
      currentSystemName: d.currentTicketing === "own_system" && d.currentSystemName ? d.currentSystemName : null,
      message: d.message || null,
      marketingConsent: marketing,
      marketingConsentAt: marketing ? now : null,
      privacyNoticeVersion,
      utmSource: utm(formData, "utmSource"),
      utmMedium: utm(formData, "utmMedium"),
      utmCampaign: utm(formData, "utmCampaign"),
    },
  };
}

function utm(formData: FormData, name: string): string | null {
  const value = text(formData, name).slice(0, 100);
  return value || null;
}

const contactSchema = z.object({
  name: required("name").max(120, "Please use 120 characters or fewer."),
  email: z.email("Please enter a valid email address.").max(254, "That email address is too long."),
  enquiryType: z.enum(oneOf(contact.enquiryTypes) as [string, ...string[]], "Please choose an enquiry type."),
  message: required("message").max(3000, "Please keep your message under 3000 characters."),
  privacyAck: z.literal(true, "Please confirm you have read the Privacy Notice."),
});

const CONTACT_FIELDS = ["name", "email", "phoneNational", "phoneCountry", "enquiryType", "message"] as const;

export function parseContactEnquiry(formData: FormData): ParseResult<ContactEnquiry> {
  const values: Record<string, string> = Object.fromEntries(CONTACT_FIELDS.map((f) => [f, text(formData, f)]));
  const privacyAck = isTicked(formData, "privacyAck");
  if (privacyAck) values.privacyAck = "on";

  const parsed = contactSchema.safeParse({ ...values, privacyAck: privacyAck || undefined });
  const fieldErrors = parsed.success ? {} : firstErrors(parsed.error);

  // Phone is optional here, but when given it must be valid.
  let phone: string | null = null;
  if (values.phoneNational) {
    phone = toE164(values.phoneNational, values.phoneCountry);
    if (!phone) fieldErrors.phone = "Please enter a valid phone number for the selected country.";
  }

  if (!parsed.success || Object.keys(fieldErrors).length) return { ok: false, fieldErrors, values };
  const d = parsed.data;
  return {
    ok: true,
    values,
    data: {
      name: d.name,
      email: d.email,
      phoneE164: phone,
      enquiryType: d.enquiryType,
      message: d.message,
      privacyNoticeVersion,
    },
  };
}
