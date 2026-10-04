import { query } from "@/lib/db";
import type { ContactEnquiry, OperatorEnquiry } from "./types";

export async function insertOperatorEnquiry(e: OperatorEnquiry): Promise<string> {
  const rows = await query(
    `INSERT INTO operator_enquiries (
       full_name, company, phone_e164, email, country, fleet_size, help_type,
       current_ticketing, current_system_name, message, marketing_consent,
       marketing_consent_at, privacy_notice_version, utm_source, utm_medium, utm_campaign
     ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16)
     RETURNING id`,
    [
      e.fullName, e.company, e.phoneE164, e.email, e.country, e.fleetSize, e.helpType,
      e.currentTicketing, e.currentSystemName, e.message, e.marketingConsent,
      e.marketingConsentAt?.toISOString() ?? null, e.privacyNoticeVersion,
      e.utmSource, e.utmMedium, e.utmCampaign,
    ],
  );
  return String(rows[0].id);
}

export async function insertContactEnquiry(e: ContactEnquiry): Promise<string> {
  const rows = await query(
    `INSERT INTO contact_enquiries (name, email, phone_e164, enquiry_type, message, privacy_notice_version)
     VALUES ($1,$2,$3,$4,$5,$6) RETURNING id`,
    [e.name, e.email, e.phoneE164, e.enquiryType, e.message, e.privacyNoticeVersion],
  );
  return String(rows[0].id);
}
