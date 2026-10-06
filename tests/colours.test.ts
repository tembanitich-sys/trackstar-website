import { readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { brandColors } from "@/content/brand";

const root = path.resolve(__dirname, "..");
const css = readFileSync(path.join(root, "app/globals.css"), "utf8");

function token(name: string): string {
  const m = css.match(new RegExp(`--color-${name}:\\s*(#[0-9a-fA-F]{6})`));
  if (!m) throw new Error(`token --color-${name} not found`);
  return m[1].toUpperCase();
}
function luminance(hex: string): number {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255).map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}
function contrast(a: string, b: string): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

describe("palette tokens", () => {
  const brandMd = readFileSync(path.join(root, "brand/BRAND.md"), "utf8");
  const fromBrandMd = (label: string) => brandMd.match(new RegExp(`\\|\\s*${label}\\s*\\|\\s*\`(#[0-9A-Fa-f]{6})\``))![1].toUpperCase();

  it.each([
    ["navy", "Navy"], ["green", "Green"], ["green-text", "Green text"], ["neutral-bg", "Neutral background"],
    ["border", "Border"], ["ink", "Body text"], ["white", "White"],
  ])("--color-%s equals the %s colour in brand/BRAND.md", (tokenName, label) => {
    expect(token(tokenName)).toBe(fromBrandMd(label));
  });

  it("matches the literal colours used for the theme and the manifest", () => {
    expect(brandColors.navy.toUpperCase()).toBe(token("navy"));
    expect(brandColors.white.toUpperCase()).toBe(token("white"));
  });
});

describe("text contrast (WCAG AA, 4.5:1 for text)", () => {
  const t = Object.fromEntries(["navy", "green", "green-text", "neutral-bg", "ink", "white", "muted", "error", "error-bg", "notice"].map((n) => [n, token(n)]));
  it.each([
    ["body text on white", "ink", "white"],
    ["body text on the neutral background", "ink", "neutral-bg"],
    ["navy text on white", "navy", "white"],
    ["navy text on the neutral background", "navy", "neutral-bg"],
    ["white text on navy", "white", "navy"],
    ["white text on the green-text button", "white", "green-text"],
    ["green text on white", "green-text", "white"],
    ["green text on the neutral background", "green-text", "neutral-bg"],
    ["muted text on white", "muted", "white"],
    ["muted text on the neutral background", "muted", "neutral-bg"],
    ["error text on white", "error", "white"],
    ["error text on the error background", "error", "error-bg"],
    ["error text on the neutral background", "error", "neutral-bg"],
    ["body text on the notice highlight", "ink", "notice"],
  ])("%s is at least 4.5:1", (_label, fg, bg) => {
    expect(contrast(t[fg], t[bg])).toBeGreaterThanOrEqual(4.5);
  });

  it("keeps the brand green for graphics and large text only (3:1 on white and on navy)", () => {
    expect(contrast(t.green, t.white)).toBeGreaterThanOrEqual(3);
    expect(contrast(t.green, t.navy)).toBeGreaterThanOrEqual(3);
    expect(contrast(t.green, t.white)).toBeLessThan(4.5); // so it must not be used for small text
  });
});

describe("no stray colours", () => {
  function files(dir: string, out: string[] = []): string[] {
    for (const name of readdirSync(dir)) {
      const full = path.join(dir, name);
      if (statSync(full).isDirectory()) files(full, out);
      else if (/\.(tsx?|css)$/.test(name)) out.push(full);
    }
    return out;
  }
  const sources = ["app", "components", "content", "lib"].flatMap((d) => files(path.join(root, d)));

  it("has hex colours only in the token file and the shared constants", () => {
    const offenders = sources
      .filter((f) => !/(globals\.css|content\/brand\.ts)$/.test(f))
      .filter((f) => /#[0-9a-fA-F]{6}\b|#[0-9a-fA-F]{3}\b(?![\w-])/.test(readFileSync(f, "utf8").replace(/#get-busrep|#get-trackstar|#main|#[a-z][\w-]*/g, "")))
      .map((f) => path.relative(root, f));
    expect(offenders).toEqual([]);
  });

  it("uses only brand and functional tokens, never Tailwind's default palette", () => {
    const palette = /\b(?:bg|text|border|ring|outline|fill|stroke|from|to|via|shadow|decoration|accent)-(?:red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose|slate|gray|zinc|neutral|stone|black)-\d{2,3}\b/;
    const offenders = sources.filter((f) => palette.test(readFileSync(f, "utf8"))).map((f) => path.relative(root, f));
    expect(offenders).toEqual([]);
  });

  it("uses the functional colours only in forms and the privacy-notice placeholders, never in brand areas", () => {
    const users = sources.filter((f) => /\b(?:bg|text|border)-(?:error|error-bg|notice)\b/.test(readFileSync(f, "utf8"))).map((f) => path.relative(root, f)).sort();
    expect(users).toEqual(["app/privacy/page.tsx", "components/forms/fields.tsx"]);
  });
});
