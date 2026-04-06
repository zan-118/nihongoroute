import FlashcardEngine from "@/components/FlashcardEngine";
import Link from "next/link";
import { notFound } from "next/navigation";

interface Params {
  params: Promise<{ level: string }>;
}

const VALID_LEVELS = ["n5", "n4", "n3", "n2", "n1"];

export default async function FlashcardPage({ params }: Params) {
  const { level } = await params;

  if (!VALID_LEVELS.includes(level)) return notFound();

  const res = await fetch(
    `${
      process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"
    }/api/flashcards?type=vocab&level=${level}`,
    { cache: "no-store" },
  );

  if (!res.ok) {
    return (
      <div className="min-h-screen px-6 py-12">Failed to load vocabulary.</div>
    );
  }

  const cards = await res.json();

  return (
    <div className="min-h-screen px-4 md:px-8 py-12">
      <div className="max-w-4xl mx-auto">
        <nav className="mb-6 text-xs uppercase tracking-widest text-[#0ef]/60">
          <Link href={`/jlpt/${level}`} className="text-sm text-[#0ef]">
            ← Back to JLPT {level.toUpperCase()}
          </Link>
        </nav>

        <h1 className="text-3xl md:text-5xl font-bold text-white mb-10">
          JLPT {level.toUpperCase()} Vocabulary
        </h1>

        <FlashcardEngine cards={cards} />
      </div>
    </div>
  );
}
