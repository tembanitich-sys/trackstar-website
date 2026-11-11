import type { MetadataRoute } from "next";
import { canonicalSiteUrl } from "@/lib/env";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  if (!canonicalSiteUrl) return [];
  return ["/", "/contact/", "/privacy/"].map((path) => ({ url: `${canonicalSiteUrl}${path}` }));
}
