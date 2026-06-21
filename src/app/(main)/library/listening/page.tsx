/**
 * @file page.tsx
 * @description Halaman katalog latihan menyimak (Listening Lab) untuk memuat daftar audio interaktif secara dinamis.
 */

// ======================
// IMPOR
// ======================
import { getPaginatedListening } from "@/actions/library.actions";
import ListeningListClient from "@/app/(main)/library/listening/ListeningListClient";
import type { Metadata } from "next";
import { JsonLd } from "@/components/seo/JsonLd";
import {
  breadcrumbJsonLd,
  createPageMetadata,
  learningResourceJsonLd,
} from "@/lib/seo";

// ======================
// METADATA SEO
// ======================
export const metadata: Metadata = {
  ...createPageMetadata({
    title: "Latihan Listening Bahasa Jepang | NihongoRoute",
    description:
      "Pertajam pendengaran bahasa Jepang dengan latihan audio interaktif, transkrip, kuis pemahaman, dan materi choukai sesuai level JLPT.",
    path: "/library/listening",
    keywords: ["listening bahasa Jepang", "choukai JLPT", "latihan menyimak Jepang"],
  }),
};

// ======================
// EKSEKUSI UTAMA
// ======================

/**
 * Halaman utama Latihan Menyimak (Listening Lab) (RSC).
 * Melakukan pra-ambil data halaman pertama daftar latihan menyimak sebelum merender ListeningListClient.
 * 
 * @returns {JSX.Element} Halaman direktori pustaka latihan menyimak.
 */
export default async function ListeningListPage() {
  const initialData = await getPaginatedListening(1, 10, "");

  return (
    <div className="w-full min-h-screen bg-transparent relative overflow-hidden pt-12 pb-24 px-4 md:px-8">
      <JsonLd
        data={[
          breadcrumbJsonLd([
            { name: "Beranda", path: "/" },
            { name: "Pustaka", path: "/library" },
            { name: "Listening", path: "/library/listening" },
          ]),
          learningResourceJsonLd({
            name: "Latihan Listening Bahasa Jepang",
            description: metadata.description as string,
            path: "/library/listening",
            educationalLevel: "JLPT N5-N1",
            teaches: "Menyimak bahasa Jepang",
          }),
        ]}
      />
      {/* Efek Latar Belakang */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-[1000px] h-[500px] bg-primary/10 blur-[120px] rounded-[100%] pointer-events-none opacity-50" />
      <div className="neural-grid" />

      <div className="max-w-5xl mx-auto relative z-10">
        <ListeningListClient initialData={initialData} />
      </div>
    </div>
  );
}
