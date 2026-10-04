export type FormState = {
  status: "idle" | "success" | "error";
  message?: string;
  fieldErrors?: Record<string, string>;
  /** Echoed back so a failed submit keeps what the visitor typed. */
  values?: Record<string, string>;
};

export const idleState: FormState = { status: "idle" };

export type OperatorEnquiry = {
  fullName: string;
  company: string;
  phoneE164: string;
  email: string;
  country: string;
  fleetSize: string;
  helpType: string;
  currentTicketing: string;
  currentSystemName: string | null;
  message: string | null;
  marketingConsent: boolean;
  marketingConsentAt: Date | null;
  privacyNoticeVersion: string;
  utmSource: string | null;
  utmMedium: string | null;
  utmCampaign: string | null;
};

export type ContactEnquiry = {
  name: string;
  email: string;
  phoneE164: string | null;
  enquiryType: string;
  message: string;
  privacyNoticeVersion: string;
};
