import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "hubqetausiziocdlbdmd.supabase.co",
      },
      {
        protocol: "https",
        hostname: "res.cloudinary.com", // Keep for legacy, but we'll mainly use Sanity
      },
      {
        protocol: "https",
        hostname: "cdn.sanity.io",
      },
    ],
  },
  devIndicators: {
    position: 'top-right',
  },
  transpilePackages: ["@react-pdf/renderer"],
  logging: {
    fetches: {
      fullUrl: true,
    },
  },
};

export default nextConfig;
