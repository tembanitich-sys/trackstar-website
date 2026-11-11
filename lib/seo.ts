import type { Metadata } from "next";
import { canonicalSiteUrl } from "./env";

/** Canonical link for one page (path like "/contact/"). Only the production build has one. */
export function canonical(path: string): Metadata["alternates"] {
  return canonicalSiteUrl ? { canonical: `${canonicalSiteUrl}${path}` } : undefined;
}
