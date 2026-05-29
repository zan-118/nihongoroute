/**
 * @file page.tsx
 * @description Halaman detail kosakata (Vocab Detail).
 * Menampilkan informasi mendalam tentang kata, termasuk contoh, mnemonic, dan konjugasi.
 * @module VocabDetailPage
 */

// ======================
// IMPOR
// ======================
import { Metadata } from "next";
import { getLibraryItemBySlug } from "@/actions/library.actions";
import { notFound } from "next/navigation";
import Link from "next/link";
import { 
  ChevronLeft, 
  Home, 
  Library, 
  Book
} from "lucide-react";
import { Button } from "@/components/ui/button";

// Komponen Pendukung
import { VocabHero } from "@/components/features/library/vocab/detail/VocabHero";
import { VocabDetails } from "@/components/features/library/vocab/detail/VocabDetails";
import { VocabNotes } from "@/components/features/library/vocab/detail/VocabNotes";
import { VocabConjugation } from "@/components/features/library/vocab/detail/VocabConjugation";
import { VocabExamples } from "@/components/features/library/vocab/detail/VocabExamples";
import { VocabRelated } from "@/components/features/library/vocab/detail/VocabRelated";

// ======================
// ANTARMUKA
// ======================
interface VocabExampleItem {
  jp?: string;
  japanese?: string;
  id?: string;
  indonesian?: string;
  furigana?: string;
  romaji?: string;
  meaning?: string;
}

interface VocabKanjiRef {
  id?: string;
  _id?: string;
  character: string;
  meaning: string;
  onyomi: string;
  kunyomi: string;
  slug: string;
}

interface VocabRef {
  id?: string;
  _id?: string;
  word: string;
  meaning: string;
  romaji?: string;
  slug?: string;
}

// ======================
// KONFIGURASI PRE-RENDERING STATIS (SSG & ISR)
// ======================
// Izinkan Next.js membuat halaman statis baru secara asinkron di latar belakang jika belum di-render saat build
export const dynamicParams = true;

/**
 * Karena data kosakata sangat masif (~36.000 data), kita kembalikan array kosong pada saat build
 * agar durasi build Vercel tetap cepat. Halaman kosakata akan di-pre-render secara statis (SSG)
 * secara dinamis di latar belakang (on-demand) begitu pertama kali dikunjungi oleh pengguna.
 */
export async function generateStaticParams() {
  return [];
}

// ======================
// METADATA SEO
// ======================

/**
 * Menghasilkan metadata SEO dinamis untuk halaman detail kosakata bahasa Jepang.
 */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const decodedId = decodeURIComponent(id);

  const vocab = await getLibraryItemBySlug("vocab", decodedId);

  if (!vocab) {
    return {
      title: "Kosakata Tidak Ditemukan | NihongoRoute",
    };
  }

  const romajiStr = typeof vocab.romaji === "string" ? vocab.romaji : "";
  return {
    title: `${vocab.word || ""} (${vocab.meaning || ""}) | NihongoRoute Kosakata`,
    description: `Pelajari arti, cara baca, dan penggunaan kata ${vocab.word || ""} (${romajiStr}) dalam bahasa Jepang.`,
  };
}

// ======================
// EKSEKUSI UTAMA
// ======================

/**
 * Halaman detail kosakata (RSC) untuk mengambil informasi detail leksem dari database,
 * kemudian merender modul bento hero kosakata, radikal, mnemonic, konjugasi, dan contoh kalimat.
 */
export default async function VocabDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const decodedId = decodeURIComponent(id);

  const vocab = await getLibraryItemBySlug("vocab", decodedId);

  if (!vocab) return notFound();

  const hinshiList = Array.isArray(vocab.hinshi)
    ? vocab.hinshi.map((h: string) => h.toLowerCase())
    : (typeof vocab.hinshi === "string" ? [vocab.hinshi.toLowerCase()] : []);

  const isAdjective = hinshiList.some((h: string) => h.includes("adjective"));
  const isVerb = hinshiList.some((h: string) => h.includes("verb"));

  return (
    <main className="w-full bg-background px-4 md:px-8 lg:px-12 relative overflow-hidden flex flex-col justify-start min-h-screen pb-32 transition-colors duration-300">
      {/* Ambient Background Glows */}
      <div className="absolute top-[10%] -left-[10%] size-[40%] bg-primary/10 blur-[120px] rounded-full pointer-events-none z-0 animate-pulse" />
      <div className="absolute bottom-[10%] -right-[10%] size-[30%] bg-secondary/5 blur-[120px] rounded-full pointer-events-none z-0" />
      
      {/* Background Grid Overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(var(--foreground-rgb),0.01)_1px,transparent_1px),linear-gradient(90deg,rgba(var(--foreground-rgb),0.01)_1px,transparent_1px)] bg-[size:60px_60px] pointer-events-none z-0" />

      <div className="max-w-5xl mx-auto w-full relative z-10 pt-8 md:pt-16">
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
          <Link href="/library/vocab" className="hover:text-primary transition-all flex items-center gap-1.5 md:gap-2 group">
            <Book size={14} aria-hidden="true" className="group-hover:scale-110 transition-transform" /> 
            <span className="hidden sm:inline">Kosakata</span>
          </Link>
          <span className="opacity-20">/</span>
          <span className="text-primary flex items-center gap-1.5 md:gap-2 drop-shadow-[0_0_10px_rgba(var(--primary-rgb),0.3)]">
            {vocab.word}
          </span>
        </nav>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 auto-rows-[minmax(0,auto)]">
          {/* 1. Hero Bento (Fokus Utama) */}
          <VocabHero 
            word={vocab.word || ""} 
            furigana={typeof vocab.furigana === "string" ? vocab.furigana : undefined} 
            romaji={typeof vocab.romaji === "string" ? vocab.romaji : undefined} 
            meaning={vocab.meaning || ""} 
          />

          {/* 2. Meta Data Bento (Atribut Kata) */}
          <VocabDetails 
            hinshi={typeof vocab.hinshi === "string" ? vocab.hinshi : undefined} 
            jlptLevel={vocab.jlptLevel || undefined} 
            pitchAccent={vocab.pitchAccent || undefined} 
          />

          {/* 3. Mnemonic & Notes Bento */}
          <VocabNotes 
            wordId={vocab.word || ""}
            mnemonic={typeof vocab.mnemonic === "string" ? vocab.mnemonic : undefined} 
            usageNotes={vocab.usageNotes || undefined} 
          />

          {/* 4. Conjugation Bento (Jika Kata Sifat atau Kata Kerja) */}
          <VocabConjugation 
            isAdjective={isAdjective}
            isVerb={isVerb}
            conjugations={vocab.conjugations as Record<string, string> | null | undefined}
          />

          {/* 5. Examples Bento */}
          <VocabExamples examples={vocab.examples as VocabExampleItem[] | undefined} />

          {/* 6. Related Context Bento */}
          <VocabRelated 
            relatedKanji={vocab.relatedKanji as VocabKanjiRef[] | undefined} 
            synonyms={vocab.synonyms as VocabRef[] | undefined} 
            antonyms={vocab.antonyms as VocabRef[] | undefined} 
          />
        </div>

        {/* Action Footer */}
        <footer className="mt-20 pt-16 border-t border-border flex flex-col md:flex-row items-center justify-between gap-8">
          <Link href="/library/vocab" className="w-full md:w-auto">
            <Button variant="ghost" className="w-full px-10 py-8 h-auto text-[11px] md:text-xs font-black uppercase tracking-[0.2em] rounded-2xl bg-[rgba(var(--muted-rgb),0.3)] border border-border hover:bg-[rgba(var(--muted-rgb),0.5)] hover:border-primary/30 transition-all gap-4 group">
              <ChevronLeft size={20} aria-hidden="true" className="group-hover:-translate-x-2 transition-transform" /> Kembali ke Daftar Kosakata
            </Button>
          </Link>
        </footer>
      </div>
    </main>
  );
}
