/**
 * @file page.tsx
 * @description Halaman autentikasi (Masuk & Daftar) NihongoRoute. Entry point untuk LoginClient.
 */

// ======================
// IMPOR
// ======================
import type { Metadata } from "next";
import LoginClient from "./LoginClient";

// ======================
// KONFIGURASI METADATA
// ======================
export const metadata: Metadata = {
  title: "Masuk & Daftar | NihongoRoute",
  description: "Masuk ke akun NihongoRoute Anda untuk melanjutkan petualangan belajar bahasa Jepang.",
};

// ======================
// EKSEKUSI UTAMA
// ======================
export default function LoginPage() {
  return <LoginClient />;
}
