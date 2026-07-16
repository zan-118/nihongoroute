/**
 * @file page.tsx
 * @description Halaman dukungan (Support) NihongoRoute untuk menerima donasi dan transparansi operasional.
 */

// ======================
// IMPOR
// ======================
import type { Metadata } from "next";
import SupportClient from "./SupportClient";
import { JsonLd } from "@/components/seo/JsonLd";
import {
  breadcrumbJsonLd,
  createPageMetadata,
  faqPageJsonLd,
} from "@/lib/seo";

// ======================
// KONFIGURASI METADATA
// ======================
/**
 * Metadata configuration for Support page.
 * Sets SEO title, description, path, and keywords.
 */
export const metadata: Metadata = {
  ...createPageMetadata({
    title: "Dukung Kami | NihongoRoute",
    description:
      "Dukung NihongoRoute agar tetap berjalan, gratis, terus berkembang, dan tanpa iklan yang mengganggu bagi pelajar bahasa Jepang.",
    path: "/support",
    keywords: ["dukung NihongoRoute", "donasi belajar bahasa Jepang", "platform Jepang gratis"],
  }),
};

// Mock FAQ data matching Client Component for search engine indexing
const supportFaqs = [
  {
    question: "Apakah NihongoRoute akan selalu gratis dan bebas iklan?",
    answer: "Pasti! NihongoRoute berkomitmen kasih akses belajar yang setara, modern, dan 100% bebas iklan yang ganggu fokus.",
  },
  {
    question: "Ke mana seluruh dana dukungan saya disalurkan?",
    answer: "100% dukunganmu dipakai buat bayar biaya server, hosting, domain, dan biaya rekaman audio dari penutur asli Jepang.",
  },
  {
    question: "Bagaimana jika saya ingin berkontribusi kode atau materi?",
    answer: "Boleh banget! Langsung aja cek repositori GitHub kami, atau hubungi pengembang lewat menu kontak buat mulai kolaborasi.",
  },
  {
    question: "Apakah ada batas minimum untuk memberikan dukungan?",
    answer: "Nggak ada batas minimum. Berapapun dukunganmu, sangat berarti buat jaga server review harian tetap jalan.",
  },
];

// ======================
// EKSEKUSI UTAMA
// ======================
/**
 * SupportPage component.
 * Server component wrapper that renders SupportClient.
 */
export default function SupportPage() {
  // Render client-side support page UI
  return (
    <>
      <JsonLd
        data={[
          breadcrumbJsonLd([
            { name: "Beranda", path: "/" },
            { name: "Dukung Kami", path: "/support" },
          ]),
          faqPageJsonLd(supportFaqs),
        ]}
      />
      <SupportClient />
    </>
  );
}