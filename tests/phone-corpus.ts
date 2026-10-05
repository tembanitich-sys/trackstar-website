import { createRequire } from "node:module";
import { getCountries, parsePhoneNumberFromString } from "libphonenumber-js";
import type { CountryCode } from "libphonenumber-js";

const require = createRequire(import.meta.url);
const examples = require("libphonenumber-js/examples.mobile.json") as Record<string, string>;

/** The reference result: what the site's old server code accepted and stored. */
export function referenceE164(input: string, country: string): string | null {
  try {
    const parsed = parsePhoneNumberFromString(input.trim(), country as CountryCode);
    return parsed && parsed.isValid() ? parsed.number : null;
  } catch {
    return null;
  }
}

/** Deterministic pseudo-random generator so failures are reproducible. */
function rng(seed: number) {
  let s = seed >>> 0;
  return () => ((s = (Math.imul(s, 1664525) + 1013904223) >>> 0) / 2 ** 32);
}

/** Valid example numbers in several typed forms, plus broken variants, across every country. */
export function buildCorpus(): [string, string][] {
  const rand = rng(42);
  const countries = getCountries();
  const pick = <T,>(a: T[]) => a[Math.floor(rand() * a.length)];
  const cases: [string, string][] = [];

  for (const country of countries) {
    const example = examples[country];
    if (!example) continue;
    const national = example.replace(/\s/g, "");
    const parsed = parsePhoneNumberFromString(example, country);
    const cc = parsed?.countryCallingCode ?? "";
    const nn = parsed?.nationalNumber ?? national;
    const forms = [
      example,
      nn,
      `0${nn}`,
      `+${cc}${nn}`,
      `+${cc} ${nn.slice(0, 2)} ${nn.slice(2)}`,
      `00${cc}${nn}`,
      `${cc}${nn}`,
      `(${nn.slice(0, 3)}) ${nn.slice(3)}`,
      `${nn.slice(0, 3)}-${nn.slice(3)}`,
      ` ${nn} `,
      `${nn} ext 12`,
      `${nn} x123`,
      `${nn}abc`,
      nn.slice(0, -1),
      nn.slice(0, 3),
      `${nn}${nn}`,
      `+${cc}0${nn}`,
    ];
    for (const f of forms) {
      cases.push([f, country]);
      cases.push([f, pick(countries)]); // right number, wrong country
    }
  }

  // Free-form noise.
  const noise = ["", " ", "+", "++263771234567", "0", "00", "000", "abc", "12", "123", "1234", "+1", "+999 123456", "077-123-4567", "0771234567;ext=5", "tel:+263771234567", "077 123 4567 #", "7712345678", "0 7 7 1 2 3 4 5 6 7", "+263(0)771234567", "０７７１２３４５６７"];
  for (const n of noise) for (const c of ["ZW", "ZA", "US", "GB", "AU", "NG", "IN", "CN"] as const) cases.push([n, c]);

  // Random digit strings.
  for (let i = 0; i < 1500; i++) {
    const len = 3 + Math.floor(rand() * 13);
    let s = "";
    for (let j = 0; j < len; j++) s += Math.floor(rand() * 10);
    if (rand() < 0.3) s = "+" + s;
    cases.push([s, pick(countries)]);
  }
  cases.push(["0771234567", "XX"]);
  return cases;
}
