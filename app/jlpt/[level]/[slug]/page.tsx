import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { client } from "@/sanity/lib/client";
import { PortableText } from "@portabletext/react";
import QuizEngine from "@/components/QuizEngine";
import TTSReader from "@/components/TTSReader";
import AddToSRSButton from "@/components/AddToSRSButton";

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
      "levelCode": level->code,
      vocabList[]-> {
        _id,
        word,
        furigana,
        romaji,
        meaning,
        kanjiDetails
      },
      referenceWords[]-> {
        _id,
        word,
        furigana,
        romaji,
        meaning
      },
      patterns,
      examples,
      conversationTitle,
      conversation,
      grammar,
      quizzes,
      seoTitle,
      seoDescription
    },
    "nav": *[_type == "lesson" && level->code == $levelCode && is_published == true] | order(orderNumber asc) {
      "slug": slug.current,
      title
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

/* ================= CUSTOM PORTABLE TEXT COMPONENTS ================= */
// Membuat materi panjang terlihat seperti Cyber-Document
const ptComponents = {
  block: {
    h2: ({ children }: any) => (
      <h2 className="text-2xl font-black text-[#0ef] mt-12 mb-6 uppercase tracking-[0.2em] flex items-center gap-3 drop-shadow-[0_0_8px_rgba(0,255,239,0.5)] border-b border-[#0ef]/20 pb-4">
        <span className="w-3 h-3 bg-[#0ef] rounded-sm shadow-[0_0_10px_#0ef]" />
        {children}
      </h2>
    ),
    h3: ({ children }: any) => (
      <h3 className="text-xl font-bold text-white mt-8 mb-4 tracking-wide flex items-center gap-2">
        <span className="text-[#0ef] opacity-50">#</span> {children}
      </h3>
    ),
    normal: ({ children }: any) => (
      <p className="mb-6 text-[#c4cfde] text-base leading-relaxed font-medium">
        {children}
      </p>
    ),
    blockquote: ({ children }: any) => (
      <blockquote className="my-8 border-l-4 border-purple-500 bg-purple-500/10 p-6 rounded-r-2xl text-purple-100 italic shadow-[inset_0_0_20px_rgba(168,85,247,0.05)]">
        {children}
      </blockquote>
    ),
  },
  types: {
    callout: ({ value }: any) => (
      <div
        className={`border-l-4 p-6 rounded-r-2xl my-8 relative overflow-hidden shadow-lg ${
          value.type === "warning"
            ? "border-yellow-500 bg-yellow-500/10 shadow-[0_0_15px_rgba(250,204,21,0.1)]"
            : "border-[#0ef] bg-[#0ef]/10 shadow-[0_0_15px_rgba(0,255,239,0.1)]"
        }`}
      >
        <div
          className={`absolute top-0 right-0 p-4 opacity-10 text-6xl ${value.type === "warning" ? "text-yellow-500" : "text-[#0ef]"}`}
        >
          {value.type === "warning" ? "⚠️" : "💡"}
        </div>
        <strong
          className={`flex items-center gap-2 mb-2 font-black uppercase tracking-widest text-xs relative z-10 ${
            value.type === "warning" ? "text-yellow-400" : "text-[#0ef]"
          }`}
        >
          {value.title}
        </strong>
        <p className="text-sm text-white/90 relative z-10 leading-relaxed">
          {value.text}
        </p>
      </div>
    ),
    exampleSentence: ({ value }: any) => (
      <div className="bg-[#15171a] p-5 rounded-2xl border border-white/5 my-5 flex justify-between items-center gap-4 shadow-[inset_0_2px_5px_rgba(0,0,0,0.5)] hover:border-white/10 transition-colors">
        <div>
          <ruby className="text-white text-lg font-bold tracking-wide">
            {value.jp}
            <rt className="text-[10px] text-[#0ef] font-normal tracking-widest">
              {value.furigana}
            </rt>
          </ruby>
          <p className="text-sm text-[#c4cfde]/60 mt-2 font-medium">
            {value.id}
          </p>
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
    <div className="min-h-screen px-4 md:px-8 pt-24 pb-32 bg-[#15171a] relative overflow-hidden">
      {/* Background Cyber Lines */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />

      <div className="max-w-4xl mx-auto relative z-10">
        {/* BREADCRUMB */}
        <nav className="mb-8 font-mono text-[10px] font-bold uppercase tracking-[0.2em] flex items-center gap-3">
          <Link
            href={`/jlpt/${lesson.levelCode}`}
            className="text-[#0ef] bg-[#0ef]/10 px-3 py-1.5 rounded-lg border border-[#0ef]/20 hover:bg-[#0ef]/20 transition-colors"
          >
            JLPT {lesson.levelCode.toUpperCase()}
          </Link>
          <span className="text-white/20">/</span>
          <span className="text-white/60 bg-white/5 px-3 py-1.5 rounded-lg border border-white/5">
            {lesson.title}
          </span>
        </nav>

        {/* HEADER */}
        <header className="mb-16">
          <h1 className="text-5xl md:text-7xl font-black text-white mb-6 tracking-tighter italic uppercase drop-shadow-lg">
            {lesson.title}
          </h1>
          {lesson.summary && (
            <div className="p-6 md:p-8 rounded-[2rem] bg-gradient-to-r from-[#0ef]/10 to-transparent border-l-4 border-[#0ef] shadow-[inset_0_0_20px_rgba(0,255,239,0.05)]">
              <p className="text-[#0ef] text-lg font-medium tracking-wide leading-relaxed">
                {lesson.summary}
              </p>
            </div>
          )}
        </header>

        {/* SECTION 1: KOSAKATA */}
        {lesson.vocabList?.length > 0 && (
          <section className="mb-24">
            <h2 className="text-3xl font-black text-white border-b border-white/10 pb-6 mb-8 uppercase tracking-[0.2em] flex items-center gap-4 italic drop-shadow-md">
              <span className="text-4xl not-italic drop-shadow-[0_0_15px_rgba(0,255,239,0.5)]">
                📝
              </span>{" "}
              Target Vocab
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {lesson.vocabList.map((v: any) => (
                <div
                  key={v._id}
                  className="bg-[#1e2024] p-6 rounded-[2rem] border border-white/5 flex justify-between items-center group transition-all duration-300 hover:border-[#0ef]/30 shadow-[6px_6px_15px_rgba(0,0,0,0.5),-4px_-4px_10px_rgba(255,255,255,0.02)] hover:shadow-[0_0_25px_rgba(0,255,239,0.1)]"
                >
                  <div className="flex-1 pr-4">
                    <div className="flex items-center gap-3 mb-2">
                      <p className="text-[#0ef] font-mono text-[10px] font-black uppercase tracking-widest opacity-80 bg-[#0ef]/10 px-2 py-0.5 rounded">
                        {v.romaji}
                      </p>
                      {v.kanjiDetails?.group && (
                        <span className="bg-purple-500/10 text-purple-400 border border-purple-500/20 px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest">
                          G{v.kanjiDetails.group}
                        </span>
                      )}
                    </div>
                    <p className="text-3xl font-black text-white tracking-tight drop-shadow-md">
                      {v.word}
                    </p>
                    <p className="text-sm text-[#c4cfde]/60 mt-2 font-medium">
                      {v.meaning}
                    </p>
                  </div>

                  <div className="flex flex-col gap-3">
                    <AddToSRSButton wordId={v._id} />
                    <TTSReader text={v.word} minimal={true} />
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* SECTION 2: POLA & CONTOH KALIMAT */}
        {(lesson.patterns || lesson.examples) && (
          <section className="mb-24 bg-[#1e2024] p-8 md:p-12 rounded-[3rem] border border-white/5 shadow-[inset_0_2px_10px_rgba(0,0,0,0.5)]">
            <h2 className="text-3xl font-black text-[#0ef] mb-10 uppercase tracking-[0.2em] flex items-center gap-4 italic drop-shadow-[0_0_10px_rgba(0,255,239,0.3)]">
              <span className="text-4xl not-italic">🎯</span> Pattern Match
            </h2>

            {lesson.patterns?.map((p: any, i: number) => (
              <div
                key={i}
                className="bg-[#15171a] p-6 md:p-8 rounded-3xl border border-[#0ef]/20 mb-6 flex justify-between items-center shadow-[0_10px_30px_rgba(0,0,0,0.4)] hover:border-[#0ef]/50 transition-colors"
              >
                <div>
                  <ruby className="text-white text-3xl font-black tracking-wider leading-relaxed drop-shadow-md">
                    {p.jp}
                    <rt className="text-[11px] text-[#0ef] font-normal tracking-widest">
                      {p.furigana}
                    </rt>
                  </ruby>
                  <p className="text-[#c4cfde] mt-4 font-bold text-base border-l-2 border-[#0ef] pl-4 italic">
                    {p.id}
                  </p>
                </div>
                <div className="ml-4 shrink-0">
                  <TTSReader text={p.jp} minimal={true} />
                </div>
              </div>
            ))}

            {lesson.examples && (
              <div className="mt-12 space-y-4">
                <p className="text-[10px] text-white/30 font-black uppercase tracking-[0.4em] mb-6 flex items-center gap-4">
                  <span className="h-[1px] flex-1 bg-white/10" />
                  Database Query: Reibun
                  <span className="h-[1px] flex-1 bg-white/10" />
                </p>
                {lesson.examples.map((e: any, i: number) => (
                  <div
                    key={i}
                    className="flex justify-between items-center bg-[#15171a]/50 p-5 rounded-2xl border border-white/5 hover:bg-[#15171a] hover:border-white/10 transition-colors group"
                  >
                    <div>
                      <ruby className="text-white text-lg font-bold group-hover:text-[#0ef] transition-colors">
                        {e.jp}
                        <rt className="text-[10px] text-[#0ef] opacity-70 tracking-widest">
                          {e.furigana}
                        </rt>
                      </ruby>
                      <p className="text-sm text-[#c4cfde]/60 mt-1.5 font-medium">
                        {e.id}
                      </p>
                    </div>
                    <TTSReader text={e.jp} minimal={true} />
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {/* SECTION 3: PERCAKAPAN (TRANSCRIPT LOG) */}
        {lesson.conversation?.length > 0 && (
          <section className="mb-24">
            <h2 className="text-3xl font-black text-white border-b border-white/10 pb-6 mb-8 uppercase tracking-[0.2em] flex items-center gap-4 italic drop-shadow-md">
              <span className="text-4xl not-italic">🗣️</span> Comms Log
            </h2>
            <div className="bg-[#1e2024] p-8 md:p-12 rounded-[3rem] border border-white/5 shadow-[15px_15px_40px_rgba(0,0,0,0.6)] relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-5 text-8xl font-black italic select-none uppercase tracking-tighter">
                Log
              </div>

              {lesson.conversationTitle && (
                <div className="mb-10 text-center relative z-10">
                  <span className="text-[#0ef] font-mono text-[10px] uppercase tracking-[0.4em] mb-2 block">
                    Session Transcript
                  </span>
                  <h3 className="text-2xl font-black text-white uppercase tracking-widest italic">
                    "{lesson.conversationTitle}"
                  </h3>
                </div>
              )}

              <div className="space-y-8 relative z-10 border-l border-white/10 pl-6 md:pl-8 ml-2">
                {lesson.conversation.map((c: any, i: number) => (
                  <div key={i} className="relative group">
                    {/* Log Node Indicator */}
                    <div className="absolute -left-[31px] md:-left-[39px] top-2 w-3 h-3 bg-[#15171a] border-2 border-white/20 rounded-full group-hover:border-[#0ef] group-hover:bg-[#0ef] transition-colors shadow-[0_0_10px_rgba(0,0,0,0.5)]" />

                    <div className="flex justify-between items-start gap-6 bg-[#15171a]/50 p-5 rounded-2xl border border-white/5 hover:border-white/10 transition-colors">
                      <div className="flex-1">
                        <ruby className="text-white text-xl leading-loose font-bold group-hover:text-[#0ef] transition-colors">
                          {c.jp}
                          <rt className="text-[10px] text-[#0ef] font-black opacity-80 uppercase tracking-widest">
                            {c.furigana}
                          </rt>
                        </ruby>
                        <p className="text-sm text-[#c4cfde]/60 mt-3 italic font-medium">
                          {c.id}
                        </p>
                      </div>
                      <div className="shrink-0 pt-2">
                        <TTSReader text={c.jp} minimal={true} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* SECTION 4: TATA BAHASA */}
        {lesson.grammar && (
          <section className="mb-24">
            <h2 className="text-3xl font-black text-white border-b border-white/10 pb-6 mb-8 uppercase tracking-[0.2em] flex items-center gap-4 italic drop-shadow-md">
              <span className="text-4xl not-italic">📖</span> Syntax Rule
            </h2>
            <div className="bg-[#1e2024] p-8 md:p-12 rounded-[3rem] border border-white/5 shadow-inner">
              <div className="prose-custom max-w-none">
                <PortableText
                  value={lesson.grammar}
                  components={ptComponents}
                />
              </div>
            </div>
          </section>
        )}

        {/* SECTION 5: KUIS */}
        {lesson.quizzes?.length > 0 && (
          <section className="mb-24">
            <h2 className="text-3xl font-black text-white border-b border-white/10 pb-6 mb-8 uppercase tracking-[0.2em] flex items-center gap-4 italic drop-shadow-md">
              <span className="text-4xl not-italic">⚡</span> Skill Check
            </h2>
            <QuizEngine questions={lesson.quizzes} />
          </section>
        )}

        {/* BOTTOM NAVIGATION (TACTILE BUTTONS) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-12 border-t border-white/10">
          {prevLesson ? (
            <Link
              href={`/jlpt/${lesson.levelCode}/${prevLesson.slug}`}
              className="group relative p-8 bg-[#1e2024] rounded-[2.5rem] border border-white/5 shadow-[6px_6px_15px_rgba(0,0,0,0.5),-4px_-4px_10px_rgba(255,255,255,0.02)] active:shadow-[inset_4px_4px_10px_rgba(0,0,0,0.5)] active:translate-y-1 transition-all flex flex-col items-start"
            >
              <div className="absolute inset-0 bg-[#0ef]/5 opacity-0 group-hover:opacity-100 rounded-[2.5rem] transition-opacity" />
              <p className="text-[10px] text-[#0ef] uppercase font-black tracking-[0.3em] mb-3 opacity-60 group-hover:opacity-100 transition-opacity">
                ← Previous Module
              </p>
              <h4 className="text-white font-black text-xl leading-tight uppercase italic group-hover:text-[#0ef] transition-colors relative z-10">
                {prevLesson.title}
              </h4>
            </Link>
          ) : (
            <div className="hidden md:block" />
          )}

          {nextLesson ? (
            <Link
              href={`/jlpt/${lesson.levelCode}/${nextLesson.slug}`}
              className="group relative p-8 bg-[#1e2024] rounded-[2.5rem] border border-white/5 shadow-[6px_6px_15px_rgba(0,0,0,0.5),-4px_-4px_10px_rgba(255,255,255,0.02)] active:shadow-[inset_4px_4px_10px_rgba(0,0,0,0.5)] active:translate-y-1 transition-all flex flex-col items-end text-right"
            >
              <div className="absolute inset-0 bg-[#0ef]/5 opacity-0 group-hover:opacity-100 rounded-[2.5rem] transition-opacity" />
              <p className="text-[10px] text-[#0ef] uppercase font-black tracking-[0.3em] mb-3 opacity-60 group-hover:opacity-100 transition-opacity">
                Next Module →
              </p>
              <h4 className="text-white font-black text-xl leading-tight uppercase italic group-hover:text-[#0ef] transition-colors relative z-10">
                {nextLesson.title}
              </h4>
            </Link>
          ) : (
            <Link
              href={`/jlpt/${lesson.levelCode}`}
              className="group relative p-8 bg-[#0ef]/10 rounded-[2.5rem] border border-[#0ef]/30 shadow-[0_0_20px_rgba(0,255,239,0.1)] active:shadow-[inset_4px_4px_10px_rgba(0,255,239,0.2)] active:translate-y-1 transition-all flex flex-col items-center justify-center text-center"
            >
              <span className="text-3xl mb-3 drop-shadow-md group-hover:scale-110 transition-transform">
                🎉
              </span>
              <p className="text-[#0ef] font-black uppercase text-sm tracking-[0.2em]">
                Level Completed
              </p>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
