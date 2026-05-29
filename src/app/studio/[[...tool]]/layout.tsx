/**
 * @file layout.tsx
 * @description Layout untuk Sanity Studio. Membungkus halaman studio dengan metadata minimal.
 */

// ======================
// IMPOR
// ======================
import type { Metadata } from "next";

// ======================
// METADATA
// ======================
export const metadata: Metadata = {
  title: "NihongoRoute Sanity Studio",
  description: "Portal manajemen konten editorial CMS NihongoRoute.",
};

// ======================
// EKSEKUSI UTAMA
// ======================
export default function StudioLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
