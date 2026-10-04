import type { MetadataRoute } from "next";
import { canonicalSiteUrl } from "@/lib/env";

export default function robots(): MetadataRoute.Robots {
  // Without a canonical URL (previews, local) nothing should be indexed.
  if (!canonicalSiteUrl) return { rules: { userAgent: "*", disallow: "/" } };
  return {
    rules: { userAgent: "*", allow: "/", disallow: "/admin" },
    sitemap: `${canonicalSiteUrl}/sitemap.xml`,
  };
}
