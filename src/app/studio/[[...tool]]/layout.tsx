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
/**
 * Metadata for Sanity Studio page.
 * Sets title and description for CMS portal.
 */
export const metadata: Metadata = {
  title: "NihongoRoute Sanity Studio",
  description: "Portal manajemen konten editorial CMS NihongoRoute.",
};

// ======================
// EKSEKUSI UTAMA
// ======================
/**
 * Layout component for Sanity Studio.
 * Wraps studio pages. Prevents global layout interference.
 * 
 * @param props - Component properties.
 * @param props.children - Child elements to render.
 * @returns Rendered children wrapped in fragment.
 */
export default function StudioLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Render children directly. Avoids wrapping studio in root layout styles.
  return <>{children}</>;
}