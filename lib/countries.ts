import type { CountryCode } from "libphonenumber-js";
import { COUNTRY_DATA } from "./country-data";

export type CountryOption = { code: CountryCode; name: string; dial: string };

/** All countries libphonenumber-js supports, Zimbabwe first. Static, so server and browser render identically. */
export const countryOptions: CountryOption[] = COUNTRY_DATA.map(([code, name, dial]) => ({
  code: code as CountryCode,
  name,
  dial,
}));

export const DEFAULT_COUNTRY: CountryCode = "ZW";
