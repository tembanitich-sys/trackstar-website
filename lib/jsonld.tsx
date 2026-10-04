import { contactDetails } from "@/content/facts";
import type { Facts } from "@/content/facts";
import { contactEmail } from "@/content/site";
import { canonicalSiteUrl } from "./env";

export function organizationJsonLd(facts: Facts) {
  const data: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "TrackStar",
    description:
      "A ticketing and transport management platform for bus operators, a Bullion Technologies product.",
    email: contactEmail,
    parentOrganization: { "@type": "Organization", name: "Bullion Technologies" },
  };
  if (canonicalSiteUrl) {
    data.url = canonicalSiteUrl;
    data.logo = `${canonicalSiteUrl}/brand/icon-512.png`;
  }
  if (facts.showAddress && contactDetails.address) {
    data.address = { "@type": "PostalAddress", streetAddress: contactDetails.address };
  }
  return data;
}

export function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
    />
  );
}
