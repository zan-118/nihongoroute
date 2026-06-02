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
  serverExternalPackages: ["kuroshiro", "kuroshiro-analyzer-kuromoji", "msedge-tts", "isomorphic-ws", "ws"],
  experimental: {
    optimizePackageImports: [
      "lucide-react",
      "@radix-ui/react-dialog",
      "@radix-ui/react-dropdown-menu",
      "@radix-ui/react-select",
      "@radix-ui/react-switch",
      "@radix-ui/react-progress",
    ],
  },
  logging: {
    fetches: {
      fullUrl: true,
    },
  },
};

export default nextConfig;
