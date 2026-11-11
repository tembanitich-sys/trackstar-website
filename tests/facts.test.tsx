import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { Footer } from "@/components/Footer";
import { contactDetails, facts as defaultFacts } from "@/content/facts";
import type { FactKey } from "@/content/facts";
import { allOff, allOn, renderHome } from "./helpers";

/** Text that must appear only when the switch is true. */
const homeMarkers: Partial<Record<FactKey, string[]>> = {
  nativeCustomerApp: ["Customer app", "customer app"],
  agentApp: ["Agent app", "your agents"],
  whatsappBooking: ["WhatsApp"],
  ticketAuthenticator: ["Ticket Authenticator"],
  manifests: ["manifests"],
  parcels: ["PARCELS", "luggage and parcels"],
  directToOperatorAccount: ["straight to your own account"],
  operatorOwnsData: ["your data stay yours"],
};

describe("fact switches on the home page", () => {
  for (const [key, markers] of Object.entries(homeMarkers) as [FactKey, string[]][]) {
    it(`${key}: false removes its content, true renders it`, () => {
      const off = renderHome({ facts: { ...allOff } });
      const on = renderHome({ facts: { ...allOff, [key]: true } });
      for (const m of markers) {
        expect(off, `"${m}" must not render when ${key} is false`).not.toContain(m);
      }
      expect(markers.some((m) => on.includes(m)), `${key} true should render its content`).toBe(true);
    });
  }

  it("uses 'mobile booking' wording while nativeCustomerApp is false", () => {
    const html = renderHome({ facts: { ...defaultFacts, nativeCustomerApp: false } });
    expect(html).toContain("mobile booking");
    expect(html).not.toContain("ustomer app");
  });

  it("ships with the confirmed defaults (the native app, payment marks, Ticket Authenticator and each new claim are on)", () => {
    expect(defaultFacts).toEqual({
      nativeCustomerApp: true,
      agentApp: true,
      whatsappBooking: true,
      ticketAuthenticator: true,
      manifests: true,
      parcels: false,
      directToOperatorAccount: false,
      operatorOwnsData: false,
      showPaymentMarks: true,
      worksOffline: true,
      bankPayments: true,
      instantSettlement: true,
      realtimeView: true,
      lessCashHandling: true,
      showContactPhones: false,
      showAddress: false,
    });
  });
});

describe("contact switches in the footer", () => {
  const phones = ["+263 000 000 000"];
  it("hides phones and address when false and shows them when true", () => {
    contactDetails.phones.push(...phones);
    contactDetails.address = "1 Test Street";
    try {
      const off = renderToStaticMarkup(<Footer facts={allOff} />);
      const on = renderToStaticMarkup(<Footer facts={allOn} />);
      expect(off).not.toContain("tel:");
      expect(off).not.toContain("1 Test Street");
      expect(on).toContain("tel:+263000000000");
      expect(on).toContain("1 Test Street");
    } finally {
      contactDetails.phones.length = 0;
      contactDetails.address = "";
    }
  });
});
