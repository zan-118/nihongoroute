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
import { getSentencesByGrammarPattern } from "@/actions/sentences.actions";
import { notFound } from "next/navigation";
import { JsonLd } from "@/components/seo/JsonLd";
import GrammarDetailClient from "@/components/features/grammar/GrammarDetailClient";
import {
  articleJsonLd,
  breadcrumbJsonLd,
  createPageMetadata,
  encodeRouteSegment,
} from "@/lib/seo";

// ======================
// KONFIGURASI RENDERING DINAMIS
// ======================
// Halaman detail tata bahasa di-render secara dinamis untuk menghindari bug platform Vercel
// di mana karakter Unicode (Jepang) dalam parameter rute menyebabkan crash pada
// header HTTP x-next-cache-tags (ERR_INVALID_CHAR) saat menggunakan ISR/SSG.
export const dynamic = "force-dynamic";

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

  return createPageMetadata({
    title: `Belajar Grammar ${article.title} | NihongoRoute`,
    description: article.notes 
      ? `${String(article.notes).slice(0, 150)}...`
      : `Pelajari rumus dan cara penggunaan tata bahasa ${article.title} secara mendalam beserta contoh kalimatnya.`,
    path: `/library/grammar/${encodeRouteSegment(String(article.slug || decodedSlug))}`,
    type: "article",
    keywords: [
      String(article.title || ""),
      String(article.jlptLevel || article.jlpt_level || ""),
      "grammar Jepang",
      "tata bahasa Jepang",
      "bunpou JLPT",
    ].filter(Boolean),
  });
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

  // Ambil kalimat contoh dinamis dari tabel sentences berdasarkan pola grammar
  const grammarPattern = String(article.title || "");
  const dynamicSentences = grammarPattern ? await getSentencesByGrammarPattern(grammarPattern, 4) : [];


  // ======================
  // RENDER UTAMA
  // ======================
  const articlePath = `/library/grammar/${encodeRouteSegment(String(article.slug || decodedSlug))}`;
  const articleDescription =
    article.notes
      ? `${String(article.notes).slice(0, 150)}...`
      : `Pelajari rumus dan cara penggunaan tata bahasa ${article.title} secara mendalam beserta contoh kalimatnya.`;

  return (
    <main className="w-full bg-transparent px-4 md:px-8 lg:px-12 relative overflow-hidden flex flex-col justify-start min-h-screen pb-32 transition-colors duration-300">
      <JsonLd
        data={[
          breadcrumbJsonLd([
            { name: "Beranda", path: "/" },
            { name: "Pustaka", path: "/library" },
            { name: "Tata Bahasa", path: "/library/grammar" },
            { name: String(article.title || "Grammar"), path: articlePath },
          ]),
          articleJsonLd({
            headline: `Belajar Grammar ${article.title}`,
            description: articleDescription,
            path: articlePath,
            datePublished: typeof article.created_at === "string" ? article.created_at : null,
            educationalLevel: String(article.jlptLevel || article.jlpt_level || ""),
          }),
        ]}
      />
      {/* Ambient Background Glows */}
      <div className="absolute top-[10%] -left-[10%] size-[45%] bg-primary/10 blur-[130px] rounded-full pointer-events-none z-0 animate-pulse" />
      <div className="absolute bottom-[10%] -right-[10%] size-[35%] bg-success/5 blur-[130px] rounded-full pointer-events-none z-0" />
      
      {/* Background Neural Overlays */}
      <div className="absolute inset-0 bg-[linear-gradient(rgb(var(--foreground-rgb)/0.01)_1px,transparent_1px),linear-gradient(90deg,rgb(var(--foreground-rgb)/0.01)_1px,transparent_1px)] bg-[size:60px_60px] pointer-events-none z-0" />

      <div className="max-w-4xl mx-auto w-full relative z-10 pt-8 md:pt-16">
        {/* Client Side Detail & TTS Interactions */}
        <GrammarDetailClient article={article} dynamicSentences={dynamicSentences} />
      </div>
    </main>
  );
}
