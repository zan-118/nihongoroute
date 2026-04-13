// app/courses/[level]/page.tsx
import Link from "next/link";
import { notFound } from "next/navigation";
import { client } from "@/sanity/lib/client";

export const revalidate = 60;

interface PageProps {
  params: Promise<{ level: string }>;
}

async function getCourseData(slug: string) {
  const query = `{
    "category": *[_type == "course_category" && slug.current == $slug][0],
    "lessons": *[_type == "lesson" && course_category->slug.current == $slug && is_published == true] | order(orderNumber asc) {
      _id, title, summary, "slug": slug.current
    },
    "mockExams": *[_type == "mockExam" && course_category->slug.current == $slug] | order(_createdAt desc) {
      _id, title, timeLimit, passingScore
    }
  }`;
  return await client.fetch(query, { slug });
}

export default async function CourseLevelPage({ params }: PageProps) {
  const { level } = await params;
  const data = await getCourseData(level);

  if (!data.category) return notFound();

  // Mode Side Quest akan berwarna Amber, Mode JLPT akan berwarna Cyber Neon
  const isSideQuest = data.category.type === "general";

  return (
    <main className="min-h-screen px-4 md:px-8 pt-24 pb-32 bg-cyber-bg relative overflow-hidden">
      {/* Background Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />

      <div className="max-w-5xl mx-auto relative z-10">
        {/* =========================================
            HEADER
        ========================================= */}
        <header className="mb-16 border-b border-white/5 pb-10">
          <nav className="mb-6 font-mono text-[10px] font-bold uppercase tracking-[0.2em]">
            <Link
              href="/courses"
              className="text-white/40 hover:text-white transition-colors"
            >
              ← Curriculum Hub
            </Link>
          </nav>
          <h1
            className={`text-5xl md:text-7xl font-black uppercase italic tracking-tighter drop-shadow-lg mb-4 ${isSideQuest ? "text-amber-500" : "text-white"}`}
          >
            {data.category.title}
          </h1>
          {data.category.description && (
            <p className="text-lg text-[#c4cfde]/70 max-w-2xl font-medium">
              {data.category.description}
            </p>
          )}
        </header>

        {/* =========================================
            DRILL SECTION (VOCAB, KANJI, SURVIVAL)
        ========================================= */}
        <section className="mb-16">
          <div className="mb-6 flex items-center gap-4">
            <h3
              className={`text-xl font-black uppercase tracking-widest italic border-l-4 pl-4 ${isSideQuest ? "border-amber-500 text-amber-500" : "border-cyber-neon text-cyber-neon"}`}
            >
              Training Center
            </h3>
            <div className="h-[1px] flex-1 bg-white/5" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-black uppercase italic text-xs tracking-widest">
            <Link
              href={`/courses/${level}/flashcards`}
              className="p-8 rounded-[2rem] bg-cyber-surface border border-white/5 hover:border-cyber-neon/50 hover:shadow-[0_0_20px_rgba(0,255,239,0.1)] transition-all flex items-center gap-4 group"
            >
              <span className="text-3xl group-hover:scale-110 transition-transform">
                🎴
              </span>
              <div>
                <p className="text-white group-hover:text-cyber-neon transition-colors text-lg">
                  Vocab Drill
                </p>
                <p className="text-white/30 text-[8px]">Flashcard Mode</p>
              </div>
            </Link>

            <Link
              href={`/courses/${level}/kanji`}
              className="p-8 rounded-[2rem] bg-cyber-surface border border-white/5 hover:border-purple-500/50 hover:shadow-[0_0_20px_rgba(168,85,247,0.1)] transition-all flex items-center gap-4 group"
            >
              <span className="text-3xl group-hover:scale-110 transition-transform">
                ✍️
              </span>
              <div>
                <p className="text-white group-hover:text-purple-400 transition-colors text-lg">
                  Kanji Power
                </p>
                <p className="text-white/30 text-[8px]">Writing & Reading</p>
              </div>
            </Link>

            <Link
              href={`/courses/${level}/survival`}
              className="p-8 rounded-[2rem] bg-red-500/10 border border-red-500/20 hover:border-red-400 hover:shadow-[0_0_20px_rgba(239,68,68,0.2)] transition-all flex items-center gap-4 group"
            >
              <span className="text-3xl group-hover:scale-110 transition-transform drop-shadow-[0_0_10px_rgba(239,68,68,0.5)]">
                🔥
              </span>
              <div>
                <p className="text-white text-lg group-hover:text-red-400 transition-colors">
                  Survival Run
                </p>
                <p className="text-red-400/50 text-[8px]">Time Attack</p>
              </div>
            </Link>
          </div>
        </section>

        {/* =========================================
            MOCK EXAM SECTION (UJIAN JLPT)
        ========================================= */}
        {data.mockExams && data.mockExams.length > 0 && (
          <section className="mb-24">
            <div className="mb-6 flex items-center gap-4">
              <h3 className="text-xl font-black text-white uppercase tracking-widest italic border-l-4 border-amber-500 pl-4">
                Proving Grounds:{" "}
                <span className="text-amber-500">Mock Exam</span>
              </h3>
              <div className="h-[1px] flex-1 bg-white/5" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {data.mockExams.map((exam: any) => (
                <Link
                  key={exam._id}
                  href={`/courses/${level}/exam/${exam._id}`}
                  className="group relative bg-cyber-surface p-8 rounded-[2.5rem] border border-white/5 hover:border-amber-500/50 transition-all shadow-[0_10px_30px_rgba(0,0,0,0.4)] overflow-hidden"
                >
                  <div className="absolute inset-0 bg-amber-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />

                  <div className="relative z-10 flex items-center justify-between">
                    <div>
                      <p className="text-[10px] text-amber-500 font-black uppercase tracking-[0.3em] mb-2">
                        Official Simulation
                      </p>
                      <h4 className="text-2xl font-black text-white uppercase italic tracking-tight group-hover:text-amber-400 transition-colors">
                        {exam.title}
                      </h4>
                      <div className="flex gap-4 mt-4 text-xs font-mono text-white/50">
                        <span className="flex items-center gap-1">
                          <span className="text-amber-500">⏱</span>{" "}
                          {exam.timeLimit} Mins
                        </span>
                        <span className="flex items-center gap-1">
                          <span className="text-cyber-neon">🎯</span> Pass:{" "}
                          {exam.passingScore}/180
                        </span>
                      </div>
                    </div>
                    <div className="w-16 h-16 bg-cyber-bg rounded-2xl flex items-center justify-center border border-white/5 group-hover:border-amber-500/30 group-hover:scale-110 transition-all shadow-inner">
                      <span className="text-3xl">📝</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* =========================================
            LESSON PATH (SYLLABUS)
        ========================================= */}
        <section>
          <div className="mb-8 flex items-center gap-4">
            <h3
              className={`text-xl font-black text-white uppercase tracking-widest italic border-l-4 pl-4 ${isSideQuest ? "border-amber-500" : "border-cyber-neon"}`}
            >
              Mission Log:{" "}
              <span
                className={isSideQuest ? "text-amber-500" : "text-cyber-neon"}
              >
                Syllabus
              </span>
            </h3>
            <div className="h-[1px] flex-1 bg-white/5" />
          </div>

          {data.lessons && data.lessons.length > 0 ? (
            <div className="grid gap-4">
              {data.lessons.map((lesson: any, index: number) => (
                <Link
                  key={lesson._id}
                  href={`/courses/${level}/${lesson.slug}`}
                  className={`group flex flex-col md:flex-row items-start md:items-center gap-6 p-6 md:p-8 rounded-[2rem] border transition-all ${
                    isSideQuest
                      ? "bg-cyber-surface border-white/5 hover:border-amber-500/50 hover:bg-amber-500/5 shadow-[0_5px_15px_rgba(0,0,0,0.3)]"
                      : "bg-cyber-surface border-white/5 hover:border-cyber-neon/50 hover:bg-cyber-neon/5 shadow-[0_5px_15px_rgba(0,0,0,0.3)]"
                  }`}
                >
                  <div
                    className={`w-14 h-14 shrink-0 rounded-2xl flex items-center justify-center font-black text-xl font-mono border shadow-inner transition-colors ${
                      isSideQuest
                        ? "bg-amber-500/10 border-amber-500/30 text-amber-500 group-hover:bg-amber-500 group-hover:text-black"
                        : "bg-cyber-neon/10 border-cyber-neon/30 text-cyber-neon group-hover:bg-cyber-neon group-hover:text-black"
                    }`}
                  >
                    {(index + 1).toString().padStart(2, "0")}
                  </div>

                  <div className="flex-1">
                    <h4 className="text-2xl font-black text-white mb-2 group-hover:tracking-wide transition-all italic uppercase drop-shadow-md">
                      {lesson.title}
                    </h4>
                    {lesson.summary && (
                      <p className="text-[#c4cfde]/60 text-sm font-medium">
                        {lesson.summary}
                      </p>
                    )}
                  </div>

                  <div
                    className={`hidden md:flex shrink-0 w-10 h-10 rounded-full border items-center justify-center transition-all ${
                      isSideQuest
                        ? "border-amber-500/30 text-amber-500 group-hover:bg-amber-500 group-hover:text-black"
                        : "border-cyber-neon/30 text-cyber-neon group-hover:bg-cyber-neon group-hover:text-black"
                    }`}
                  >
                    →
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center p-12 rounded-[3rem] border border-white/5 bg-cyber-surface">
              <p className="text-white/40 font-mono text-sm uppercase tracking-widest">
                Belum ada lesson yang dipublikasikan di level ini.
              </p>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
