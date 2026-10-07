import siteConfig from "../site.config.json";

/** The live site, from the domain in site.config.json. Absolute URLs that must work anywhere (social previews) use this. */
export const productionOrigin = `https://www.${siteConfig.domain}`;

/**
 * Where this build will be hosted (set by scripts/package.mjs from site.config.json),
 * for example https://www.<domain> or https://new.<domain>.
 * Used to resolve social-sharing image URLs.
 */
const origin = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") || undefined;

/** Only the production build is indexable: canonical tag, sitemap and open robots.txt. */
export const isIndexable = process.env.NEXT_PUBLIC_INDEXABLE === "true" && origin !== undefined;

/** Canonical origin. Undefined on test and preview builds so they never claim the production URL. */
export const canonicalSiteUrl: string | undefined = isIndexable ? origin : undefined;

export function metadataBaseUrl(): URL {
  if (origin) return new URL(origin);
  if (process.env.VERCEL_URL) return new URL(`https://${process.env.VERCEL_URL}`);
  return new URL("http://localhost:3000");
}
