import FlashcardMaster from "@/components/FlashcardMaster";
import { client } from "@/sanity/lib/client";
import Link from "next/link";

interface PageProps {
  params: Promise<{ level: string }>;
}

export default async function VocabFlashcardPage({ params }: PageProps) {
  const { level } = await params;

  const query = `{
    "vocab": *[_type == "kosakata" && category != "kanji" && showInFlashcard != false && course_category->slug.current == $level] {
      _id, word, meaning, romaji, furigana
    },
    "verbs": *[_type == "verb_dictionary" && showInFlashcard != false && course_category->slug.current == $level] {
      _id, "word": jisho, meaning, romaji, furigana
    }
  }`;

  const data = await client.fetch(query, { level });
  const cards = [...(data.vocab || []), ...(data.verbs || [])];

  return (
    <main className="min-h-screen px-4 py-20 md:py-24 bg-cyber-bg relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-cyan-900/10 via-cyber-bg to-cyber-bg pointer-events-none" />

      <div className="max-w-xl mx-auto relative z-10">
        <nav className="mb-6 md:mb-8 italic">
          <Link
            href={`/courses/${level}`}
            className="text-cyan-400 text-[10px] md:text-xs font-black uppercase tracking-widest hover:text-cyan-300 transition-colors bg-cyan-400/10 px-4 py-2 rounded-lg border border-cyan-400/20"
          >
            ← Kembali ke Materi
          </Link>
        </nav>

        <header className="mb-8 md:mb-10 text-center md:text-left">
          <h1 className="text-3xl md:text-5xl font-black text-white uppercase italic tracking-tighter">
            Latihan{" "}
            <span className="text-cyan-400 drop-shadow-[0_0_10px_rgba(34,211,238,0.5)]">
              Kosakata
            </span>
          </h1>
          <p className="text-white/40 text-[9px] md:text-[10px] font-mono uppercase tracking-widest mt-2 md:mt-3">
            Database Terintegrasi: {cards.length} Kartu Dimuat
          </p>
        </header>

        {cards.length > 0 ? (
          <FlashcardMaster cards={cards} type="vocab" />
        ) : (
          <div className="text-white bg-red-500/10 border border-red-500/30 p-8 md:p-10 rounded-[2rem] text-center shadow-[0_0_20px_rgba(239,68,68,0.1)]">
            <span className="text-4xl md:text-5xl mb-4 block">📡</span>
            <p className="font-black uppercase italic tracking-tighter text-lg md:text-xl text-red-400">
              Data Kosong
            </p>
            <p className="text-xs text-white/60 mt-3 max-w-xs mx-auto leading-relaxed">
              Pastikan Anda sudah memasukkan kosakata di database (Sanity) untuk
              level <strong>{level.toUpperCase()}</strong>.
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
