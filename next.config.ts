import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // All prototype photography is checked into /public (see scripts/fetch_images.py).
    // Remote patterns are listed so real listing photos can be swapped in later
    // without another config change.
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "upload.wikimedia.org" },
    ],
    formats: ["image/avif", "image/webp"],
  },
  experimental: {
    optimizePackageImports: ["@/components/icons"],
  },
};

export default nextConfig;
