import type { MetadataRoute } from "next";
import { canonicalSiteUrl } from "@/lib/env";

export const dynamic = "force-static";

export default function robots(): MetadataRoute.Robots {
  // Test and preview builds have no canonical URL and must not be indexed.
  if (!canonicalSiteUrl) return { rules: { userAgent: "*", disallow: "/" } };
  return {
    rules: { userAgent: "*", allow: "/", disallow: "/admin" },
    sitemap: `${canonicalSiteUrl}/sitemap.xml`,
  };
}
