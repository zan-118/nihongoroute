/**
 * @file page.tsx
 * @description Halaman dukungan (Support) NihongoRoute untuk menerima donasi dan transparansi operasional.
 */

// ======================
// IMPOR
// ======================
import type { Metadata } from "next";
import SupportClient from "./SupportClient";
import { createPageMetadata } from "@/lib/seo";

// ======================
// KONFIGURASI METADATA
// ======================
export const metadata: Metadata = {
  ...createPageMetadata({
    title: "Dukung Kami | NihongoRoute",
    description:
      "Dukung NihongoRoute agar tetap berjalan, gratis, terus berkembang, dan tanpa iklan yang mengganggu bagi pelajar bahasa Jepang.",
    path: "/support",
    keywords: ["dukung NihongoRoute", "donasi belajar bahasa Jepang", "platform Jepang gratis"],
  }),
};

// ======================
// EKSEKUSI UTAMA
// ======================
export default function SupportPage() {
  return <SupportClient />;
}
