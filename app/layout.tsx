import type { Metadata, Viewport } from "next";
import { Nunito, Nunito_Sans } from "next/font/google";
import { facts, instaTicketsStatus } from "@/content/facts";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { UtmCapture } from "@/components/forms/Utm";
import { TopStrip } from "@/components/TopStrip";
import { JsonLd, organizationJsonLd } from "@/lib/jsonld";
import { isIndexable, metadataBaseUrl, productionOrigin } from "@/lib/env";
import { brandColors } from "@/content/brand";
import { productName, seo } from "@/content/site";
import "./globals.css";

// Fonts are fetched from Google Fonts at build time and served from this site (nothing is requested from Google by visitors).
const nunito = Nunito({ subsets: ["latin"], weight: ["600", "700", "800", "900"], variable: "--font-nunito", display: "swap" });
const nunitoSans = Nunito_Sans({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  variable: "--font-nunito-sans",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: metadataBaseUrl(),
  title: { default: seo.title, template: `%s | ${productName}` },
  description: seo.description,
  robots: isIndexable ? undefined : { index: false, follow: false },
  // Exactly the markup suggested in brand/BRAND.md: favicon.svg, favicon.ico, apple-touch-icon, site.webmanifest.
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon.ico", sizes: "any" },
    ],
    apple: "/apple-touch-icon.png",
  },
  manifest: "/site.webmanifest",
  openGraph: {
    type: "website",
    siteName: productName,
    title: seo.title,
    description: seo.description,
    // Absolute URL on the live domain, so link previews work from any build.
    images: [{ url: `${productionOrigin}/og-image.png`, width: 1200, height: 630, alt: productName }],
  },
  twitter: { card: "summary_large_image", title: seo.title, description: seo.description, images: [`${productionOrigin}/og-image.png`] },
};

export const viewport: Viewport = { themeColor: brandColors.navy, width: "device-width", initialScale: 1 };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${nunito.variable} ${nunitoSans.variable}`}>
      <body className="min-h-screen">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-white focus:px-4 focus:py-3 focus:font-semibold focus:text-navy"
        >
          Skip to content
        </a>
        <TopStrip status={instaTicketsStatus} />
        <Header />
        <main id="main">{children}</main>
        <Footer facts={facts} />
        <JsonLd data={organizationJsonLd(facts)} />
        <UtmCapture />
      </body>
    </html>
  );
}
