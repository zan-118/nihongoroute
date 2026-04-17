import FlashcardMaster from "@/components/FlashcardMaster";
import { client } from "@/sanity/lib/client";
import Link from "next/link";

interface PageProps {
  params: Promise<{ level: string }>;
}

export default async function KanjiFlashcardPage({ params }: PageProps) {
  const { level } = await params;

  // Hanya menarik data yang secara eksplisit ditandai sebagai "kanji"
  const kanjiQuery = `*[_type == "kosakata" && category == "kanji" && course_category->slug.current == $level] {
    _id, word, meaning, romaji, furigana, kanjiDetails
  }`;

  const cards = await client.fetch(kanjiQuery, { level });

  return (
    <main className="min-h-screen px-4 py-20 md:py-24 bg-cyber-bg relative overflow-hidden">
      {/* Background Effect: Menggunakan pendaran warna Ungu untuk Kanji */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-900/20 via-cyber-bg to-cyber-bg pointer-events-none" />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none z-0" />

      <div className="max-w-xl mx-auto relative z-10">
        {/* BREADCRUMB NAVIGASI */}
        <nav className="mb-6 md:mb-8 italic">
          <Link
            href={`/courses/${level}`}
            className="text-purple-400 text-[10px] md:text-xs font-black uppercase tracking-widest hover:text-purple-300 transition-colors bg-purple-500/10 px-4 py-2 rounded-lg border border-purple-500/20 inline-flex items-center gap-2"
          >
            ← Kembali ke Materi
          </Link>
        </nav>

        {/* HEADER HALAMAN */}
        <header className="mb-8 md:mb-10 text-center md:text-left">
          <h1 className="text-3xl md:text-5xl font-black text-white uppercase italic tracking-tighter">
            Latihan{" "}
            <span className="text-purple-400 drop-shadow-[0_0_15px_rgba(168,85,247,0.5)]">
              Kanji
            </span>
          </h1>
          <p className="text-white/40 text-[9px] md:text-[10px] font-mono uppercase tracking-widest mt-2 md:mt-3 flex items-center justify-center md:justify-start gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-pulse" />
            Database Terintegrasi: {cards.length} Karakter Dimuat
          </p>
        </header>

        {/* KONTEN UTAMA (FLASHCARD ATAU ERROR) */}
        {cards.length > 0 ? (
          <FlashcardMaster cards={cards} type="kanji" />
        ) : (
          <div className="text-white bg-red-500/10 border border-red-500/30 p-8 md:p-10 rounded-[2rem] text-center shadow-[0_0_20px_rgba(239,68,68,0.1)]">
            <span className="text-4xl md:text-5xl mb-4 block">📡</span>
            <p className="font-black uppercase italic tracking-tighter text-lg md:text-xl text-red-400">
              Data Kanji Kosong
            </p>
            <p className="text-xs text-white/60 mt-3 max-w-xs mx-auto leading-relaxed">
              Pastikan Anda sudah memasukkan karakter ke database (Sanity),
              memilih kategori <strong>"Kanji"</strong>, dan mengatur levelnya
              ke <strong>{level.toUpperCase()}</strong>.
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
