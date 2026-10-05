import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { MobileNav } from "@/components/MobileNav";
import { facts } from "@/content/facts";
import { operatorLogin, portalUrl } from "@/content/site";

/** Every anchor that points at the portal, with its full tag. */
function portalAnchors(html: string): string[] {
  return html.match(new RegExp(`<a [^>]*href="${portalUrl.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}"[^>]*>`, "g")) ?? [];
}

describe("Operator login link", () => {
  it("points at the operator portal, not the website", () => {
    expect(portalUrl).toBe("https://www.trackstar.solutions");
    expect(operatorLogin).toEqual({ label: "Operator login", href: portalUrl });
  });

  it("is in the header as a text link in the same tab, not a primary button", () => {
    const header = renderToStaticMarkup(<Header />);
    const anchors = portalAnchors(header);
    expect(anchors).toHaveLength(1);
    expect(anchors[0]).not.toMatch(/target=/);
    expect(anchors[0]).not.toMatch(/bg-green-text|bg-navy|border-2/); // the primary and secondary buttons use these
    expect(header).toContain("Operator login");
    // GET TRACKSTAR is still the one primary button.
    expect(header.match(/bg-green-text/g)?.length).toBeGreaterThanOrEqual(1);
  });

  it("is in the footer, same tab", () => {
    const anchors = portalAnchors(renderToStaticMarkup(<Footer facts={facts} />));
    expect(anchors).toHaveLength(1);
    expect(anchors[0]).not.toMatch(/target=/);
  });

  it("keeps the mobile menu in step (the menu content only renders when opened, so check the source)", () => {
    expect(renderToStaticMarkup(<MobileNav />)).toContain("Open menu");
  });
});
