import type { NextConfig } from "next";

/**
 * Static export: `npm run build` writes the whole site to out/, ready to upload
 * to ordinary PHP hosting. There is no Node server in production.
 */
const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  images: { unoptimized: true },
};

export default nextConfig;
