import { client } from "@/sanity/lib/client";
import Link from "next/link";
import SurvivalMode from "@/components/SurvivalMode";
import { ArrowLeft } from "lucide-react";

interface PageProps {
  params: Promise<{ categoryId: string }>;
}

export default async function SurvivalPage({ params }: PageProps) {
  const { categoryId } = await params;

  const query = `{
    "vocab": *[_type == "vocab" && showInFlashcard != false && course_category->slug.current == $categoryId] {
      _id, word, meaning, romaji, furigana, category
    },
    "verbs": *[_type == "verb_dictionary" && showInFlashcard != false && course_category->slug.current == $categoryId] {
      _id, "word": jisho, meaning, romaji, furigana, "category": "verb"
    }
  }`;

  const data = await client.fetch(query, { categoryId });
  const cards = [...(data.vocab || []), ...(data.verbs || [])];

  return (
    <main className="min-h-screen px-4 md:px-8 pt-28 pb-32 bg-cyber-bg relative overflow-hidden flex flex-col">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-red-900/15 via-cyber-bg to-cyber-bg pointer-events-none z-0" />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none z-0" />

      <div className="max-w-3xl mx-auto w-full relative z-10 flex-1 flex flex-col">
        <header className="mb-8 flex justify-between items-center border-b border-white/5 pb-6">
          <Link
            href={`/courses/${categoryId}`}
            className="flex items-center gap-2 text-red-400/60 hover:text-red-400 text-[10px] sm:text-xs uppercase tracking-widest font-black transition-colors bg-red-500/5 hover:bg-red-500/10 px-4 py-2 rounded-xl border border-red-500/10"
          >
            <ArrowLeft size={16} />
            <span className="hidden sm:inline">Abort Mission</span>
            <span className="inline sm:hidden">Keluar</span>
          </Link>
          <div className="text-right">
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30 bg-white/5 px-3 py-1.5 rounded-full border border-white/5">
              Level {categoryId.toUpperCase()}
            </span>
          </div>
        </header>

        {cards.length >= 4 ? (
          <SurvivalMode cards={cards} />
        ) : (
          <div className="text-white bg-red-500/10 border border-red-500/30 p-10 md:p-16 rounded-[2.5rem] text-center shadow-[0_0_30px_rgba(239,68,68,0.15)] max-w-lg mx-auto my-auto flex flex-col items-center">
            <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center border border-red-500/30 mb-6 text-4xl shadow-inner">
              ⚠️
            </div>
            <p className="font-black text-2xl md:text-3xl uppercase italic tracking-tighter text-red-500 mb-4 drop-shadow-[0_0_10px_rgba(239,68,68,0.5)]">
              Data Tidak Cukup
            </p>
            <p className="text-xs md:text-sm text-white/60 leading-relaxed font-medium px-4">
              Mode Survival membutuhkan minimal 4 kosakata terpublikasi di level{" "}
              <strong className="text-white">
                "{categoryId.toUpperCase()}"
              </strong>{" "}
              agar sistem pengacakan opsi bisa bekerja. Saat ini sistem hanya
              mendeteksi {cards.length} kartu aktif.
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
