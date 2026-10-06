import { spawnSync } from "node:child_process";
import { mkdtempSync, readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";
import siteConfig from "@/site.config.json";
import { cta, contactEmail, legalEntityName, legalProductName, privacyNoticeVersion, productName, seo, siteDomain } from "@/content/site";

const root = path.resolve(__dirname, "..");
const hasPhp = spawnSync("php", ["-v"]).status === 0;

describe("product name, domain and contact e-mail are single settings", () => {
  it("live in site.config.json", () => {
    expect(Object.keys(siteConfig)).toEqual(
      expect.arrayContaining(["productName", "legalProductName", "legalEntityName", "legalEffectiveDate", "domain", "contactEmail", "portalUrl"]),
    );
    expect(productName).toBe(siteConfig.productName);
    expect(legalProductName).toBe(siteConfig.legalProductName);
    expect(siteDomain).toBe(siteConfig.domain);
    expect(contactEmail).toBe(siteConfig.contactEmail);
  });

  it("is BusRep on busrep.co.zw with the contact address on that domain", () => {
    expect(siteConfig.productName).toBe("BusRep");
    expect(siteConfig.domain).toBe("busrep.co.zw");
    expect(siteConfig.contactEmail).toBe("info@busrep.co.zw");
  });

  it("names BusRep in legal text, with Bullion Technologies Private Limited as the responsible company", () => {
    expect(siteConfig.legalProductName).toBe("BusRep");
    expect(legalEntityName).toBe("Bullion Technologies Private Limited");
    expect(privacyNoticeVersion).toBe("2026-10-busrep");
  });

  it("keeps the brand spelling in capital lines (BusRep, never BUSREP)", () => {
    expect(cta.primary).toBe(`GET ${productName}`);
    expect(`${cta.primary}`).not.toContain(productName.toUpperCase());
  });

  it("keeps the exact page title and description wording from the brief", () => {
    expect(seo.title).toBe(`${productName} | Bus Ticketing & Transport Management Platform`);
    expect(seo.description.startsWith(`${productName} gives bus operators`)).toBe(true);
  });

  it("is copied next to the PHP scripts so e-mails use the same name (run `npm run sync:config` if this fails)", () => {
    expect(readFileSync(path.join(root, "public/api/site.config.json"), "utf8")).toBe(readFileSync(path.join(root, "site.config.json"), "utf8"));
  });
});

/** Source files whose text reaches visitors or e-mails. Identifiers, file names and comments are not text. */
function sources(): string[] {
  const out: string[] = [];
  const walk = (dir: string) => {
    for (const name of readdirSync(dir)) {
      const full = path.join(dir, name);
      if (statSync(full).isDirectory()) {
        if (!["vendor", "logs", "node_modules"].includes(name)) walk(full);
      } else if (/\.(tsx?|php)$/.test(name) && !/(phone_data|config\.example)\.php$/.test(name) && !name.endsWith(".d.ts")) out.push(full);
    }
  };
  for (const d of ["content", "components", "app", "lib", "public/api"]) walk(path.join(root, d));
  return out;
}

describe("no hard-coded product name", () => {
  it("appears nowhere in code that produces text (it comes from the settings)", () => {
    const offenders: string[] = [];
    for (const file of sources()) {
      let text = readFileSync(file, "utf8");
      text = text.replace(/\/\*[\s\S]*?\*\//g, "").replace(/(^|[^:"'`])\/\/.*$/gm, "$1");
      // Internal identifiers (class and function names, environment variables) are not text.
      text = text.replace(/\b[A-Za-z_]+TrackStar\w*|\bTrackStar[A-Za-z_]+|\bTRACKSTAR_\w+/g, "");
      if (/TrackStar|TRACKSTAR|BusRep|BUSREP/.test(text)) offenders.push(path.relative(root, file));
    }
    expect(offenders).toEqual([]);
  });
});

describe("renaming propagates", () => {
  afterEach(() => {
    vi.doUnmock("@/site.config.json");
    vi.doUnmock("../site.config.json");
    vi.resetModules();
  });

  async function loadWith(overrides: Record<string, string>) {
    vi.resetModules();
    const renamed = { ...siteConfig, ...overrides };
    vi.doMock("../site.config.json", () => ({ default: renamed, ...renamed }));
    vi.doMock("@/site.config.json", () => ({ default: renamed, ...renamed }));
    const { facts } = await import("@/content/facts");
    const [{ HomeView }, { Header }, { Footer }, contactPage, privacyPage, manifestRoute, { organizationJsonLd }, site] = await Promise.all([
      import("@/components/home/HomeView"),
      import("@/components/Header"),
      import("@/components/Footer"),
      import("@/app/contact/page"),
      import("@/app/privacy/page"),
      import("@/app/site.webmanifest/route"),
      import("@/lib/jsonld"),
      import("@/content/site"),
    ]);
    const pages = {
      home: renderToStaticMarkup(<HomeView status="prelaunch" />),
      header: renderToStaticMarkup(<Header />),
      footer: renderToStaticMarkup(<Footer facts={facts} />),
      contact: renderToStaticMarkup(<contactPage.default />),
      privacy: renderToStaticMarkup(<privacyPage.default />),
    };
    return { facts, pages, manifest: await manifestRoute.GET().json(), organizationJsonLd, site };
  }

  const visible = (html: string) => html.replace(/<script[\s\S]*?<\/script>/g, " ").replace(/<[^>]+>/g, " ");
  const labels = (html: string) => [...html.matchAll(/(?:aria-label|alt)="([^"]*)"/g)].map((m) => m[1]).join(" ");

  it("changes every page, the header, the footer, the manifest and the structured data", async () => {
    const { facts, pages, manifest, organizationJsonLd, site } = await loadWith({
      productName: "Zebra", legalProductName: "Zebra", legalEntityName: "Zebra Holdings", domain: "zebra.example", contactEmail: "hello@zebra.example",
    });

    expect(site.productName).toBe("Zebra");
    expect(site.contactEmail).toBe("hello@zebra.example");
    expect(site.seo.title).toBe("Zebra | Bus Ticketing & Transport Management Platform");

    for (const [name, html] of Object.entries(pages)) {
      expect(visible(html) + labels(html), `${name} still shows the old name`).not.toMatch(/busrep|trackstar/i);
      expect(visible(html), `${name} still shows the old domain`).not.toContain("busrep.co.zw");
    }
    expect(pages.home).toContain("GET Zebra");
    expect(pages.home).toContain("WITH Zebra");
    expect(pages.header).toContain('aria-label="Zebra home"');
    expect(pages.footer).toContain("hello@zebra.example");
    expect(pages.privacy).toContain("Zebra Privacy Notice");
    expect(visible(pages.privacy)).toContain("Zebra Holdings is the company responsible");
    expect(visible(pages.footer)).toContain("© 2026 Zebra Holdings.");
    expect(pages.privacy).toContain("hello@zebra.example");
    expect(pages.contact).toContain("I have read the Zebra");

    expect(manifest.name).toBe("Zebra");
    expect(manifest.short_name).toBe("Zebra");
    expect(organizationJsonLd(facts).name).toBe("Zebra");
    expect(organizationJsonLd(facts).email).toBe("hello@zebra.example");
  });

  it("keeps legal text and consent wording on the legal name until it is switched", async () => {
    const { pages } = await loadWith({ productName: "Zebra", legalProductName: "Kiwi" });

    // The Privacy Notice and the consent labels use the legal name, nothing else on them changes.
    expect(visible(pages.privacy)).toContain("Kiwi Privacy Notice");
    expect(visible(pages.privacy)).not.toContain("Zebra");
    expect(pages.contact).toContain("I have read the Kiwi");
    expect(visible(pages.home)).toContain("I have read the Kiwi");
    expect(visible(pages.home)).toContain("I would like to receive Kiwi updates by email");

    // Everything else follows the product name.
    expect(pages.home).toContain("GET Zebra");
    expect(visible(pages.home).match(/Kiwi/g)).toHaveLength(2); // only the two consent labels on the home page
    expect(visible(pages.footer)).toContain("Zebra");
    expect(visible(pages.footer)).not.toContain("Kiwi");
    expect(visible(pages.header) + labels(pages.header)).not.toContain("Kiwi");
  });
});

describe.skipIf(!hasPhp)("e-mails use the product name setting", () => {
  const run = (code: string) => {
    const r = spawnSync("php", ["-r", code], { cwd: root });
    expect(r.status, String(r.stderr)).toBe(0);
    return String(r.stdout);
  };

  it("reads it from the config file the site ships with", () => {
    expect(run('require "public/api/lib/brand.php"; echo TrackStarBrand::name();')).toBe(siteConfig.productName);
  });

  it("follows a changed setting and falls back safely when it is missing", () => {
    const dir = mkdtempSync(path.join(os.tmpdir(), "brand-"));
    const renamed = path.join(dir, "renamed.json");
    writeFileSync(renamed, JSON.stringify({ ...siteConfig, productName: "Zebra" }));
    const broken = path.join(dir, "broken.json");
    writeFileSync(broken, "{ not json");
    expect(run(`require "public/api/lib/brand.php"; echo TrackStarBrand::name(${JSON.stringify(renamed)});`)).toBe("Zebra");
    expect(run(`require "public/api/lib/brand.php"; echo TrackStarBrand::name(${JSON.stringify(broken)});`)).toBe("Website");
    expect(run(`require "public/api/lib/brand.php"; echo TrackStarBrand::name(${JSON.stringify(path.join(dir, "missing.json"))});`)).toBe("Website");
  });

  it("puts the name in the subject and the body of the notification e-mails", () => {
    const code = `
      require "public/api/lib/handler.php";
      $op = ['full_name'=>'A','company'=>'Acme','phone_e164'=>'+263771234567','email'=>'a@example.com','country'=>'Zimbabwe','fleet_size'=>'6-15','help_type'=>'need_system','current_ticketing'=>'none','current_system_name'=>null,'message'=>null,'marketing_consent'=>0,'utm_source'=>null,'utm_medium'=>null,'utm_campaign'=>null];
      $ct = ['name'=>'A','email'=>'a@example.com','phone_e164'=>null,'enquiry_type'=>'sales','message'=>'Hi'];
      echo json_encode([TrackStarMessages::build('operator', $op, 'id-1'), TrackStarMessages::build('contact', $ct, 'id-2')]);`;
    const [operator, contact] = JSON.parse(run(code));
    expect(operator.subject).toBe(`${productName} enquiry: Acme (I need a ticketing system)`);
    expect(operator.text).toContain(`How can ${productName} help: I need a ticketing system`);
    expect(contact.subject).toBe(`${productName} contact: Sales from A`);
  });
});
