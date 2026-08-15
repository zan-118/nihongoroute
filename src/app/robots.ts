/**
 * @file robots.ts
 * @description Configures web crawler access policies (SEO). Defines routes allowed for search engine indexing.
 * @module Robots
 */

// ==========================================
// Main Execution
// ==========================================

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
  const baseUrl = siteUrl.replace(/\/+$/, "");

  const privateRoutes = [
    "/api/",
    "/auth/",
    "/dashboard",
    "/settings",
    "/review",
    "/onboarding",
    "/update-password",
    "/forgot-password",
    "/share",
  ];

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: privateRoutes,
      },
      // AI Search & Answer Engine Bots - Diizinkan merayap konten edukasi publik
      {
        userAgent: [
          "GPTBot",
          "ChatGPT-User",
          "PerplexityBot",
          "ClaudeBot",
          "anthropic-ai",
          "Google-Extended",
          "Bingbot",
          "Applebot-Extended",
          "cohere-ai",
        ],
        allow: "/",
        disallow: privateRoutes,
      },
    ],
    // Remove trailing slashes from base URL to prevent malformed path.
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  };
}