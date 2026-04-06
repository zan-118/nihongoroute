import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { client } from "@/sanity/lib/client";
import { PortableText } from "@portabletext/react";
import QuizEngine from "@/components/QuizEngine";
import TTSReader from "@/components/TTSReader";

export const revalidate = 3600;

interface Props {
  params: Promise<{ level: string; slug: string }>;
}

/* ============================= */
/* FETCH DARI SANITY */
/* ============================= */
async function getLessonData(levelCode: string, slug: string) {
  const query = `{
    "lesson": *[_type == "lesson" && level->code == $levelCode && slug.current == $slug][0] {
      _id,
      title,
      summary,
      content,
      quizzes,
      seoTitle,
      seoDescription,
      "levelCode": level->code
    },
    "nav": *[_type == "lesson" && level->code == $levelCode] | order(orderNumber asc) {
      "slug": slug.current,
      title
    }
  }`;

  return await client.fetch(query, { levelCode, slug });
}

/* ============================= */
/* METADATA */
/* ============================= */
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { level, slug } = await params;
  const { lesson } = await getLessonData(level, slug);

  if (!lesson) return { title: "Lesson Not Found | NihongoPath" };

  return {
    title:
      lesson.seoTitle ??
      `${lesson.title} | JLPT ${lesson.levelCode.toUpperCase()} | NihongoPath`,
    description:
      lesson.seoDescription ?? lesson.summary ?? `Pelajari ${lesson.title}.`,
    alternates: { canonical: `/jlpt/${lesson.levelCode}/${slug}` },
  };
}

/* ============================= */
/* CUSTOM PORTABLE TEXT STYLING */
/* ============================= */
// Ini membuat tampilan artikel/teks dari Sanity menggunakan gaya Neumorphic kamu
const ptComponents = {
  block: {
    h2: ({ children }: any) => (
      <h2 className="text-2xl font-bold text-[#0ef] mt-8 mb-4">{children}</h2>
    ),
    h3: ({ children }: any) => (
      <h3 className="text-xl font-bold text-white mt-6 mb-3">{children}</h3>
    ),
    normal: ({ children }: any) => (
      <p className="mb-4 text-[#c4cfde]/80 leading-relaxed">{children}</p>
    ),
    blockquote: ({ children }: any) => (
      <blockquote className="border-l-4 border-[#0ef] pl-4 italic bg-white/5 p-4 rounded-r-lg my-6">
        {children}
      </blockquote>
    ),
  },
  marks: {
    strong: ({ children }: any) => (
      <strong className="text-white font-bold">{children}</strong>
    ),
    em: ({ children }: any) => (
      <em className="italic text-[#0ef]">{children}</em>
    ),
    // Renderer untuk Furigana
    furigana: ({ children, value }: any) => (
      <ruby className="mx-1 text-white font-bold">
        {children}
        <rt className="text-[10px] text-[#0ef] font-normal tracking-widest">
          {value.reading}
        </rt>
      </ruby>
    ),
  },
  types: {
    // Renderer untuk Callout Box
    callout: ({ value }: any) => {
      const colors = {
        grammar: "border-[#0ef] bg-[#0ef]/10 text-[#0ef]",
        info: "border-blue-500 bg-blue-500/10 text-blue-400",
        warning: "border-yellow-500 bg-yellow-500/10 text-yellow-400",
      };
      const colorClass =
        colors[value.type as keyof typeof colors] || colors.grammar;

      return (
        <div className={`border-l-4 p-5 rounded-r-2xl my-8 ${colorClass}`}>
          <strong className="block mb-2 font-black uppercase tracking-wider">
            {value.title}
          </strong>
          <p className="text-sm text-[#c4cfde] leading-relaxed">{value.text}</p>
        </div>
      );
    },
    // RENDERER BARU UNTUK KANA TABLE
    kanaTable: ({ value }: any) => {
      return (
        <div className="my-10 p-6 bg-[#1e2024] border border-[#0ef]/20 rounded-3xl">
          <h3 className="text-xl font-black text-white mb-6 text-center uppercase tracking-widest">
            {value.title}
          </h3>

          <div className="grid gap-2">
            {value.rows?.map((row: any, i: number) => (
              <div key={i} className="flex gap-2 justify-center">
                {row.characters?.map((char: any, j: number) => (
                  <div
                    key={j}
                    className="w-14 h-14 md:w-16 md:h-16 flex flex-col items-center justify-center bg-[#1f242d] border border-white/5 rounded-xl hover:bg-[#0ef]/10 hover:border-[#0ef]/50 hover:scale-110 transition-all cursor-pointer group relative"
                  >
                    <span className="text-xl md:text-2xl text-white font-bold group-hover:text-[#0ef] transition-colors">
                      {char.kana}
                    </span>
                    <span className="text-[10px] text-[#c4cfde]/50 font-mono group-hover:text-[#0ef]/80">
                      {char.romaji}
                    </span>

                    {/* Tooltip untuk Contoh Kata (Muncul saat di-hover) */}
                    {char.example && (
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max px-3 py-1 bg-black text-[#0ef] text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                        {char.example}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      );
    },
  },
};

/* ============================= */
/* PAGE */
/* ============================= */
export default async function LessonPage({ params }: Props) {
  const { level, slug } = await params;
  const { lesson, nav } = await getLessonData(level, slug);

  if (!lesson) return notFound();

  // Cari index untuk tombol Next / Prev
  const currentIndex = nav.findIndex((l: any) => l.slug === slug);
  const prevLesson = currentIndex > 0 ? nav[currentIndex - 1] : null;
  const nextLesson =
    currentIndex >= 0 && currentIndex < nav.length - 1
      ? nav[currentIndex + 1]
      : null;

  return (
    <div className="min-h-screen px-4 md:px-8 py-12 bg-[#1f242d]">
      <div className="max-w-4xl mx-auto">
        {/* BREADCRUMB */}
        <nav className="mb-6 text-xs uppercase tracking-widest text-[#0ef]/60">
          <Link
            href={`/jlpt/${lesson.levelCode}`}
            className="hover:text-[#0ef] transition"
          >
            JLPT {lesson.levelCode.toUpperCase()}
          </Link>{" "}
          / {lesson.title}
        </nav>

        {/* TITLE */}
        <h1 className="text-3xl md:text-5xl font-bold text-white mb-6">
          {lesson.title}
        </h1>

        {lesson.summary && (
          <div className="border-b border-white/10 pb-8 mb-10">
            <p className="text-[#c4cfde]/60 text-lg mb-6 leading-relaxed">
              {lesson.summary}
            </p>
            {/* Fitur Audio Baru */}
            <TTSReader text={lesson.summary} />
          </div>
        )}
        {/* CONTENT (Render Portable Text dari Sanity) */}
        <article className="max-w-none mb-16">
          {lesson.content ? (
            <PortableText value={lesson.content} components={ptComponents} />
          ) : (
            <p className="text-white/40 italic">
              Konten materi belum ditambahkan.
            </p>
          )}
        </article>

        {/* QUIZ */}
        {/* Schema Quiz Sanity sudah sangat cocok dengan QuizEngine kamu! */}
        {lesson.quizzes && lesson.quizzes.length > 0 && (
          <QuizEngine questions={lesson.quizzes} />
        )}

        {/* NAVIGATION */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-16 pt-8 border-t border-white/10">
          {prevLesson ? (
            <Link
              href={`/jlpt/${lesson.levelCode}/${prevLesson.slug}`}
              className="text-left p-6 rounded-2xl bg-[#1e2024] hover:border-[#0ef] border border-transparent transition"
            >
              <div className="text-xs text-white/40 mb-2 uppercase tracking-widest">
                ← Sebelumnya
              </div>
              <div className="text-[#0ef] font-bold">{prevLesson.title}</div>
            </Link>
          ) : (
            <div />
          )}

          {nextLesson ? (
            <Link
              href={`/jlpt/${lesson.levelCode}/${nextLesson.slug}`}
              className="text-right p-6 rounded-2xl bg-[#1e2024] hover:border-[#0ef] border border-transparent transition"
            >
              <div className="text-xs text-white/40 mb-2 uppercase tracking-widest">
                Selanjutnya →
              </div>
              <div className="text-[#0ef] font-bold">{nextLesson.title}</div>
            </Link>
          ) : (
            <Link
              href={`/jlpt/${lesson.levelCode}`}
              className="text-right p-6 rounded-2xl bg-[#0ef]/10 hover:bg-[#0ef]/20 border border-[#0ef]/30 transition"
            >
              <div className="text-xs text-[#0ef] mb-2 uppercase tracking-widest">
                Selesai
              </div>
              <div className="text-white font-bold">Kembali ke Menu Level</div>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
