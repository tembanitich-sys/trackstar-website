import { spawn, spawnSync } from "node:child_process";
import type { ChildProcess } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync, writeFileSync, existsSync } from "node:fs";
import net from "node:net";
import os from "node:os";
import path from "node:path";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { closedPort, startFakeSmtp } from "./helpers/fake-smtp";

/**
 * End to end: a real PHP server runs public/api/*.php against a real database and a fake SMTP server.
 * The database is SQLite by default. Set TRACKSTAR_TEST_MYSQL_DSN (and _USER / _PASS) to run the same
 * tests against MySQL or MariaDB using db/schema.mysql.sql.
 */
const hasPhp = spawnSync("php", ["-v"]).status === 0;
const root = path.resolve(__dirname, "..");
const mysqlDsn = process.env.TRACKSTAR_TEST_MYSQL_DSN;

type Reply = { status: number; body: Record<string, unknown>; headers: Headers };

async function freePort(): Promise<number> {
  const s = net.createServer();
  await new Promise<void>((r) => s.listen(0, "127.0.0.1", r));
  const port = (s.address() as net.AddressInfo).port;
  await new Promise<void>((r) => s.close(() => r()));
  return port;
}

async function waitFor(port: number) {
  for (let i = 0; i < 100; i++) {
    const ok = await new Promise<boolean>((r) => {
      const c = net.connect(port, "127.0.0.1", () => (c.destroy(), r(true)));
      c.on("error", () => r(false));
    });
    if (ok) return;
    await new Promise((r) => setTimeout(r, 50));
  }
  throw new Error("php server did not start");
}

const operator = (over: Record<string, unknown> = {}) => ({
  fullName: "Test Person", company: "Test Coaches", mobileCountry: "ZW", mobileNational: "077 123 4567",
  email: "test@example.com", country: "ZW", fleetSize: "6-15", helpType: "need_system", currentTicketing: "none",
  currentSystemName: "", message: "Hello there", marketingConsent: false, privacyAck: true, website: "",
  utmSource: "newsletter", utmMedium: "email", utmCampaign: "launch", ...over,
});
const contact = (over: Record<string, unknown> = {}) => ({
  name: "Test Person", email: "test@example.com", phoneCountry: "ZW", phoneNational: "", enquiryType: "sales",
  message: "Hello", privacyAck: true, website: "", ...over,
});

describe.skipIf(!hasPhp)("PHP API over HTTP", () => {
  let tmp: string;
  let server: ChildProcess;
  let base: string;
  let configPath: string;
  let smtp: Awaited<ReturnType<typeof startFakeSmtp>>;
  let logFile: string;
  let ipCounter = 10;

  const baseConfig = (extra: Record<string, unknown> = {}) => ({
    DB_DSN: mysqlDsn ?? `sqlite:${path.join(tmp, "test.sqlite")}`,
    DB_USER: process.env.TRACKSTAR_TEST_MYSQL_USER ?? "",
    DB_PASS: process.env.TRACKSTAR_TEST_MYSQL_PASS ?? "",
    SMTP_HOST: "127.0.0.1", SMTP_PORT: smtp.port, SMTP_SECURE: "", SMTP_USER: "", SMTP_PASS: "",
    MAIL_FROM: "noreply@trackstar.co.zw", MAIL_FROM_NAME: "TrackStar", MAIL_TO: "info@trackstar.co.zw",
    IP_SALT: "test-salt", TURNSTILE_SECRET: "", TRUST_PROXY_HEADERS: true, ...extra,
  });
  const writeConfig = (cfg: Record<string, unknown>) =>
    writeFileSync(configPath, `<?php return json_decode(${JSON.stringify(JSON.stringify(cfg))}, true);`);

  const php = (...args: string[]) =>
    spawnSync("php", [path.join(root, "tests/php/db_helper.php"), ...args], { env: { ...process.env, TRACKSTAR_CONFIG: configPath } });
  const rows = (table: string): Record<string, unknown>[] => JSON.parse(String(php("rows", table).stdout));

  async function post(endpoint: string, body: unknown, headers: Record<string, string> = {}): Promise<Reply> {
    const res = await fetch(`${base}/api/${endpoint}`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Forwarded-For": `10.0.0.${ipCounter++}`, ...headers },
      body: typeof body === "string" ? body : JSON.stringify(body),
    });
    return { status: res.status, body: (await res.json()) as Record<string, unknown>, headers: res.headers };
  }
  const waitForMail = async (n: number) => {
    for (let i = 0; i < 60 && smtp.messages.length < n; i++) await new Promise((r) => setTimeout(r, 50));
  };

  beforeAll(async () => {
    tmp = mkdtempSync(path.join(os.tmpdir(), "trackstar-api-"));
    configPath = path.join(tmp, "config.php");
    smtp = await startFakeSmtp();
    writeConfig(baseConfig());
    const port = await freePort();
    base = `http://127.0.0.1:${port}`;
    server = spawn("php", ["-d", "display_errors=0", "-S", `127.0.0.1:${port}`, "-t", path.join(root, "public")], {
      env: { ...process.env, TRACKSTAR_CONFIG: configPath },
      stdio: "ignore",
    });
    await waitFor(port);
    logFile = path.join(root, "public/api/logs/api.log");
  }, 30000);

  afterAll(async () => {
    server?.kill();
    await smtp?.close();
    if (tmp) rmSync(tmp, { recursive: true, force: true });
    if (logFile && existsSync(logFile)) rmSync(logFile);
  });

  beforeEach(() => {
    writeConfig(baseConfig());
    expect(String(php("init").stdout)).toBe("ok");
    smtp.messages.length = 0;
    if (existsSync(logFile)) rmSync(logFile);
  });

  it("only accepts POST with JSON from its own site", async () => {
    const get = await fetch(`${base}/api/enquiry.php`);
    expect(get.status).toBe(405);
    expect(get.headers.get("allow")).toBe("POST");
    const text = await fetch(`${base}/api/enquiry.php`, { method: "POST", headers: { "Content-Type": "text/plain" }, body: "x" });
    expect(text.status).toBe(415);
    expect((await post("enquiry.php", "not json")).status).toBe(400);
    expect((await post("enquiry.php", "[1,2]")).status).toBe(400);
    expect((await post("enquiry.php", operator(), { Origin: "https://evil.example" })).status).toBe(403);
    const ok = await post("enquiry.php", operator(), { Origin: base });
    expect(ok.status).toBe(200);
  });

  it("saves an operator enquiry, then emails it with the reference and reply-to", async () => {
    const reply = await post("enquiry.php", operator());
    expect(reply.status).toBe(200);
    expect(reply.body).toEqual({ ok: true });
    expect(reply.headers.get("content-type")).toContain("application/json");
    expect(reply.headers.get("cache-control")).toBe("no-store");

    const saved = rows("operator_enquiries");
    expect(saved).toHaveLength(1);
    expect(saved[0]).toMatchObject({
      full_name: "Test Person", company: "Test Coaches", phone_e164: "+263771234567", email: "test@example.com",
      country: "Zimbabwe", fleet_size: "6-15", help_type: "need_system", current_ticketing: "none",
      current_system_name: null, message: "Hello there", privacy_notice_version: "2026-10-trackstar",
      utm_source: "newsletter", utm_medium: "email", utm_campaign: "launch",
    });
    expect(Number(saved[0].marketing_consent)).toBe(0);
    expect(saved[0].marketing_consent_at).toBeNull();
    expect(String(saved[0].id)).toMatch(/^[0-9a-f-]{36}$/);
    expect(String(saved[0].created_at)).toMatch(/^\d{4}-\d\d-\d\d \d\d:\d\d:\d\d$/);

    await waitForMail(1);
    expect(smtp.messages).toHaveLength(1);
    const mail = smtp.messages[0];
    expect(mail.from).toBe("noreply@trackstar.co.zw");
    expect(mail.to).toEqual(["info@trackstar.co.zw"]);
    expect(mail.data).toMatch(/^Reply-To: Test Person <test@example\.com>/im);
    expect(mail.data).toMatch(/^From: TrackStar <noreply@trackstar\.co\.zw>/im);
    expect(mail.data).toMatch(/^Subject: TrackStar enquiry: Test Coaches \(I need a ticketing system\)/im);
    expect(mail.data).toContain("+263771234567");
    expect(mail.data).toContain(`Reference: ${saved[0].id}`);
  });

  it("takes the sender and recipient from config.php, not from the code", async () => {
    writeConfig(baseConfig({ MAIL_FROM: "sender@example.test", MAIL_FROM_NAME: "Site", MAIL_TO: "leads@example.test" }));
    await post("enquiry.php", operator());
    await waitForMail(1);
    expect(smtp.messages[0].from).toBe("sender@example.test");
    expect(smtp.messages[0].to).toEqual(["leads@example.test"]);
    expect(smtp.messages[0].data).toMatch(/^From: Site <sender@example\.test>/im);
  });

  it("records marketing consent with a UTC timestamp only when ticked", async () => {
    await post("enquiry.php", operator({ marketingConsent: true }));
    const [saved] = rows("operator_enquiries");
    expect(Number(saved.marketing_consent)).toBe(1);
    expect(String(saved.marketing_consent_at)).toMatch(/^\d{4}-\d\d-\d\d \d\d:\d\d:\d\d$/);
  });

  it("returns a message per field and saves nothing when the input is invalid", async () => {
    const reply = await post("enquiry.php", operator({ mobileNational: "12", email: "nope", privacyAck: false }));
    expect(reply.status).toBe(422);
    expect(reply.body.ok).toBe(false);
    expect(Object.keys(reply.body.fieldErrors as object).sort()).toEqual(["email", "mobile", "privacyAck"]);
    expect(rows("operator_enquiries")).toHaveLength(0);
    expect(smtp.messages).toHaveLength(0);
  });

  it("looks like success to a bot that fills the honeypot, but saves and sends nothing", async () => {
    const reply = await post("enquiry.php", operator({ website: "http://spam.example" }));
    expect(reply).toMatchObject({ status: 200, body: { ok: true } });
    expect(rows("operator_enquiries")).toHaveLength(0);
    expect(smtp.messages).toHaveLength(0);
  });

  it("still succeeds, and logs it, when the mail server is down; the enquiry is saved", async () => {
    writeConfig(baseConfig({ SMTP_PORT: await closedPort() }));
    const reply = await post("enquiry.php", operator());
    expect(reply).toMatchObject({ status: 200, body: { ok: true } });
    expect(rows("operator_enquiries")).toHaveLength(1);
    expect(readFileSync(logFile, "utf8")).toContain("email failed");
  });

  it("answers 500 and sends no email when the database cannot be used", async () => {
    writeConfig(baseConfig({ DB_DSN: `sqlite:${path.join(tmp, "missing-dir", "x.sqlite")}` }));
    const reply = await post("enquiry.php", operator());
    expect(reply.status).toBe(500);
    expect(String(reply.body.message)).not.toContain("@"); // the website adds the public address, the script holds none
    expect(smtp.messages).toHaveLength(0);
    expect(readFileSync(logFile, "utf8")).toContain("failure");
  });

  it("still validates when the config file is missing, and fails safely for valid input", async () => {
    rmSync(configPath);
    expect((await post("enquiry.php", operator({ email: "nope" }))).status).toBe(422);
    const reply = await post("enquiry.php", operator());
    expect(reply.status).toBe(500);
    expect(readFileSync(logFile, "utf8")).toContain("config.php is missing");
  });

  it("allows 5 per 10 minutes per visitor and form, then answers 429", async () => {
    const ip = { "X-Forwarded-For": "203.0.113.50" };
    for (let i = 0; i < 5; i++) expect((await post("enquiry.php", operator(), ip)).status).toBe(200);
    const sixth = await post("enquiry.php", operator(), ip);
    expect(sixth.status).toBe(429);
    expect(rows("operator_enquiries")).toHaveLength(5);
    // The contact form has its own allowance, and other visitors are unaffected.
    expect((await post("contact.php", contact(), ip)).status).toBe(200);
    expect((await post("enquiry.php", operator(), { "X-Forwarded-For": "203.0.113.51" })).status).toBe(200);
  });

  it("stores only a hashed address for rate limiting, never the raw IP", async () => {
    await post("enquiry.php", operator(), { "X-Forwarded-For": "203.0.113.77" });
    const limits = JSON.stringify(rows("rate_limits"));
    expect(limits).not.toContain("203.0.113.77");
    expect(limits).toMatch(/operator:[0-9a-f]{64}/);
  });

  it("ignores forwarded headers unless the config says the host is behind a proxy", async () => {
    writeConfig(baseConfig({ TRUST_PROXY_HEADERS: false }));
    const statuses: number[] = [];
    for (let i = 0; i < 6; i++) statuses.push((await post("enquiry.php", operator())).status);
    expect(statuses).toEqual([200, 200, 200, 200, 200, 429]);
  });

  it("checks Turnstile only when a secret is configured", async () => {
    const off = await post("enquiry.php", operator());
    expect(off.status).toBe(200);
    writeConfig(baseConfig({ TURNSTILE_SECRET: "secret" }));
    const missing = await post("enquiry.php", operator());
    expect(missing.status).toBe(400);
    const bad = await post("enquiry.php", operator({ turnstileToken: "not-a-real-token" }));
    expect(bad.status).toBe(400);
    expect(rows("operator_enquiries")).toHaveLength(1);
  });

  it("handles the contact form, with and without a phone", async () => {
    expect((await post("contact.php", contact())).status).toBe(200);
    expect((await post("contact.php", contact({ phoneNational: "0771234567" }))).status).toBe(200);
    const saved = rows("contact_enquiries");
    expect(saved.map((r) => r.phone_e164)).toEqual(expect.arrayContaining([null, "+263771234567"]));
    expect(saved[0]).toMatchObject({ name: "Test Person", enquiry_type: "sales", privacy_notice_version: "2026-10-trackstar" });
    await waitForMail(2);
    expect(smtp.messages[0].data).toMatch(/^Subject: TrackStar contact: Sales from Test Person/im);
    expect(smtp.messages[0].data).toMatch(/^Reply-To: Test Person <test@example\.com>/im);
    const bad = await post("contact.php", contact({ message: "", enquiryType: "zzz" }));
    expect(bad.status).toBe(422);
  });

  it("keeps duplicate enquiries as separate records", async () => {
    await post("enquiry.php", operator());
    await post("enquiry.php", operator());
    expect(rows("operator_enquiries")).toHaveLength(2);
  });

  it("keeps non-ASCII text intact", async () => {
    await post("enquiry.php", operator({ fullName: "Tendai Moyo-Ncube", company: "Zvishavane Café & Safaris ✓", message: "Mhoro, ndinoda ticketing system" }));
    const [saved] = rows("operator_enquiries");
    expect(saved.company).toBe("Zvishavane Café & Safaris ✓");
  });
});

// Used when running outside PHP environments, so the skip is visible in the report.
describe.skipIf(hasPhp)("PHP API over HTTP (skipped: php not installed)", () => {
  it.skip("requires php", () => undefined);
});
