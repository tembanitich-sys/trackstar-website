import { getCountries, getCountryCallingCode } from "libphonenumber-js";
import type { CountryCode } from "libphonenumber-js";

export type CountryOption = { code: CountryCode; name: string; dial: string };

const names = new Intl.DisplayNames(["en"], { type: "region" });

/** All countries libphonenumber-js knows, Zimbabwe first, then alphabetical. */
export const countryOptions: CountryOption[] = getCountries()
  .map((code) => ({ code, name: names.of(code) ?? code, dial: `+${getCountryCallingCode(code)}` }))
  .sort((a, b) => {
    if (a.code === "ZW") return -1;
    if (b.code === "ZW") return 1;
    return a.name.localeCompare(b.name, "en");
  });

export const DEFAULT_COUNTRY: CountryCode = "ZW";
