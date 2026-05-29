/**
 * @file page.tsx
 * @description Halaman detail graded reading (Dokkai) dinamis untuk meresolusi materi membaca berdasarkan slug.
 */

// ======================
// IMPOR
// ======================
import { getLibraryItemBySlug } from "@/actions/library.actions";
import ReadingPageClient from "./ReadingPageClient";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

// ======================
// KONFIGURASI RENDERING DINAMIS
// ======================
// Halaman detail bacaan di-render secara dinamis untuk menghindari bug platform Vercel
// di mana karakter Unicode (Jepang) dalam parameter rute menyebabkan crash pada
// header HTTP x-next-cache-tags (ERR_INVALID_CHAR) saat menggunakan ISR/SSG.
export const dynamic = "force-dynamic";

// ======================
// METADATA SEO
// ======================

/**
 * Menghasilkan metadata SEO dinamis untuk halaman graded reading tertentu.
 */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const decodedSlug = decodeURIComponent(slug);
  const data = await getLibraryItemBySlug("reading", decodedSlug);
  return {
    title: data ? `${data.title} | Graded Reading NihongoRoute` : "Latihan Membaca Dokkai | NihongoRoute",
    description: data ? `Tingkatkan kemampuan membaca dokkai bahasa Jepang Anda dengan teks interaktif ber-furigana untuk ${data.title}.` : "Koleksi teks membaca bahasa Jepang terlengkap dengan furigana dinamis, daftar kosakata terjemahan, dan latihan pemahaman.",
  };
}

// ======================
// EKSEKUSI UTAMA
// ======================

/**
 * Halaman detail graded reading (RSC) untuk memuat artikel membaca dari Sanity CMS, kemudian merender reader ReadingPageClient.
 */
export default async function ReadingPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const decodedSlug = decodeURIComponent(slug);

  const data = await getLibraryItemBySlug("reading", decodedSlug);


  if (!data) {
    notFound();
  }

  return <ReadingPageClient data={data as unknown as import("@/components/features/reading/types").ReadingData} />;
}
