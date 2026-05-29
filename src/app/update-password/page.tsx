/**
 * @file page.tsx
 * @description Halaman pembaruan kata sandi (Update Password). Entry point untuk UpdatePasswordClient.
 */

// ======================
// IMPOR
// ======================
import type { Metadata } from "next";
import UpdatePasswordClient from "./UpdatePasswordClient";

// ======================
// KONFIGURASI METADATA
// ======================
export const metadata: Metadata = {
  title: "Perbarui Kata Sandi | NihongoRoute",
  description: "Perbarui kata sandi akun NihongoRoute Anda untuk menjaga keamanan akun belajar bahasa Jepang Anda.",
};

// ======================
// EKSEKUSI UTAMA
// ======================
export default function UpdatePasswordPage() {
  return <UpdatePasswordClient />;
}
