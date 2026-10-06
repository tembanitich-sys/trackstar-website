import { spawnSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";
import siteConfig from "@/site.config.json";

const root = path.resolve(__dirname, "..");
const visible = (html: string) => html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ");

async function render(overrides: Record<string, string> = {}) {
  vi.resetModules();
  const cfg = { ...siteConfig, ...overrides };
  vi.doMock("../site.config.json", () => ({ default: cfg, ...cfg }));
  vi.doMock("@/site.config.json", () => ({ default: cfg, ...cfg }));
  const page = await import("@/app/privacy/page");
  const { Footer } = await import("@/components/Footer");
  const { facts } = await import("@/content/facts");
  return { privacy: visible(renderToStaticMarkup(<page.default />)), footer: visible(renderToStaticMarkup(<Footer facts={facts} />)) };
}

afterEach(() => {
  vi.doUnmock("../site.config.json");
  vi.doUnmock("@/site.config.json");
  vi.unstubAllEnvs();
  vi.resetModules();
});

describe("Privacy Notice", () => {
  it("states what was agreed", async () => {
    const { privacy, footer } = await render();
    expect(privacy).toContain("BusRep Privacy Notice");
    expect(privacy).toContain("Bullion Technologies Private Limited is the company responsible");
    expect(privacy).toContain("Registered address: 153 Sam Nujoma Street Extension, Belgravia, Harare, Zimbabwe.");
    expect(privacy).toContain("Only authorised Bullion Technologies staff");
    expect(privacy).toContain("These server logs are kept for 3 months");
    expect(privacy).toContain("Our website, database and email are hosted in Zimbabwe. Enquiry emails are also delivered to our Microsoft Outlook mailboxes, and Microsoft may store copies outside Zimbabwe; where it does, we take steps to protect your information as required by law.");
    expect(privacy).toContain("InstaTickets team, which is also part of Bullion Technologies");
    expect(privacy).toContain("24 months");
    expect(privacy).toContain("12 months after the enquiry is closed");
    expect(privacy).toContain("within 30 days");
    expect(privacy).not.toContain("outside Zimbabwe, we take steps"); // the old conditional sentence is gone
    expect(footer).toContain("© 2026 Bullion Technologies Private Limited. All rights reserved.");
  });

  it("has no uppercase styling on its heading", () => {
    const src = readFileSync(path.join(root, "app/privacy/page.tsx"), "utf8");
    expect(src).not.toMatch(/uppercase/);
  });

  it("shows the placeholder only while legalEffectiveDate is empty", async () => {
    expect(siteConfig.legalEffectiveDate).toBe("");
    expect((await render()).privacy).toContain("Effective date: [DATE PUBLISHED]");
    const set = await render({ legalEffectiveDate: "12 November 2026" });
    expect(set.privacy).toContain("Effective date: 12 November 2026");
    expect(set.privacy).not.toContain("[");
  });

  it("leaves no other placeholder", async () => {
    expect((await render({ legalEffectiveDate: "1 January 2027" })).privacy).not.toMatch(/\[[A-Z ]+\]/);
  });
});

describe("production build needs the effective date", () => {
  it("throws when indexable and the date is empty, and builds when it is set", async () => {
    vi.stubEnv("NEXT_PUBLIC_INDEXABLE", "true");
    await expect(render()).rejects.toThrow(/legalEffectiveDate is empty/);
    await expect(render({ legalEffectiveDate: "12 November 2026" })).resolves.toBeDefined();
  });

  it("makes the production package script stop before building", () => {
    const original = readFileSync(path.join(root, "site.config.json"), "utf8");
    try {
      const r = spawnSync("node", ["scripts/package.mjs", "production"], { cwd: root, encoding: "utf8" });
      expect(r.status).not.toBe(0);
      expect(r.stderr).toContain("legalEffectiveDate is empty");
      expect(r.stdout).not.toContain("Building the production site");
    } finally {
      writeFileSync(path.join(root, "site.config.json"), original);
    }
  });
});
