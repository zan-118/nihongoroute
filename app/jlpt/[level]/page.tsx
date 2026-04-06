import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { supabase } from "@/lib/supabase";

export const revalidate = 3600;

interface Level {
  id: string;
  code: string;
  name: string;
  description: string | null;
}

interface Lesson {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  order_number: number;
}

interface Props {
  params: {
    level: string;
  };
}

/* ----------------------------- */
/* FETCH LEVEL */
/* ----------------------------- */
async function getLevel(code: string): Promise<Level | null> {
  const { data } = await supabase
    .from("levels")
    .select("*")
    .eq("code", code)
    .single();

  return data ?? null;
}

/* ----------------------------- */
/* FETCH LESSONS */
/* ----------------------------- */
async function getLessons(levelCode: string): Promise<Lesson[]> {
  const { data } = await supabase
    .from("lessons")
    .select("id, slug, title, description, order_number")
    .eq("level_code", levelCode)
    .eq("is_published", true)
    .order("order_number", { ascending: true });

  return data ?? [];
}

/* ----------------------------- */
/* METADATA */
/* ----------------------------- */
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const level = await getLevel(params.level);

  if (!level) {
    return {
      title: "Level Not Found | NihongoPath",
    };
  }

  return {
    title: `JLPT ${level.name} Lessons | NihongoPath`,
    description:
      level.description ??
      `Pelajari semua materi JLPT ${level.name} secara terstruktur dan interaktif.`,
    alternates: {
      canonical: `/jlpt/${level.code}`,
    },
  };
}

/* ----------------------------- */
/* PAGE */
/* ----------------------------- */
export default async function LevelPage({ params }: Props) {
  const level = await getLevel(params.level);

  if (!level) return notFound();

  const lessons = await getLessons(level.code);

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
        {lessons.length === 0 ? (
          <div className="bg-[#1e2024] p-10 rounded-2xl border border-white/10 text-center">
            <p className="text-white">No lessons available yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {lessons.map((lesson) => (
              <Link
                key={lesson.id}
                href={`/jlpt/${level.code}/${lesson.slug}`}
                className="group"
              >
                <div className="bg-[#1e2024] p-8 rounded-2xl border border-white/10 hover:border-[#0ef]/40 transition-all">
                  <span className="text-xs text-[#0ef] uppercase tracking-widest">
                    JLPT {level.name}
                  </span>

                  <h3 className="text-xl font-bold text-white mt-4 group-hover:text-[#0ef] transition">
                    {lesson.title}
                  </h3>

                  {lesson.description && (
                    <p className="text-sm text-[#c4cfde] mt-3">
                      {lesson.description}
                    </p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* STRUCTURED DATA (SEO BOOST) */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "ItemList",
            name: `JLPT ${level.name} Lessons`,
            itemListElement: lessons.map((lesson, index) => ({
              "@type": "ListItem",
              position: index + 1,
              name: lesson.title,
              url: `${process.env.NEXT_PUBLIC_SITE_URL}/jlpt/${level.code}/${lesson.slug}`,
            })),
          }),
        }}
      />
    </div>
  );
}
