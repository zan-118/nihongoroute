import withPWAInit from "@ducanh2912/next-pwa";
import type { NextConfig } from "next";

const withPWA = withPWAInit({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
  workboxOptions: {
    additionalManifestEntries: [
      { url: "/logo-branding.svg", revision: "1" },
      { url: "/logo-branding.png", revision: "1" },
      { url: "/manifest.json", revision: "1" },
      { url: "/fonts/NotoSansJP-Bold.ttf", revision: "1" },
      { url: "/fonts/NotoSansJP-Regular.ttf", revision: "1" },
    ],
    maximumFileSizeToCacheInBytes: 5242880, // 5MB
    skipWaiting: true,
    clientsClaim: true,
    cleanupOutdatedCaches: true,
    runtimeCaching: [
      {
        urlPattern: /^https:\/\/cdn\.sanity\.io\/.*/i,
        handler: "StaleWhileRevalidate",
        options: {
          cacheName: "sanity-assets",
          expiration: {
            maxEntries: 100,
            maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
          },
        },
      },
      {
        urlPattern: /^https:\/\/.*\.supabase\.co\/.*/i,
        handler: "NetworkFirst",
        options: {
          cacheName: "supabase-api",
          networkTimeoutSeconds: 5,
        },
      },
      {
        urlPattern: /\.(?:eot|otf|ttc|ttf|woff|woff2|font.css)$/i,
        handler: "CacheFirst",
        options: {
          cacheName: "static-fonts",
          expiration: {
            maxEntries: 10,
            maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year
          },
        },
      },
    ],
  },
});

const nextConfig: NextConfig = {
  reactStrictMode: true,
  compiler: {
    styledComponents: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.sanity.io",
      },
    ],
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  devIndicators: {
    position: 'top-right',
  },
  transpilePackages: ["@react-pdf/renderer"],
};

export default withPWA(nextConfig);
