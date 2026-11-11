import { readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { HomeView } from "@/components/home/HomeView";
import { facts } from "@/content/facts";
import { productName } from "@/content/site";
import contactPage from "@/app/contact/page";
import privacyPage from "@/app/privacy/page";

const root = path.resolve(__dirname, "..");
const layout = readFileSync(path.join(root, "app/layout.tsx"), "utf8");

describe("fonts", () => {
  it("loads Nunito 600, 700, 800 and 900 for headings, buttons and labels", () => {
    expect(layout).toMatch(/Nunito\(\{[^}]*weight: \["600", "700", "800", "900"\]/);
  });

  it("loads Nunito Sans 400, 600 and 700 for running text", () => {
    expect(layout).toMatch(/Nunito_Sans\(\{[^}]*weight: \["400", "600", "700"\]/);
  });

  it("fetches both from Google Fonts at build time through next/font (visitors request nothing from Google)", () => {
    expect(layout).toContain('from "next/font/google"');
    expect(layout).not.toMatch(/fonts\.googleapis\.com/);
  });

  it("only asks each family for weights it has loaded", () => {
    function files(dir: string, out: string[] = []): string[] {
      for (const name of readdirSync(dir)) {
        const full = path.join(dir, name);
        if (statSync(full).isDirectory()) files(full, out);
        else if (/\.tsx$/.test(name)) out.push(full);
      }
      return out;
    }
    const problems: string[] = [];
    for (const file of ["app", "components"].flatMap((d) => files(path.join(root, d)))) {
      for (const [, classes] of readFileSync(file, "utf8").matchAll(/className=(?:"([^"]*)"|\{`([^`]*)`\})/g).map((m) => [m[0], m[1] ?? m[2]] as const)) {
        const heading = /\bfont-heading\b/.test(classes);
        const weight = classes.match(/\bfont-(light|normal|medium|semibold|bold|extrabold|black)\b/)?.[1];
        // Nunito has 600-900 only; Nunito Sans has 400, 600 and 700 only.
        if (heading && (weight === undefined || ["light", "normal", "medium"].includes(weight))) problems.push(`${path.relative(root, file)}: font-heading needs a weight of 600 or more (${classes})`);
        if (!heading && weight && ["extrabold", "black"].includes(weight) && !/\bfont-sans\b/.test(classes)) problems.push(`${path.relative(root, file)}: ${weight} is not loaded for Nunito Sans (${classes})`);
      }
    }
    expect(problems).toEqual([]);
  });
});

describe("uppercase styles never touch the product name", () => {
  const pages = {
    home: renderToStaticMarkup(<HomeView status="prelaunch" />),
    header: renderToStaticMarkup(<Header />),
    footer: renderToStaticMarkup(<Footer facts={facts} />),
    contact: renderToStaticMarkup(contactPage()),
    privacy: renderToStaticMarkup(privacyPage()),
  };

  it("has no global text-transform in the stylesheet", () => {
    expect(readFileSync(path.join(root, "app/globals.css"), "utf8")).not.toMatch(/text-transform|font-variant/);
  });

  it("finds the product name in no element that is styled uppercase, nor in any child of one", () => {
    const offenders: string[] = [];
    for (const [page, html] of Object.entries(pages)) {
      // Every element carrying the uppercase utility, with everything inside it.
      for (const m of html.matchAll(/<(\w+)\b[^>]*class="[^"]*\buppercase\b[^"]*"[^>]*>([\s\S]*?)<\/\1>/g)) {
        const inner = m[2].replace(/<span class="[^"]*\bnormal-case\b[^"]*">[\s\S]*?<\/span>/g, "");
        if (inner.toLowerCase().includes(productName.toLowerCase())) offenders.push(`${page}: ${m[0].slice(0, 90)}`);
      }
    }
    expect(offenders).toEqual([]);
  });

  it("lists the uppercase elements that exist, so a new one cannot slip in unnoticed", () => {
    const found = Object.values(pages).flatMap((html) => [...html.matchAll(/<(\w+)\b[^>]*class="[^"]*\buppercase\b[^"]*"[^>]*>([\s\S]*?)<\/\1>/g)].map((m) => m[2].replace(/<[^>]+>/g, "").trim()));
    expect([...new Set(found)].sort()).toEqual(["A BULLION TECHNOLOGIES PRODUCT", "Optional"]);
  });
});
