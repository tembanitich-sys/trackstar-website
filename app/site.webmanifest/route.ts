import { brandColors } from "@/content/brand";
import { productName } from "@/content/site";

export const dynamic = "force-static";

/**
 * Served at /site.webmanifest, the address brand/BRAND.md uses. Same content as brand/icons/site.webmanifest,
 * except the name comes from the product-name setting instead of being typed here a second time.
 */
export function GET() {
  const manifest = {
    name: productName,
    short_name: productName,
    icons: [
      { src: "/android-chrome-192.png", sizes: "192x192", type: "image/png" },
      { src: "/android-chrome-512.png", sizes: "512x512", type: "image/png" },
    ],
    theme_color: brandColors.navy,
    background_color: brandColors.white,
    display: "standalone",
  };
  return new Response(JSON.stringify(manifest, null, 2) + "\n", {
    headers: { "Content-Type": "application/manifest+json" },
  });
}
