/**
 * @file page.tsx
 * @description Halaman pemulihan kata sandi (Lupa Kata Sandi). Entry point untuk ForgotPasswordClient.
 */

// ======================
// IMPOR
// ======================
import type { Metadata } from "next";
import ForgotPasswordClient from "./ForgotPasswordClient";
import { createPageMetadata } from "@/lib/seo";

// ======================
// KONFIGURASI METADATA
// ======================
export const metadata: Metadata = {
  ...createPageMetadata({
    title: "Lupa Kata Sandi | NihongoRoute",
    description: "Kirim tautan pemulihan kata sandi ke email terdaftar Anda.",
    path: "/forgot-password",
    noIndex: true,
  }),
};

// ======================
// EKSEKUSI UTAMA
// ======================
export default function ForgotPasswordPage() {
  return <ForgotPasswordClient />;
}
