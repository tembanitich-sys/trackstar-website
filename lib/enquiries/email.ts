import { Resend } from "resend";
import { contact, getTrackStar } from "@/content/site";
import type { ContactEnquiry, OperatorEnquiry } from "./types";

export type OutgoingEmail = { subject: string; text: string; replyTo: string };

const label = (list: readonly { value: string; label: string }[], value: string) =>
  list.find((o) => o.value === value)?.label ?? value;

/** Subjects must not carry line breaks. */
const oneLine = (s: string) => s.replace(/[\r\n]+/g, " ").trim();

export function operatorEmail(e: OperatorEnquiry, id: string): OutgoingEmail {
  const lines = [
    `Full name: ${e.fullName}`,
    `Company: ${e.company}`,
    `Mobile: ${e.phoneE164}`,
    `Email: ${e.email}`,
    `Country: ${e.country}`,
    `Fleet size: ${label(getTrackStar.fleetSizes, e.fleetSize)}`,
    `How can TrackStar help: ${label(getTrackStar.helpTypes, e.helpType)}`,
    `Current ticketing: ${label(getTrackStar.currentTicketing, e.currentTicketing)}${e.currentSystemName ? ` (${e.currentSystemName})` : ""}`,
    `Marketing emails: ${e.marketingConsent ? "yes" : "no"}`,
    `Source: ${[e.utmSource, e.utmMedium, e.utmCampaign].filter(Boolean).join(" / ") || "none recorded"}`,
    `Reference: ${id}`,
    "",
    "Message:",
    e.message ?? "(none)",
  ];
  return {
    subject: oneLine(`TrackStar enquiry: ${e.company} (${label(getTrackStar.helpTypes, e.helpType)})`),
    text: lines.join("\n"),
    replyTo: e.email,
  };
}

export function contactEmail(e: ContactEnquiry, id: string): OutgoingEmail {
  const lines = [
    `Name: ${e.name}`,
    `Email: ${e.email}`,
    `Phone: ${e.phoneE164 ?? "not given"}`,
    `Enquiry type: ${label(contact.enquiryTypes, e.enquiryType)}`,
    `Reference: ${id}`,
    "",
    "Message:",
    e.message,
  ];
  return {
    subject: oneLine(`TrackStar contact: ${label(contact.enquiryTypes, e.enquiryType)} from ${e.name}`),
    text: lines.join("\n"),
    replyTo: e.email,
  };
}

/** Sends via Resend. Throws on any failure so the caller can log it. */
export async function sendEmail(message: OutgoingEmail): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.MAIL_FROM;
  const to = process.env.MAIL_TO;
  if (!apiKey || !from || !to) throw new Error("RESEND_API_KEY, MAIL_FROM or MAIL_TO is not set");
  const { error } = await new Resend(apiKey).emails.send({
    from,
    to,
    replyTo: message.replyTo,
    subject: message.subject,
    text: message.text,
  });
  if (error) throw new Error(`Resend: ${error.name}: ${error.message}`);
}
