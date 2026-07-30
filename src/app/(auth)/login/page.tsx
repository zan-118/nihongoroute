/**
 * @file page.tsx
 * @description Halaman autentikasi (Masuk & Daftar) NihongoRoute. Entry point untuk LoginClient.
 */

// ======================
// IMPOR
// ======================
import type { Metadata } from "next";
import LoginView from "@/features/auth/LoginView";
import { createPageMetadata } from "@/lib/seo";

// ======================
// KONFIGURASI METADATA
// ======================
/**
 * Metadata for login page.
 * Disable search indexing. Set SEO title and description.
 */
export const metadata: Metadata = {
  // Generate base SEO metadata.
  ...createPageMetadata({
    title: "Masuk & Daftar | NihongoRoute",
    description: "Masuk ke akun NihongoRoute Anda untuk melanjutkan petualangan belajar bahasa Jepang.",
    path: "/login",
    noIndex: true,
  }),
};

// ======================
// EKSEKUSI UTAMA
// ======================
/**
 * Login page entry point.
 * Render client-side login interface.
 */
export default function LoginPage() {
  return <LoginView />;
}