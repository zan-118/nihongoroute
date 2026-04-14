import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { client } from "@/sanity/lib/client";
import { PortableText, PortableTextComponents } from "@portabletext/react";
import QuizEngine from "@/components/QuizEngine";
import TTSReader from "@/components/TTSReader";
import AddToSRSButton from "@/components/AddToSRSButton";

export const revalidate = 3600;

interface Props {
  params: Promise<{ level: string; slug: string }>;
}

async function getLessonData(levelCode: string, slug: string) {
  const query = `{
    "lesson": *[_type == "lesson" && course_category->slug.current == $levelCode && slug.current == $slug][0] {
      _id, title, summary, 
      "levelCode": course_category->slug.current, 
      "levelTitle": course_category->title,
      "categoryType": course_category->type,
      vocabList[]-> { _id, word, furigana, romaji, meaning, kanjiDetails },
      referenceWords[]-> { _id, word, furigana, romaji, meaning },
      patterns, examples, conversationTitle, conversation, grammar, quizzes, seoTitle, seoDescription
    },
    "nav": *[_type == "lesson" && course_category->slug.current == $levelCode && is_published == true] | order(orderNumber asc) {
      "slug": slug.current, title
    }
  }`;
  return await client.fetch(query, { levelCode, slug });
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { level, slug } = await params;
  const { lesson } = await getLessonData(level, slug);
  if (!lesson) return { title: "Pelajaran Tidak Ditemukan | NihongoRoute" };
  return {
    title: lesson.seoTitle ?? `${lesson.title} | NihongoRoute`,
    description: lesson.seoDescription ?? lesson.summary,
  };
}

/* ================= KOMPONEN TEKS ================= */
const ptComponents: PortableTextComponents = {
  block: {
    h2: ({ children }) => (
      <h2 className="text-xl md:text-2xl font-black text-cyan-400 mt-12 mb-6 uppercase tracking-[0.2em] flex items-center gap-3 drop-shadow-[0_0_8px_rgba(34,211,238,0.5)] border-b border-cyan-400/20 pb-4">
        <span className="w-3 h-3 bg-cyan-400 rounded-sm shadow-[0_0_10px_#0ef]" />
        {children}
      </h2>
    ),
    h3: ({ children }) => (
      <h3 className="text-lg md:text-xl font-bold text-white mt-8 mb-4 tracking-wide flex items-center gap-2">
        <span className="text-cyan-400 opacity-50">#</span> {children}
      </h3>
    ),
    normal: ({ children }) => (
      <p className="mb-6 text-[#c4cfde] text-sm md:text-base leading-relaxed font-medium">
        {children}
      </p>
    ),
    blockquote: ({ children }) => (
      <blockquote className="my-8 border-l-4 border-purple-500 bg-purple-500/10 p-4 md:p-6 rounded-r-2xl text-purple-100 italic shadow-[inset_0_0_20px_rgba(168,85,247,0.05)] text-sm md:text-base">
        {children}
      </blockquote>
    ),
  },
  types: {
    callout: ({ value }: any) => (
      <div
        className={`border-l-4 p-4 md:p-6 rounded-r-2xl my-8 relative overflow-hidden shadow-lg ${
          value.type === "warning"
            ? "border-amber-500 bg-amber-500/10"
            : "border-cyan-400 bg-cyan-400/10"
        }`}
      >
        <div
          className={`absolute top-0 right-0 p-4 opacity-10 text-6xl ${value.type === "warning" ? "text-amber-500" : "text-cyan-400"}`}
        >
          {value.type === "warning" ? "⚠️" : "💡"}
        </div>
        <strong
          className={`flex items-center gap-2 mb-2 font-black uppercase tracking-widest text-xs relative z-10 ${value.type === "warning" ? "text-amber-400" : "text-cyan-400"}`}
        >
          {value.title}
        </strong>
        <p className="text-sm md:text-base text-white/90 relative z-10 leading-relaxed">
          {value.text}
        </p>
      </div>
    ),
    exampleSentence: ({ value }: any) => (
      <div className="bg-cyber-bg p-4 md:p-5 rounded-2xl border border-white/5 my-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-[inset_0_2px_5px_rgba(0,0,0,0.5)] hover:border-white/10 transition-colors">
        <div>
          <ruby className="text-white text-lg md:text-xl font-bold tracking-wide">
            {value.jp}
            <rt className="text-[10px] text-cyan-400 font-normal tracking-widest">
              {value.furigana}
            </rt>
          </ruby>
          <p className="text-xs md:text-sm text-[#c4cfde]/60 mt-2 font-medium">
            {value.id}
          </p>
        </div>
        <TTSReader text={value.jp} minimal={true} />
      </div>
    ),
  },
};

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
  const isSideQuest = lesson.categoryType === "general";

  return (
    <main className="min-h-screen px-4 md:px-8 pt-20 md:pt-24 pb-32 bg-cyber-bg relative overflow-hidden">
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />

      <article className="max-w-4xl mx-auto relative z-10">
        {/* BREADCRUMB */}
        <nav className="mb-6 md:mb-8 font-mono text-[9px] md:text-[10px] font-bold uppercase tracking-[0.2em] flex flex-wrap items-center gap-2 md:gap-3">
          <Link
            href={`/courses/${lesson.levelCode}`}
            className={`${isSideQuest ? "text-amber-500 bg-amber-500/10 border-amber-500/20" : "text-cyan-400 bg-cyan-400/10 border-cyan-400/20"} px-3 py-1.5 rounded-lg border hover:opacity-80 transition-all whitespace-nowrap`}
          >
            {isSideQuest ? "🌟" : "🏆"} {lesson.levelTitle}
          </Link>
          <span className="text-white/20">/</span>
          <span className="text-white/60 bg-white/5 px-3 py-1.5 rounded-lg border border-white/5 uppercase italic truncate max-w-[150px] md:max-w-xs">
            Bab: {lesson.title}
          </span>
        </nav>

        {/* HEADER */}
        <header className="mb-12 md:mb-16">
          <h1
            className={`text-4xl md:text-6xl lg:text-7xl font-black mb-4 md:mb-6 tracking-tighter italic uppercase drop-shadow-lg ${isSideQuest ? "text-amber-400" : "text-white"}`}
          >
            {lesson.title}
          </h1>
          {lesson.summary && (
            <div
              className={`p-5 md:p-8 rounded-[1.5rem] md:rounded-[2rem] border-l-4 shadow-xl ${isSideQuest ? "bg-amber-500/5 border-amber-500" : "bg-cyan-400/10 border-cyan-400"}`}
            >
              <p
                className={`text-sm md:text-lg font-medium tracking-wide leading-relaxed ${isSideQuest ? "text-amber-200/80" : "text-cyan-400"}`}
              >
                {lesson.summary}
              </p>
            </div>
          )}
        </header>

        {/* BODY */}
        {isSideQuest ? (
          <div className="flex flex-col gap-10 md:gap-12 mb-24">
            {lesson.grammar && (
              <section className="bg-cyber-surface/40 p-6 md:p-12 rounded-[2rem] md:rounded-[3rem] border border-white/5 shadow-inner">
                <div className="prose-custom max-w-none">
                  <PortableText
                    value={lesson.grammar}
                    components={ptComponents}
                  />
                </div>
              </section>
            )}

            {/* Vocab & Comms Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
              {lesson.vocabList?.length > 0 && (
                <div className="space-y-5 bg-cyber-surface/30 p-5 md:p-6 rounded-[2rem] border border-white/5">
                  <h3 className="text-amber-500 font-black uppercase italic tracking-widest text-xs flex items-center gap-3">
                    <span className="text-2xl not-italic">🎒</span> Kosakata
                    Penting
                  </h3>
                  <div className="space-y-3">
                    {lesson.vocabList.slice(0, 8).map((v: any) => (
                      <div
                        key={v._id}
                        className="bg-cyber-bg/50 p-4 rounded-2xl border border-white/5 flex justify-between items-center group hover:border-amber-500/30 transition-colors"
                      >
                        <div>
                          <p className="text-white font-bold text-base md:text-lg leading-none">
                            {v.word}
                          </p>
                          <p className="text-[10px] text-amber-500/60 uppercase font-mono mt-1">
                            {v.romaji}
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-[10px] md:text-xs font-medium text-white/50 text-right max-w-[100px] md:max-w-[120px] truncate">
                            {v.meaning}
                          </span>
                          <TTSReader text={v.word} minimal={true} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {lesson.conversation?.length > 0 && (
                <div className="space-y-5 bg-cyber-surface/30 p-5 md:p-6 rounded-[2rem] border border-white/5 h-fit">
                  <h3 className="text-amber-500 font-black uppercase italic tracking-widest text-xs flex items-center gap-3">
                    <span className="text-2xl not-italic">💬</span> Dialog
                    Praktis
                  </h3>
                  <div className="space-y-4">
                    {lesson.conversation
                      .slice(0, 3)
                      .map((c: any, i: number) => (
                        <div
                          key={i}
                          className="bg-amber-500/5 p-4 md:p-5 rounded-2xl border border-amber-500/10"
                        >
                          <div className="flex justify-between items-start gap-4">
                            <p className="italic text-white/90 text-xs md:text-sm leading-relaxed font-bold">
                              "{c.jp}"
                            </p>
                            <div className="shrink-0 -mt-1">
                              <TTSReader text={c.jp} minimal={true} />
                            </div>
                          </div>
                          <p className="text-[9px] md:text-[10px] mt-3 text-amber-500/50 not-italic border-t border-amber-500/10 pt-2 font-medium">
                            {c.id}
                          </p>
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </div>

            {lesson.quizzes?.length > 0 && (
              <section className="mt-6 md:mt-8">
                <h2 className="text-2xl md:text-3xl font-black text-amber-500 mb-6 md:mb-8 uppercase tracking-[0.2em] flex items-center gap-3 md:gap-4 italic drop-shadow-md border-b border-white/5 pb-4 md:pb-6">
                  <span className="text-3xl md:text-4xl not-italic">🧩</span>{" "}
                  Latihan Mini
                </h2>
                <QuizEngine questions={lesson.quizzes} />
              </section>
            )}
          </div>
        ) : (
          <div className="mb-24">
            {/* Kosakata */}
            {lesson.vocabList?.length > 0 && (
              <section className="mb-16 md:mb-24">
                <h2 className="text-2xl md:text-3xl font-black text-white border-b border-white/10 pb-4 md:pb-6 mb-6 md:mb-8 uppercase tracking-[0.2em] flex items-center gap-3 md:gap-4 italic drop-shadow-md">
                  <span className="text-3xl md:text-4xl not-italic drop-shadow-[0_0_15px_rgba(34,211,238,0.5)]">
                    📝
                  </span>{" "}
                  Target Kosakata
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
                  {lesson.vocabList.map((v: any) => (
                    <div
                      key={v._id}
                      className="bg-cyber-surface p-5 md:p-6 rounded-[1.5rem] md:rounded-[2rem] border border-white/5 flex justify-between items-center group transition-all duration-300 hover:border-cyan-400/30 shadow-[6px_6px_15px_rgba(0,0,0,0.5)] hover:shadow-[0_0_25px_rgba(34,211,238,0.1)]"
                    >
                      <div className="flex-1 pr-4">
                        <div className="flex items-center gap-2 mb-2">
                          <p className="text-cyan-400 font-mono text-[9px] md:text-[10px] font-black uppercase tracking-widest opacity-80 bg-cyan-400/10 px-2 py-0.5 rounded">
                            {v.romaji}
                          </p>
                          {v.kanjiDetails?.group && (
                            <span className="bg-purple-500/10 text-purple-400 border border-purple-500/20 px-2 py-0.5 rounded text-[8px] md:text-[9px] font-black uppercase tracking-widest">
                              G{v.kanjiDetails.group}
                            </span>
                          )}
                        </div>
                        <p className="text-2xl md:text-3xl font-black text-white tracking-tight drop-shadow-md">
                          {v.word}
                        </p>
                        <p className="text-xs md:text-sm text-[#c4cfde]/60 mt-1 md:mt-2 font-medium">
                          {v.meaning}
                        </p>
                      </div>
                      <div className="flex flex-col gap-2 md:gap-3">
                        <AddToSRSButton wordId={v._id} />
                        <TTSReader text={v.word} minimal={true} />
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Pola Kalimat */}
            {(lesson.patterns || lesson.examples) && (
              <section className="mb-16 md:mb-24 bg-cyber-surface p-6 md:p-12 rounded-[2rem] md:rounded-[3rem] border border-white/5 shadow-[inset_0_2px_10px_rgba(0,0,0,0.5)]">
                <h2 className="text-2xl md:text-3xl font-black text-cyan-400 mb-8 md:mb-10 uppercase tracking-[0.2em] flex items-center gap-3 md:gap-4 italic drop-shadow-[0_0_10px_rgba(34,211,238,0.3)]">
                  <span className="text-3xl md:text-4xl not-italic">🎯</span>{" "}
                  Pola Kalimat
                </h2>
                {lesson.patterns?.map((p: any, i: number) => (
                  <div
                    key={i}
                    className="bg-cyber-bg p-5 md:p-8 rounded-2xl md:rounded-3xl border border-cyan-400/20 mb-5 flex flex-col md:flex-row justify-between items-start md:items-center shadow-[0_10px_30px_rgba(0,0,0,0.4)] hover:border-cyan-400/50 transition-colors gap-4"
                  >
                    <div>
                      <ruby className="text-white text-2xl md:text-3xl font-black tracking-wider leading-relaxed drop-shadow-md">
                        {p.jp}
                        <rt className="text-[10px] md:text-[11px] text-cyan-400 font-normal tracking-widest">
                          {p.furigana}
                        </rt>
                      </ruby>
                      <p className="text-[#c4cfde] mt-3 md:mt-4 font-bold text-sm md:text-base border-l-2 border-cyan-400 pl-3 md:pl-4 italic">
                        {p.id}
                      </p>
                    </div>
                    <div className="self-end md:self-auto shrink-0">
                      <TTSReader text={p.jp} minimal={true} />
                    </div>
                  </div>
                ))}

                {lesson.examples && (
                  <div className="mt-10 md:mt-12 space-y-4">
                    <p className="text-[9px] md:text-[10px] text-white/30 font-black uppercase tracking-[0.4em] mb-4 md:mb-6 flex items-center gap-4">
                      <span className="h-[1px] flex-1 bg-white/10" /> Contoh
                      Kalimat <span className="h-[1px] flex-1 bg-white/10" />
                    </p>
                    {lesson.examples.map((e: any, i: number) => (
                      <div
                        key={i}
                        className="flex flex-col md:flex-row justify-between items-start md:items-center bg-cyber-bg/50 p-4 md:p-5 rounded-xl md:rounded-2xl border border-white/5 hover:bg-cyber-bg hover:border-white/10 transition-colors group gap-3"
                      >
                        <div>
                          <ruby className="text-white text-base md:text-lg font-bold group-hover:text-cyan-400 transition-colors">
                            {e.jp}
                            <rt className="text-[9px] md:text-[10px] text-cyan-400 opacity-70 tracking-widest">
                              {e.furigana}
                            </rt>
                          </ruby>
                          <p className="text-xs md:text-sm text-[#c4cfde]/60 mt-1 md:mt-1.5 font-medium">
                            {e.id}
                          </p>
                        </div>
                        <div className="self-end md:self-auto shrink-0">
                          <TTSReader text={e.jp} minimal={true} />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            )}

            {/* Penjelasan Tata Bahasa */}
            {lesson.grammar && (
              <section className="mb-16 md:mb-24">
                <h2 className="text-2xl md:text-3xl font-black text-white border-b border-white/10 pb-4 md:pb-6 mb-6 md:mb-8 uppercase tracking-[0.2em] flex items-center gap-3 md:gap-4 italic drop-shadow-md">
                  <span className="text-3xl md:text-4xl not-italic">📖</span>{" "}
                  Penjelasan Materi
                </h2>
                <div className="bg-cyber-surface p-6 md:p-12 rounded-[2rem] md:rounded-[3rem] border border-white/5 shadow-inner">
                  <div className="prose-custom max-w-none">
                    <PortableText
                      value={lesson.grammar}
                      components={ptComponents}
                    />
                  </div>
                </div>
              </section>
            )}

            {/* Kuis */}
            {lesson.quizzes?.length > 0 && (
              <section className="mb-16 md:mb-24">
                <h2 className="text-2xl md:text-3xl font-black text-white border-b border-white/10 pb-4 md:pb-6 mb-6 md:mb-8 uppercase tracking-[0.2em] flex items-center gap-3 md:gap-4 italic drop-shadow-md">
                  <span className="text-3xl md:text-4xl not-italic">⚡</span>{" "}
                  Uji Pemahaman
                </h2>
                <QuizEngine questions={lesson.quizzes} />
              </section>
            )}
          </div>
        )}

        {/* BOTTOM NAVIGATION */}
        <nav className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6 pt-10 md:pt-12 border-t border-white/10">
          {prevLesson ? (
            <Link
              href={`/courses/${lesson.levelCode}/${prevLesson.slug}`}
              className="group relative p-6 md:p-8 bg-cyber-surface rounded-[2rem] md:rounded-[2.5rem] border border-white/5 shadow-[6px_6px_15px_rgba(0,0,0,0.5)] active:translate-y-1 transition-all flex flex-col items-start"
            >
              <div
                className={`absolute inset-0 opacity-0 group-hover:opacity-100 rounded-[2rem] md:rounded-[2.5rem] transition-opacity ${isSideQuest ? "bg-amber-500/5" : "bg-cyan-400/5"}`}
              />
              <p
                className={`text-[9px] md:text-[10px] uppercase font-black tracking-[0.2em] md:tracking-[0.3em] mb-2 md:mb-3 opacity-60 group-hover:opacity-100 transition-opacity ${isSideQuest ? "text-amber-500" : "text-cyan-400"}`}
              >
                ← Bab Sebelumnya
              </p>
              <h4
                className={`text-white font-black text-lg md:text-xl leading-tight uppercase italic transition-colors relative z-10 ${isSideQuest ? "group-hover:text-amber-400" : "group-hover:text-cyan-400"}`}
              >
                {prevLesson.title}
              </h4>
            </Link>
          ) : (
            <div className="hidden sm:block" />
          )}

          {nextLesson ? (
            <Link
              href={`/courses/${lesson.levelCode}/${nextLesson.slug}`}
              className="group relative p-6 md:p-8 bg-cyber-surface rounded-[2rem] md:rounded-[2.5rem] border border-white/5 shadow-[6px_6px_15px_rgba(0,0,0,0.5)] active:translate-y-1 transition-all flex flex-col items-end text-right"
            >
              <div
                className={`absolute inset-0 opacity-0 group-hover:opacity-100 rounded-[2rem] md:rounded-[2.5rem] transition-opacity ${isSideQuest ? "bg-amber-500/5" : "bg-cyan-400/5"}`}
              />
              <p
                className={`text-[9px] md:text-[10px] uppercase font-black tracking-[0.2em] md:tracking-[0.3em] mb-2 md:mb-3 opacity-60 group-hover:opacity-100 transition-opacity ${isSideQuest ? "text-amber-500" : "text-cyan-400"}`}
              >
                Bab Selanjutnya →
              </p>
              <h4
                className={`text-white font-black text-lg md:text-xl leading-tight uppercase italic transition-colors relative z-10 ${isSideQuest ? "group-hover:text-amber-400" : "group-hover:text-cyan-400"}`}
              >
                {nextLesson.title}
              </h4>
            </Link>
          ) : (
            <Link
              href={`/courses/${lesson.levelCode}`}
              className={`group relative p-6 md:p-8 rounded-[2rem] md:rounded-[2.5rem] border active:translate-y-1 transition-all flex flex-col items-center justify-center text-center ${isSideQuest ? "bg-amber-500/10 border-amber-500/30" : "bg-cyan-400/10 border-cyan-400/30"}`}
            >
              <span className="text-2xl md:text-3xl mb-2 md:mb-3 drop-shadow-md group-hover:scale-110 transition-transform">
                {isSideQuest ? "🗺️" : "🎉"}
              </span>
              <p
                className={`font-black uppercase text-xs md:text-sm tracking-[0.2em] ${isSideQuest ? "text-amber-500" : "text-cyan-400"}`}
              >
                Selesai
              </p>
            </Link>
          )}
        </nav>
      </article>
    </main>
  );
}
