import Link from "next/link";
import { notFound } from "next/navigation";
import { client } from "@/sanity/lib/client";

interface PageProps {
  params: Promise<{ level: string }>;
}

export default async function LevelPage({ params }: PageProps) {
  const { level: levelCode } = await params;

  const query = `{
    "level": *[_type == "course_category" && slug.current == $levelCode][0],
    "lessons": *[_type == "lesson" && course_category->slug.current == $levelCode && is_published == true] | order(orderNumber asc)
  }`;

  const { level, lessons } = await client.fetch(query, { levelCode });

  if (!level) return notFound();

  return (
    <main className="min-h-screen px-4 md:px-8 py-10 md:py-16 bg-cyber-bg">
      <div className="max-w-4xl mx-auto">
        <header className="mb-12">
          <Link
            href="/courses"
            className="text-cyber-neon text-[10px] font-black uppercase tracking-widest hover:underline"
          >
            ← Back to Paths
          </Link>
          <h1 className="text-6xl md:text-8xl font-black text-white uppercase tracking-tighter italic mt-2">
            Course <span className="text-cyber-neon">{level.title}</span>
          </h1>
        </header>

        <nav className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-16 font-black uppercase italic text-xs tracking-widest">
          <Link
            href={`/courses/${level.slug.current}/flashcards`}
            className="p-8 rounded-[2rem] bg-green-500/10 border border-green-500/20 hover:border-green-400 transition-all flex items-center gap-4"
          >
            <span className="text-3xl">📝</span>
            <div>
              <p className="text-white text-lg">Vocab Drill</p>
              <p className="text-green-400/50 text-[8px]">SRS Integrated</p>
            </div>
          </Link>
          <Link
            href={`/courses/${level.slug.current}/kanji`}
            className="p-8 rounded-[2rem] bg-purple-500/10 border border-purple-500/20 hover:border-purple-400 transition-all flex items-center gap-4"
          >
            <span className="text-3xl">🈴</span>
            <div>
              <p className="text-white text-lg">Kanji Power</p>
              <p className="text-purple-400/50 text-[8px]">Reading Practice</p>
            </div>
          </Link>
        </nav>

        <section className="space-y-4">
          <h2 className="text-[10px] font-black text-white/30 mb-8 uppercase tracking-[0.4em] italic border-l-2 border-cyber-neon pl-4">
            Curriculum Path
          </h2>
          {lessons.map((lesson: any) => (
            <Link
              key={lesson._id}
              href={`/courses/${level.slug.current}/${lesson.slug.current}`}
              className="block group transition-all"
            >
              <article className="bg-cyber-surface p-6 md:p-8 rounded-[2rem] border border-white/5 group-hover:border-cyber-neon/30 flex items-center gap-6">
                <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center font-black text-white/20 group-hover:text-cyber-neon transition-colors italic">
                  {lesson.orderNumber}
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-black text-white group-hover:text-cyber-neon uppercase italic transition-colors">
                    {lesson.title}
                  </h3>
                  <p className="text-xs text-[#c4cfde]/40 italic mt-1">
                    {lesson.summary}
                  </p>
                </div>
                <span className="text-white/10 group-hover:text-cyber-neon transition-colors">
                  →
                </span>
              </article>
            </Link>
          ))}
        </section>
      </div>
    </main>
  );
}
