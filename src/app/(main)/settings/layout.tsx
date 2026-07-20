/**
 * @file layout.tsx
 * @description Layout sekunder untuk grup rute pengaturan (Settings), menyediakan metadata SEO.
 */

// ======================
// IMPOR
// ======================
import type { Metadata } from "next";
import { createPageMetadata } from "@/lib/seo";

import { ROUTES } from "@/lib/core/routes";
// ======================
// KONFIGURASI METADATA
// ======================
/**
 * Metadata for settings page. Prevent search engine indexing.
 */
export const metadata: Metadata = {
  // Generate SEO metadata. Set noIndex true to hide settings from search engines.
  ...createPageMetadata({
    title: "Pengaturan | NihongoRoute",
    description: "Atur profil, tema tampilan, dan preferensi belajar di NihongoRoute.",
    path:ROUTES.SETTINGS,
    noIndex: true,
  }),
};

// ======================
// EKSEKUSI UTAMA
// ======================
/**
 * Layout component for settings route. Render children directly.
 */
export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  return children;
}