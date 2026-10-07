import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { EnquiryFormBody } from "@/components/forms/EnquiryForm";
import { TopStrip } from "@/components/TopStrip";
import { helpPresetFor, passengers } from "@/content/site";
import { renderHome, withAlts } from "./helpers";

describe("copy rules", () => {
  it("has no em dash (U+2014) in content/site.ts", () => {
    const src = readFileSync(path.join(__dirname, "../content/site.ts"), "utf8");
    expect(src.includes("—")).toBe(false);
  });

  it("has no em dash in any rendered home copy", () => {
    expect(renderHome().includes("—")).toBe(false);
  });
});

describe("InstaTickets wording", () => {
  it("prelaunch: strip, passenger section and FAQ", () => {
    const html = renderHome({ status: "prelaunch" });
    const strip = renderToStaticMarkup(<TopStrip status="prelaunch" />);
    expect(strip).toContain("launching November 2026");
    expect(strip).toContain("Pre-register on InstaTickets");
    expect(html).toContain(passengers.prelaunch.button);
    expect(withAlts(html).split(passengers.prelaunch.copy).length - 1).toBe(2); // section + FAQ
    expect(html).not.toContain(passengers.live.button);
  });

  it("live: strip, passenger section and FAQ", () => {
    const html = renderHome({ status: "live" });
    const strip = renderToStaticMarkup(<TopStrip status="live" />);
    expect(strip).toContain("Book on InstaTickets");
    expect(strip).not.toContain("launching November 2026");
    expect(html).toContain(passengers.live.button);
    expect(withAlts(html).split(passengers.live.copy).length - 1).toBe(2);
    expect(html).not.toContain("launching November 2026");
  });
});

describe("CTA presets", () => {
  it("GET TRACKSTAR presets 'I need a ticketing system'", () => {
    expect(helpPresetFor("need")).toBe("need_system");
    expect(helpPresetFor(undefined)).toBe("need_system");
    expect(renderToStaticMarkup(<EnquiryFormBody helpDefault={helpPresetFor("need")} />)).toMatch(
      /<option value="need_system" selected/,
    );
  });

  it("BOOK A DEMO presets 'I would like a demo'", () => {
    expect(helpPresetFor("demo")).toBe("demo");
    expect(renderToStaticMarkup(<EnquiryFormBody helpDefault={helpPresetFor("demo")} />)).toMatch(
      /<option value="demo" selected/,
    );
  });

  it("renders the default preset in the static home page", () => {
    expect(renderHome()).toMatch(/<option value="need_system" selected/);
  });

  it("links the two CTAs to the form", () => {
    const html = renderHome();
    expect(html).toContain('href="/?help=need#get-busrep"');
    expect(html).toContain('href="/?help=demo#get-busrep"');
  });
});

describe("form defaults", () => {
  it("leaves the marketing checkbox unticked and requires the privacy acknowledgement", () => {
    const html = renderHome();
    const marketing = html.match(/<input[^>]*name="marketingConsent"[^>]*>/)?.[0] ?? "";
    const privacy = html.match(/<input[^>]*name="privacyAck"[^>]*>/)?.[0] ?? "";
    expect(marketing).not.toBe("");
    expect(marketing).not.toContain("checked");
    expect(privacy).toContain("required");
  });

  it("defaults the country selectors to Zimbabwe", () => {
    expect(renderHome()).toMatch(/<option value="ZW" selected/);
  });
});
