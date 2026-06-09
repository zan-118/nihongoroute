/**
 * @file page.tsx
 * @description Halaman berbagi progres dan sertifikat kelulusan ujian NihongoRoute.
 */

// ======================
// IMPOR
// ======================
import type { Metadata } from "next";
import ShareClient from "./ShareClient";
import { createPageMetadata } from "@/lib/seo";

// ======================
// KONFIGURASI METADATA
// ======================
export const metadata: Metadata = {
  ...createPageMetadata({
    title: "Berbagi Progres | NihongoRoute",
    description: "Lihat dan bagikan pencapaian serta progres belajar bahasa Jepang Anda di NihongoRoute.",
    path: "/share",
    noIndex: true,
  }),
};

// ======================
// EKSEKUSI UTAMA
// ======================
export default function SharePage() {
  return <ShareClient />;
}
