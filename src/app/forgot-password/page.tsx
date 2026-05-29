/**
 * @file page.tsx
 * @description Halaman pemulihan kata sandi (Lupa Kata Sandi). Entry point untuk ForgotPasswordClient.
 */

// ======================
// IMPOR
// ======================
import type { Metadata } from "next";
import ForgotPasswordClient from "./ForgotPasswordClient";

// ======================
// KONFIGURASI METADATA
// ======================
export const metadata: Metadata = {
  title: "Lupa Kata Sandi | NihongoRoute",
  description: "Lupa kata sandi Anda? Kirim tautan pemulihan kata sandi ke email terdaftar Anda untuk membuat kata sandi baru.",
};

// ======================
// EKSEKUSI UTAMA
// ======================
export default function ForgotPasswordPage() {
  return <ForgotPasswordClient />;
}
