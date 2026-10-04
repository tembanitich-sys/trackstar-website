/** Canonical origin. Unset on preview deployments so they never claim the production URL. */
export const canonicalSiteUrl: string | undefined = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") || undefined;

/** Origin used to resolve relative metadata URLs (Open Graph images and so on). */
export function metadataBaseUrl(): URL {
  if (canonicalSiteUrl) return new URL(canonicalSiteUrl);
  if (process.env.VERCEL_URL) return new URL(`https://${process.env.VERCEL_URL}`);
  return new URL("http://localhost:3000");
}
