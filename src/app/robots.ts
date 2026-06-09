/**
 * @file robots.ts
 * @description Mengatur kebijakan akses untuk web crawler (SEO).
 * Menentukan rute mana yang boleh diindeks oleh mesin pencari.
 * @module Robots
 */

// ======================
// EKSEKUSI UTAMA
// ======================

/**
 * Konfigurasi robots.txt untuk aplikasi.
 * 
 * @returns {Object} Konfigurasi rules dan sitemap.
 */
export default function robots() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.nihongoroute.my.id";

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/api/",
          "/studio/",
          "/_next/",
        ],
      },
    ],
    sitemap: `${siteUrl.replace(/\/+$/, "")}/sitemap.xml`,
  };
}
