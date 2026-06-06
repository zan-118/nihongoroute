/**
 * @file page.tsx
 * @description Halaman indeks daftar materi membaca (Reading List) NihongoRoute.
 * Mengambil data awal dari Sanity CMS dan mendelegasikan rendering ke ReadingListClient.
 */

// ======================
// IMPOR
// ======================
import { getPaginatedReading } from "@/actions/library.actions";
import ReadingListClient from "./ReadingListClient";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

// ======================
// METADATA SEO
// ======================
export const metadata: Metadata = {
  title: "Graded Reading | NihongoRoute",
  description: "Tingkatkan kemampuan membaca Anda dengan teks interaktif yang disesuaikan dengan level JLPT Anda.",
};

// ======================
// EKSEKUSI UTAMA
// ======================

/**
 * Halaman utama Graded Reading (RSC).
 * Melakukan pra-ambil data halaman pertama daftar bacaan sebelum merender ReadingListClient.
 * 
 * @returns {JSX.Element} Halaman direktori pustaka graded reading.
 */
export default async function ReadingListPage() {
  const initialData = await getPaginatedReading(1, 9, "");

  return (
    <div className="w-full min-h-screen bg-background relative overflow-hidden pt-12 pb-24 px-4 md:px-8">
      {/* Efek Latar Belakang */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-[1000px] h-[500px] bg-primary/10 blur-[120px] rounded-[100%] pointer-events-none opacity-50" />
      <div className="neural-grid" />

      <div className="max-w-6xl mx-auto relative z-10">
        <ReadingListClient initialData={initialData} />
      </div>
    </div>
  );
}
