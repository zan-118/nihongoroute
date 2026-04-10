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
const ptComponents = {
  block: {
    h2: ({ children }: any) => (
      <h2 className="text-2xl font-black text-[#0ef] mt-10 mb-4 italic uppercase tracking-wider">
        {children}
      </h2>
    ),
    normal: ({ children }: any) => (
      <p className="mb-4 text-[#c4cfde]/90 text-base leading-relaxed">
        {children}
      </p>
    ),
  },
  types: {
    callout: ({ value }: any) => (
      <div
        className={`border-l-4 p-6 rounded-r-2xl my-8 ${
          value.type === "warning"
            ? "border-yellow-500 bg-yellow-500/10"
            : "border-[#0ef] bg-[#0ef]/5"
        }`}
      >
        <strong
          className={`block mb-2 font-black uppercase tracking-widest text-xs ${
            value.type === "warning" ? "text-yellow-400" : "text-[#0ef]"
          }`}
        >
          {value.title}
        </strong>
        <p className="text-sm text-[#c4cfde]">{value.text}</p>
      </div>
    ),
    exampleSentence: ({ value }: any) => (
      <div className="bg-[#1e2024] p-4 rounded-xl border border-white/5 my-4 flex justify-between items-center gap-4">
        <div>
          <ruby className="text-white text-lg font-bold">
            {value.jp}
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
        {/* BREADCRUMB */}
        <nav className="mb-8 text-[10px] font-bold uppercase tracking-[0.2em] text-[#c4cfde]/40 flex items-center gap-2">
          <Link
            href={`/jlpt/${lesson.levelCode}`}
            className="hover:text-[#0ef] transition-colors"
          >
            JLPT {lesson.levelCode.toUpperCase()}
          </Link>
          <span className="opacity-20">/</span>
          <span className="text-white/60">{lesson.title}</span>
        </nav>

        <header className="mb-12">
          <h1 className="text-4xl md:text-6xl font-black text-white mb-6 tracking-tighter italic uppercase">
            {lesson.title}
          </h1>
          {lesson.summary && (
            <div className="p-5 rounded-2xl bg-gradient-to-r from-[#0ef]/10 to-transparent border-l-2 border-[#0ef]">
              <p className="text-[#0ef] text-lg font-medium">
                {lesson.summary}
              </p>
            </div>
          )}
        </header>

        {/* SECTION 1: KOSAKATA */}
        {lesson.vocabList?.length > 0 && (
          <section className="mb-20">
            <h2 className="text-2xl font-black text-white border-b border-white/10 pb-4 mb-8 uppercase tracking-[0.3em] flex items-center gap-4 italic">
              <span className="text-3xl not-italic">📝</span> Kosakata Baru
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {lesson.vocabList.map((v: any) => (
                <div
                  key={v._id}
                  className="bg-[#1e2024] p-5 rounded-3xl border border-white/5 flex justify-between items-center group hover:border-[#0ef]/30 transition-all hover:shadow-[0_0_20px_rgba(0,255,239,0.05)]"
                >
                  <div className="flex-1 pr-4">
                    <div className="flex items-center gap-2 mb-1.5">
                      <p className="text-[#0ef] text-[10px] font-black uppercase tracking-tighter opacity-70">
                        {v.romaji}
                      </p>
                      {v.kanjiDetails?.group && (
                        <span className={`badge-g${v.kanjiDetails.group}`}>
                          G{v.kanjiDetails.group}
                        </span>
                      )}
                    </div>
                    <p className="text-2xl font-black text-white tracking-tight">
                      {v.word}
                    </p>
                    <p className="text-sm text-[#c4cfde]/60 mt-1 font-medium">
                      {v.meaning}
                    </p>
                  </div>

                  <div className="flex flex-col gap-2">
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
          <section className="mb-20 bg-gradient-to-br from-[#0ef]/5 to-transparent p-6 md:p-10 rounded-[3rem] border border-[#0ef]/10 shadow-inner">
            <h2 className="text-2xl font-black text-[#0ef] mb-8 uppercase tracking-[0.3em] flex items-center gap-4 italic">
              <span className="text-3xl not-italic">🎯</span> Pola & Reibun
            </h2>

            {lesson.patterns?.map((p: any, i: number) => (
              <div
                key={i}
                className="bg-white/5 backdrop-blur-sm p-6 rounded-2xl border border-white/10 mb-6 flex justify-between items-center shadow-xl"
              >
                <div>
                  <ruby className="text-white text-2xl font-black tracking-wide leading-relaxed">
                    {p.jp}
                    <rt className="text-xs text-[#0ef] opacity-80">
                      {p.furigana}
                    </rt>
                  </ruby>
                  <p className="text-[#c4cfde] mt-3 font-bold text-base border-l-2 border-[#0ef] pl-4 italic">
                    {p.id}
                  </p>
                </div>
                <TTSReader text={p.jp} minimal={true} />
              </div>
            ))}

            {lesson.examples && (
              <div className="mt-10 space-y-4">
                <p className="text-[10px] text-[#0ef] font-black uppercase tracking-[0.4em] mb-6 opacity-50">
                  Daftar Contoh Kalimat
                </p>
                {lesson.examples.map((e: any, i: number) => (
                  <div
                    key={i}
                    className="flex justify-between items-center bg-[#1e2024]/50 p-4 rounded-2xl border border-white/5 hover:bg-[#1e2024] transition-colors"
                  >
                    <div>
                      <ruby className="text-white text-lg font-bold">
                        {e.jp}
                        <rt className="text-[10px] text-[#0ef] opacity-70">
                          {e.furigana}
                        </rt>
                      </ruby>
                      <p className="text-xs text-[#c4cfde]/60 mt-1.5">{e.id}</p>
                    </div>
                    <TTSReader text={e.jp} minimal={true} />
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {/* SECTION 3: PERCAKAPAN */}
        {lesson.conversation?.length > 0 && (
          <section className="mb-20">
            <h2 className="text-2xl font-black text-white border-b border-white/10 pb-4 mb-8 uppercase tracking-[0.3em] flex items-center gap-4 italic">
              <span className="text-3xl not-italic">🗣️</span> Kaiwa
            </h2>
            <div className="bg-[#1e2024] p-8 rounded-[3rem] border border-white/5 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-5 text-7xl font-black italic select-none uppercase tracking-tighter">
                Dialogue
              </div>
              {lesson.conversationTitle && (
                <h3 className="text-xl font-black text-[#0ef] mb-10 text-center uppercase tracking-widest italic relative z-10">
                  "{lesson.conversationTitle}"
                </h3>
              )}
              <div className="space-y-6 relative z-10">
                {lesson.conversation.map((c: any, i: number) => (
                  <div
                    key={i}
                    className="flex justify-between items-start gap-6 pb-6 border-b border-white/5 last:border-0 last:pb-0 group"
                  >
                    <div className="flex-1">
                      <ruby className="text-white text-lg leading-loose font-medium group-hover:text-[#0ef] transition-colors">
                        {c.jp}
                        <rt className="text-[10px] text-[#0ef] font-black opacity-60 uppercase">
                          {c.furigana}
                        </rt>
                      </ruby>
                      <p className="text-sm text-[#c4cfde]/40 mt-2 italic font-medium">
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

        {/* SECTION 4: TATA BAHASA */}
        {lesson.grammar && (
          <section className="mb-20">
            <h2 className="text-2xl font-black text-white border-b border-white/10 pb-4 mb-8 uppercase tracking-[0.3em] flex items-center gap-4 italic">
              <span className="text-3xl not-italic">📖</span> Bunpou
            </h2>
            <div className="prose-custom">
              <PortableText value={lesson.grammar} components={ptComponents} />
            </div>
          </section>
        )}

        {/* SECTION 5: KUIS */}
        {lesson.quizzes?.length > 0 && (
          <section className="mb-20">
            <QuizEngine questions={lesson.quizzes} />
          </section>
        )}

        {/* BOTTOM NAVIGATION */}
        <div className="grid grid-cols-2 gap-4 pt-12 border-t border-white/10">
          {prevLesson ? (
            <Link
              href={`/jlpt/${lesson.levelCode}/${prevLesson.slug}`}
              className="p-8 bg-[#1e2024] rounded-[2rem] border border-white/5 hover:border-[#0ef]/30 transition-all group"
            >
              <p className="text-[10px] text-[#0ef] uppercase font-black tracking-[0.2em] mb-2 opacity-50 group-hover:opacity-100 transition-opacity">
                ← Sebelumnya
              </p>
              <h4 className="text-white font-black text-lg leading-tight uppercase italic">
                {prevLesson.title}
              </h4>
            </Link>
          ) : (
            <div />
          )}

          {nextLesson ? (
            <Link
              href={`/jlpt/${lesson.levelCode}/${nextLesson.slug}`}
              className="p-8 bg-[#1e2024] rounded-[2rem] border border-white/5 hover:border-[#0ef]/30 transition-all text-right group"
            >
              <p className="text-[10px] text-[#0ef] uppercase font-black tracking-[0.2em] mb-2 opacity-50 group-hover:opacity-100 transition-opacity">
                Selanjutnya →
              </p>
              <h4 className="text-white font-black text-lg leading-tight uppercase italic">
                {nextLesson.title}
              </h4>
            </Link>
          ) : (
            <Link
              href={`/jlpt/${lesson.levelCode}`}
              className="p-8 bg-[#0ef]/5 border border-[#0ef]/20 rounded-[2rem] text-center hover:bg-[#0ef]/10 transition-all flex flex-col justify-center items-center"
            >
              <span className="text-2xl mb-2">🎉</span>
              <p className="text-[#0ef] font-black uppercase text-xs tracking-widest">
                Selesai Level ini
              </p>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
