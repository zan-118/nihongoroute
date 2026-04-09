import FlashcardEngine from "@/components/FlashcardEngine";
import Link from "next/link";
import { notFound } from "next/navigation";
import { client } from "@/sanity/lib/client";

export default async function KanjiPage({
  params,
}: {
  params: Promise<{ level: string }>;
}) {
  const { level } = await params;
  const VALID_LEVELS = ["n5", "n4", "n3", "n2", "n1"];

  if (!VALID_LEVELS.includes(level)) return notFound();

  const query = `*[_type == "flashcard" && level->code == $level] {
    "id": _id,
    word,
    romaji,
    meaning,
    details,
    examples
  }`;

  const cards = await client.fetch(query, { level });

  if (!cards || cards.length === 0) {
    return (
      <div className="min-h-screen px-4 md:px-8 py-12 bg-[#1f242d] text-center">
        <div className="max-w-4xl mx-auto">
          <nav className="mb-6 text-xs uppercase tracking-widest text-[#0ef]/60 text-left">
            <Link
              href={`/jlpt/${level}`}
              className="text-sm text-[#0ef] hover:underline"
            >
              ← Back to JLPT {level.toUpperCase()}
            </Link>
          </nav>
          <div className="mt-20 p-10 bg-[#1e2024] rounded-2xl border border-white/10 inline-block">
            <p className="text-white mb-2">Belum ada kanji untuk level ini.</p>
            <p className="text-sm text-[#c4cfde]/60">
              Tambahkan dokumen "Flashcard Pro" di Sanity.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-4 md:px-8 py-12 bg-[#1f242d]">
      <div className="max-w-4xl mx-auto">
        <nav className="mb-6 text-xs uppercase tracking-widest text-[#0ef]/60">
          <Link
            href={`/jlpt/${level}`}
            className="text-sm text-[#0ef] hover:underline"
          >
            ← Back to JLPT {level.toUpperCase()}
          </Link>
        </nav>
        <h1 className="text-3xl md:text-5xl font-bold text-[#0ef] mb-10">
          JLPT {level.toUpperCase()} Kanji Practice
        </h1>
        <FlashcardEngine cards={cards} />
      </div>
    </div>
  );
}
