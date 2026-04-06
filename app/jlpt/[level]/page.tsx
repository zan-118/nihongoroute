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
}

interface Props {
  params: Promise<{ level: string }>;
}

async function getLevelData(code: string) {
  const query = `{
    "level": *[_type == "level" && code == $code][0] {
      _id, code, name, description
    },
    "lessons": *[_type == "lesson" && level->code == $code] | order(orderNumber asc) {
      _id,
      "slug": slug.current,
      title,
      summary
    }
  }`;

  const data = await client.fetch(query, { code });
  return data;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { level: levelCode } = await params;
  const { level } = await getLevelData(levelCode);

  if (!level) return { title: "Level Not Found | NihongoPath" };

  return {
    title: `JLPT ${level.name} Lessons | NihongoPath`,
    description:
      level.description ??
      `Pelajari semua materi JLPT ${level.name} secara terstruktur.`,
    alternates: { canonical: `/jlpt/${level.code}` },
  };
}

export default async function LevelPage({ params }: Props) {
  const { level: levelCode } = await params;
  const { level, lessons } = await getLevelData(levelCode);

  if (!level) return notFound();

  return (
    <div className="min-h-screen px-4 md:px-8 py-12 bg-[#1f242d]">
      <div className="max-w-6xl mx-auto">
        {/* HEADER */}
        <header className="mb-16">
          <p className="text-[#0ef] text-xs uppercase tracking-widest mb-3">
            JLPT Level
          </p>
          <h1 className="text-4xl md:text-6xl font-black text-white uppercase">
            {level.name}
          </h1>
          {level.description && (
            <p className="mt-4 text-[#c4cfde]/60 max-w-2xl">
              {level.description}
            </p>
          )}
        </header>

        {/* PRACTICE BUTTON */}
        <Link
          href={`/jlpt/${level.code}/flashcards`}
          className="inline-block mb-12 px-6 py-3 bg-[#0ef] text-black font-bold rounded-lg hover:scale-105 transition"
        >
          Practice Vocabulary →
        </Link>

        {/* LESSON GRID */}
        {!lessons || lessons.length === 0 ? (
          <div className="bg-[#1e2024] p-10 rounded-2xl border border-white/10 text-center">
            <p className="text-white">Belum ada materi untuk level ini.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {lessons.map((lesson: Lesson) => (
              <Link
                key={lesson._id}
                href={`/jlpt/${level.code}/${lesson.slug}`}
                className="group"
              >
                <div className="bg-[#1e2024] h-full p-8 rounded-2xl border border-white/10 hover:border-[#0ef]/40 transition-all">
                  <span className="text-xs text-[#0ef] uppercase tracking-widest">
                    JLPT {level.name}
                  </span>
                  <h3 className="text-xl font-bold text-white mt-4 group-hover:text-[#0ef] transition">
                    {lesson.title}
                  </h3>
                  {lesson.summary && (
                    <p className="text-sm text-[#c4cfde] mt-3 line-clamp-3">
                      {lesson.summary}
                    </p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
