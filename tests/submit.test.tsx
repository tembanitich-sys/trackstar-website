import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { ContactForm } from "@/components/forms/ContactForm";
import { EnquiryFormBody } from "@/components/forms/EnquiryForm";
import { contactEmail } from "@/content/site";
import { buildPayload, postForm } from "@/lib/submit";

function formData(entries: Record<string, string>): FormData {
  const fd = new FormData();
  for (const [k, v] of Object.entries(entries)) fd.set(k, v);
  return fd;
}

function reply(body: unknown, init: ResponseInit = {}): typeof fetch {
  return vi.fn(async () => new Response(typeof body === "string" ? body : JSON.stringify(body), init)) as unknown as typeof fetch;
}

describe("buildPayload", () => {
  it("turns checkboxes into booleans and sends unticked ones as false", () => {
    expect(buildPayload(formData({ fullName: "A", privacyAck: "on" }))).toEqual({
      fullName: "A",
      privacyAck: true,
      marketingConsent: false,
    });
  });

  it("maps the Turnstile field to turnstileToken and keeps the honeypot", () => {
    const payload = buildPayload(formData({ "cf-turnstile-response": "tok", website: "" }));
    expect(payload.turnstileToken).toBe("tok");
    expect(payload).toHaveProperty("website", "");
  });
});

describe("postForm", () => {
  it("POSTs JSON to the given endpoint", async () => {
    const doFetch = reply({ ok: true });
    await postForm("/api/enquiry.php", formData({ fullName: "A" }), doFetch);
    const [url, init] = vi.mocked(doFetch).mock.calls[0];
    expect(url).toBe("/api/enquiry.php");
    expect(init?.method).toBe("POST");
    expect((init?.headers as Record<string, string>)["Content-Type"]).toBe("application/json");
    expect(JSON.parse(String(init?.body))).toMatchObject({ fullName: "A", privacyAck: false });
  });

  it("maps success", async () => {
    expect(await postForm("/x", formData({}), reply({ ok: true }))).toEqual({ status: "success" });
  });

  it("maps field errors and messages", async () => {
    const state = await postForm(
      "/x",
      formData({}),
      reply({ ok: false, message: "Please check the highlighted fields.", fieldErrors: { mobile: "bad" } }, { status: 422 }),
    );
    expect(state).toEqual({
      status: "error",
      message: "Please check the highlighted fields.",
      fieldErrors: { mobile: "bad" },
    });
  });

  it("adds the public contact address to messages about a server problem", async () => {
    const state = await postForm("/x", formData({}), reply({ ok: false, message: "Sorry, something went wrong." }, { status: 500 }));
    expect(state.message).toBe(`Sorry, something went wrong. Or email ${contactEmail}.`);
    const limited = await postForm("/x", formData({}), reply({ ok: false, message: "Too many requests." }, { status: 429 }));
    expect(limited.message).toBe("Too many requests.");
  });

  it("shows a friendly error when the server is unreachable or does not answer with JSON", async () => {
    const down = (async () => Promise.reject(new TypeError("offline"))) as unknown as typeof fetch;
    const offline = await postForm("/x", formData({}), down);
    expect(offline.status).toBe("error");
    expect(offline.message).toContain(contactEmail);

    const html404 = await postForm("/x", formData({}), reply("<html>Not found</html>", { status: 404 }));
    expect(html404.status).toBe("error");
    expect(html404.message).toContain(contactEmail);
  });
});

describe("form markup", () => {
  const operator = renderToStaticMarkup(<EnquiryFormBody helpDefault="need_system" />);
  const contact = renderToStaticMarkup(<ContactForm />);

  it("does not post anywhere by itself (JSON is sent with fetch)", () => {
    for (const html of [operator, contact]) {
      expect(html).not.toMatch(/<form[^>]*\saction=/);
      expect(html).not.toMatch(/<button[^>]*\sdisabled(=|\s|>)/);
    }
  });

  it("names the fields the PHP scripts expect", () => {
    for (const name of ["fullName", "company", "mobileCountry", "mobileNational", "email", "country", "fleetSize", "helpType", "currentTicketing", "message", "marketingConsent", "privacyAck", "website"]) {
      expect(operator).toContain(`name="${name}"`);
    }
    for (const name of ["name", "email", "phoneCountry", "phoneNational", "enquiryType", "message", "privacyAck", "website"]) {
      expect(contact).toContain(`name="${name}"`);
    }
  });

  it("includes the honeypot out of sight and out of the tab order", () => {
    for (const html of [operator, contact]) {
      expect(html).toMatch(/<input[^>]*name="website"[^>]*tabindex="-1"|<input[^>]*tabindex="-1"[^>]*name="website"/i);
      expect(html).toContain('aria-hidden="true"');
    }
  });
});
