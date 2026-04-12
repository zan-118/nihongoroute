import FlashcardMaster from "@/components/FlashcardMaster";
import { client } from "@/sanity/lib/client";
import Link from "next/link";

interface PageProps {
  params: Promise<{ level: string }>;
}

export default async function KanjiFlashcardPage({ params }: PageProps) {
  const { level } = await params;

  const kanjiQuery = `*[_type == "kosakata" && category == "kanji" && level->code == $level] {
    _id, word, meaning, romaji, furigana, kanjiDetails
  }`;

  const cards = await client.fetch(kanjiQuery, { level });

  return (
    <main className="min-h-screen px-4 py-16 bg-cyber-bg">
      <div className="max-w-xl mx-auto">
        <nav className="mb-8 italic">
          <Link href={`/jlpt/${level}`} className="text-cyber-neon text-xs">
            ← Back to {level.toUpperCase()}
          </Link>
        </nav>
        <h1 className="text-4xl font-black text-white uppercase italic mb-10">
          Kanji <span className="text-cyber-neon">Power</span>
        </h1>

        {cards.length > 0 ? (
          <FlashcardMaster cards={cards} type="kanji" />
        ) : (
          <div className="text-white bg-red-500/10 border border-red-500/50 p-6 rounded-2xl text-center">
            <p className="font-bold">Data tidak ditemukan</p>
            <p className="text-xs opacity-60 mt-1">
              Pastikan data di Sanity memiliki category "kanji" dan level{" "}
              {level.toUpperCase()}.
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
