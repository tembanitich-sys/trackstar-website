import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { ContactForm } from "@/components/forms/ContactForm";
import { EnquiryForm } from "@/components/forms/EnquiryForm";
import { hashIp } from "@/lib/security";
import { toE164 } from "@/lib/phone";
import { processContactEnquiry, processOperatorEnquiry } from "@/lib/enquiries/process";
import type { Deps } from "@/lib/enquiries/process";
import { parseOperatorEnquiry } from "@/lib/enquiries/validation";

const NOW = new Date("2026-10-05T08:00:00.000Z");

function operatorForm(overrides: Record<string, string | null> = {}): FormData {
  const base: Record<string, string> = {
    fullName: "Test Person",
    company: "Test Coaches",
    mobileCountry: "ZW",
    mobileNational: "077 123 4567",
    email: "test@example.com",
    country: "ZW",
    fleetSize: "6-15",
    helpType: "need_system",
    currentTicketing: "none",
    currentSystemName: "",
    message: "",
    privacyAck: "on",
  };
  const fd = new FormData();
  for (const [k, v] of Object.entries({ ...base, ...overrides })) if (v !== null) fd.set(k, v);
  return fd;
}

function contactForm(overrides: Record<string, string | null> = {}): FormData {
  const base: Record<string, string> = {
    name: "Test Person",
    email: "test@example.com",
    phoneCountry: "ZW",
    phoneNational: "",
    enquiryType: "general",
    message: "Hello",
    privacyAck: "on",
  };
  const fd = new FormData();
  for (const [k, v] of Object.entries({ ...base, ...overrides })) if (v !== null) fd.set(k, v);
  return fd;
}

function makeDeps(over: Partial<Deps> = {}) {
  const calls: string[] = [];
  const deps: Deps = {
    verifyTurnstile: async () => true,
    allowRequest: async () => true,
    insertOperator: vi.fn(async () => (calls.push("insert"), "op-1")),
    insertContact: vi.fn(async () => (calls.push("insert"), "ct-1")),
    sendEmail: vi.fn(async () => void calls.push("email")),
    log: vi.fn(),
    now: () => NOW,
    ...over,
  };
  return { deps, calls };
}

describe("phone numbers", () => {
  it("normalises a Zimbabwe number to E.164", () => {
    expect(toE164("077 123 4567", "ZW")).toBe("+263771234567");
    expect(toE164("0771234567", "ZW")).toBe("+263771234567");
  });

  it("uses the selected country", () => {
    expect(toE164("082 123 4567", "ZA")).toBe("+27821234567");
  });

  it("rejects invalid numbers", () => {
    expect(toE164("123", "ZW")).toBeNull();
    expect(toE164("", "ZW")).toBeNull();
    expect(toE164("0771234567", "XX")).toBeNull();
  });

  it("stores E.164 on the operator record and rejects bad numbers", async () => {
    const { deps } = makeDeps();
    expect((await processOperatorEnquiry(operatorForm(), deps)).status).toBe("success");
    expect(deps.insertOperator).toHaveBeenCalledWith(expect.objectContaining({ phoneE164: "+263771234567" }));

    const bad = await processOperatorEnquiry(operatorForm({ mobileNational: "12" }), makeDeps().deps);
    expect(bad.status).toBe("error");
    expect(bad.fieldErrors?.mobile).toMatch(/valid mobile number/);
  });

  it("makes the contact phone optional but validates it when given", async () => {
    const { deps } = makeDeps();
    expect((await processContactEnquiry(contactForm(), deps)).status).toBe("success");
    expect(deps.insertContact).toHaveBeenCalledWith(expect.objectContaining({ phoneE164: null }));

    const bad = await processContactEnquiry(contactForm({ phoneNational: "12" }), makeDeps().deps);
    expect(bad.fieldErrors?.phone).toBeDefined();
    const good = makeDeps();
    await processContactEnquiry(contactForm({ phoneNational: "0771234567" }), good.deps);
    expect(good.deps.insertContact).toHaveBeenCalledWith(expect.objectContaining({ phoneE164: "+263771234567" }));
  });
});

describe("consent", () => {
  it("defaults marketing consent to false with no timestamp", () => {
    const r = parseOperatorEnquiry(operatorForm(), NOW);
    expect(r.ok && r.data.marketingConsent).toBe(false);
    expect(r.ok && r.data.marketingConsentAt).toBeNull();
  });

  it("records the timestamp when the marketing box is ticked", () => {
    const r = parseOperatorEnquiry(operatorForm({ marketingConsent: "on" }), NOW);
    expect(r.ok && r.data.marketingConsent).toBe(true);
    expect(r.ok && r.data.marketingConsentAt).toEqual(NOW);
  });

  it("requires the privacy acknowledgement and stores the notice version", () => {
    const missing = parseOperatorEnquiry(operatorForm({ privacyAck: null }), NOW);
    expect(missing.ok).toBe(false);
    expect(!missing.ok && missing.fieldErrors.privacyAck).toBeDefined();
    const ok = parseOperatorEnquiry(operatorForm(), NOW);
    expect(ok.ok && ok.data.privacyNoticeVersion).toBe("2026-10-trackstar");
  });

  it("only keeps the system name when the operator has their own system", () => {
    const own = parseOperatorEnquiry(operatorForm({ currentTicketing: "own_system", currentSystemName: "Acme" }), NOW);
    expect(own.ok && own.data.currentSystemName).toBe("Acme");
    const none = parseOperatorEnquiry(operatorForm({ currentTicketing: "none", currentSystemName: "Acme" }), NOW);
    expect(none.ok && none.data.currentSystemName).toBeNull();
  });
});

describe("submission pipeline", () => {
  it("stores before it emails", async () => {
    const { deps, calls } = makeDeps();
    expect((await processOperatorEnquiry(operatorForm(), deps)).status).toBe("success");
    expect(calls).toEqual(["insert", "email"]);
  });

  it("email failure is logged and still shows success", async () => {
    const { deps } = makeDeps({ sendEmail: vi.fn(async () => Promise.reject(new Error("resend down"))) });
    const state = await processOperatorEnquiry(operatorForm(), deps);
    expect(state.status).toBe("success");
    expect(deps.insertOperator).toHaveBeenCalledTimes(1);
    expect(deps.log).toHaveBeenCalledWith(expect.stringContaining("email failed"), "resend down");
  });

  it("does not report success when the record could not be stored, and sends no email", async () => {
    const { deps } = makeDeps({ insertOperator: vi.fn(async () => Promise.reject(new Error("db down"))) });
    const state = await processOperatorEnquiry(operatorForm(), deps);
    expect(state.status).toBe("error");
    expect(deps.sendEmail).not.toHaveBeenCalled();
  });

  it("keeps what the visitor typed when a server-side step fails", async () => {
    const msg = { message: "keep me" };
    const cases = [
      makeDeps({ allowRequest: async () => false }),
      makeDeps({ verifyTurnstile: async () => false }),
      makeDeps({ insertOperator: vi.fn(async () => Promise.reject(new Error("db down"))) }),
    ];
    for (const { deps } of cases) {
      const state = await processOperatorEnquiry(operatorForm(msg), deps);
      expect(state.status).toBe("error");
      expect(state.values?.message).toBe("keep me");
    }
  });

  it("stops at the rate limit and at a failed Turnstile check before storing", async () => {
    const limited = makeDeps({ allowRequest: async () => false });
    expect((await processOperatorEnquiry(operatorForm(), limited.deps)).status).toBe("error");
    expect(limited.deps.insertOperator).not.toHaveBeenCalled();

    const bot = makeDeps({ verifyTurnstile: async () => false });
    expect((await processContactEnquiry(contactForm(), bot.deps)).status).toBe("error");
    expect(bot.deps.insertContact).not.toHaveBeenCalled();
  });

  it("keeps duplicate enquiries as separate records", async () => {
    const { deps } = makeDeps();
    await processOperatorEnquiry(operatorForm(), deps);
    await processOperatorEnquiry(operatorForm(), deps);
    expect(deps.insertOperator).toHaveBeenCalledTimes(2);
  });

  it("returns field messages and echoes values on validation errors, without touching the database", async () => {
    const { deps } = makeDeps();
    const state = await processOperatorEnquiry(operatorForm({ email: "nope", company: "" }), deps);
    expect(state.status).toBe("error");
    expect(state.fieldErrors?.email).toBeDefined();
    expect(state.fieldErrors?.company).toBeDefined();
    expect(state.values?.fullName).toBe("Test Person");
    expect(deps.insertOperator).not.toHaveBeenCalled();
  });

  it("validates before touching the rate limiter, Turnstile or the database", async () => {
    const allow = vi.fn(async () => true);
    const verify = vi.fn(async () => true);
    const { deps } = makeDeps({ allowRequest: allow, verifyTurnstile: verify });
    await processOperatorEnquiry(operatorForm({ mobileNational: "1" }), deps);
    expect(allow).not.toHaveBeenCalled();
    expect(verify).not.toHaveBeenCalled();
  });

  it("sends the enquiry to the team with reply-to set to the enquirer", async () => {
    const { deps } = makeDeps();
    await processOperatorEnquiry(operatorForm({ message: "Hi\nthere" }), deps);
    const sent = vi.mocked(deps.sendEmail).mock.calls[0][0];
    expect(sent.replyTo).toBe("test@example.com");
    expect(sent.subject).not.toMatch(/[\r\n]/);
    expect(sent.text).toContain("+263771234567");
    expect(sent.text).toContain("Hi\nthere");
  });
});

describe("IP hashing", () => {
  it("is stable and never contains the raw address", () => {
    const hash = hashIp("203.0.113.9");
    expect(hash).toBe(hashIp("203.0.113.9"));
    expect(hash).not.toBe(hashIp("203.0.113.10"));
    expect(hash).not.toContain("203.0.113.9");
  });
});

describe("form markup", () => {
  it("submits through a server action with enabled buttons", () => {
    const op = renderToStaticMarkup(<EnquiryForm helpDefault="demo" />);
    const ct = renderToStaticMarkup(<ContactForm />);
    for (const html of [op, ct]) {
      expect(html).toMatch(/<form[^>]*action=/);
      expect(html).not.toMatch(/<button[^>]*\sdisabled(=|\s|>)/);
    }
    expect(op).toMatch(/<option value="demo" selected/);
  });

  it("names the phone fields the server expects", () => {
    const op = renderToStaticMarkup(<EnquiryForm helpDefault="need_system" />);
    const ct = renderToStaticMarkup(<ContactForm />);
    expect(op).toContain('name="mobileNational"');
    expect(op).toContain('name="mobileCountry"');
    expect(ct).toContain('name="phoneNational"');
    expect(ct).toContain('name="phoneCountry"');
  });
});
