import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { client } from "@/sanity/lib/client";

export const revalidate = 3600;

interface Level {
  _id: string;
  code: string;
  name: string;
  description: string | null;
}
interface Lesson {
  _id: string;
  slug: string;
  title: string;
  summary: string | null;
  orderNumber: number;
}
interface Props {
  params: Promise<{ level: string }>;
}

async function getLevelData(code: string) {
  const query = `{
    "level": *[_type == "level" && code == $code][0] { _id, code, name, description },
    "lessons": *[_type == "lesson" && level->code == $code && is_published == true] | order(orderNumber asc) {
      _id, "slug": slug.current, title, summary, orderNumber
    }
  }`;
  return await client.fetch(query, { code });
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { level: levelCode } = await params;
  const { level } = await getLevelData(levelCode);
  if (!level) return { title: "Level Not Found | NihongoPath" };
  return {
    title: `JLPT ${level.name} Syllabus | NihongoPath`,
    description: level.description ?? `Pelajari materi JLPT ${level.name}.`,
    alternates: { canonical: `/jlpt/${level.code}` },
  };
}

export default async function LevelPage({ params }: Props) {
  const { level: levelCode } = await params;
  const { level, lessons } = await getLevelData(levelCode);

  if (!level) return notFound();

  return (
    <div className="min-h-screen px-4 md:px-8 py-10 md:py-16 bg-[#1f242d]">
      <div className="max-w-4xl mx-auto">
        <header className="mb-12 text-center md:text-left">
          <p className="text-[#0ef] text-[10px] md:text-xs font-bold uppercase tracking-widest mb-2">
            Syllabus Overview
          </p>
          <h1 className="text-5xl md:text-7xl font-black text-white uppercase tracking-tighter">
            {level.name}
          </h1>
          {level.description && (
            <p className="mt-4 text-[#c4cfde]/70 text-sm md:text-base leading-relaxed">
              {level.description}
            </p>
          )}
        </header>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-16">
          <Link
            href={`/jlpt/${level.code}/flashcards`}
            className="group bg-gradient-to-br from-green-500/20 to-green-500/5 border border-green-500/30 p-6 rounded-3xl hover:border-green-500 active:scale-95 transition-all flex items-center gap-4"
          >
            <div className="text-4xl group-hover:scale-110 transition-transform">
              📝
            </div>
            <div>
              <h3 className="text-white font-black text-xl uppercase">
                Flashcard Kosakata
              </h3>
              <p className="text-green-400/80 text-xs font-bold tracking-widest uppercase mt-1">
                Latih Ingatan Kata
              </p>
            </div>
          </Link>
          <Link
            href={`/jlpt/${level.code}/kanji`}
            className="group bg-gradient-to-br from-purple-500/20 to-purple-500/5 border border-purple-500/30 p-6 rounded-3xl hover:border-purple-500 active:scale-95 transition-all flex items-center gap-4"
          >
            <div className="text-4xl group-hover:scale-110 transition-transform">
              🈴
            </div>
            <div>
              <h3 className="text-white font-black text-xl uppercase">
                Flashcard Kanji
              </h3>
              <p className="text-purple-400/80 text-xs font-bold tracking-widest uppercase mt-1">
                Latih Bacaan Kanji
              </p>
            </div>
          </Link>
        </div>

        <div>
          <h2 className="text-2xl font-black text-white mb-6 uppercase tracking-widest border-b border-white/10 pb-4">
            Daftar Bab
          </h2>
          {!lessons || lessons.length === 0 ? (
            <div className="bg-[#1e2024] p-8 rounded-2xl border border-white/5 text-center border-dashed">
              <p className="text-[#c4cfde]/40 text-xs uppercase tracking-widest">
                Materi sedang disusun...
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {lessons.map((lesson: Lesson) => (
                <Link
                  key={lesson._id}
                  href={`/jlpt/${level.code}/${lesson.slug}`}
                  className="group block active:scale-[0.98] transition-transform"
                >
                  <div className="bg-[#1e2024] p-6 md:p-8 rounded-[2rem] border border-white/5 hover:border-[#0ef]/30 hover:bg-[#23272b] transition-all flex items-center gap-6">
                    <div className="hidden md:flex shrink-0 w-16 h-16 rounded-2xl bg-[#0ef]/10 border border-[#0ef]/20 items-center justify-center text-[#0ef] font-black text-2xl group-hover:scale-110 transition-transform">
                      {lesson.orderNumber}
                    </div>
                    <div className="flex-1">
                      <span className="text-[10px] text-[#0ef] font-bold uppercase tracking-widest md:hidden mb-1 block">
                        Bab {lesson.orderNumber}
                      </span>
                      <h3 className="text-xl md:text-2xl font-black text-white group-hover:text-[#0ef] transition-colors">
                        {lesson.title}
                      </h3>
                      {lesson.summary && (
                        <p className="text-sm text-[#c4cfde]/60 mt-2 line-clamp-2">
                          {lesson.summary}
                        </p>
                      )}
                    </div>
                    <div className="text-white/20 group-hover:text-[#0ef] text-2xl transition-colors">
                      →
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
