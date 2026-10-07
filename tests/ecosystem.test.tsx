import { createHash } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { Ecosystem } from "@/components/home/Ecosystem";
import { Operators } from "@/components/home/Operators";
import { ecosystemGroups, journeySteps, operatorBenefits } from "@/content/compose";
import { facts as defaultFacts } from "@/content/facts";
import type { Facts } from "@/content/facts";
import { paymentGroups, whatsappGlyph } from "@/content/partners";
import * as c from "@/content/site";
import { allOff, renderHome, withAlts } from "./helpers";

const root = path.resolve(__dirname, "..");
const sha = (...p: string[]) => createHash("sha256").update(readFileSync(path.join(root, ...p))).digest("hex");
const text = (html: string) => withAlts(html).replace(/&#x27;/g, "'").replace(/\s+/g, " ");

const eco = (f: Facts = defaultFacts) => {
  const g = ecosystemGroups(f);
  return renderToStaticMarkup(<Ecosystem {...g} />);
};
const marks = paymentGroups.flatMap((g) => g.marks);

describe("partner logo files", () => {
  it("are referenced from the one list and exist as the partners' unmodified files", () => {
    expect(marks.map((m) => m.name)).toEqual(["EcoCash", "InnBucks", "Visa", "Mastercard", "ZimSwitch"]);
    for (const m of marks) {
      const web = path.join("public", m.file);
      expect(existsSync(path.join(root, web)), `${web} is missing`).toBe(true);
      expect(sha(web), `${m.name} differs from brand/partners`).toBe(sha("brand/partners/payments", path.basename(m.file)));
    }
    expect(sha("public", whatsappGlyph.file)).toBe(sha("brand/partners/whatsapp-glyph.svg"));
  });

  it("have the proportions the list says", () => {
    for (const m of marks) {
      const file = readFileSync(path.join(root, "public", m.file));
      if (m.file.endsWith(".svg")) {
        const [, , w, h] = file.toString("utf8").match(/viewBox="([^"]+)"/)![1].split(/\s+/).map(Number);
        expect(w).toBeCloseTo(m.width, 1);
        expect(h).toBeCloseTo(m.height, 1);
      } else {
        expect([file.readUInt32BE(16), file.readUInt32BE(20)]).toEqual([m.width, m.height]);
      }
    }
  });

  it("only the web files are in public/, never the originals", () => {
    expect(existsSync(path.join(root, "public/brand/partners/original"))).toBe(false);
    expect(existsSync(path.join(root, "public/brand/partners/payments/innbucks-badge.jpg"))).toBe(false);
  });

  it("all shown at 20 px, except Mastercard and ZimSwitch at 22 px; white-only InnBucks on a navy chip", () => {
    expect(Object.fromEntries(marks.map((m) => [m.name, m.displayHeight ?? 20]))).toEqual({ EcoCash: 20, InnBucks: 20, Visa: 20, Mastercard: 22, ZimSwitch: 22 });
    expect(Object.fromEntries(marks.map((m) => [m.name, m.chip]))).toEqual({ EcoCash: "light", InnBucks: "navy", Visa: "light", Mastercard: "light", ZimSwitch: "light" });
  });
});

describe("ecosystem diagram", () => {
  const html = eco();

  it("shows the centre card, the three groups and the closing line", () => {
    expect(html).toContain('alt="BusRep"');
    expect(html.match(/alt="BusRep"/g)).toHaveLength(1);
    expect(text(html)).toContain("One platform, every channel");
    for (const label of ["YOUR PASSENGERS", "YOUR TEAM", "YOUR MONEY"]) expect(html).toContain(label);
    for (const t of ["Website and online booking", "Customer app", "WhatsApp booking", "Agent app", "Works offline", "Back office", "Mobile money", "Cards", "Bank payments"]) expect(text(html)).toContain(t);
    expect(text(html)).toContain("Sell on the road, verify tickets at boarding");
    expect(text(html)).not.toContain("depots");
    expect(text(html)).toContain("Routes, fleet, sales and reports, live");
    expect(text(html)).toContain("More wallets, banks and cards are added as partners join.");
  });

  it("renders every partner logo once, with its brand name as alt text, at the set height, on the right chip", () => {
    for (const m of marks) {
      const imgs = [...html.matchAll(new RegExp(`<img[^>]*alt="${m.name}"[^>]*>`, "g"))];
      expect(imgs, m.name).toHaveLength(1);
      expect(imgs[0][0]).toContain(`height:${m.displayHeight ?? 20}px`);
      expect(imgs[0][0]).toContain(`src="${m.file}"`);
      const chip = html.match(new RegExp(`<span data-partner="${m.name}" class="([^"]*)"`))![1];
      expect(chip).toContain("h-9"); // every chip is 36 px tall
      expect(chip).toContain("rounded-lg");
      expect(chip).toContain(m.chip === "navy" ? "bg-navy" : "bg-white");
    }
  });

  it("uses lists for the content, and hides every connector and icon from screen readers", () => {
    expect(html.match(/<ul/g)!.length).toBeGreaterThanOrEqual(5);
    for (const m of html.matchAll(/<svg\b[^>]*>/g)) expect(m[0], "an svg is exposed to screen readers").toMatch(/aria-hidden="true"/);
    // WhatsApp's glyph is decorative: the text beside it names it
    const glyph = html.match(/<img[^>]*whatsapp-glyph\.svg[^>]*>/)![0];
    expect(glyph).toContain('alt=""');
    expect(glyph).toContain('aria-hidden="true"');
    expect(html).not.toMatch(/alt="WhatsApp"/);
  });

  it("keeps the labels and lines as text (not baked into an image)", () => {
    expect(html.match(/<img/g)!.length).toBe(1 /* BusRep */ + 1 /* WhatsApp */ + marks.length);
  });

  it("sits under the heading, and GET BusRep stays below the diagram", () => {
    const home = renderHome();
    const at = (s: string) => home.indexOf(s);
    expect(at("YOUR MONEY")).toBeGreaterThan(at('id="no-solution-title"'));
    expect(at('href="/?help=need#get-busrep"', )).toBeGreaterThan(0);
    const section = home.match(/<section id="no-ticketing"[\s\S]*?<\/section>\s*<section id="your-brand"/)![0];
    expect(section.lastIndexOf("GET BusRep")).toBeGreaterThan(section.indexOf("More wallets, banks and cards"));
  });
});

describe("fact switches in the new sections", () => {
  const on = { ...allOff, agentApp: true, whatsappBooking: true, nativeCustomerApp: true, showPaymentMarks: true, bankPayments: true };
  const without = (k: keyof Facts) => ({ ...defaultFacts, [k]: false });

  it("nativeCustomerApp, whatsappBooking and agentApp each remove their own item", () => {
    expect(text(eco(without("nativeCustomerApp")))).not.toContain("Customer app");
    expect(text(eco(without("whatsappBooking")))).not.toContain("WhatsApp booking");
    expect(eco(without("whatsappBooking"))).not.toContain("whatsapp-glyph");
    expect(text(eco(without("agentApp")))).not.toContain("Agent app");
    expect(text(eco(without("agentApp")))).not.toContain("Works offline");
    expect(text(eco(on))).toContain("Customer app");
  });

  it("ticketAuthenticator decides whether the Agent app line says 'verify tickets at boarding'", () => {
    const line = (f: Facts) => ecosystemGroups(f).team.find((i) => i.key === "agent-app")!.line;
    expect(line(defaultFacts)).toBe("Sell on the road, verify tickets at boarding");
    expect(line(without("ticketAuthenticator") as Facts)).toBe("Sell on the road");
    expect(text(eco(without("ticketAuthenticator")))).toContain("Sell on the road");
    expect(text(eco(without("ticketAuthenticator")))).not.toContain("verify tickets");
    // the badge is a separate switch and stays when the authenticator is off
    expect(text(eco(without("ticketAuthenticator")))).toContain("Works offline");
    // the same line is the one rendered on every screen size (one DOM, responsive classes)
    expect(text(renderHome())).toContain("Sell on the road, verify tickets at boarding");
  });

  it("worksOffline removes the badge and 'even offline'", () => {
    expect(text(eco(without("worksOffline")))).not.toContain("Works offline");
    expect(journeySteps(defaultFacts)[5].line).toContain("even offline");
    expect(journeySteps(without("worksOffline") as Facts)[5].line).not.toContain("offline");
  });

  it("bankPayments removes the Bank payments row, its logo and 'bank' from the benefit", () => {
    const html = eco(without("bankPayments"));
    expect(text(html)).not.toContain("Bank payments");
    expect(html).not.toContain("ZimSwitch");
    expect(operatorBenefits(without("bankPayments") as Facts).join(" ")).not.toMatch(/\bbank\b/);
    expect(operatorBenefits(defaultFacts).join(" ")).toContain("mobile money, card and bank");
  });

  it("showPaymentMarks off keeps the rows but shows no partner logo", () => {
    const html = eco(without("showPaymentMarks"));
    for (const m of marks) expect(html).not.toContain(`alt="${m.name}"`);
    expect(text(html)).toContain("Mobile money");
  });

  it("instantSettlement, realtimeView and lessCashHandling each remove their claim", () => {
    expect(operatorBenefits(defaultFacts)[1]).toBe("Get paid instantly by mobile money, card and bank");
    expect(operatorBenefits(without("instantSettlement") as Facts)[1]).toBe("Get paid by mobile money, card and bank");
    expect(operatorBenefits(without("realtimeView") as Facts)).not.toContain("See every sale and seat in real time");
    expect(text(eco(without("realtimeView")))).toContain("Routes, fleet, sales and reports");
    expect(text(eco(without("realtimeView")))).not.toContain("reports, live");
    expect(operatorBenefits(without("lessCashHandling") as Facts)).not.toContain("Less cash handling at depots");
  });

  it("ticketAuthenticator decides how step 6 is worded", () => {
    expect(journeySteps(defaultFacts)[5]).toEqual({ title: "CHECK IN AND BOARD", line: "Your team scans or verifies the ticket digitally at boarding, even offline." });
    expect(journeySteps(without("ticketAuthenticator") as Facts)[5].line).toBe("Your team checks the ticket at departure.");
    expect(text(renderHome({ facts: { ...defaultFacts, ticketAuthenticator: false } }))).not.toContain("scans or verifies");
  });
});

describe("customer journey", () => {
  it("has the new heading and steps 5 and 6, in capitals like the other steps", () => {
    expect(c.journey.headline).toBe("THE CUSTOMER JOURNEY");
    const steps = journeySteps(defaultFacts);
    expect(steps.map((s) => s.title)).toEqual(["SEARCH", "SELECT", "BOOK", "PAY", "DIGITAL TICKET", "CHECK IN AND BOARD"]);
    expect(steps[4].line).toBe("Passengers receive a digital ticket with a QR code.");
    expect(steps.slice(0, 4).map((s) => s.line)).toEqual([
      "Passengers choose departure, destination and travel date.",
      "They pick a trip and a seat.",
      "They enter passenger details.",
      "They pay by mobile money or card.",
    ]);
    const html = text(renderHome());
    expect(html).toContain("THE CUSTOMER JOURNEY");
    expect(html).not.toContain("FROM SEARCH TO BOARDING");
  });
});

describe("Built for every bus operator", () => {
  const html = renderToStaticMarkup(<Operators benefits={operatorBenefits(defaultFacts)} />);

  it("has the heading, the two panels, the arrow label and every row", () => {
    expect(text(html)).toContain("BUILT FOR EVERY BUS OPERATOR.");
    expect(text(html)).toContain("WHO IT'S FOR");
    expect(text(html)).toContain("WHAT EVERY OPERATOR GETS");
    for (const row of ["Intercity operators", "Cross-border operators", "Growing operators", "Established operators", "Operators moving from paper tickets"]) expect(text(html)).toContain(row);
    for (const b of ["Sell seats on every channel", "Get paid instantly by mobile money, card and bank", "See every sale and seat in real time", "Less cash handling at depots", "Add routes, branches and agents without changing systems", "Nothing to build or maintain"]) expect(text(html)).toContain(b);
    expect(html.replace(/<br\s*\/?>/g, " ")).toMatch(/ALL OF IT,[\s\S]*FOR ALL/);
    expect(html).toContain("bg-navy"); // the navy panel
    expect(html.match(/lucide-bus-front/g)).toHaveLength(5);
    expect(html.match(/lucide-check/g)).toHaveLength(6);
  });

  it("points right on wide screens and down on phones, and hides the arrow from screen readers", () => {
    expect(html).toContain("lucide-arrow-right");
    expect(html).toContain("lucide-arrow-down");
    expect(html).toMatch(/<div aria-hidden="true"[^>]*>[\s\S]*lucide-arrow-right/);
  });

  it("replaces the five cards", () => {
    expect(text(renderHome())).not.toContain("BUILT FOR BUS OPERATORS");
    expect(text(renderHome())).not.toContain("STARTING FROM PAPER");
  });
});
