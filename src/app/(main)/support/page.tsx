/**
 * @file page.tsx
 * @description Halaman Server Component untuk Dukungan (Support) NihongoRoute.
 * Menyediakan konfigurasi SEO Metadata dan JSON-LD Structured Data.
 * @module SupportPage
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
import { getSupporters } from "@/actions/support.actions";

// ======================
// METADATA & DATA SEO
// ======================
export const metadata: Metadata = {
  ...createPageMetadata({
    title: "Dukung Kami | NihongoRoute",
    description:
      "Dukung NihongoRoute agar tetap berjalan gratis, 100% tanpa iklan, dan terus berkembang untuk seluruh pelajar bahasa Jepang di Indonesia.",
    path: "/support",
    keywords: [
      "dukung NihongoRoute",
      "donasi belajar bahasa Jepang",
      "platform Jepang gratis",
      "saweria nihongoroute",
      "trakteer nihongoroute",
    ],
  }),
};

const supportFaqs = [
  {
    question: "Apakah NihongoRoute akan selalu gratis dan bebas iklan?",
    answer:
      "Pasti! NihongoRoute berkomitmen memberikan akses belajar bahasa Jepang yang setara, modern, dan 100% bebas dari iklan banner atau popup yang mengganggu fokus.",
  },
  {
    question: "Ke mana seluruh dana dukungan saya disalurkan?",
    answer:
      "100% dana dukungan Anda digunakan secara transparan untuk membiayai infrastruktur cloud server, CDN audio TTS, domain, serta pengayaan materi latihan JLPT.",
  },
  {
    question: "Apakah ada batas minimum untuk memberikan dukungan?",
    answer:
      "Tidak ada batas minimum. Sekecil apa pun dukungan Anda sangat berarti untuk memastikan server latihan harian tetap aktif tanpa kendala.",
  },
  {
    question: "Bagaimana jika saya ingin berkontribusi kode atau materi?",
    answer:
      "Kami sangat terbuka untuk kolaborasi! Anda dapat mengunjungi repositori GitHub terbuka kami atau menghubungi pengembang untuk berkontribusi.",
  },
];

// ======================
// EKSEKUSI UTAMA
// ======================
/**
 * SupportPage component.
 * Async Server Component that fetches supporters from Supabase and passes to SupportClient.
 */
export default async function SupportPage() {
  const initialSupporters = await getSupporters();

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
      <SupportClient initialSupporters={initialSupporters} />
    </>
  );
}