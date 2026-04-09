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

async function getLessonData(levelCode: string, slug: string) {
  const query = `{
    "lesson": *[_type == "lesson" && level->code == $levelCode && slug.current == $slug][0] {
      _id,
      title,
      summary,
      content,
      category,
      quizzes,
      seoTitle,
      seoDescription,
      "levelCode": level->code
    },
    "nav": *[_type == "lesson" && level->code == $levelCode && is_published == true] | order(orderNumber asc) {
      "slug": slug.current,
      title,
      category
    }
  }`;

  return await client.fetch(query, { levelCode, slug });
}

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
const ptComponents = {
  block: {
    h2: ({ children }: any) => (
      <h2 className="text-2xl md:text-3xl font-black text-[#0ef] mt-12 mb-6 tracking-tight">
        {children}
      </h2>
    ),
    h3: ({ children }: any) => (
      <h3 className="text-xl md:text-2xl font-bold text-white mt-8 mb-4">
        {children}
      </h3>
    ),
    normal: ({ children }: any) => (
      <p className="mb-6 text-[#c4cfde]/90 text-base md:text-lg leading-[1.8] md:leading-[2]">
        {children}
      </p>
    ),
    blockquote: ({ children }: any) => (
      <blockquote className="border-l-4 border-[#0ef] bg-gradient-to-r from-[#0ef]/10 to-transparent pl-5 py-4 pr-4 rounded-r-2xl my-8 italic text-white/80">
        {children}
      </blockquote>
    ),
  },
  marks: {
    strong: ({ children }: any) => (
      <strong className="text-white font-black">{children}</strong>
    ),
    em: ({ children }: any) => (
      <em className="italic text-[#0ef]">{children}</em>
    ),
    furigana: ({ children, value }: any) => (
      <ruby className="mx-1 text-white font-bold group cursor-default inline-block">
        {children}
        <rt className="text-[10px] md:text-xs text-[#0ef] font-normal tracking-widest opacity-80">
          {value.reading}
        </rt>
      </ruby>
    ),
  },
  types: {
    callout: ({ value }: any) => {
      const colors = {
        grammar: "border-[#0ef] bg-[#0ef]/5 text-[#0ef]",
        info: "border-blue-500 bg-blue-500/5 text-blue-400",
        warning: "border-yellow-500 bg-yellow-500/5 text-yellow-400",
      };
      const colorClass =
        colors[value.type as keyof typeof colors] || colors.grammar;

      return (
        <div
          className={`border-l-4 p-6 md:p-8 rounded-r-[2rem] my-10 ${colorClass}`}
        >
          <strong className="block mb-3 font-black uppercase tracking-widest text-xs md:text-sm">
            {value.title}
          </strong>
          <p className="text-sm md:text-base text-[#c4cfde] leading-relaxed">
            {value.text}
          </p>
        </div>
      );
    },
    kanaTable: ({ value }: any) => {
      return (
        <div className="my-12 p-6 md:p-10 bg-[#1e2024] border border-white/5 rounded-[2rem] overflow-x-auto custom-scrollbar shadow-lg">
          <h3 className="text-lg md:text-xl font-black text-white mb-8 text-center uppercase tracking-widest">
            {value.title}
          </h3>
          <div className="min-w-[320px] grid gap-3">
            {value.rows?.map((row: any, i: number) => (
              <div key={i} className="flex gap-3 justify-center">
                {row.characters?.map((char: any, j: number) => (
                  <div
                    key={j}
                    className="w-14 h-14 md:w-16 md:h-16 flex flex-col items-center justify-center bg-[#1f242d] border border-white/10 rounded-[1rem] hover:bg-[#0ef]/10 hover:border-[#0ef]/50 active:scale-95 transition-all cursor-pointer group relative"
                  >
                    <span className="text-xl md:text-2xl text-white font-bold group-hover:text-[#0ef] transition-colors">
                      {char.kana}
                    </span>
                    <span className="text-[9px] md:text-[10px] text-[#c4cfde]/50 font-mono group-hover:text-[#0ef]/80 uppercase">
                      {char.romaji}
                    </span>
                    {char.example && (
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 w-max px-3 py-2 bg-[#1e2024] border border-white/10 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity z-10 shadow-xl flex flex-col items-center gap-2 pointer-events-auto">
                        <span className="text-[#0ef] text-[10px] font-bold uppercase tracking-widest text-center">
                          {char.example}
                        </span>
                        <TTSReader
                          text={char.example.split(/[\s-]/)[0]}
                          minimal={true}
                        />
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
    exampleSentence: ({ value }: any) => {
      return (
        <div className="bg-gradient-to-r from-[#1e2024] to-[#1a1c20] p-5 md:p-6 rounded-2xl border-l-4 border-[#0ef] border-y border-r border-white/5 my-8 flex justify-between items-center gap-4 shadow-md">
          <div className="flex-1">
            <ruby className="text-white text-lg md:text-xl font-bold leading-relaxed tracking-wide">
              {value.jp}{" "}
              {value.furigana && (
                <rt className="text-[10px] md:text-xs text-[#0ef] font-normal opacity-90 ml-1 tracking-widest">
                  {value.furigana}
                </rt>
              )}
            </ruby>
            {value.id && (
              <p className="text-sm md:text-base text-[#c4cfde]/80 mt-3 leading-relaxed">
                {value.id}
              </p>
            )}
          </div>
          <div className="shrink-0">
            <TTSReader text={value.jp} minimal={true} />
          </div>
        </div>
      );
    },
  },
};

/* ============================= */
/* PAGE COMPONENT */
/* ============================= */
export default async function LessonPage({ params }: Props) {
  const { level, slug } = await params;
  const { lesson, nav } = await getLessonData(level, slug);

  if (!lesson) return notFound();

  // Filter Navigasi Bawah agar menyarankan materi di kategori yang sama jika memungkinkan
  const categoryNav = nav.filter((l: any) => l.category === lesson.category);
  const currentIndex = categoryNav.findIndex((l: any) => l.slug === slug);
  const prevLesson = currentIndex > 0 ? categoryNav[currentIndex - 1] : null;
  const nextLesson =
    currentIndex >= 0 && currentIndex < categoryNav.length - 1
      ? categoryNav[currentIndex + 1]
      : null;

  return (
    <div className="min-h-screen px-4 md:px-8 py-8 md:py-16 bg-[#1f242d]">
      <div className="max-w-3xl mx-auto">
        {/* BREADCRUMB DENGAN KATEGORI */}
        <nav className="mb-8 flex items-center gap-2 text-[10px] md:text-xs font-bold uppercase tracking-widest text-[#c4cfde]/50 overflow-x-auto whitespace-nowrap custom-scrollbar pb-2">
          <Link
            href={`/jlpt/${lesson.levelCode}`}
            className="hover:text-[#0ef] transition"
          >
            JLPT {lesson.levelCode.toUpperCase()}
          </Link>
          <span>/</span>
          <span className="text-[#0ef]/80">{lesson.category || "GENERAL"}</span>
          <span>/</span>
          <span className="text-white truncate">{lesson.title}</span>
        </nav>

        {/* TITLE */}
        <h1 className="text-3xl sm:text-4xl md:text-6xl font-black text-white mb-8 tracking-tighter leading-tight">
          {lesson.title}
        </h1>

        {lesson.summary && (
          <div className="border-b-2 border-white/5 pb-8 md:pb-12 mb-10 md:mb-16">
            <p className="text-[#0ef] text-base md:text-xl font-medium leading-relaxed">
              {lesson.summary}
            </p>
          </div>
        )}

        {/* CONTENT */}
        <article className="max-w-none mb-16 md:mb-24">
          {lesson.content ? (
            <PortableText value={lesson.content} components={ptComponents} />
          ) : (
            <div className="p-8 bg-[#1e2024] border border-white/5 rounded-2xl text-center border-dashed">
              <p className="text-white/40 italic uppercase tracking-widest text-xs font-bold">
                Konten materi sedang dipersiapkan.
              </p>
            </div>
          )}
        </article>

        {/* QUIZ SECTION */}
        {lesson.quizzes && lesson.quizzes.length > 0 && (
          <div className="mb-20">
            <QuizEngine questions={lesson.quizzes} />
          </div>
        )}

        {/* BOTTOM NAVIGATION */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-10 md:mt-16">
          {prevLesson ? (
            <Link
              href={`/jlpt/${lesson.levelCode}/${prevLesson.slug}`}
              className="group flex flex-col p-6 md:p-8 rounded-[2rem] bg-[#1e2024] hover:bg-gradient-to-r hover:from-[#1e2024] hover:to-[#23272b] border border-white/5 hover:border-[#0ef]/30 active:scale-[0.98] transition-all"
            >
              <span className="text-[10px] md:text-xs text-[#c4cfde]/40 mb-2 uppercase tracking-widest font-bold group-hover:text-[#0ef] transition-colors">
                ← {lesson.category} Sebelumnya
              </span>
              <span className="text-white font-black text-lg md:text-xl line-clamp-2">
                {prevLesson.title}
              </span>
            </Link>
          ) : (
            <div className="hidden sm:block" />
          )}

          {nextLesson ? (
            <Link
              href={`/jlpt/${lesson.levelCode}/${nextLesson.slug}`}
              className="group flex flex-col items-end text-right p-6 md:p-8 rounded-[2rem] bg-[#1e2024] hover:bg-gradient-to-l hover:from-[#1e2024] hover:to-[#23272b] border border-white/5 hover:border-[#0ef]/30 active:scale-[0.98] transition-all"
            >
              <span className="text-[10px] md:text-xs text-[#c4cfde]/40 mb-2 uppercase tracking-widest font-bold group-hover:text-[#0ef] transition-colors">
                {lesson.category} Selanjutnya →
              </span>
              <span className="text-white font-black text-lg md:text-xl line-clamp-2">
                {nextLesson.title}
              </span>
            </Link>
          ) : (
            <Link
              href={`/jlpt/${lesson.levelCode}`}
              className="group flex flex-col items-center justify-center p-6 md:p-8 rounded-[2rem] bg-[#0ef]/10 hover:bg-[#0ef]/20 border border-[#0ef]/30 active:scale-[0.98] transition-all text-center"
            >
              <span className="text-xs text-[#0ef] mb-2 uppercase tracking-widest font-bold">
                Kategori Selesai 🎯
              </span>
              <span className="text-white font-black text-lg">
                Kembali ke Syllabus
              </span>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
