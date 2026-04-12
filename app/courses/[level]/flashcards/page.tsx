import FlashcardMaster from "@/components/FlashcardMaster";
import { client } from "@/sanity/lib/client";
import Link from "next/link";

interface PageProps {
  params: Promise<{ level: string }>;
}

export default async function VocabFlashcardPage({ params }: PageProps) {
  const { level } = await params;

  /**
   * QUERY GROQ MULTI-SCHEMA
   * 1. Menarik kosakata non-kanji yang status flashcard-nya aktif.
   * 2. Menarik kata kerja dari kamus konjugasi dan menyamakan field 'jisho' menjadi 'word'.
   */
  const query = `{
    "vocab": *[_type == "kosakata" && category != "kanji" && showInFlashcard != false && course_category->slug.current == $level] {
      _id, 
      word, 
      meaning, 
      romaji, 
      furigana
    },
    "verbs": *[_type == "verb_dictionary" && showInFlashcard != false && course_category->slug.current == $level] {
      _id, 
      "word": jisho, 
      meaning, 
      romaji, 
      furigana
    }
  }`;

  const data = await client.fetch(query, { level });

  // Menggabungkan kedua sumber data menjadi satu tumpukan kartu (Flashcards)
  const cards = [...(data.vocab || []), ...(data.verbs || [])];

  return (
    <main className="min-h-screen px-4 py-16 bg-cyber-bg">
      <div className="max-w-xl mx-auto">
        <nav className="mb-8 italic">
          <Link href={`/courses/${level}`} className="text-cyber-neon text-xs">
            ← Back to {level.toUpperCase()}
          </Link>
        </nav>

        <header className="mb-10">
          <h1 className="text-4xl font-black text-white uppercase italic">
            Vocab <span className="text-cyber-neon">Drill</span>
          </h1>
          <p className="text-white/40 text-[10px] font-mono uppercase tracking-widest mt-2">
            Integrated Database: {cards.length} Cards Loaded
          </p>
        </header>

        {cards.length > 0 ? (
          <FlashcardMaster cards={cards} type="vocab" />
        ) : (
          <div className="text-white bg-red-500/10 border border-red-500/50 p-8 rounded-[2rem] text-center shadow-[0_0_20px_rgba(239,68,68,0.1)]">
            <span className="text-4xl mb-4 block">📡</span>
            <p className="font-black uppercase italic tracking-tighter text-lg">
              Data tidak ditemukan
            </p>
            <p className="text-xs opacity-60 mt-2 max-w-xs mx-auto">
              Pastikan Anda sudah menambahkan kosakata atau kata kerja untuk
              level <strong>{level.toUpperCase()}</strong> dan mengaktifkan opsi
              "Show in Flashcard" di Sanity.
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
