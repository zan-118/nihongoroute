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

import { ROUTES } from "@/lib/core/routes";
// ======================
// KONFIGURASI METADATA
// ======================
/**
 * Metadata for Share page.
 * Disable search indexing via noIndex.
 */
export const metadata: Metadata = {
  ...createPageMetadata({
    title: "Berbagi Progres | NihongoRoute",
    description: "Lihat dan bagikan pencapaian serta progres belajar bahasa Jepangmu di NihongoRoute.",
    path:ROUTES.SHARE,
    noIndex: true,
  }),
};

// ======================
// EKSEKUSI UTAMA
// ======================
/**
 * Share page entry point.
 * Render ShareClient component.
 */
export default function SharePage() {
  return <ShareClient />;
}