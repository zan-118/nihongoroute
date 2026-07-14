/**
 * @file page.tsx
 * @description Halaman pembaruan kata sandi (Update Password). Entry point untuk UpdatePasswordClient.
 */

// ======================
// IMPOR
// ======================
import type { Metadata } from "next";
import UpdatePasswordClient from "./UpdatePasswordClient";
import { createPageMetadata } from "@/lib/seo";

// ======================
// KONFIGURASI METADATA
// ======================
/**
 * Metadata for Update Password page.
 * Disables search engine indexing for security.
 */
export const metadata: Metadata = {
  ...createPageMetadata({
    title: "Perbarui Kata Sandi | NihongoRoute",
    description: "Perbarui kata sandi akun NihongoRoute Anda.",
    path: "/update-password",
    noIndex: true,
  }),
};

// ======================
// EKSEKUSI UTAMA
// ======================
/**
 * Page component for password updates.
 * Serves as entry point for client component.
 */
export default function UpdatePasswordPage() {
  // Render client-side password update form
  return <UpdatePasswordClient />;
}