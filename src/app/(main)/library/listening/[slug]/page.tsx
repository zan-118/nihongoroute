/**
 * @file page.tsx
 * @description Halaman sesi menyimak (Listening Session) dinamis untuk meresolusi materi audio berdasarkan slug.
 */

// ======================
// IMPOR
// ======================
import { getLibraryItemBySlug } from "@/actions/library.actions";
import ListeningPageClient from "./ListeningPageClient";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

// ======================
// KONFIGURASI PRE-RENDERING STATIS (SSG & ISR)
// ======================
// Izinkan Next.js membuat halaman statis baru secara asinkron di latar belakang jika belum di-render saat build
export const dynamicParams = true;

/**
 * Karena modul audio menyimak bertahap, kita kembalikan array kosong pada saat build
 * agar durasi build Vercel tetap cepat. Halaman latihan menyimak akan di-pre-render secara statis (SSG)
 * secara dinamis di latar belakang (on-demand) begitu pertama kali dikunjungi oleh pengguna.
 */
export async function generateStaticParams() {
  return [];
}

// ======================
// METADATA SEO
// ======================

/**
 * Menghasilkan metadata SEO dinamis untuk halaman latihan menyimak spesifik.
 */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const decodedSlug = decodeURIComponent(slug);
  const data = await getLibraryItemBySlug("listening", decodedSlug);
  return {
    title: data ? `${data.title} | Laboratorium Listening NihongoRoute` : "Latihan Listening Choukai | NihongoRoute",
    description: data ? `Latih choukai / pendengaran bahasa Jepang Anda dengan materi percakapan dan kuis interaktif untuk ${data.title}.` : "Laboratorium choukai interaktif dengan klip audio percakapan asli penutur Jepang dan kuis pemahaman.",
  };
}

// ======================
// EKSEKUSI UTAMA
// ======================

/**
 * Halaman detail latihan menyimak (RSC) untuk mengambil data materi audio dari CMS Sanity, kemudian merender modul player ListeningPageClient.
 */
export default async function ListeningPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const decodedSlug = decodeURIComponent(slug);

  const data = await getLibraryItemBySlug("listening", decodedSlug);


  if (!data) {
    notFound();
  }

  return <ListeningPageClient data={data as unknown as import("@/components/features/listening/types").ListeningTaskData} />;
}
