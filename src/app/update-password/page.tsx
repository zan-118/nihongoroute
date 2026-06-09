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
export default function UpdatePasswordPage() {
  return <UpdatePasswordClient />;
}
