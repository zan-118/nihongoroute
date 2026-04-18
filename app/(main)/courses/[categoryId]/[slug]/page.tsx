/**
 * LOKASI FILE: app/(main)/courses/[categoryId]/[slug]/page.tsx
 * KONSEP: Cyber-Dark Neumorphic (Server Component)
 * STATUS: Final Fix (GROQ Params & Null-Checks)
 */

import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { PortableText, PortableTextComponents } from "@portabletext/react";
import { client } from "@/sanity/lib/client";
import {
  ChevronLeft,
  ChevronRight,
  Lightbulb,
  AlertTriangle,
  FileText,
} from "lucide-react";

import QuizEngine from "@/components/QuizEngine";
import TTSReader from "@/components/TTSReader";
import AddToSRSButton from "@/components/AddToSRSButton";
import DownloadPdfButton from "@/components/DownloadPdfButton";

export const revalidate = 3600;

// Parameter dari nama folder: [categoryId] dan [slug]
interface Props {
  params: Promise<{ categoryId: string; slug: string }>;
}

async function getLessonData(categoryId: string, slug: string) {
  // ✨ PERBAIKAN GROQ: Memakai variabel $categoryId yang dipassing dari fungsi
  const query = `{
    "lesson": *[_type == "lesson" && course_category->slug.current == $categoryId && slug.current == $slug][0] {
      _id, title, summary, 
      "levelCode": course_category->slug.current, 
      "levelTitle": course_category->title,
      "categoryType": course_category->type,
      
      vocabList[]-> { 
        _id, 
        _type,
        _type == "vocab" => { word, furigana, romaji, meaning, hinshi },
        _type == "verb_dictionary" => { 
          "word": jisho, 
          "furigana": furigana, 
          "romaji": romaji, 
          "meaning": meaning 
        }
      },
      
      referenceWords[]-> { _id, word, furigana, romaji, meaning, hinshi },
      articles, grammar, quizzes, seoTitle, seoDescription
    },
    "nav": *[_type == "lesson" && course_category->slug.current == $categoryId && is_published == true] | order(orderNumber asc) {
      "slug": slug.current, title
    }
  }`;

  // Mengirim nilai categoryId dan slug ke Sanity
  return await client.fetch(query, { categoryId, slug });
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { categoryId, slug } = await params;
  const data = await getLessonData(categoryId, slug);
  const lesson = data?.lesson;

  if (!lesson) return { title: "Pelajaran Tidak Ditemukan | NihongoRoute" };

  return {
    title: lesson.seoTitle ?? `${lesson.title} | NihongoRoute`,
    description: lesson.seoDescription ?? lesson.summary,
  };
}

// --- CUSTOM PORTABLE TEXT COMPONENTS (Neumorphic Style) ---
const ptComponents: PortableTextComponents = {
  block: {
    h2: ({ children }) => (
      <h2 className="text-2xl md:text-3xl font-black text-white mt-16 mb-8 uppercase italic tracking-tighter flex items-center gap-4">
        <span className="w-2 h-8 bg-cyan-400 shadow-[0_0_15px_#22d3ee]" />
        {children}
      </h2>
    ),
    h3: ({ children }) => (
      <h3 className="text-xl font-bold text-cyan-400 mt-10 mb-4 tracking-wide uppercase">
        {children}
      </h3>
    ),
    normal: ({ children }) => (
      <p className="mb-6 text-slate-400 text-base leading-relaxed font-medium">
        {children}
      </p>
    ),
    blockquote: ({ children }) => (
      <blockquote className="my-10 neo-inset p-6 md:p-8 border-l-4 border-purple-500 text-purple-200/80 italic text-sm md:text-base leading-relaxed">
        {children}
      </blockquote>
    ),
  },
  types: {
    callout: ({ value }: any) => {
      if (!value) return null;
      const isWarning = value.type === "warning";

      return (
        <div
          className={`my-10 p-6 md:p-8 rounded-[2rem] border border-white/5 relative overflow-hidden ${
            isWarning
              ? "bg-[#150a0a] shadow-[inset_4px_4px_10px_rgba(0,0,0,0.6)]"
              : "neo-inset"
          }`}
        >
          <div className="flex items-center gap-3 mb-4">
            {isWarning ? (
              <AlertTriangle className="text-red-500" size={20} />
            ) : (
              <Lightbulb className="text-cyan-400" size={20} />
            )}
            <strong
              className={`font-black uppercase tracking-widest text-xs ${isWarning ? "text-red-400" : "text-cyan-400"}`}
            >
              {value.title || "Catatan"}
            </strong>
          </div>
          <p className="text-sm md:text-base text-slate-300 relative z-10 leading-relaxed">
            {value.text || ""}
          </p>
        </div>
      );
    },
    exampleSentence: ({ value }: any) => {
      if (!value) return null;

      return (
        <div className="neo-card p-6 my-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 group hover:border-cyan-400/30 transition-all duration-300">
          <div className="flex-1">
            <ruby className="text-white text-xl md:text-2xl font-black tracking-wide drop-shadow-md">
              {value.jp || ""}
              <rt className="text-[10px] text-cyan-400 font-bold tracking-widest uppercase opacity-70">
                {value.furigana || ""}
              </rt>
            </ruby>
            <p className="text-xs md:text-sm text-slate-500 mt-3 font-bold italic uppercase tracking-tight border-l-2 border-white/10 pl-4">
              {value.id || ""}
            </p>
          </div>
          <div className="shrink-0 neo-inset p-2 rounded-xl group-hover:shadow-none transition-all">
            {value.jp ? <TTSReader text={value.jp} minimal={true} /> : null}
          </div>
        </div>
      );
    },
  },
};

export default async function LessonPage({ params }: Props) {
  // Mengekstrak parameter Next.js 15+
  const { categoryId, slug } = await params;

  // Memanggil fungsi fetch
  const data = await getLessonData(categoryId, slug);
  const lesson = data?.lesson;
  const nav = data?.nav || [];

  if (!lesson) return notFound();

  const currentIndex = nav.findIndex((l: any) => l.slug === slug);
  const prevLesson = currentIndex > 0 ? nav[currentIndex - 1] : null;
  const nextLesson =
    currentIndex >= 0 && currentIndex < nav.length - 1
      ? nav[currentIndex + 1]
      : null;

  const isSideQuest = lesson.categoryType === "general";

  // Memformat quiz dengan aman
  const formattedQuizzes =
    lesson.quizzes
      ?.map((quiz: any) => {
        if (!quiz) return null;
        const correctOption = quiz.options?.find((opt: any) => opt?.isCorrect);
        return {
          question: quiz.question || "",
          options: quiz.options?.map((opt: any) => opt?.text || "") || [],
          answer: correctOption ? correctOption.text : "",
          explanation: quiz.explanation || "",
        };
      })
      .filter(Boolean) || [];

  return (
    <main className="min-h-screen bg-[#080a0f] text-slate-300 pt-32 pb-40 px-6 relative overflow-hidden flex flex-col">
      {/* Background Decor */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-cyan-500/5 blur-[150px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-indigo-500/5 blur-[120px] rounded-full pointer-events-none" />

      <article className="max-w-4xl mx-auto w-full relative z-10 flex-1">
        {/* BREADCRUMB */}
        <nav className="mb-10 flex items-center gap-4">
          <Link
            href={`/courses/${lesson.levelCode || categoryId}`}
            className="neo-inset px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest text-cyan-400 border border-cyan-400/20 hover:border-cyan-400 hover:bg-cyan-400/5 transition-all flex items-center gap-2"
          >
            <ChevronLeft size={14} /> {lesson.levelTitle || "Materi"}
          </Link>
          <div className="h-[1px] flex-1 bg-white/5" />
          <span className="text-[10px] font-mono text-slate-600 uppercase tracking-widest hidden sm:block">
            Bab: {lesson.title}
          </span>
        </nav>

        {/* HEADER */}
        <header className="mb-20">
          <h1
            className={`text-5xl md:text-7xl lg:text-8xl font-black italic uppercase tracking-tighter leading-none mb-8 ${isSideQuest ? "text-amber-500 drop-shadow-[0_0_15px_rgba(245,158,11,0.4)]" : "text-white drop-shadow-lg"}`}
          >
            {lesson.title}
          </h1>

          {lesson.summary ? (
            <div
              className={`p-8 rounded-[2rem] neo-inset border-l-8 mb-8 ${isSideQuest ? "border-amber-500" : "border-cyan-400"}`}
            >
              <p className="text-base md:text-lg font-medium leading-relaxed italic text-slate-400">
                {lesson.summary}
              </p>
            </div>
          ) : null}

          <div className="flex justify-start">
            <DownloadPdfButton data={lesson} />
          </div>
        </header>

        <div className="space-y-24 mb-24">
          {/* VOCAB LIST */}
          {lesson.vocabList && lesson.vocabList.length > 0 ? (
            <section>
              <div className="flex items-center gap-4 mb-10">
                <h2 className="text-xl font-black uppercase italic tracking-tighter text-white flex items-center gap-3">
                  <span className="text-2xl not-italic">📝</span> Target
                  Kosakata
                </h2>
                <div className="h-[1px] flex-1 bg-white/5" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {lesson.vocabList.map((v: any) => {
                  if (!v) return null;
                  return (
                    <div
                      key={v._id || Math.random()}
                      className="neo-card p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 group hover:border-cyan-400/30 transition-colors duration-300"
                    >
                      <div className="flex-1 w-full">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-[10px] font-mono font-black text-cyan-400 uppercase tracking-widest bg-cyan-400/10 px-2 py-0.5 rounded">
                            {v.romaji || "-"}
                          </span>
                          {v.hinshi ? (
                            <span className="text-[9px] font-mono font-black text-purple-400 uppercase tracking-widest bg-purple-500/10 border border-purple-500/20 px-2 py-0.5 rounded">
                              {v.hinshi}
                            </span>
                          ) : null}
                        </div>
                        <h4 className="text-3xl font-black text-white group-hover:text-cyan-400 transition-colors tracking-tight mb-1">
                          {v.word || "-"}
                        </h4>
                        <p className="text-sm text-slate-500 font-medium leading-relaxed">
                          {v.meaning || "-"}
                        </p>
                      </div>
                      <div className="flex flex-row sm:flex-col gap-3 shrink-0 w-full sm:w-auto justify-end">
                        {v._id ? <AddToSRSButton wordId={v._id} /> : null}
                        {v.word ? (
                          <TTSReader text={v.word} minimal={true} />
                        ) : null}
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          ) : null}

          {/* MAIN ARTICLES */}
          {lesson.articles && lesson.articles.length > 0 ? (
            <section className="prose-custom">
              <PortableText value={lesson.articles} components={ptComponents} />
            </section>
          ) : null}

          {/* GRAMMAR BLOCK */}
          {lesson.grammar && lesson.grammar.length > 0 ? (
            <section>
              <div className="flex items-center gap-4 mb-10">
                <h2 className="text-xl font-black uppercase italic tracking-tighter text-white flex items-center gap-3">
                  <span className="text-2xl not-italic">📖</span> Materi Inti
                </h2>
                <div className="h-[1px] flex-1 bg-white/5" />
              </div>
              <div className="neo-card p-8 md:p-14 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-10 opacity-[0.02] pointer-events-none">
                  <FileText size={180} />
                </div>
                <div className="relative z-10 prose-custom">
                  <PortableText
                    value={lesson.grammar}
                    components={ptComponents}
                  />
                </div>
              </div>
            </section>
          ) : null}

          {/* QUIZ SECTION */}
          {formattedQuizzes.length > 0 ? (
            <section>
              <div className="flex items-center gap-4 mb-10">
                <h2 className="text-xl font-black uppercase italic tracking-tighter text-white flex items-center gap-3">
                  <span className="text-2xl not-italic">⚡</span> Uji Pemahaman
                </h2>
                <div className="h-[1px] flex-1 bg-white/5" />
              </div>
              <QuizEngine questions={formattedQuizzes} />
            </section>
          ) : null}
        </div>

        {/* BOTTOM NAVIGATION */}
        <nav className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-12 border-t border-white/5 mt-auto">
          {prevLesson ? (
            <Link
              href={`/courses/${lesson.levelCode || categoryId}/${prevLesson.slug}`}
              className="neo-card p-8 group flex flex-col items-start hover:bg-cyan-400/5 hover:border-cyan-400/30 transition-all duration-300"
            >
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 group-hover:text-cyan-400 mb-3 flex items-center gap-2 transition-colors">
                <ChevronLeft size={14} /> Bab Sebelumnya
              </span>
              <h4 className="text-xl font-black italic uppercase text-white tracking-tight leading-tight">
                {prevLesson.title}
              </h4>
            </Link>
          ) : (
            <div className="hidden sm:block" />
          )}

          {nextLesson ? (
            <Link
              href={`/courses/${lesson.levelCode || categoryId}/${nextLesson.slug}`}
              className="neo-card p-8 group flex flex-col items-end text-right hover:bg-cyan-400/5 hover:border-cyan-400/30 transition-all duration-300"
            >
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 group-hover:text-cyan-400 mb-3 flex items-center gap-2 transition-colors">
                Bab Selanjutnya <ChevronRight size={14} />
              </span>
              <h4 className="text-xl font-black italic uppercase text-white tracking-tight leading-tight">
                {nextLesson.title}
              </h4>
            </Link>
          ) : (
            <Link
              href={`/courses/${lesson.levelCode || categoryId}`}
              className="neo-card p-8 flex flex-col items-center justify-center text-center bg-cyan-400/5 border-cyan-400/20 group hover:border-cyan-400 hover:bg-cyan-400/10 transition-all duration-300"
            >
              <span className="text-4xl mb-3 group-hover:scale-110 transition-transform">
                🎉
              </span>
              <p className="text-xs font-black uppercase tracking-widest text-cyan-400">
                Kurikulum Selesai
              </p>
            </Link>
          )}
        </nav>
      </article>
    </main>
  );
}
