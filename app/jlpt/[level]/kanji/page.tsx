import FlashcardMaster from "@/components/FlashcardMaster";
import { client } from "@/sanity/lib/client";
import Link from "next/link";

export default async function KanjiFlashcardPage({ params }: any) {
  const { level } = await params;

  // ✨ Query diperbarui: Mencari di 'kosakata' dan mengambil 'kanjiDetails'
  const kanjiQuery = `*[_type == "kosakata" && category == "kanji" && level->code == $level] {
  _id, word, meaning, romaji, furigana, kanjiDetails
}`;

  const cards = await client.fetch(kanjiQuery, { level });

  return (
    <div className="min-h-screen px-4 py-16 bg-[#1f242d]">
      <div className="max-w-xl mx-auto">
        <nav className="mb-8 italic">
          <Link href={`/jlpt/${level}`} className="text-[#0ef] text-xs">
            ← Back to {level.toUpperCase()}
          </Link>
        </nav>
        <h1 className="text-4xl font-black text-white uppercase italic mb-10">
          Kanji <span className="text-[#0ef]">Power</span>
        </h1>

        {cards.length > 0 ? (
          <FlashcardMaster cards={cards} type="kanji" />
        ) : (
          <div className="text-white bg-red-500/10 border border-red-500/50 p-6 rounded-2xl text-center">
            <p className="font-bold">Data tidak ditemukan</p>
            <p className="text-xs opacity-60">
              Pastikan data di Sanity memiliki category "kanji" dan level{" "}
              {level.toUpperCase()}.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
