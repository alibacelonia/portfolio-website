import type { NextConfig } from "next";

// Static export only: the site is served from a private S3 bucket through CloudFront.
// Do not add features that need a server runtime (API routes, Server Actions, middleware, ISR).
const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  poweredByHeader: false,
  reactStrictMode: true,
};

export default nextConfig;
