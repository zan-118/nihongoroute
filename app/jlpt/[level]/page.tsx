import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { client } from "@/sanity/lib/client";

export const revalidate = 3600;

async function getLevelData(code: string) {
  const query = `{
    "level": *[_type == "level" && code == $code][0] { _id, code, name, description },
    "lessons": *[_type == "lesson" && level->code == $code && is_published == true] | order(orderNumber asc) {
      _id, "slug": slug.current, title, summary, orderNumber
    }
  }`;
  return await client.fetch(query, { code });
}

export async function generateMetadata({ params }: any): Promise<Metadata> {
  const { level: levelCode } = await params;
  const { level } = await getLevelData(levelCode);
  if (!level) return { title: "Level Not Found | NihongoPath" };
  return {
    title: `JLPT ${level.name} Syllabus | NihongoPath`,
    description: level.description ?? `Pelajari materi JLPT ${level.name}.`,
  };
}

export default async function LevelPage({ params }: any) {
  const { level: levelCode } = await params;
  const { level, lessons } = await getLevelData(levelCode);

  if (!level) return notFound();

  return (
    <div className="min-h-screen px-4 md:px-8 py-10 md:py-16 bg-[#1f242d]">
      <div className="max-w-4xl mx-auto">
        <header className="mb-12">
          <Link
            href="/jlpt"
            className="text-[#0ef] text-[10px] font-black uppercase tracking-widest hover:underline"
          >
            ← Back to Paths
          </Link>
          <h1 className="text-6xl md:text-8xl font-black text-white uppercase tracking-tighter italic mt-2">
            JLPT <span className="text-[#0ef]">{level.name}</span>
          </h1>
        </header>

        {/* --- TOMBOL FLASHCARD UTAMA --- */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-16">
          <Link
            href={`/jlpt/${level.code}/flashcards`}
            className="group relative overflow-hidden bg-gradient-to-br from-green-500/20 to-transparent border border-green-500/30 p-8 rounded-[2rem] hover:border-green-400 active:scale-95 transition-all"
          >
            <div className="absolute top-0 right-0 p-6 opacity-5 text-6xl font-black italic group-hover:opacity-10 transition-opacity select-none">
              VOCAB
            </div>
            <div className="flex items-center gap-4 relative z-10">
              <span className="text-4xl group-hover:scale-110 transition-transform">
                📝
              </span>
              <div>
                <h3 className="text-white font-black text-xl uppercase italic">
                  Vocab Drill
                </h3>
                <p className="text-green-400/80 text-[10px] font-bold tracking-[0.2em] uppercase mt-1">
                  Latih Hafalan Kata
                </p>
              </div>
            </div>
          </Link>

          <Link
            href={`/jlpt/${level.code}/kanji`}
            className="group relative overflow-hidden bg-gradient-to-br from-purple-500/20 to-transparent border border-purple-500/30 p-8 rounded-[2rem] hover:border-purple-400 active:scale-95 transition-all"
          >
            <div className="absolute top-0 right-0 p-6 opacity-5 text-6xl font-black italic group-hover:opacity-10 transition-opacity select-none">
              KANJI
            </div>
            <div className="flex items-center gap-4 relative z-10">
              <span className="text-4xl group-hover:scale-110 transition-transform">
                🈴
              </span>
              <div>
                <h3 className="text-white font-black text-xl uppercase italic">
                  Kanji Power
                </h3>
                <p className="text-purple-400/80 text-[10px] font-bold tracking-[0.2em] uppercase mt-1">
                  Latih Bacaan Kanji
                </p>
              </div>
            </div>
          </Link>
        </div>

        {/* --- DAFTAR BAB --- */}
        <div>
          <h2 className="text-[10px] font-black text-white/30 mb-8 uppercase tracking-[0.4em] italic border-l-2 border-[#0ef] pl-4">
            Curriculum Path
          </h2>

          <div className="space-y-4">
            {lessons.map((lesson: any) => (
              <Link
                key={lesson._id}
                href={`/jlpt/${level.code}/${lesson.slug}`}
                className="block group active:scale-[0.98] transition-all"
              >
                <div className="bg-[#1e2024] p-6 md:p-8 rounded-[2rem] border border-white/5 group-hover:border-[#0ef]/30 group-hover:bg-[#23272b] transition-all flex items-center gap-6">
                  <div className="hidden md:flex shrink-0 w-16 h-16 rounded-2xl bg-[#0ef]/5 border border-white/5 items-center justify-center text-white/20 font-black text-2xl group-hover:text-[#0ef] group-hover:border-[#0ef]/20 transition-all italic">
                    {lesson.orderNumber}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl md:text-2xl font-black text-white group-hover:text-[#0ef] transition-colors uppercase italic">
                      {lesson.title}
                    </h3>
                    <p className="text-sm text-[#c4cfde]/40 mt-1 italic line-clamp-1">
                      {lesson.summary}
                    </p>
                  </div>
                  <span className="text-white/10 group-hover:text-[#0ef] transition-colors text-2xl">
                    →
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
