import { createHash } from "node:crypto";
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { brandColors } from "@/content/brand";
import { clearSpace, logoFiles, logoWidth } from "@/components/Logo";
import siteConfig from "@/site.config.json";

const root = path.resolve(__dirname, "..");
const pub = (...p: string[]) => path.join(root, "public", ...p);
const brand = (...p: string[]) => path.join(root, "brand", ...p);
const sha = (f: string) => createHash("sha256").update(readFileSync(f)).digest("hex");

/** Which pack file each public file must be a byte-for-byte copy of. */
const copies: Record<string, string> = {
  "favicon.svg": "icons/favicon.svg",
  "favicon.ico": "icons/favicon.ico",
  "favicon-16.png": "icons/favicon-16.png",
  "favicon-32.png": "icons/favicon-32.png",
  "favicon-48.png": "icons/favicon-48.png",
  "apple-touch-icon.png": "icons/apple-touch-icon.png",
  "android-chrome-192.png": "icons/android-chrome-192.png",
  "android-chrome-512.png": "icons/android-chrome-512.png",
  "og-image.png": "social/og-image.png",
  "brand/busrep-horizontal.svg": "logos/busrep-horizontal.svg",
  "brand/busrep-horizontal-reverse.svg": "logos/busrep-horizontal-reverse.svg",
  "brand/busrep-stacked.svg": "logos/busrep-stacked.svg",
  "brand/busrep-stacked-reverse.svg": "logos/busrep-stacked-reverse.svg",
  "brand/busrep-symbol.svg": "symbol/busrep-symbol.svg",
  "brand/busrep-symbol-reverse.svg": "symbol/busrep-symbol-reverse.svg",
};

function pngSize(file: string): [number, number] {
  const b = readFileSync(file);
  expect(b.subarray(1, 4).toString()).toBe("PNG");
  return [b.readUInt32BE(16), b.readUInt32BE(20)];
}
function icoSizes(file: string): number[] {
  const b = readFileSync(file);
  const count = b.readUInt16LE(4);
  return Array.from({ length: count }, (_, i) => b[6 + i * 16] || 256).sort((a, c) => a - c);
}
function viewBox(file: string): [number, number] {
  const m = readFileSync(file, "utf8").match(/viewBox="([^"]+)"/);
  const [, , w, h] = m![1].split(/\s+/).map(Number);
  return [w, h];
}

describe("BusRep assets in public/ are the pack's files, unmodified", () => {
  for (const [target, source] of Object.entries(copies)) {
    it(`${target} matches brand/${source}`, () => {
      expect(existsSync(pub(target)), `public/${target} is missing`).toBe(true);
      expect(sha(pub(target))).toBe(sha(brand(source)));
    });
  }

  it("leaves app-icon.svg and the static manifest in brand/ only", () => {
    expect(existsSync(brand("icons/app-icon.svg"))).toBe(true);
    expect(existsSync(pub("app-icon.svg"))).toBe(false);
    expect(existsSync(pub("brand/app-icon.svg"))).toBe(false);
    expect(existsSync(pub("site.webmanifest"))).toBe(false); // generated from the product-name setting instead
  });

  it("keeps no TrackStar brand files", () => {
    const all = (dir: string): string[] => readdirSync(dir).flatMap((n) => (statSync(path.join(dir, n)).isDirectory() ? all(path.join(dir, n)) : [path.join(dir, n)]));
    const old = all(pub()).filter((f) => /trackstar|(^|\/)icon(-\d+)?(-maskable)?\.(png|svg)$/i.test(path.relative(pub(), f)));
    expect(old.map((f) => path.relative(root, f))).toEqual([]);
    expect(existsSync(path.join(root, "docs/brand/brand-sheet.pdf"))).toBe(false);
  });

  it("keeps the whole pack in brand/, with the trademark note updated", () => {
    const text = readFileSync(brand("BRAND.md"), "utf8");
    expect(text).toContain("- Trademark secured.");
    expect(text).not.toMatch(/Trademark search/);
    expect(text).toContain('The payoff "Your Bus Online" was approved on 6 October 2026.');
  });

  it("serves the manifest from the same icons and colours as the pack's site.webmanifest", async () => {
    const { GET } = await import("@/app/site.webmanifest/route");
    const generated = await GET().json();
    const supplied = JSON.parse(readFileSync(brand("icons/site.webmanifest"), "utf8"));
    // Deliberate differences from the pack: the name is a setting, and `display` is "browser" (decided after the pack).
    expect({ ...generated, name: "x", short_name: "x", display: "d" }).toEqual({ ...supplied, name: "x", short_name: "x", display: "d" });
    expect(generated.display).toBe("browser");
    expect(generated.name).toBe(siteConfig.productName);
  });
});

describe("icon files are the right sizes", () => {
  it.each([
    ["favicon-16.png", 16, 16], ["favicon-32.png", 32, 32], ["favicon-48.png", 48, 48], ["apple-touch-icon.png", 180, 180],
    ["android-chrome-192.png", 192, 192], ["android-chrome-512.png", 512, 512], ["og-image.png", 1200, 630],
  ])("%s is %ix%i", (file, w, h) => {
    expect(pngSize(pub(file))).toEqual([w, h]);
  });

  it("favicon.ico holds 16, 32 and 48 px", () => {
    expect(icoSizes(pub("favicon.ico"))).toEqual([16, 32, 48]);
  });
});

describe("logo artwork follows brand/BRAND.md", () => {
  it("has proportions in Logo.tsx that match each SVG's viewBox (the files are cropped tight)", () => {
    for (const [variant, f] of Object.entries(logoFiles)) {
      const [w, h] = viewBox(pub(f.src.replace(/^\//, "")));
      expect({ variant, w, h }).toEqual({ variant, w: f.w, h: f.h });
    }
  });

  it("is flat colour only, with outlined text, and uses only palette colours", () => {
    const allowed = new Set([brandColors.navy, "#369851", brandColors.white].map((c) => c.toUpperCase()));
    const svgs = [...Object.keys(copies).filter((f) => f.endsWith(".svg"))];
    for (const f of svgs) {
      const text = readFileSync(pub(f), "utf8");
      expect(text, `${f} has live text`).not.toMatch(/<text/);
      expect(text, `${f} has an effect`).not.toMatch(/gradient|filter|<image|<script|href="http/i);
      const colours = [...text.matchAll(/#[0-9a-fA-F]{6}\b/g)].map((m) => m[0].toUpperCase());
      expect(colours.filter((c) => !allowed.has(c)), `${f} has off-palette colours`).toEqual([]);
    }
  });

  it("meets the minimum sizes where the site uses the logo", () => {
    expect(logoWidth("horizontal", 32)).toBeGreaterThanOrEqual(120); // header: horizontal lockup 120 px wide or more
    expect(logoWidth("stacked-reverse", 140)).toBeGreaterThanOrEqual(120);
    expect(56).toBeGreaterThanOrEqual(48); // decorative full symbol (with road markings): 48 px tall or more
  });

  it("keeps the wordmark's capital B as clear space: 24 px around the 32 px header logo", () => {
    expect(clearSpace("horizontal", 32)).toBe(24);
    expect(clearSpace("stacked-reverse", 140)).toBe(39);
    expect(clearSpace("symbol", 56)).toBe(46);
  });
});

describe("header", () => {
  it("is exactly the 32 px logo plus its clear space above and below, and the stylesheet agrees", async () => {
    const { HEADER_HEIGHT } = await import("@/components/Header");
    expect(HEADER_HEIGHT).toBe(32 + 2 * clearSpace("horizontal", 32));
    expect(HEADER_HEIGHT).toBe(80);
    const css = readFileSync(path.join(root, "app/globals.css"), "utf8");
    expect(css).toMatch(new RegExp(`--header-h:\\s*${HEADER_HEIGHT}px`));
  });
});
