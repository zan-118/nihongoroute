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
      _id, title, summary, vocabList, referenceWords, patterns, examples, conversationTitle, conversation, grammar, quizzes, seoTitle, seoDescription, "levelCode": level->code
    },
    "nav": *[_type == "lesson" && level->code == $levelCode && is_published == true] | order(orderNumber asc) {
      "slug": slug.current, title
    }
  }`;
  return await client.fetch(query, { levelCode, slug });
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { level, slug } = await params;
  const { lesson } = await getLessonData(level, slug);
  if (!lesson) return { title: "Lesson Not Found | NihongoPath" };
  return {
    title: lesson.seoTitle ?? `${lesson.title} | NihongoPath`,
    description: lesson.seoDescription ?? lesson.summary,
  };
}

/* ================= CUSTOM PORTABLE TEXT ================= */
const ptComponents = {
  block: {
    h2: ({ children }: any) => (
      <h2 className="text-2xl font-black text-[#0ef] mt-10 mb-4">{children}</h2>
    ),
    normal: ({ children }: any) => (
      <p className="mb-4 text-[#c4cfde]/90 text-base leading-relaxed">
        {children}
      </p>
    ),
  },
  types: {
    callout: ({ value }: any) => (
      <div className="border-l-4 border-yellow-500 bg-yellow-500/10 p-6 rounded-r-2xl my-8">
        <strong className="block mb-2 font-black text-yellow-400 uppercase tracking-widest text-xs">
          {value.title}
        </strong>
        <p className="text-sm text-[#c4cfde]">{value.text}</p>
      </div>
    ),
    exampleSentence: ({ value }: any) => (
      <div className="bg-[#1e2024] p-4 rounded-xl border border-white/5 my-4 flex justify-between items-center gap-4">
        <div>
          <ruby className="text-white text-lg font-bold">
            {value.jp}{" "}
            <rt className="text-[10px] text-[#0ef]">{value.furigana}</rt>
          </ruby>
          <p className="text-sm text-[#c4cfde]/60 mt-1">{value.id}</p>
        </div>
        <TTSReader text={value.jp} minimal={true} />
      </div>
    ),
  },
};

/* ================= PAGE COMPONENT ================= */
export default async function LessonPage({ params }: Props) {
  const { level, slug } = await params;
  const { lesson, nav } = await getLessonData(level, slug);

  if (!lesson) return notFound();

  const currentIndex = nav.findIndex((l: any) => l.slug === slug);
  const prevLesson = currentIndex > 0 ? nav[currentIndex - 1] : null;
  const nextLesson =
    currentIndex >= 0 && currentIndex < nav.length - 1
      ? nav[currentIndex + 1]
      : null;

  return (
    <div className="min-h-screen px-4 md:px-8 py-8 md:py-16 bg-[#1f242d]">
      <div className="max-w-3xl mx-auto">
        <nav className="mb-8 text-xs font-bold uppercase tracking-widest text-[#c4cfde]/50 flex gap-2">
          <Link
            href={`/jlpt/${lesson.levelCode}`}
            className="hover:text-[#0ef]"
          >
            JLPT {lesson.levelCode}
          </Link>
          <span>/</span>
          <span className="text-white">{lesson.title}</span>
        </nav>

        <h1 className="text-4xl md:text-5xl font-black text-white mb-6 tracking-tighter">
          {lesson.title}
        </h1>
        {lesson.summary && (
          <p className="text-[#0ef] text-lg mb-12">{lesson.summary}</p>
        )}

        {/* SECTION 1: KOSAKATA */}
        {(lesson.vocabList?.length > 0 ||
          lesson.referenceWords?.length > 0) && (
          <section className="mb-16">
            <h2 className="text-2xl font-black text-white border-b-2 border-white/10 pb-3 mb-6 uppercase tracking-widest flex items-center gap-3">
              <span className="text-3xl">📝</span> Kosakata Baru
            </h2>

            {lesson.vocabList && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                {lesson.vocabList.map((v: any, i: number) => (
                  <div
                    key={i}
                    className="bg-[#1e2024] p-4 rounded-2xl border border-white/5 flex justify-between items-center group hover:border-[#0ef]/30 transition-colors"
                  >
                    <div>
                      <p className="text-[#0ef] text-xs font-mono mb-1">
                        {v.romaji}
                      </p>
                      <p className="text-xl font-bold text-white">{v.jp}</p>
                      <p className="text-sm text-[#c4cfde]/70 mt-1">{v.id}</p>
                      {v.info && (
                        <span className="inline-block mt-2 text-[9px] bg-white/10 px-2 py-1 rounded text-white/50">
                          {v.info}
                        </span>
                      )}
                    </div>
                    <TTSReader text={v.jp} minimal={true} />
                  </div>
                ))}
              </div>
            )}

            {lesson.referenceWords && (
              <div>
                <h3 className="text-sm font-bold text-[#c4cfde]/60 uppercase tracking-widest mb-4">
                  Referensi Tambahan
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {lesson.referenceWords.map((v: any, i: number) => (
                    <div
                      key={i}
                      className="bg-white/5 p-4 rounded-xl border border-white/5 flex justify-between items-center"
                    >
                      <div>
                        <p className="text-white font-bold">{v.jp}</p>
                        <p className="text-xs text-[#c4cfde]/60 mt-1">{v.id}</p>
                      </div>
                      <TTSReader text={v.jp} minimal={true} />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </section>
        )}

        {/* SECTION 2: POLA & CONTOH KALIMAT */}
        {(lesson.patterns || lesson.examples) && (
          <section className="mb-16 bg-gradient-to-br from-blue-500/10 to-transparent p-6 md:p-8 rounded-[2rem] border border-blue-500/20">
            <h2 className="text-2xl font-black text-blue-400 mb-6 uppercase tracking-widest flex items-center gap-3">
              <span className="text-3xl">🎯</span> Pola & Contoh Kalimat
            </h2>

            {lesson.patterns &&
              lesson.patterns.map((p: any, i: number) => (
                <div
                  key={i}
                  className="bg-blue-500/20 p-5 rounded-xl border border-blue-500/30 mb-4 flex justify-between items-center shadow-lg"
                >
                  <div>
                    <ruby className="text-white text-xl md:text-2xl font-black tracking-wide">
                      {p.jp}{" "}
                      <rt className="text-xs text-blue-300">{p.furigana}</rt>
                    </ruby>
                    <p className="text-blue-100/80 mt-2 font-medium">{p.id}</p>
                  </div>
                  <TTSReader text={p.jp} minimal={true} />
                </div>
              ))}

            {lesson.examples && (
              <div className="mt-8 space-y-3 border-t border-blue-500/20 pt-6">
                <p className="text-xs text-blue-400 font-bold uppercase tracking-widest mb-4">
                  Reibun (Contoh)
                </p>
                {lesson.examples.map((e: any, i: number) => (
                  <div
                    key={i}
                    className="flex justify-between items-center bg-[#1e2024] p-4 rounded-xl border border-white/5"
                  >
                    <div>
                      <ruby className="text-white text-lg font-bold">
                        {e.jp}{" "}
                        <rt className="text-[10px] text-[#0ef]">
                          {e.furigana}
                        </rt>
                      </ruby>
                      <p className="text-sm text-[#c4cfde]/70 mt-1">{e.id}</p>
                    </div>
                    <TTSReader text={e.jp} minimal={true} />
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {/* SECTION 3: PERCAKAPAN */}
        {lesson.conversation && lesson.conversation.length > 0 && (
          <section className="mb-16">
            <h2 className="text-2xl font-black text-white border-b-2 border-white/10 pb-3 mb-6 uppercase tracking-widest flex items-center gap-3">
              <span className="text-3xl">🗣️</span> Percakapan
            </h2>
            <div className="bg-[#1e2024] p-6 md:p-8 rounded-[2rem] border border-white/10 shadow-xl">
              {lesson.conversationTitle && (
                <h3 className="text-xl font-black text-[#0ef] mb-6 text-center">
                  {lesson.conversationTitle}
                </h3>
              )}
              <div className="space-y-4">
                {lesson.conversation.map((c: any, i: number) => (
                  <div
                    key={i}
                    className="flex justify-between items-start gap-4 pb-4 border-b border-white/5 last:border-0"
                  >
                    <div>
                      <ruby className="text-white text-lg leading-relaxed">
                        {c.jp}{" "}
                        <rt className="text-[10px] text-[#0ef]">
                          {c.furigana}
                        </rt>
                      </ruby>
                      <p className="text-sm text-[#c4cfde]/60 mt-1 italic">
                        {c.id}
                      </p>
                    </div>
                    <TTSReader text={c.jp} minimal={true} />
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* SECTION 4: TATA BAHASA & KUIS */}
        {lesson.grammar && (
          <section className="mb-16">
            <h2 className="text-2xl font-black text-white border-b-2 border-white/10 pb-3 mb-6 uppercase tracking-widest flex items-center gap-3">
              <span className="text-3xl">📖</span> Tata Bahasa
            </h2>
            <div className="prose prose-invert max-w-none">
              <PortableText value={lesson.grammar} components={ptComponents} />
            </div>
          </section>
        )}

        {lesson.quizzes && lesson.quizzes.length > 0 && (
          <section className="mb-16">
            <QuizEngine questions={lesson.quizzes} />
          </section>
        )}

        {/* NAVIGATION */}
        <div className="grid grid-cols-2 gap-4 pt-10 border-t border-white/10">
          {prevLesson ? (
            <Link
              href={`/jlpt/${lesson.levelCode}/${prevLesson.slug}`}
              className="p-6 bg-[#1e2024] rounded-3xl hover:bg-[#23272b] transition-colors"
            >
              <p className="text-xs text-[#0ef] uppercase font-bold mb-1">
                ← Sebelumnya
              </p>
              <h4 className="text-white font-black">{prevLesson.title}</h4>
            </Link>
          ) : (
            <div></div>
          )}
          {nextLesson ? (
            <Link
              href={`/jlpt/${lesson.levelCode}/${nextLesson.slug}`}
              className="p-6 bg-[#1e2024] rounded-3xl hover:bg-[#23272b] transition-colors text-right"
            >
              <p className="text-xs text-[#0ef] uppercase font-bold mb-1">
                Selanjutnya →
              </p>
              <h4 className="text-white font-black">{nextLesson.title}</h4>
            </Link>
          ) : (
            <Link
              href={`/jlpt/${lesson.levelCode}`}
              className="p-6 bg-[#0ef]/10 border border-[#0ef]/30 rounded-3xl text-center"
            >
              <p className="text-[#0ef] font-black mt-2">
                Kembali ke Daftar Bab
              </p>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
