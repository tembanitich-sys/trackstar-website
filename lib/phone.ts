import { isSupportedCountry, parsePhoneNumberFromString } from "libphonenumber-js";
import type { CountryCode } from "libphonenumber-js";

/** Returns the E.164 form (e.g. +263771234567) or null when the number is not valid for the country. */
export function toE164(national: string, country: string): string | null {
  const value = national.trim();
  if (!value || !isSupportedCountry(country)) return null;
  const parsed = parsePhoneNumberFromString(value, country as CountryCode);
  return parsed && parsed.isValid() ? parsed.number : null;
}
