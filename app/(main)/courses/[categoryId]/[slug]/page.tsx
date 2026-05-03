/**
 * @file page.tsx
 * @description Halaman ruang kelas dinamis untuk materi pembelajaran tunggal.
 * Menangani Portable Text, Kuis, Audio, dan modul SRS.
 * @module LessonPage
 */

// ======================
// IMPORTS
// ======================
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
import QuizEngine from "@/components/features/exams/quiz-engine/QuizEngine";
import TTSReader from "@/components/features/tools/tts/TTSReader";
import AddToSRSButton from "@/components/features/srs/actions/AddToSRSButton";
import DownloadPdfButton from "@/components/features/pdf/actions/DownloadPdfButton";
import AppBreadcrumbs from "@/components/layout/AppBreadcrumbs";
import SanityImage from "@/components/ui/SanityImage";
import { renderSmartText } from "@/lib/smartLinks";

// ======================
// CONFIG / CONSTANTS
// ======================
export const revalidate = 3600;

interface Props {
  params: Promise<{ categoryId: string; slug: string }>;
}

// ======================
// DATABASE OPERATIONS
// ======================

/**
 * Menarik data materi lengkap dari Sanity CMS.
 */
async function getLessonData(categoryId: string, slug: string) {
  const query = `{
    "lesson": *[_type == "lesson" && course_category->slug.current == $categoryId && slug.current == $slug][0] {
      _id, title, summary, 
      "levelCode": course_category->slug.current, 
      "levelTitle": course_category->title,
      "categoryType": course_category->type,
      vocabList[]-> { 
        _id, _type,
        _type == "vocab" => { word, furigana, romaji, meaning, hinshi },
        _type == "verb_dictionary" => { "word": jisho, furigana, romaji, meaning },
        _type == "kanji" => { "word": character, meaning, onyomi, kunyomi }
      },
      referenceWords[]-> { 
        _id, _type,
        _type == "vocab" => { word, furigana, romaji, meaning, hinshi },
        _type == "verb_dictionary" => { "word": jisho, furigana, romaji, meaning },
        _type == "kanji" => { "word": character, meaning, onyomi, kunyomi }
      },
      articles[] {
        ...,
        _type == "image" => {
          ...,
          asset-> {
            _id,
            metadata {
              lqip,
              dimensions
            }
          }
        }
      },
      grammar[] {
        ...,
        _type == "image" => {
          ...,
          asset-> {
            _id,
            metadata {
              lqip,
              dimensions
            }
          }
        }
      },
      quizzes, seoTitle, seoDescription
    },
    "nav": *[_type == "lesson" && course_category->slug.current == $categoryId] | order(orderNumber asc, _createdAt desc) {
      "slug": slug.current, title
    }
  }`;
  return await client.fetch(query, { categoryId, slug });
}

// ======================
// METADATA
// ======================
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

// ======================
// HELPERS / COMPONENTS
// ======================

interface VocabularyValue {
  jp: string;
  furigana: string;
  id: string;
}

interface SanityImageValue {
  _type: "image";
  asset: {
    _ref: string;
    _type: "reference";
  };
}

/**
 * Konfigurasi Pemetaan Portable Text.
 */
const ptComponents: PortableTextComponents = {
  block: {
    h2: ({ children }: { children?: React.ReactNode }) => (
      <h2 className="text-2xl md:text-3xl font-black text-foreground mt-16 mb-8 uppercase tracking-tight flex items-center gap-4">
        <span className="w-1.5 h-8 bg-cyan-400 shadow-[0_0_15px_#22d3ee]" />
        {children}
      </h2>
    ),
    h3: ({ children }: { children?: React.ReactNode }) => (
      <h3 className="text-xl font-bold text-cyan-500 dark:text-cyan-400 mt-10 mb-4 tracking-widest uppercase text-[13px] md:text-sm">
        {children}
      </h3>
    ),
    normal: ({ children }: { children?: React.ReactNode }) => (
      <p className="mb-6 text-muted-foreground text-base leading-relaxed font-medium">
        {children}
      </p>
    ),
    blockquote: ({ children }: { children?: React.ReactNode }) => (
      <blockquote className="my-10 neo-inset p-6 md:p-8 border-l-4 border-purple-500 text-purple-600 dark:text-purple-200/80 italic text-sm md:text-base leading-relaxed">
        {children}
      </blockquote>
    ),
  },
  types: {
    callout: ({ value }: { value: { type?: string; title?: string; text?: string } }) => {
      if (!value) return null;
      const isWarning = value.type === "warning";
      return (
        <div
          className={`my-10 p-6 md:p-8 rounded-[2rem] border border-border relative overflow-hidden ${isWarning ? "bg-red-500/5 dark:bg-[#150a0a]" : "bg-muted/30"}`}
        >
          <div className="flex items-center gap-3 mb-4">
            {isWarning ? (
              <AlertTriangle className="text-red-500" size={20} />
            ) : (
              <Lightbulb className="text-cyan-500 dark:text-cyan-400" size={20} />
            )}
            <strong
              className={`font-bold uppercase tracking-widest text-[10px] ${isWarning ? "text-red-500" : "text-cyan-500 dark:text-cyan-400"}`}
            >
              {value.title || "Catatan"}
            </strong>
          </div>
          <p className="text-sm md:text-base text-muted-foreground relative z-10 leading-relaxed font-medium">
            {value.text || ""}
          </p>
        </div>
      );
    },
    vocabulary: ({ value }: { value: VocabularyValue }) => {
      return (
        <div className="group relative flex items-center justify-between p-4 md:p-6 bg-muted/30 border border-border rounded-2xl hover:border-primary/40 hover:bg-primary/[0.02] transition-all duration-300 mb-4 overflow-hidden">
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary/20 group-hover:bg-primary transition-all duration-300" />
          <div className="flex flex-col">
            <ruby className="text-xl md:text-2xl font-black text-foreground tracking-tight">
              {value.jp || ""}
              <rt className="text-[10px] text-cyan-500 dark:text-cyan-400/70 font-bold tracking-widest uppercase mb-1">
                {value.furigana || ""}
              </rt>
            </ruby>
            <p className="text-[10px] md:text-xs text-muted-foreground mt-3 font-bold uppercase tracking-widest border-l-2 border-border pl-4">
              {value.id || ""}
            </p>
          </div>
          <div className="shrink-0 neo-inset p-2 rounded-xl group-hover:shadow-none transition-all">
            {value.jp ? <TTSReader text={value.jp} minimal={true} /> : null}
          </div>
        </div>
      );
    },
    image: ({ value }: { value: SanityImageValue }) => <SanityImage value={value} />,
  },
};

export default async function LessonPage({ params }: Props) {
  const { categoryId, slug } = await params;
  const data = await getLessonData(categoryId, slug);
  const lesson = data?.lesson;
  const nav = data?.nav || [];

  if (!lesson) return notFound();

  const currentIndex = nav.findIndex((l: { slug: string }) => l.slug === slug);
  const prevLesson = currentIndex > 0 ? nav[currentIndex - 1] : null;
  const nextLesson =
    currentIndex >= 0 && currentIndex < nav.length - 1
      ? nav[currentIndex + 1]
      : null;
  const isSideQuest = lesson.categoryType === "general";

  const formattedQuizzes =
    lesson.quizzes
      ?.map((quiz: { question: string; options: { text: string; isCorrect?: boolean }[]; explanation?: string }) => {
        if (!quiz) return null;
        const correctOption = quiz.options?.find((opt: { isCorrect?: boolean }) => opt?.isCorrect);
        return {
          question: quiz.question || "",
          options: quiz.options?.map((opt: { text: string }) => opt?.text || "") || [],
          answer: correctOption ? correctOption.text : "",
          explanation: quiz.explanation || "",
        };
      })
      .filter(Boolean) || [];

  return (
    <div className="w-full text-foreground px-4 md:px-8 relative overflow-hidden flex flex-col flex-1 transition-colors duration-300">
      {/* Background Ambient Decor */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-cyan-500/5 blur-[150px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-indigo-500/5 blur-[120px] rounded-full pointer-events-none" />

      <article className="max-w-4xl mx-auto w-full relative z-10 flex-1">
        <AppBreadcrumbs 
          items={[
            { label: "Pusat Belajar", href: "/courses" },
            { label: lesson.levelTitle || "Materi", href: `/courses/${lesson.levelCode || categoryId}` },
            { label: lesson.title, active: true }
          ]} 
        />

        <header className="mb-20">
          <h1
            className={`text-5xl md:text-7xl lg:text-8xl font-black uppercase tracking-tighter leading-none mb-8 ${isSideQuest ? "text-amber-500" : "text-foreground"}`}
          >
            {lesson.title}
          </h1>
          {lesson.summary && (
            <div
              className={`p-8 rounded-[2rem] neo-inset border-l-8 mb-8 ${isSideQuest ? "border-amber-500" : "border-cyan-400"}`}
            >
               <p className="text-base md:text-lg font-medium leading-relaxed text-muted-foreground">
                 {renderSmartText(lesson.summary)}
               </p>
            </div>
          )}
          <div className="flex justify-start">
             <DownloadPdfButton data={lesson} />
          </div>
        </header>

        <div className="space-y-24 mb-24">
          {lesson.vocabList && lesson.vocabList.length > 0 && (
            <section>
              <div className="flex items-center gap-4 mb-10">
                <h2 className="text-xl font-black uppercase tracking-tight text-foreground flex items-center gap-3">
                  <span className="text-2xl">統</span> Target
                  Kosakata
                </h2>
                <div className="h-[1px] flex-1 bg-border" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {lesson.vocabList.map((v: { _id: string; word: string; romaji?: string; meaning: string; hinshi?: string; onyomi?: string; kunyomi?: string }) => {
                  if (!v) return null;
                  return (
                    <div
                      key={v._id || Math.random()}
                      className="neo-card p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 group hover:border-cyan-400/30 transition-colors duration-300"
                    >
                      <div className="flex-1 w-full">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-[9px] font-bold text-cyan-600 dark:text-cyan-400 uppercase tracking-widest bg-cyan-400/10 px-2 py-0.5 rounded">
                            {v.romaji || "-"}
                          </span>
                          {v.hinshi && (
                            <span className="text-[9px] font-mono font-black text-purple-600 dark:text-purple-400 uppercase tracking-widest bg-purple-500/10 border border-purple-500/20 px-2 py-0.5 rounded">
                              {v.hinshi === "Meishi" ? "Kata Benda" :
                               v.hinshi === "Doushi" ? "Kata Kerja" :
                               v.hinshi === "I-Keiyoushi" ? "Kata Sifat-I" :
                               v.hinshi === "Na-Keiyoushi" ? "Kata Sifat-Na" :
                               v.hinshi === "Fukushi" ? "Kata Keterangan" :
                               v.hinshi === "Joshi" ? "Partikel" :
                               v.hinshi === "Kandoushi" ? "Kata Seru" :
                               v.hinshi === "Rentaishi" ? "Kata Penunjuk" : v.hinshi}
                            </span>
                          )}
                        </div>
                        <h4 className="text-3xl font-black text-foreground group-hover:text-cyan-500 dark:group-hover:text-cyan-400 transition-colors tracking-tight mb-1">
                          {v.word || "-"}
                        </h4>
                        
                        {(v.onyomi || v.kunyomi) && (
                          <div className="flex flex-wrap gap-2 mb-3">
                            {v.onyomi && (
                              <span className="text-[10px] font-bold text-purple-500 dark:text-purple-400 border border-purple-500/20 px-2 py-0.5 rounded-lg bg-purple-500/5">
                                ON: {v.onyomi}
                              </span>
                            )}
                            {v.kunyomi && (
                              <span className="text-[10px] font-bold text-emerald-500 dark:text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-lg bg-emerald-500/5">
                                KUN: {v.kunyomi}
                              </span>
                            )}
                          </div>
                        )}

                        <p className="text-[13px] md:text-sm text-muted-foreground font-medium leading-relaxed">
                          {v.meaning || "-"}
                        </p>
                      </div>
                      <div className="flex flex-row sm:flex-col gap-3 shrink-0 w-full sm:w-auto justify-end">
                        {v._id && <AddToSRSButton wordId={v._id} />}
                        {v.word && <TTSReader text={v.word} minimal={true} />}
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {lesson.articles && lesson.articles.length > 0 && (
            <section className="prose-custom">
              <PortableText value={lesson.articles} components={ptComponents} />
            </section>
          )}

          {lesson.grammar && lesson.grammar.length > 0 && (
            <section>
              <div className="flex items-center gap-4 mb-10">
                <h2 className="text-xl font-black uppercase italic tracking-tighter text-foreground flex items-center gap-3">
                  <span className="text-2xl not-italic">当</span> Materi Inti
                </h2>
                <div className="h-[1px] flex-1 bg-border" />
              </div>
              <div className="neo-card p-8 md:p-14 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-10 opacity-[0.05] pointer-events-none">
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
          )}

          {formattedQuizzes.length > 0 && (
            <section>
              <div className="flex items-center gap-4 mb-10">
                <h2 className="text-xl font-black uppercase tracking-tight text-foreground flex items-center gap-3">
                  <span className="text-2xl">笞｡</span> Uji Pemahaman
                </h2>
                <div className="h-[1px] flex-1 bg-border" />
              </div>
              <QuizEngine questions={formattedQuizzes} />
            </section>
          )}
        </div>

        <nav className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-12 border-t border-border mt-auto mb-20">
          {prevLesson ? (
            <Link
              href={`/courses/${lesson.levelCode || categoryId}/${prevLesson.slug}`}
              className="neo-card h-full p-8 group flex flex-col justify-center items-start hover:bg-cyan-400/5 hover:border-cyan-400/30 transition-all duration-300"
            >
              <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground group-hover:text-cyan-500 dark:group-hover:text-cyan-400 mb-3 flex items-center gap-2 transition-colors">
                <ChevronLeft size={14} /> Materi Sebelumnya
              </span>
              <h4 className="text-xl font-black uppercase text-foreground tracking-tight leading-tight">
                {prevLesson.title}
              </h4>
            </Link>
          ) : (
            <div className="hidden sm:block" />
          )}
          {nextLesson ? (
            <Link
              href={`/courses/${lesson.levelCode || categoryId}/${nextLesson.slug}`}
              className="neo-card h-full p-8 group flex flex-col justify-center items-end text-right hover:bg-cyan-400/5 hover:border-cyan-400/30 transition-all duration-300"
            >
              <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground group-hover:text-cyan-500 dark:group-hover:text-cyan-400 mb-3 flex items-center gap-2 transition-colors">
                Materi Selanjutnya <ChevronRight size={14} />
              </span>
              <h4 className="text-xl font-black italic uppercase text-foreground tracking-tight leading-tight">
                {nextLesson.title}
              </h4>
            </Link>
          ) : (
            <Link
              href={`/courses/${lesson.levelCode || categoryId}`}
              className="neo-card h-full p-8 flex flex-col items-center justify-center text-center bg-cyan-400/5 border-cyan-400/20 group hover:border-cyan-400 hover:bg-cyan-400/10 transition-all duration-300"
            >
              <span className="text-4xl mb-3 group-hover:scale-110 transition-transform">
                脂
              </span>
              <p className="text-xs font-black uppercase tracking-widest text-cyan-500 dark:text-cyan-400">
                Yeay! Materi Selesai
              </p>
            </Link>
          )}
        </nav>
      </article>
    </div>
  );
}
