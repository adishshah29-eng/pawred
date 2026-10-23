import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  experimental: {
    serverActions: {
      // Photos are shrunk in the browser before upload; this leaves room for
      // a few photos or one 4 MB document per request (Vercel's cap is ~4.5 MB).
      bodySizeLimit: "4.4mb",
    },
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "images.dog.ceo" }, // seed dog photos
      // Uploaded dog photos (Supabase Storage, public bucket)
      { protocol: "https", hostname: "cfbtybwpomdjbdntyiyr.supabase.co", pathname: "/storage/v1/object/public/**" },
    ],
  },
  turbopack: {
    rules: {
      // Only the global stylesheet goes through Tailwind, so *.module.css keeps CSS Module behaviour.
      "globals.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
