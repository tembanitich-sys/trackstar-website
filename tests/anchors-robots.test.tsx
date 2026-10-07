import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { HomeView } from "@/components/home/HomeView";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { facts } from "@/content/facts";

describe("form anchor", () => {
  const home = renderToStaticMarkup(<HomeView status="prelaunch" />);

  it("is #get-busrep everywhere, with no link left on the old name", () => {
    const all = home + renderToStaticMarkup(<Header />) + renderToStaticMarkup(<Footer facts={facts} />);
    expect(all).toContain("#get-busrep");
    expect(all).not.toMatch(/href="[^"]*#get-trackstar"/);
  });

  it("keeps the old id on the same section, so shared links still land there", () => {
    expect(home.match(/id="get-busrep"/g)).toHaveLength(1);
    expect(home.match(/id="get-trackstar"/g)).toHaveLength(1);
    const section = home.slice(home.indexOf('id="get-busrep"'));
    // the old id sits inside the form section, before its content
    expect(section.indexOf('id="get-trackstar"')).toBeLessThan(section.indexOf('id="get-title"'));
  });
});

describe("robots.txt", () => {
  it("has no stale /admin rule in production and blocks everything otherwise", async () => {
    vi.resetModules();
    vi.doMock("@/lib/env", () => ({ canonicalSiteUrl: "https://www.example.test" }));
    const open = (await import("@/app/robots")).default();
    expect(JSON.stringify(open)).not.toContain("admin");
    expect(open.rules).toEqual({ userAgent: "*", allow: "/" });
    vi.resetModules();
    vi.doMock("@/lib/env", () => ({ canonicalSiteUrl: undefined }));
    expect((await import("@/app/robots")).default().rules).toEqual({ userAgent: "*", disallow: "/" });
    vi.doUnmock("@/lib/env");
    vi.resetModules();
  });
});
