/**
 * @file robots.ts
 * @description Mengatur kebijakan akses untuk web crawler (SEO).
 * Menentukan rute mana yang boleh diindeks oleh mesin pencari.
 * @module Robots
 */

// ======================
// MAIN EXECUTION
// ======================

/**
 * Konfigurasi robots.txt untuk aplikasi.
 * 
 * @returns {Object} Konfigurasi rules dan sitemap.
 */
export default function robots() {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
      },
    ],
    sitemap: "https://www.nihongoroute.my.id/sitemap.xml",
  };
}

