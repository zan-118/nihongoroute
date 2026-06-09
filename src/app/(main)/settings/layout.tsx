/**
 * @file layout.tsx
 * @description Layout sekunder untuk grup rute pengaturan (Settings), menyediakan metadata SEO.
 */

// ======================
// IMPOR
// ======================
import type { Metadata } from "next";
import { createPageMetadata } from "@/lib/seo";

// ======================
// KONFIGURASI METADATA
// ======================
export const metadata: Metadata = {
  ...createPageMetadata({
    title: "Pengaturan | NihongoRoute",
    description: "Atur profil, tema tampilan, dan preferensi belajar di NihongoRoute.",
    path: "/settings",
    noIndex: true,
  }),
};

// ======================
// EKSEKUSI UTAMA
// ======================
export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
