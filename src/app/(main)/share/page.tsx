/**
 * @file page.tsx
 * @description Halaman berbagi progres dan sertifikat kelulusan ujian NihongoRoute.
 */

// ======================
// IMPOR
// ======================
import type { Metadata } from "next";
import ShareClient from "./ShareClient";

// ======================
// KONFIGURASI METADATA
// ======================
export const metadata: Metadata = {
  title: "Berbagi Progres | NihongoRoute",
  description: "Lihat dan bagikan pencapaian serta progres belajar bahasa Jepang Anda di NihongoRoute.",
};

// ======================
// EKSEKUSI UTAMA
// ======================
export default function SharePage() {
  return <ShareClient />;
}
