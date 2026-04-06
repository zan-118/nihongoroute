import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { supabase } from "@/lib/supabase";
import QuizEngine from "@/components/QuizEngine";

export const revalidate = 3600;

/* ============================= */
/* TYPES */
/* ============================= */

interface Lesson {
  id: string;
  level_code: string;
  slug: string;
  title: string;
  description: string | null;
  content: string;
  order_number: number;
  seo_title: string | null;
  seo_description: string | null;
  quiz: any[] | null;
}

interface LessonNav {
  id: string;
  slug: string;
  title: string;
  order_number: number;
}

interface Props {
  params: {
    level: string;
    slug: string;
  };
}

/* ============================= */
/* DATA FETCHING */
/* ============================= */

async function getLesson(level: string, slug: string): Promise<Lesson | null> {
  const { data } = await supabase
    .from("lessons")
    .select("*")
    .eq("level_code", level)
    .eq("slug", slug)
    .eq("is_published", true)
    .single();

  return data ?? null;
}

async function getLessonsForNav(level: string): Promise<LessonNav[]> {
  const { data } = await supabase
    .from("lessons")
    .select("id, slug, title, order_number")
    .eq("level_code", level)
    .eq("is_published", true)
    .order("order_number", { ascending: true });

  return data ?? [];
}

/* ============================= */
/* METADATA */
/* ============================= */

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const lesson = await getLesson(params.level, params.slug);

  if (!lesson) {
    return {
      title: "Lesson Not Found | NihongoPath",
    };
  }

  return {
    title:
      lesson.seo_title ??
      `${lesson.title} | JLPT ${lesson.level_code.toUpperCase()} | NihongoPath`,
    description:
      lesson.seo_description ??
      lesson.description ??
      `Pelajari ${lesson.title} untuk JLPT ${lesson.level_code.toUpperCase()}.`,
    alternates: {
      canonical: `/jlpt/${lesson.level_code}/${lesson.slug}`,
    },
  };
}

/* ============================= */
/* PAGE */
/* ============================= */

export default async function LessonPage({ params }: Props) {
  const lesson = await getLesson(params.level, params.slug);

  if (!lesson) return notFound();

  const lessons = await getLessonsForNav(params.level);

  const currentIndex = lessons.findIndex((l) => l.slug === lesson.slug);

  const prevLesson = currentIndex > 0 ? lessons[currentIndex - 1] : null;

  const nextLesson =
    currentIndex >= 0 && currentIndex < lessons.length - 1
      ? lessons[currentIndex + 1]
      : null;

  return (
    <div className="min-h-screen px-4 md:px-8 py-12 bg-[#1f242d]">
      <div className="max-w-4xl mx-auto">
        {/* BREADCRUMB */}
        <nav className="mb-6 text-xs uppercase tracking-widest text-[#0ef]/60">
          <Link href={`/jlpt/${lesson.level_code}`}>
            JLPT {lesson.level_code.toUpperCase()}
          </Link>{" "}
          / {lesson.title}
        </nav>

        {/* TITLE */}
        <h1 className="text-3xl md:text-5xl font-bold text-white mb-6">
          {lesson.title}
        </h1>

        {/* DESCRIPTION */}
        {lesson.description && (
          <p className="text-[#c4cfde]/60 mb-10">{lesson.description}</p>
        )}

        {/* CONTENT */}
        <article
          className="prose prose-invert max-w-none mb-16 overflow-x-auto"
          dangerouslySetInnerHTML={{ __html: lesson.content }}
        />

        {/* QUIZ */}
        {lesson.quiz && lesson.quiz.length > 0 && (
          <QuizEngine questions={lesson.quiz} />
        )}

        {/* NAVIGATION */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-16">
          {prevLesson ? (
            <Link
              href={`/jlpt/${lesson.level_code}/${prevLesson.slug}`}
              className="text-left text-[#0ef]"
            >
              ← {prevLesson.title}
            </Link>
          ) : (
            <div />
          )}

          {nextLesson ? (
            <Link
              href={`/jlpt/${lesson.level_code}/${nextLesson.slug}`}
              className="text-right text-[#0ef]"
            >
              {nextLesson.title} →
            </Link>
          ) : (
            <Link
              href={`/jlpt/${lesson.level_code}`}
              className="text-right text-[#0ef]"
            >
              Level Completed
            </Link>
          )}
        </div>
      </div>

      {/* STRUCTURED DATA */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Article",
            headline: lesson.title,
            description: lesson.description,
            author: {
              "@type": "Organization",
              name: "NihongoPath",
            },
            url: `${process.env.NEXT_PUBLIC_SITE_URL}/jlpt/${lesson.level_code}/${lesson.slug}`,
          }),
        }}
      />
    </div>
  );
}
