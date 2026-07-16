/**
 * @file robots.ts
 * @description Mengatur kebijakan akses untuk web crawler (SEO).
 * Menentukan rute mana yang boleh diindeks oleh mesin pencari.
 * @module Robots
 */

// ======================
// EKSEKUSI UTAMA
// ======================

import { MetadataRoute } from "next";

/**
 * Generates robots.txt configuration.
 * Controls search engine crawler access.
 * 
 * @returns Robots configuration object.
 */
export default function robots(): MetadataRoute.Robots {
  // Fallback to production domain if env variable missing.
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://nihongoroute.my.id";

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/api/",
          "/studio/",
        ],
      },
    ],
    // Remove trailing slashes from base URL to prevent malformed path.
    sitemap: `${siteUrl.replace(/\/+$/, "")}/sitemap.xml`,
  };
}