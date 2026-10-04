import type { Metadata, Viewport } from "next";
import { Nunito, Nunito_Sans } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { facts } from "@/content/facts";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { TopStrip } from "@/components/TopStrip";
import { JsonLd, organizationJsonLd } from "@/lib/jsonld";
import { canonicalSiteUrl, metadataBaseUrl } from "@/lib/env";
import { getInstaTicketsStatus } from "@/lib/status";
import { seo } from "@/content/site";
import "./globals.css";

const nunito = Nunito({ subsets: ["latin"], weight: ["700", "800"], variable: "--font-nunito", display: "swap" });
const nunitoSans = Nunito_Sans({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  variable: "--font-nunito-sans",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: metadataBaseUrl(),
  title: { default: seo.title, template: "%s | TrackStar" },
  description: seo.description,
  alternates: canonicalSiteUrl ? { canonical: canonicalSiteUrl } : undefined,
  icons: {
    icon: [
      { url: "/brand/icon.svg", type: "image/svg+xml" },
      { url: "/brand/icon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/brand/icon-16.png", sizes: "16x16", type: "image/png" },
      { url: "/brand/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: "/brand/apple-touch-icon.png",
  },
  openGraph: {
    type: "website",
    siteName: "TrackStar",
    title: seo.title,
    description: seo.description,
    images: [{ url: "/brand/og-image.png", width: 1200, height: 630, alt: "TrackStar" }],
  },
  twitter: { card: "summary_large_image", title: seo.title, description: seo.description, images: ["/brand/og-image.png"] },
};

export const viewport: Viewport = { themeColor: "#153B4E", width: "device-width", initialScale: 1 };

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const status = await getInstaTicketsStatus();
  return (
    <html lang="en" className={`${nunito.variable} ${nunitoSans.variable}`}>
      <body className="min-h-screen">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-white focus:px-4 focus:py-3 focus:font-semibold focus:text-navy"
        >
          Skip to content
        </a>
        <TopStrip status={status} />
        <Header />
        <main id="main">{children}</main>
        <Footer facts={facts} />
        <JsonLd data={organizationJsonLd(facts)} />
        <Analytics />
      </body>
    </html>
  );
}
