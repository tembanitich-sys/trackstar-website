import type { MetadataRoute } from "next";
import { canonicalSiteUrl } from "@/lib/env";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = canonicalSiteUrl ?? "http://localhost:3000";
  return ["", "/contact", "/privacy"].map((path) => ({ url: `${base}${path}` }));
}
