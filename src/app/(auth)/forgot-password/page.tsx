/**
 * @file page.tsx
 * @description Halaman pemulihan kata sandi (Lupa Kata Sandi). Entry point untuk ForgotPasswordClient.
 */

// ======================
// IMPOR
// ======================
import type { Metadata } from "next";
import ForgotPasswordView from "@/features/auth/ForgotPasswordView";
import { createPageMetadata } from "@/lib/seo";

// ======================
// KONFIGURASI METADATA
// ======================
/**
 * Page metadata. Disable search indexing.
 */
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
/**
 * Forgot password page. Render client form.
 */
export default function ForgotPasswordPage() {
  // Render client component wrapper
  return <ForgotPasswordView />;
}