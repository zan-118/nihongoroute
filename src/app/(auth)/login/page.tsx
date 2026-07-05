/**
 * @file page.tsx
 * @description Halaman autentikasi (Masuk & Daftar) NihongoRoute. Entry point untuk LoginClient.
 */

// ======================
// IMPOR
// ======================
import type { Metadata } from "next";
import LoginClient from "./LoginClient";
import { createPageMetadata } from "@/lib/seo";

// ======================
// KONFIGURASI METADATA
// ======================
export const metadata: Metadata = {
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
export default function LoginPage() {
  return <LoginClient />;
}
