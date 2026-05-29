/**
 * @file page.tsx
 * @description Halaman detail Kanji (Kanji Detail).
 * Menampilkan animasi goresan, cara baca, mnemonic, dan kosakata terkait.
 * @module KanjiDetailPage
 */

// ======================
// IMPOR
// ======================
import { Metadata } from "next";
import { getLibraryItemBySlug } from "@/actions/library.actions";
import { notFound } from "next/navigation";
import Link from "next/link";
import { fullyDecode } from "@/lib/utils";
import { 
  ChevronLeft, 
  Home,
  Library,
  Languages
} from "lucide-react";
import { Button } from "@/components/ui/button";

// Komponen Pendukung
import { KanjiStrokeHero } from "@/components/features/kanji/detail/KanjiStrokeHero";
import { KanjiReadings } from "@/components/features/kanji/detail/KanjiReadings";
import { KanjiRadicals } from "@/components/features/kanji/detail/KanjiRadicals";
import { KanjiMnemonic } from "@/components/features/kanji/detail/KanjiMnemonic";
import { KanjiRelatedVocab } from "@/components/features/kanji/detail/KanjiRelatedVocab";

// ======================
// KONFIGURASI RENDERING DINAMIS
// ======================
// Halaman detail kanji di-render secara dinamis untuk menghindari bug platform Vercel
// di mana karakter Unicode (Jepang) dalam parameter rute menyebabkan crash pada
// header HTTP x-next-cache-tags (ERR_INVALID_CHAR) saat menggunakan ISR/SSG.
export const dynamic = "force-dynamic";

// ======================
// METADATA SEO
// ======================

/**
 * Menghasilkan metadata SEO dinamis untuk halaman detail karakter Kanji.
 */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const decodedId = fullyDecode(id);
  const kanji = await getLibraryItemBySlug("kanji", decodedId);

  if (!kanji) {
    return {
      title: "Kanji Tidak Ditemukan | NihongoRoute",
    };
  }

  return {
    title: `${kanji.character} (${kanji.meaning}) | NihongoRoute`,
    description: `Pelajari cara menulis, cara baca, dan mnemonic untuk kanji ${kanji.character}.`,
  };
}

// ======================
// EKSEKUSI UTAMA
// ======================

/**
 * Halaman detail karakter kanji (RSC) untuk mengambil data kanji dari database, 
 * kemudian merender hero goresan, readings Onyomi/Kunyomi, radikal, mnemonic, dan kosakata terkait.
 */
export default async function KanjiDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const decodedId = fullyDecode(id);
  const kanji = await getLibraryItemBySlug("kanji", decodedId);

  if (!kanji) notFound();

  return (
    <main className="w-full bg-background px-4 md:px-8 lg:px-12 relative overflow-hidden flex flex-col justify-start min-h-screen pb-32 transition-colors duration-300">
      {/* Ambient Background Glows */}
      <div className="absolute top-[5%] -left-[10%] size-[45%] bg-secondary/10 blur-[130px] rounded-full pointer-events-none z-0 animate-pulse" />
      <div className="absolute bottom-[20%] -right-[15%] size-[35%] bg-primary/5 blur-[130px] rounded-full pointer-events-none z-0" />
      
      {/* Background Grid Overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(var(--foreground-rgb),0.01)_1px,transparent_1px),linear-gradient(90deg,rgba(var(--foreground-rgb),0.01)_1px,transparent_1px)] bg-[size:60px_60px] pointer-events-none z-0" />

      <div className="max-w-6xl mx-auto w-full relative z-10 pt-8 md:pt-16">
        {/* Breadcrumbs */}
        <nav className="mb-10 md:mb-16 flex flex-wrap items-center gap-2 md:gap-4 text-[10px] md:text-xs font-black text-muted-foreground uppercase tracking-[0.2em]">
          <Link href="/dashboard" className="hover:text-primary transition-all flex items-center gap-1.5 md:gap-2 group">
            <Home size={14} aria-hidden="true" className="group-hover:scale-110 transition-transform" /> 
            <span className="hidden sm:inline">Beranda</span>
          </Link>
          <span className="opacity-20">/</span>
          <Link href="/library" className="hover:text-primary transition-all flex items-center gap-1.5 md:gap-2 group">
            <Library size={14} aria-hidden="true" className="group-hover:scale-110 transition-transform" /> 
            <span className="hidden sm:inline">Pustaka</span>
          </Link>
          <span className="opacity-20">/</span>
          <Link href="/library/kanji" className="hover:text-primary transition-all flex items-center gap-1.5 md:gap-2 group">
            <Languages size={14} aria-hidden="true" className="group-hover:scale-110 transition-transform" /> 
            <span className="hidden sm:inline">Kanji</span>
          </Link>
          <span className="opacity-20">/</span>
          <span className="text-primary flex items-center gap-1.5 md:gap-2 drop-shadow-[0_0_10px_rgba(var(--primary-rgb),0.3)]">
            {kanji.character}
          </span>
        </nav>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 auto-rows-[minmax(0,auto)] animate-in fade-in slide-in-from-bottom-8 duration-1000 ease-out">
          {/* 1. Stroke & Visual Bento (Fokus Utama) */}
          <KanjiStrokeHero 
            id={kanji.id || kanji._id || ""}
            character={kanji.character || ""} 
            strokeOrderSvg={kanji.strokeOrderSvg || undefined} 
            meaning={kanji.meaning || ""} 
            jlpt={kanji.jlpt_level || undefined} 
          />

          {/* 2 & 3. Onyomi & Kunyomi */}
          <KanjiReadings 
            onyomi={kanji.onyomi || undefined} 
            kunyomi={kanji.kunyomi || undefined} 
          />

          {/* 4. Radicals Bento (Akar Kata) */}
          <KanjiRadicals radicals={kanji.radicals || undefined} />

          {/* 5. Mnemonic Bento (Jembatan Keledai) */}
          <KanjiMnemonic 
            mnemonics={kanji.mnemonics || undefined} 
            wordId={kanji.character || ""}
          />

          {/* 6. Related Context Bento (Kosakata Terkait) */}
          <KanjiRelatedVocab relatedVocab={kanji.relatedVocab || undefined} />
        </div>

        {/* Footer Actions */}
        <footer className="mt-20 pt-16 border-t border-border flex flex-col md:flex-row items-center justify-between gap-8">
          <Link href="/library/kanji" className="w-full md:w-auto">
            <Button variant="ghost" className="w-full px-10 py-8 h-auto text-[11px] md:text-xs font-black uppercase tracking-[0.2em] rounded-2xl bg-muted/30 border border-border hover:bg-muted/50 hover:border-primary/30 transition-all gap-4 group shadow-none">
              <ChevronLeft size={20} className="group-hover:-translate-x-2 transition-transform" aria-hidden="true" /> Kembali ke Daftar Kanji
            </Button>
          </Link>
        </footer>
      </div>
    </main>
  );
}
