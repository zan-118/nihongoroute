/**
 * @file page.tsx
 * @description Halaman detail panduan tata bahasa (Grammar Detail). 
 * Menampilkan konten artikel tata bahasa menggunakan Portable Text.
 * @module GrammarDetailPage
 */

// ======================
// IMPOR
// ======================
import { Metadata } from "next";
import { getLibraryItemBySlug } from "@/actions/library.actions";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Home, Library, BookOpen } from "lucide-react";
import GrammarDetailClient from "@/components/features/grammar/GrammarDetailClient";

// ======================
// KONFIGURASI PRE-RENDERING STATIS (SSG & ISR)
// ======================
// Izinkan Next.js membuat halaman statis baru secara asinkron di latar belakang jika belum di-render saat build
export const dynamicParams = true;

/**
 * Karena pola tata bahasa cukup banyak, kita kembalikan array kosong pada saat build
 * agar durasi build Vercel tetap cepat. Halaman tata bahasa akan di-pre-render secara statis (SSG)
 * secara dinamis di latar belakang (on-demand) begitu pertama kali dikunjungi oleh pengguna.
 */
export async function generateStaticParams() {
  return [];
}

// ======================
// METADATA SEO
// ======================

/**
 * Menghasilkan metadata SEO dinamis untuk halaman detail tata bahasa Jepang (Bunpou).
 */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const decodedSlug = decodeURIComponent(slug);
  
  const article = await getLibraryItemBySlug("grammar", decodedSlug);

  if (!article) {
    return {
      title: "Grammar Tidak Ditemukan | NihongoRoute",
      description: "Halaman panduan tata bahasa Jepang yang Anda cari tidak tersedia atau telah dipindahkan.",
    };
  }

  return {
    title: `Belajar Grammar ${article.title} | NihongoRoute`,
    description: article.notes 
      ? article.notes.slice(0, 150) + "..."
      : `Pelajari rumus dan cara penggunaan tata bahasa ${article.title} secara mendalam beserta contoh kalimatnya.`,
  };
}

// ======================
// EKSEKUSI UTAMA
// ======================

/**
 * Halaman detail tata bahasa Jepang (RSC) untuk mengambil data satu materi grammar dan menyajikan detail penjelasannya.
 */
export default async function GrammarDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const decodedSlug = decodeURIComponent(slug);

  // ======================
  // OPERASI DATABASE
  // ======================
  const article = await getLibraryItemBySlug("grammar", decodedSlug);
  if (!article) notFound();


  // ======================
  // RENDER UTAMA
  // ======================
  return (
    <main className="w-full bg-background px-4 md:px-8 lg:px-12 relative overflow-hidden flex flex-col justify-start min-h-screen pb-32 transition-colors duration-300">
      {/* Ambient Background Glows */}
      <div className="absolute top-[10%] -left-[10%] size-[45%] bg-primary/10 blur-[130px] rounded-full pointer-events-none z-0 animate-pulse" />
      <div className="absolute bottom-[10%] -right-[10%] size-[35%] bg-success/5 blur-[130px] rounded-full pointer-events-none z-0" />
      
      {/* Background Neural Overlays */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(var(--foreground-rgb),0.01)_1px,transparent_1px),linear-gradient(90deg,rgba(var(--foreground-rgb),0.01)_1px,transparent_1px)] bg-[size:60px_60px] pointer-events-none z-0" />

      <div className="max-w-4xl mx-auto w-full relative z-10 pt-8 md:pt-16">
        {/* Semantic Breadcrumbs */}
        <nav className="mb-10 md:mb-16 flex flex-wrap items-center gap-2 md:gap-4 text-[10px] md:text-xs font-black text-muted-foreground uppercase tracking-[0.2em] select-none">
          <Link href="/dashboard" className="hover:text-primary transition-all flex items-center gap-1.5 md:gap-2 group">
            <Home size={14} className="group-hover:scale-110 transition-transform" /> Beranda
          </Link>
          <span className="opacity-25">/</span>
          <Link href="/library" className="hover:text-primary transition-all flex items-center gap-1.5 md:gap-2 group">
            <Library size={14} className="group-hover:scale-110 transition-transform" /> Pustaka
          </Link>
          <span className="opacity-25">/</span>
          <Link href="/library/grammar" className="hover:text-primary transition-all flex items-center gap-1.5 md:gap-2 group">
            <BookOpen size={14} className="group-hover:scale-110 transition-transform" /> Tata Bahasa
          </Link>
          <span className="opacity-25">/</span>
          <span className="text-primary flex items-center gap-1.5 md:gap-2 drop-shadow-[0_0_10px_rgba(var(--primary-rgb),0.3)] truncate max-w-[150px] md:max-w-none">
            {article.title}
          </span>
        </nav>

        {/* Client Side Detail & TTS Interactions */}
        <GrammarDetailClient article={article} />
      </div>
    </main>
  );
}
