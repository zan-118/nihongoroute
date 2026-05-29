/**
 * @file page.tsx
 * @description Halaman dukungan (Support) NihongoRoute untuk menerima donasi dan transparansi operasional.
 */

// ======================
// IMPOR
// ======================
import type { Metadata } from "next";
import SupportClient from "./SupportClient";

// ======================
// KONFIGURASI METADATA
// ======================
export const metadata: Metadata = {
  title: "Dukung Kami | NihongoRoute",
  description: "Dukungan Anda sangat berarti agar NihongoRoute tetap berjalan, gratis, terus berkembang, dan tanpa iklan yang mengganggu bagi para pejuang bahasa Jepang.",
};

// ======================
// EKSEKUSI UTAMA
// ======================
export default function SupportPage() {
  return <SupportClient />;
}
