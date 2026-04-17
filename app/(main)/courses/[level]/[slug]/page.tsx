/**
 * LOKASI FILE: app/courses/[level]/[slug]/page.tsx
 * DESKRIPSI:
 * Halaman utama untuk merender isi materi pembelajaran (Lesson).
 * Menggunakan Next.js Server Component untuk pengambilan data (data fetching)
 * dan Portable Text untuk merender konten kaya (rich text) dari Sanity CMS.
 */

import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { client } from "@/sanity/lib/client";
import { PortableText, PortableTextComponents } from "@portabletext/react";
import QuizEngine from "@/components/QuizEngine";
import TTSReader from "@/components/TTSReader";
import AddToSRSButton from "@/components/AddToSRSButton";

// Mengatur ISR (Incremental Static Regeneration) untuk menyegarkan cache data setiap 1 jam.
export const revalidate = 3600;

interface Props {
  params: Promise<{ level: string; slug: string }>;
}

/**
 * MENGAMBIL DATA PELAJARAN
 * Fungsi asinkron untuk mengambil konten pelajaran spesifik dan data navigasi.
 * ✨ DIPERBARUI: Query disesuaikan dengan skema baru (articles, grammar, quizzes)
 */
async function getLessonData(levelCode: string, slug: string) {
  const query = `{
    "lesson": *[_type == "lesson" && course_category->slug.current == $levelCode && slug.current == $slug][0] {
      _id, title, summary, 
      "levelCode": course_category->slug.current, 
      "levelTitle": course_category->title,
      "categoryType": course_category->type,
      
      // INI BAGIAN YANG DIUBAH
      vocabList[]-> { 
        _id, 
        _type, // Wajib dipanggil untuk membedakan UI (jika butuh label "Verb")
        
        // 1. Jika dokumennya dari tabel Kosakata biasa
        _type == "kosakata" => {
          word, 
          furigana, 
          romaji, 
          meaning, 
          kanjiDetails 
        },
        
        // 2. Jika dokumennya dari tabel Kata Kerja (Verb Dictionary)
        _type == "verb_dictionary" => {
          // Trik Alias: "nama_di_frontend": nama_field_di_sanity
          "word": jisho,     // Mengambil bentuk kamus saja, dan mengubah namanya menjadi "word"
          "furigana": furigana,   // (Ganti 'furigana' kanan dengan nama field hiragana di tabel verb kamu jika beda)
          "romaji": romaji,
          "meaning": meaning      // (Ganti 'meaning' kanan dengan 'arti' jika di tabel verb kamu namanya 'arti')
          // Catatan: Jika di verbDictionary tidak ada field 'kanjiDetails', abaikan saja.
        }
      },
      
      referenceWords[]-> { _id, word, furigana, romaji, meaning },
      articles, grammar, quizzes, seoTitle, seoDescription
    },
    "nav": *[_type == "lesson" && course_category->slug.current == $levelCode && is_published == true] | order(orderNumber asc) {
      "slug": slug.current, title
    }
  }`;

  return await client.fetch(query, { levelCode, slug });
}
/**
 * SEO & METADATA DINAMIS
 */
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { level, slug } = await params;
  const { lesson } = await getLessonData(level, slug);
  if (!lesson) return { title: "Pelajaran Tidak Ditemukan | NihongoRoute" };
  return {
    title: lesson.seoTitle ?? `${lesson.title} | NihongoRoute`,
    description: lesson.seoDescription ?? lesson.summary,
  };
}

/**
 * KONFIGURASI RENDERER TEKS (Portable Text)
 */
const ptComponents: PortableTextComponents = {
  block: {
    h2: ({ children }) => (
      <h2 className="text-xl md:text-2xl font-black text-cyan-400 mt-12 mb-6 uppercase tracking-[0.2em] flex items-center gap-3 drop-shadow-[0_0_8px_rgba(34,211,238,0.5)] border-b border-cyan-400/20 pb-4 leading-snug">
        <span className="w-3 h-3 bg-cyan-400 rounded-sm shadow-[0_0_10px_#0ef] shrink-0" />
        <span>{children}</span>
      </h2>
    ),
    h3: ({ children }) => (
      <h3 className="text-lg md:text-xl font-bold text-white mt-8 mb-4 tracking-wide flex items-center gap-2 leading-snug">
        <span className="text-cyan-400 opacity-50 shrink-0">#</span>{" "}
        <span>{children}</span>
      </h3>
    ),
    normal: ({ children }) => (
      <p className="mb-6 text-[#c4cfde] text-sm md:text-base leading-relaxed font-medium">
        {children}
      </p>
    ),
    blockquote: ({ children }) => (
      <blockquote className="my-8 border-l-4 border-purple-500 bg-purple-500/10 p-4 md:p-6 rounded-r-2xl text-purple-100 italic shadow-[inset_0_0_20px_rgba(168,85,247,0.05)] text-sm md:text-base leading-relaxed">
        {children}
      </blockquote>
    ),
  },
  types: {
    callout: ({ value }: any) => (
      <div
        className={`border-l-4 p-5 md:p-6 rounded-r-2xl my-8 relative overflow-hidden shadow-lg ${value.type === "warning" ? "border-amber-500 bg-amber-500/10" : "border-cyan-400 bg-cyan-400/10"}`}
      >
        <div
          className={`absolute top-0 right-0 p-4 opacity-10 text-6xl pointer-events-none select-none ${value.type === "warning" ? "text-amber-500" : "text-cyan-400"}`}
        >
          {value.type === "warning" ? "⚠️" : "💡"}
        </div>
        <strong
          className={`flex items-center gap-2 mb-3 font-black uppercase tracking-widest text-xs relative z-10 ${value.type === "warning" ? "text-amber-400" : "text-cyan-400"}`}
        >
          {value.title}
        </strong>
        <p className="text-sm md:text-base text-white/90 relative z-10 leading-relaxed">
          {value.text}
        </p>
      </div>
    ),
    exampleSentence: ({ value }: any) => (
      <div className="bg-cyber-bg p-4 md:p-5 rounded-2xl border border-white/5 my-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shadow-[inset_0_2px_5px_rgba(0,0,0,0.5)] hover:border-white/10 transition-colors">
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
        <div className="self-end sm:self-auto shrink-0">
          <TTSReader text={value.jp} minimal={true} />
        </div>
      </div>
    ),
  },
};

/**
 * KOMPONEN UTAMA HALAMAN PELAJARAN
 */
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

  // ✨ DIPERBARUI: Memformat data Kuis agar sesuai dengan prop yang diminta QuizEngine
  const formattedQuizzes = lesson.quizzes?.map((quiz: any) => {
    const correctOption = quiz.options?.find((opt: any) => opt.isCorrect);
    return {
      question: quiz.question,
      options: quiz.options?.map((opt: any) => opt.text) || [],
      answer: correctOption ? correctOption.text : "",
      explanation: quiz.explanation,
    };
  });

  return (
    <main className="min-h-screen px-4 md:px-8 pt-20 md:pt-24 pb-40 bg-cyber-bg relative overflow-hidden flex flex-col">
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />

      <article className="max-w-4xl mx-auto w-full relative z-10 flex-1">
        <nav className="mb-6 md:mb-8 font-mono text-[9px] md:text-[10px] font-bold uppercase tracking-[0.2em] flex flex-wrap items-center gap-2 md:gap-3">
          <Link
            href={`/courses/${lesson.levelCode}`}
            className={`${isSideQuest ? "text-amber-500 bg-amber-500/10 border-amber-500/20" : "text-cyan-400 bg-cyan-400/10 border-cyan-400/20"} px-3 py-1.5 rounded-lg border hover:opacity-80 transition-all whitespace-nowrap flex items-center gap-2`}
          >
            <span className="text-sm leading-none">
              {isSideQuest ? "🌟" : "🏆"}
            </span>
            <span>{lesson.levelTitle}</span>
          </Link>
          <span className="text-white/20 hidden sm:inline">/</span>
          <span className="text-white/60 bg-white/5 px-3 py-1.5 rounded-lg border border-white/5 uppercase italic truncate max-w-[200px] md:max-w-xs">
            Bab: {lesson.title}
          </span>
        </nav>

        <header className="mb-12 md:mb-16">
          <h1
            className={`text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black mb-4 md:mb-6 tracking-tighter italic uppercase drop-shadow-lg leading-tight ${isSideQuest ? "text-amber-400" : "text-white"}`}
          >
            {lesson.title}
          </h1>
          {lesson.summary && (
            <div
              className={`p-5 md:p-8 rounded-[1.5rem] md:rounded-[2rem] border-l-4 shadow-xl ${isSideQuest ? "bg-amber-500/5 border-amber-500" : "bg-cyan-400/10 border-cyan-400"}`}
            >
              <p
                className={`text-sm md:text-base lg:text-lg font-medium tracking-wide leading-relaxed ${isSideQuest ? "text-amber-200/80" : "text-cyan-400"}`}
              >
                {lesson.summary}
              </p>
            </div>
          )}
        </header>

        <div className="mb-16 md:mb-24">
          {/* SEKSI KOSAKATA */}
          {lesson.vocabList?.length > 0 && (
            <section className="mb-16 md:mb-24">
              <h2 className="text-2xl md:text-3xl font-black text-white border-b border-white/10 pb-4 md:pb-6 mb-6 md:mb-8 uppercase tracking-[0.2em] flex items-center gap-3 md:gap-4 italic drop-shadow-md leading-tight">
                <span className="text-3xl md:text-4xl not-italic shrink-0 drop-shadow-[0_0_15px_rgba(34,211,238,0.5)]">
                  📝
                </span>{" "}
                Target Kosakata
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
                {lesson.vocabList.map((v: any) => (
                  <div
                    key={v._id}
                    className="bg-cyber-surface p-5 md:p-6 rounded-[1.5rem] md:rounded-[2rem] border border-white/5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-0 group transition-all duration-300 hover:border-cyan-400/30 shadow-[6px_6px_15px_rgba(0,0,0,0.5)] hover:shadow-[0_0_25px_rgba(34,211,238,0.1)]"
                  >
                    <div className="flex-1 pr-0 sm:pr-4 w-full">
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
                      <p className="text-2xl md:text-3xl font-black text-white tracking-tight drop-shadow-md leading-none mb-1">
                        {v.word}
                      </p>
                      <p className="text-xs md:text-sm text-[#c4cfde]/60 mt-1 md:mt-2 font-medium leading-relaxed">
                        {v.meaning}
                      </p>
                    </div>
                    <div className="flex flex-row sm:flex-col gap-2 md:gap-3 w-full sm:w-auto justify-end">
                      <AddToSRSButton wordId={v._id} />
                      <TTSReader text={v.word} minimal={true} />
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* ✨ DIPERBARUI: SEKSI ARTICLES (Pengantar Materi) */}
          {lesson.articles && (
            <section className="mb-16 md:mb-24">
              <div className="prose-custom max-w-none">
                <PortableText
                  value={lesson.articles}
                  components={ptComponents}
                />
              </div>
            </section>
          )}

          {/* ✨ DIPERBARUI: SEKSI GRAMMAR (Penjelasan Tata Bahasa Inti) */}
          {lesson.grammar && (
            <section className="mb-16 md:mb-24">
              <h2 className="text-2xl md:text-3xl font-black text-white border-b border-white/10 pb-4 md:pb-6 mb-6 md:mb-8 uppercase tracking-[0.2em] flex items-center gap-3 md:gap-4 italic drop-shadow-md leading-tight">
                <span className="text-3xl md:text-4xl not-italic shrink-0">
                  📖
                </span>{" "}
                Materi Inti
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

          {/* SEKSI KUIS */}
          {formattedQuizzes?.length > 0 && (
            <section className="mb-16 md:mb-24">
              <h2 className="text-2xl md:text-3xl font-black text-white border-b border-white/10 pb-4 md:pb-6 mb-6 md:mb-8 uppercase tracking-[0.2em] flex items-center gap-3 md:gap-4 italic drop-shadow-md leading-tight">
                <span className="text-3xl md:text-4xl not-italic shrink-0">
                  ⚡
                </span>{" "}
                Uji Pemahaman
              </h2>
              <QuizEngine questions={formattedQuizzes} />
            </section>
          )}
        </div>

        {/* FOOTER NAVIGATION */}
        <nav className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6 pt-10 md:pt-12 border-t border-white/10 mt-auto">
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
              <span className="text-2xl md:text-3xl mb-2 md:mb-3 drop-shadow-md group-hover:scale-110 transition-transform block">
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
