// app/courses/[level]/survival/page.tsx
import { client } from "@/sanity/lib/client";
import Link from "next/link";
import SurvivalMode from "@/components/SurvivalMode"; // Pastikan path import ini benar

interface PageProps {
  params: Promise<{ level: string }>;
}

export default async function SurvivalPage({ params }: PageProps) {
  const { level } = await params;

  // ✨ PERBAIKAN: Menambahkan 'category' pada kedua fetch data
  const query = `{
    "vocab": *[_type == "kosakata" && category != "kanji" && showInFlashcard != false && course_category->slug.current == $level] {
      _id, word, meaning, romaji, furigana, category
    },
    "verbs": *[_type == "verb_dictionary" && showInFlashcard != false && course_category->slug.current == $level] {
      _id, "word": jisho, meaning, romaji, furigana, "category": "verb"
    }
  }`;

  const data = await client.fetch(query, { level });
  const cards = [...(data.vocab || []), ...(data.verbs || [])];

  return (
    <main className="min-h-screen px-4 py-16 bg-cyber-bg relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-red-900/10 via-cyber-bg to-cyber-bg pointer-events-none" />

      <div className="max-w-4xl mx-auto relative z-10">
        <nav className="mb-12 italic">
          <Link
            href={`/courses/${level}`}
            className="text-red-400 hover:text-red-300 text-xs uppercase tracking-widest font-black transition-colors"
          >
            ← Abort Mission
          </Link>
        </nav>

        {cards.length >= 4 ? (
          <SurvivalMode cards={cards} />
        ) : (
          <div className="text-white bg-red-500/10 border border-red-500/50 p-8 rounded-[2rem] text-center">
            <p className="font-bold text-xl text-red-500 mb-2">
              Insufficient Data
            </p>
            <p className="text-sm opacity-80">
              Mode Survival membutuhkan minimal 4 kosakata di level{" "}
              <strong>{level.toUpperCase()}</strong> agar bisa mengacak pilihan
              ganda. Saat ini hanya ada {cards.length} kartu.
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
