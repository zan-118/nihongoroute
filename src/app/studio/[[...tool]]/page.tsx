/**
 * @file page.tsx
 * @description Halaman portal CMS Sanity Studio untuk manajemen konten editorial NihongoRoute.
 * Dikonfigurasi agar tidak diindeks oleh mesin pencari (robots: noindex).
 */

// ======================
// IMPOR
// ======================
import type { Metadata, Viewport } from "next";
import StudioClient from "./StudioClient";

// ======================
// METADATA & VIEWPORT
// ======================
export const metadata: Metadata = {
  title: "NihongoRoute Sanity Studio",
  description: "CMS NihongoRoute Studio untuk mengelola kurikulum, ujian, cheatsheet, pelajaran membaca (dokkai), dan mendengarkan (choukai).",
  robots: {
    index: false,
    follow: false,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

// ======================
// EKSEKUSI UTAMA
// ======================
export default function StudioPage() {
  return <StudioClient />;
}
