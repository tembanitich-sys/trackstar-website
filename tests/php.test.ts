import { spawnSync } from "node:child_process";
import { readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { COUNTRY_DATA } from "@/lib/country-data";
import siteConfig from "@/site.config.json";
import { contact, contactEmail, getTrackStar, portalUrl, privacyNoticeVersion, siteDomain } from "@/content/site";

const root = path.resolve(__dirname, "..");
const hasPhp = spawnSync("php", ["-v"]).status === 0;

function phpJson(code: string): unknown {
  const run = spawnSync("php", ["-r", code], { cwd: root });
  expect(run.status, String(run.stderr)).toBe(0);
  return JSON.parse(String(run.stdout));
}

const toMap = (list: readonly { value: string; label: string }[]) => Object.fromEntries(list.map((o) => [o.value, o.label]));

describe.skipIf(!hasPhp)("PHP submission pipeline", () => {
  it("passes its own checks (tests/php/handler_test.php)", () => {
    const run = spawnSync("php", [path.join(root, "tests/php/handler_test.php")]);
    const out = String(run.stdout);
    expect(out.split("\n").filter((l) => l.startsWith("FAIL"))).toEqual([]);
    expect(run.status, out + String(run.stderr)).toBe(0);
    expect(out).toContain("all passed");
  });

  it("offers the same choices as the website forms", () => {
    const options = phpJson('echo json_encode(require "public/api/lib/options.php");') as Record<string, unknown>;
    expect(options.fleet_sizes).toEqual(toMap(getTrackStar.fleetSizes));
    expect(options.help_types).toEqual(toMap(getTrackStar.helpTypes));
    expect(options.current_ticketing).toEqual(toMap(getTrackStar.currentTicketing));
    expect(options.enquiry_types).toEqual(toMap(contact.enquiryTypes));
    expect(options.privacy_notice_version).toBe(privacyNoticeVersion);
  });

  it("lists the same countries, names and calling codes as the website", () => {
    const php = phpJson(
      'require "public/api/lib/phone.php"; $d = require "public/api/lib/phone_data.php"; echo json_encode(array_map(fn($c) => [$c["name"], "+" . $c["cc"]], $d["countries"]));',
    ) as Record<string, [string, string]>;
    const site = Object.fromEntries(COUNTRY_DATA.map(([code, name, dial]) => [code, [name, dial]]));
    expect(php).toEqual(site);
  });

  it("holds no e-mail address or site domain in its code (they live in config.php and site.config.json)", () => {
    const message = phpJson('require "public/api/lib/handler.php"; echo json_encode(TrackStarHandler::GENERIC_ERROR);') as string;
    expect(message).not.toContain("@");
    const phpFiles = [
      "public/api/enquiry.php", "public/api/contact.php", "public/api/lib/bootstrap.php", "public/api/lib/handler.php",
      "public/api/lib/services.php", "public/api/lib/validate.php", "public/api/lib/options.php",
    ];
    for (const f of phpFiles) {
      const text = readFileSync(path.join(root, f), "utf8");
      expect(text, f).not.toMatch(/trackstar\.(co\.zw|solutions)/i);
      expect(text, f).not.toMatch(/[\w.+-]+@[\w-]+\.[a-z]{2,}/i);
    }
  });

  it("ships a config example with every setting the code reads", () => {
    const keys = phpJson('echo json_encode(array_keys(require "public/api/config.example.php"));') as string[];
    expect(keys).toEqual(
      expect.arrayContaining([
        "DB_HOST", "DB_NAME", "DB_USER", "DB_PASS", "SMTP_HOST", "SMTP_PORT", "SMTP_SECURE", "SMTP_USER", "SMTP_PASS",
        "MAIL_FROM", "MAIL_FROM_NAME", "MAIL_TO", "IP_SALT", "TURNSTILE_SECRET", "TRUST_PROXY_HEADERS",
      ]),
    );
    const service = readFileSync(path.join(root, "public/api/lib/services.php"), "utf8");
    for (const [, key] of service.matchAll(/setting\('([A-Z_]+)'/g)) {
      if (key === "DB_DSN") continue; // advanced / test override, intentionally undocumented
      expect(keys, `config.example.php is missing ${key}`).toContain(key);
    }
  });
});

describe("domain", () => {
  function files(dir: string, out: string[] = []): string[] {
    for (const name of readdirSync(dir)) {
      if (["node_modules", ".next", "out", ".git", "dist", "vendor"].includes(name)) continue;
      const full = path.join(dir, name);
      if (statSync(full).isDirectory()) files(full, out);
      else if (/\.(ts|tsx|md|php|sql|json|mjs|css|example|txt)$|\.htaccess$/.test(name)) out.push(full);
    }
    return out;
  }
  const portalHost = new URL(portalUrl).hostname.replace(/^www\./, "");

  it("keeps the site domain in one setting (site.config.json) and derives the contact e-mail from it", () => {
    expect(siteConfig.domain).toBe("busrep.co.zw");
    expect(siteDomain).toBe(siteConfig.domain);
    expect(contactEmail).toBe(`info@${siteConfig.domain}`);
  });

  it("never mentions the old site domain (trackstar.co.zw) outside the original brief", () => {
    const offenders = files(root)
      .filter((f) => !f.endsWith("TRACKSTAR_WEBSITE_BRIEF.md") && !f.endsWith("package-lock.json") && !f.endsWith("php.test.ts"))
      .filter((f) => /trackstar\.co\.zw/i.test(readFileSync(f, "utf8")))
      .map((f) => path.relative(root, f));
    expect(offenders).toEqual([]);
  });

  it("mentions the portal domain only as the portal link, never as the site's own address", () => {
    const offenders = files(root)
      .filter((f) => !f.endsWith("TRACKSTAR_WEBSITE_BRIEF.md") && !f.endsWith("package-lock.json") && !f.endsWith("php.test.ts"))
      .filter((f) => readFileSync(f, "utf8").replaceAll(portalUrl, "").includes(portalHost))
      .map((f) => path.relative(root, f));
    expect(offenders).toEqual([]);
  });

  it("does not hard-code the site's own domain in code or markup (only site.config.json, docs and tests hold it)", () => {
    const allowed = /(site\.config\.json|README\.md|DEPLOY\.md|config\.example\.php|\.test\.tsx?|TRACKSTAR_WEBSITE_BRIEF\.md|\.env\.example)$/;
    const offenders = files(root)
      .filter((f) => !allowed.test(f))
      .filter((f) => new RegExp(siteConfig.domain.replace(/\./g, "\\."), "i").test(readFileSync(f, "utf8")))
      .map((f) => path.relative(root, f));
    // The InstaTickets domain (instatickets.co.zw) is a different site and is fine.
    expect(offenders).toEqual([]);
  });
});
