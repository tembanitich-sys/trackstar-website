import type { MetadataRoute } from "next";
import { productName } from "@/content/site";

export const dynamic = "force-static";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: productName,
    short_name: productName,
    start_url: "/",
    display: "browser",
    theme_color: "#153B4E",
    background_color: "#FFFFFF",
    icons: [
      { src: "/brand/icon-192-maskable.png", sizes: "192x192", type: "image/png", purpose: "maskable" },
      { src: "/brand/icon-512-maskable.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
      { src: "/brand/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
    ],
  };
}
