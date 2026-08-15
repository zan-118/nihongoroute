"use client";

/**
 * @file CloudflareAnalytics.tsx
 * @description Komponen client untuk memuat Cloudflare Web Analytics.
 * Menggantikan Vercel Analytics untuk deployment Cloudflare Workers.
 */

import Script from "next/script";

/**
 * CloudflareAnalytics component.
 * Loads Cloudflare Web Analytics beacon script.
 * 
 * @returns JSX element rendering the script tag.
 */
export default function CloudflareAnalytics() {
  // TODO: Tambahkan token beacon dari Cloudflare dashboard setelah deployment
  const token = process.env.NEXT_PUBLIC_CF_BEACON_TOKEN;

  if (!token) return null;

  return (
    <Script
      src="https://static.cloudflareinsights.com/beacon.min.js"
      data-cf-beacon={`{"token": "${token}"}`}
      strategy="lazyOnload"
    />
  );
}
