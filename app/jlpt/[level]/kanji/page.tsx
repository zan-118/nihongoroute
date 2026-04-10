import FlashcardMaster from "@/components/FlashcardMaster";
import { client } from "@/sanity/lib/client";
import Link from "next/link";

export default async function KanjiFlashcardPage({ params }: any) {
  const { level } = await params;
  const query = `*[_type == "flashcard" && level->code == $level] { _id, word, meaning, romaji, details }`;
  const cards = await client.fetch(query, { level });

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
        <FlashcardMaster cards={cards} type="kanji" />
      </div>
    </div>
  );
}
