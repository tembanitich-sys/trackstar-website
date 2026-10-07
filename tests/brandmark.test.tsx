import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import path from "node:path";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { BrandMark, markHeight, marks, NAMED_CAP_HEIGHT } from "@/components/BrandMark";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { MobileNav } from "@/components/MobileNav";
import { Rich } from "@/components/Rich";
import { TopStrip } from "@/components/TopStrip";
import { EnquiryFormBody } from "@/components/forms/EnquiryForm";
import { ContactForm } from "@/components/forms/ContactForm";
import ContactPage from "@/app/contact/page";
import PrivacyPage from "@/app/privacy/page";
import { allOn, renderHome } from "./helpers";
import { facts } from "@/content/facts";
import { productName } from "@/content/site";

const root = path.resolve(__dirname, "..");
const read = (...p: string[]) => readFileSync(path.join(root, ...p), "utf8");
const sha = (...p: string[]) => createHash("sha256").update(readFileSync(path.join(root, ...p))).digest("hex");
const viewBox = (file: string) => read(file).match(/viewBox="([^"]+)"/)![1].split(/\s+/).map(Number).slice(2);
const fills = (file: string) => [...new Set([...read(file).matchAll(/fill="([^"]+)"/g)].map((m) => m[1].toUpperCase()))].sort();

const wordmarkImgs = (html: string) => [...html.matchAll(/<img[^>]*src="([^"]*wordmark[^"]*)"[^>]*>/g)].map((m) => ({ tag: m[0], src: decodeURIComponent(m[1]) }));
const altOf = (tag: string) => tag.match(/alt="([^"]*)"/)![1];

describe("logo files", () => {
  it("are the supplied files, unmodified", () => {
    for (const f of ["busrep-wordmark.svg", "busrep-wordmark-reverse.svg"]) expect(sha("public/brand", f)).toBe(sha("brand/logos", f));
    for (const f of ["instatickets-wordmark.svg", "instatickets-wordmark-reverse.svg"]) expect(sha("public/brand", f)).toBe(sha("brand/instatickets", f));
  });

  it("have the proportions BrandMark uses", () => {
    for (const [name, files] of [["busrep", ["busrep-wordmark.svg", "busrep-wordmark-reverse.svg"]], ["instatickets", ["instatickets-wordmark.svg", "instatickets-wordmark-reverse.svg"]]] as const) {
      for (const f of files) {
        const [w, h] = viewBox(`public/brand/${f}`);
        expect(w).toBeCloseTo(marks[name].w, 1);
        expect(h).toBeCloseTo(marks[name].h, 1);
      }
    }
  });

  it("InstaTickets reverse is all white (never the red on navy), BusRep reverse is white and green", () => {
    expect(fills("public/brand/instatickets-wordmark-reverse.svg")).toEqual(["#FFFFFF"]);
    expect(fills("public/brand/busrep-wordmark-reverse.svg")).toEqual(["#369851", "#FFFFFF"]);
    expect(fills("public/brand/instatickets-wordmark.svg")).toEqual(["#233367", "#E11D25"]);
  });

  it("alignment numbers are the ones in brand/instatickets/README.md", () => {
    const readme = read("brand/instatickets/README.md");
    expect(NAMED_CAP_HEIGHT).toBe(0.705);
    expect(readme).toMatch(/\| BusRep wordmark \(`busrep-wordmark\*\.svg`\) \| 1\.284 \| 0\.214 /);
    expect(readme).toMatch(/\| InstaTickets wordmark \(`instatickets-wordmark\*\.svg`\) \| 1\.610 \| 0\.377 /);
    expect(marks.busrep.heightRatio).toBe(1.284);
    expect(marks.busrep.baseline).toBe(0.214);
    expect(marks.instatickets.heightRatio).toBe(1.61);
    expect(marks.instatickets.baseline).toBe(0.377);
    // README widths: height x 3.820 and x 4.573
    expect(marks.busrep.w / marks.busrep.h).toBeCloseTo(3.82, 2);
    expect(marks.instatickets.w / marks.instatickets.h).toBeCloseTo(4.573, 2);
  });
});

describe("<BrandMark>", () => {
  it("renders exactly one image, the variant for the background", () => {
    const light = renderToStaticMarkup(<BrandMark name="busrep" on="light" textPx={18} />);
    const navy = renderToStaticMarkup(<BrandMark name="busrep" on="navy" textPx={18} />);
    expect(wordmarkImgs(light).map((i) => i.src)).toEqual(["/brand/busrep-wordmark.svg"]);
    expect(wordmarkImgs(navy).map((i) => i.src)).toEqual(["/brand/busrep-wordmark-reverse.svg"]);
    const it = renderToStaticMarkup(<BrandMark name="instatickets" on="navy" textPx={18} />);
    expect(wordmarkImgs(it).map((i) => i.src)).toEqual(["/brand/instatickets-wordmark-reverse.svg"]);
    for (const html of [light, navy, it]) expect(html.match(/<img/g)).toHaveLength(1);
    expect(light).not.toMatch(/display:\s*none|hidden/);
  });

  it("sizes to the cap height and sits on the baseline, in em", () => {
    const bus = renderToStaticMarkup(<BrandMark name="busrep" textPx={18} />);
    const ins = renderToStaticMarkup(<BrandMark name="instatickets" textPx={18} />);
    expect(bus).toContain("display:inline"); // the page-wide image reset is display:block
    expect(ins).toContain("display:inline");
    expect(bus).toContain(`height:${(0.705 * 1.284).toFixed(4)}em`);
    expect(bus).toContain(`vertical-align:${(-0.705 * 1.284 * 0.214).toFixed(4)}em`);
    expect(ins).toContain(`height:${(0.705 * 1.61).toFixed(4)}em`);
    expect(ins).toContain(`vertical-align:${(-0.705 * 1.61 * 0.377).toFixed(4)}em`);
  });

  it("falls back to the plain name below the minimum height (BusRep 14 px, InstaTickets 16 px)", () => {
    expect(markHeight("busrep", 16)).toBeCloseTo(14.48, 1);
    expect(markHeight("busrep", 14)).toBeLessThan(14);
    expect(markHeight("instatickets", 16)).toBeCloseTo(18.2, 1);
    expect(markHeight("instatickets", 14)).toBeLessThan(16); // 15.9
    expect(markHeight("instatickets", 15)).toBeGreaterThanOrEqual(16); // the strip's size
    expect(renderToStaticMarkup(<BrandMark name="busrep" textPx={14} />)).toBe(`<span style="text-transform:none">${productName}</span>`);
    expect(renderToStaticMarkup(<BrandMark name="instatickets" textPx={14} />)).toContain("InstaTickets</span>");
    expect(renderToStaticMarkup(<BrandMark name="busrep" textPx={16} />)).toContain("<img");
  });
});

describe("<Rich>", () => {
  it("swaps each name for a logo, in any case, and leaves the rest as text", () => {
    const html = renderToStaticMarkup(<Rich textPx={18}>{`REACH MORE WITH INSTATICKETS. ${productName} is a product of Bullion.`}</Rich>);
    const imgs = wordmarkImgs(html);
    expect(imgs.map((i) => altOf(i.tag))).toEqual(["InstaTickets", productName]);
    expect(html.replace(/<[^>]+>/g, "")).toBe("REACH MORE WITH .  is a product of Bullion.");
  });
});

describe("each logo is announced exactly once", () => {
  const pages = {
    "home (prelaunch)": () => renderHome({ status: "prelaunch" }),
    "home (live)": () => renderHome({ status: "live" }),
    "home (every fact on)": () => renderHome({ facts: allOn }),
    strip: () => renderToStaticMarkup(<TopStrip status="prelaunch" />),
    footer: () => renderToStaticMarkup(<Footer facts={facts} />),
    contact: () => renderToStaticMarkup(<ContactPage />),
  };

  for (const [name, render] of Object.entries(pages)) {
    it(`${name}: alt text only, never hidden text as well, never a doubled name`, () => {
      const html = render();
      // no visually hidden text that names a brand
      for (const m of html.matchAll(/<[^>]*class="[^"]*\bsr-only\b[^"]*"[^>]*>([^<]*)</g)) expect(m[1]).not.toMatch(/busrep|instatickets/i);
      // every wordmark has a real alt text
      for (const { tag } of wordmarkImgs(html)) expect(altOf(tag)).toMatch(/^(InstaTickets|BusRep)$/);
      // reading order: images become their alt text; no name directly followed by the same name
      const readout = html.replace(/<img[^>]*?alt="([^"]*)"[^>]*>/g, " $1 ").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ");
      expect(readout).not.toMatch(/\b(BusRep|InstaTickets)\b[ ,.:;&middot·]*\1\b/i);
      // headings and questions: the logo's alt is not repeated inside the same element
      for (const m of html.matchAll(/<(h1|h2|h3|summary)\b[^>]*>([\s\S]*?)<\/\1>/g)) {
        const text = m[2].replace(/<img[^>]*?alt="([^"]*)"[^>]*>/g, " $1 ").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ");
        expect(text).not.toMatch(/\b(BusRep|InstaTickets)\b\s+\1\b/i);
      }
      // an element labelled with aria-label must not also contain a logo of the same name
      for (const m of html.matchAll(/<(a|button|div|section)\b[^>]*aria-label="([^"]*)"[^>]*>([\s\S]*?)<\/\1>/g)) {
        for (const { tag } of wordmarkImgs(m[3])) expect(m[2].toLowerCase()).not.toContain(altOf(tag).toLowerCase());
      }
    });
  }

  it("the diagram's group is labelled in words and its two logos are each announced once", () => {
    const html = renderHome();
    const group = html.match(/<div role="group" aria-label="([^"]*)"([\s\S]*?)<ul class="mt-10 grid gap-4/)!;
    expect(group[1]).toBe(`How ${productName} and InstaTickets fit together`);
    expect(wordmarkImgs(group[2]).map((i) => altOf(i.tag))).toEqual([productName, "InstaTickets"]);
  });
});

describe("where the names stay plain text", () => {
  const none = (html: string) => expect(wordmarkImgs(html)).toEqual([]);

  it("nav menus, header button, mobile menu", () => {
    none(renderToStaticMarkup(<Header />));
    none(renderToStaticMarkup(<MobileNav />));
  });

  it("buttons and button-style links", () => {
    const html = renderHome({ status: "prelaunch" }) + renderHome({ status: "live" });
    for (const m of html.matchAll(/<(a|button)\b([^>]*)>([\s\S]*?)<\/\1>/g)) {
      const inner = m[3];
      if (wordmarkImgs(inner).length === 0) continue;
      // the only link around a logo is the footer's InstaTickets product link
      throw new Error(`a link or button contains a logo: ${m[0].slice(0, 160)}`);
    }
    for (const label of ["GET BusRep", "EXPLORE INSTATICKETS", "PRE-REGISTER ON INSTATICKETS", "CONNECT YOUR SYSTEM TO INSTATICKETS"]) {
      expect(html.replace(/<[^>]+>/g, "")).toContain(label);
    }
    for (const label of ["VISIT INSTATICKETS", "Book on InstaTickets"]) expect(renderHome({ status: "live" }).concat(renderToStaticMarkup(<TopStrip status="live" />)).replace(/<[^>]+>/g, "")).toContain(label);
  });

  it("the top strip's link", () => {
    const strip = renderToStaticMarkup(<TopStrip status="prelaunch" />);
    const link = strip.match(/<a [^>]*>([\s\S]*?)<\/a>/)![1];
    expect(link).toBe("Pre-register on InstaTickets");
    expect(wordmarkImgs(strip)).toHaveLength(1); // the sentence only, in the all-white reverse version
    expect(wordmarkImgs(strip)[0].src).toBe("/brand/instatickets-wordmark-reverse.svg");
  });

  it("form labels, consent labels, the enquiry options and the contact form", () => {
    none(renderToStaticMarkup(<EnquiryFormBody helpDefault="need_system" />));
    none(renderToStaticMarkup(<ContactForm />));
  });

  it("the Privacy Notice", () => {
    none(renderToStaticMarkup(<PrivacyPage />));
  });

  it("meta tags, titles, structured data and e-mails (all plain strings in the source)", () => {
    const layout = read("app/layout.tsx");
    expect(layout).not.toMatch(/BrandMark|Rich/);
    for (const f of ["lib/jsonld.tsx", "lib/seo.ts", "public/api/lib/handler.php", "app/site.webmanifest/route.ts", "app/privacy/page.tsx"]) {
      expect(read(f)).not.toMatch(/BrandMark|<Rich/);
    }
  });

  it("the footer copyright line is text", () => {
    const html = renderToStaticMarkup(<Footer facts={facts} />);
    expect(html).toContain("© 2026 Bullion Technologies Private Limited. All rights reserved.");
  });
});

describe("logos on the right background, never on green", () => {
  it("navy contexts use the reverse files, light contexts the normal ones", () => {
    const home = renderHome();
    const strip = renderToStaticMarkup(<TopStrip status="prelaunch" />);
    const diagram = home.match(/<div role="group"([\s\S]*?)<ul class="mt-10 grid gap-4/)![1];
    for (const { src } of [...wordmarkImgs(strip), ...wordmarkImgs(diagram)]) expect(src).toMatch(/-reverse\.svg$/);
    const yourBrand = home.match(/<section id="your-brand"([\s\S]*?)<\/section>/)![1];
    for (const { src } of wordmarkImgs(yourBrand)) expect(src).toBe("/brand/busrep-wordmark-reverse.svg");
    const faq = home.match(/<section id="faq"([\s\S]*?)<\/section>/)![1];
    for (const { src } of wordmarkImgs(faq)) expect(src).not.toMatch(/reverse/);
  });

  it("no logo is placed inside a green-background element", () => {
    const home = renderHome({ facts: allOn });
    for (const m of home.matchAll(/<(div|a|span|li)\b[^>]*class="[^"]*\bbg-green(?:-text)?\b[^"]*"[^>]*>([\s\S]*?)<\/\1>/g)) expect(wordmarkImgs(m[2])).toEqual([]);
  });
});
