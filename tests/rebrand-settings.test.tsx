import { spawnSync } from "node:child_process";
import { mkdtempSync, readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";
import siteConfig from "@/site.config.json";
import { contactEmail, productName, productNameUpper, seo, siteDomain } from "@/content/site";

const root = path.resolve(__dirname, "..");
const hasPhp = spawnSync("php", ["-v"]).status === 0;

describe("product name, domain and contact e-mail are single settings", () => {
  it("live in site.config.json", () => {
    expect(Object.keys(siteConfig)).toEqual(expect.arrayContaining(["productName", "domain", "contactEmail", "portalUrl"]));
    expect(productName).toBe(siteConfig.productName);
    expect(productNameUpper).toBe(siteConfig.productName.toUpperCase());
    expect(siteDomain).toBe(siteConfig.domain);
    expect(contactEmail).toBe(siteConfig.contactEmail);
  });

  it("keeps the exact page title from the brief while the name is TrackStar", () => {
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
  it("appears nowhere in code that produces text (it comes from the setting)", () => {
    const offenders: string[] = [];
    for (const file of sources()) {
      let text = readFileSync(file, "utf8");
      text = text.replace(/\/\*[\s\S]*?\*\//g, "").replace(/(^|[^:"'`])\/\/.*$/gm, "$1");
      text = text.replace(/\b[A-Za-z_]+TrackStar\w*|\bTrackStar[A-Za-z_]+|\bTRACKSTAR_\w+/g, "");
      if (/TrackStar|TRACKSTAR/.test(text)) offenders.push(path.relative(root, file));
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

  it("changes every page, the header, the footer, the manifest and the structured data", async () => {
    vi.resetModules();
    const renamed = { ...siteConfig, productName: "Zebra", domain: "zebra.example", contactEmail: "hello@zebra.example" };
    vi.doMock("../site.config.json", () => ({ default: renamed, ...renamed }));
    vi.doMock("@/site.config.json", () => ({ default: renamed, ...renamed }));

    const { facts } = await import("@/content/facts");
    const [{ HomeView }, { Header }, { Footer }, contactPage, privacyPage, { default: manifest }, { organizationJsonLd }, site] = await Promise.all([
      import("@/components/home/HomeView"),
      import("@/components/Header"),
      import("@/components/Footer"),
      import("@/app/contact/page"),
      import("@/app/privacy/page"),
      import("@/app/manifest"),
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

    expect(site.productName).toBe("Zebra");
    expect(site.contactEmail).toBe("hello@zebra.example");
    expect(site.seo.title).toBe("Zebra | Bus Ticketing & Transport Management Platform");

    for (const [name, html] of Object.entries(pages)) {
      const visible = html.replace(/<script[\s\S]*?<\/script>/g, " ").replace(/<[^>]+>/g, " ");
      const labels = [...html.matchAll(/(?:aria-label|alt)="([^"]*)"/g)].map((m) => m[1]).join(" ");
      expect(visible + labels, `${name} still shows the old name`).not.toMatch(/trackstar/i);
      expect(visible, `${name} lost the old domain's replacement`).not.toContain("trackstar.co.zw");
    }
    expect(pages.home).toContain("GET ZEBRA");
    expect(pages.home).toContain("WITH ZEBRA");
    expect(pages.header).toContain('aria-label="Zebra home"');
    expect(pages.footer).toContain("hello@zebra.example");
    expect(pages.footer).toMatch(/alt="Zebra"|Zebra<\/p>|&middot; Zebra/);
    expect(pages.privacy).toContain("ZEBRA PRIVACY NOTICE");
    expect(pages.privacy).toContain("hello@zebra.example");
    expect(pages.contact).toContain("I have read the Zebra");

    expect(manifest().name).toBe("Zebra");
    expect(organizationJsonLd(facts).name).toBe("Zebra");
    expect(organizationJsonLd(facts).email).toBe("hello@zebra.example");
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
