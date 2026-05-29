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
// KONFIGURASI PRE-RENDERING STATIS (SSG & ISR)
// ======================
// Izinkan Next.js membuat halaman statis baru secara asinkron di latar belakang jika belum di-render saat build
export const dynamicParams = true;

/**
 * Karena teks membaca dinilai bertahap, kita kembalikan array kosong pada saat build
 * agar durasi build Vercel tetap cepat. Halaman graded reading akan di-pre-render secara statis (SSG)
 * secara dinamis di latar belakang (on-demand) begitu pertama kali dikunjungi oleh pengguna.
 */
export async function generateStaticParams() {
  return [];
}

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
