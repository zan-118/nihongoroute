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

  const isSideQuest = data.category.type === "general";
  const themeColor = isSideQuest ? "text-amber-500" : "text-cyan-400";
  const themeBorder = isSideQuest ? "border-amber-500" : "border-cyan-400";

  return (
    // PERBAIKAN: pb-40 memberikan ruang scroll ekstra di HP agar tidak tertutup nav bar
    <main className="min-h-screen px-4 md:px-8 pt-20 md:pt-24 pb-40 bg-cyber-bg relative overflow-hidden">
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />

      <div className="max-w-5xl mx-auto relative z-10">
        {/* HEADER */}
        <header className="mb-12 md:mb-16 border-b border-white/5 pb-8 md:pb-10">
          <nav className="mb-4 md:mb-6 font-mono text-[9px] md:text-[10px] font-bold uppercase tracking-[0.2em]">
            <Link
              href="/courses"
              className="text-white/40 hover:text-white transition-colors bg-white/5 px-3 py-1.5 rounded-lg border border-white/10"
            >
              ← Kembali ke Pusat
            </Link>
          </nav>
          <h1
            className={`text-4xl sm:text-5xl md:text-7xl font-black uppercase italic tracking-tight leading-tight drop-shadow-lg mb-3 md:mb-4 ${isSideQuest ? "text-amber-400" : "text-white"}`}
          >
            {data.category.title}
          </h1>
          {data.category.description && (
            <p className="text-sm md:text-lg text-[#c4cfde]/70 max-w-2xl font-medium leading-relaxed px-1 md:px-0">
              {data.category.description}
            </p>
          )}
        </header>

        {/* AREA LATIHAN */}
        <section className="mb-16 md:mb-20">
          <div className="mb-6 flex items-center gap-3 md:gap-4">
            <h3
              className={`text-lg md:text-xl font-black uppercase tracking-widest italic border-l-4 pl-3 md:pl-4 py-0.5 leading-none ${themeBorder} ${themeColor}`}
            >
              Area Latihan
            </h3>
            <div className="h-[1px] flex-1 bg-white/5" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 md:gap-4 font-black uppercase italic text-[10px] md:text-xs tracking-widest">
            <Link
              href={`/courses/${level}/flashcards`}
              className="p-5 md:p-8 rounded-2xl md:rounded-[2rem] bg-cyber-surface border border-white/5 hover:border-cyan-400/50 hover:shadow-[0_0_20px_rgba(34,211,238,0.1)] transition-all flex items-center gap-4 group"
            >
              <span className="text-3xl md:text-4xl group-hover:scale-110 transition-transform">
                🎴
              </span>
              <div>
                <p className="text-white group-hover:text-cyan-400 transition-colors text-base md:text-lg leading-tight mb-1">
                  Kosakata
                </p>
                <p className="text-white/30 text-[8px] md:text-[9px] font-mono">
                  Mode Flashcard
                </p>
              </div>
            </Link>
            <Link
              href={`/courses/${level}/kanji`}
              className="p-5 md:p-8 rounded-2xl md:rounded-[2rem] bg-cyber-surface border border-white/5 hover:border-purple-500/50 hover:shadow-[0_0_20px_rgba(168,85,247,0.1)] transition-all flex items-center gap-4 group"
            >
              <span className="text-3xl md:text-4xl group-hover:scale-110 transition-transform">
                ✍️
              </span>
              <div>
                <p className="text-white group-hover:text-purple-400 transition-colors text-base md:text-lg leading-tight mb-1">
                  Kamus Kanji
                </p>
                <p className="text-white/30 text-[8px] md:text-[9px] font-mono">
                  Membaca & Menulis
                </p>
              </div>
            </Link>
            <Link
              href={`/courses/${level}/survival`}
              className="p-5 md:p-8 rounded-2xl md:rounded-[2rem] bg-red-500/10 border border-red-500/20 hover:border-red-400 hover:shadow-[0_0_20px_rgba(239,68,68,0.2)] transition-all flex items-center gap-4 group sm:col-span-2 md:col-span-1"
            >
              <span className="text-3xl md:text-4xl group-hover:scale-110 transition-transform drop-shadow-[0_0_10px_rgba(239,68,68,0.5)]">
                🔥
              </span>
              <div>
                <p className="text-white text-base md:text-lg group-hover:text-red-400 transition-colors leading-tight mb-1">
                  Tantangan Bertahan
                </p>
                <p className="text-red-400/50 text-[8px] md:text-[9px] font-mono">
                  Adu Kecepatan Waktu
                </p>
              </div>
            </Link>
          </div>
        </section>

        {/* UJIAN SIMULASI */}
        {data.mockExams && data.mockExams.length > 0 && (
          <section className="mb-16 md:mb-20">
            <div className="mb-6 flex items-center gap-3 md:gap-4">
              <h3 className="text-lg md:text-xl font-black text-white uppercase tracking-widest italic border-l-4 border-amber-500 pl-3 md:pl-4 py-0.5 leading-none flex items-center gap-2">
                Ujian <span className="text-amber-500">Simulasi</span>
              </h3>
              <div className="h-[1px] flex-1 bg-white/5" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              {data.mockExams.map((exam: any) => (
                <Link
                  key={exam._id}
                  href={`/courses/${level}/exam/${exam._id}`}
                  className="group relative bg-cyber-surface p-6 md:p-8 rounded-2xl md:rounded-[2.5rem] border border-white/5 hover:border-amber-500/50 transition-all shadow-[0_5px_15px_rgba(0,0,0,0.3)] overflow-hidden"
                >
                  <div className="absolute inset-0 bg-amber-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex-1">
                      <p className="text-[9px] md:text-[10px] text-amber-500 font-black uppercase tracking-[0.3em] mb-1 md:mb-2 bg-amber-500/10 w-max px-2 py-0.5 rounded">
                        Sertifikasi Resmi
                      </p>
                      <h4 className="text-xl md:text-2xl font-black text-white uppercase italic tracking-tight group-hover:text-amber-400 transition-colors">
                        {exam.title}
                      </h4>
                      <div className="flex flex-wrap gap-3 md:gap-4 mt-3 md:mt-4 text-[10px] md:text-xs font-mono text-white/50">
                        <span className="flex items-center gap-1.5 bg-white/5 px-2 py-1 rounded">
                          <span className="text-amber-500">⏱</span>{" "}
                          {exam.timeLimit} Menit
                        </span>
                        <span className="flex items-center gap-1.5 bg-white/5 px-2 py-1 rounded">
                          <span className="text-cyan-400">🎯</span> Lulus:{" "}
                          {exam.passingScore}/180
                        </span>
                      </div>
                    </div>
                    <div className="w-14 h-14 md:w-16 md:h-16 bg-cyber-bg rounded-2xl flex items-center justify-center border border-white/5 group-hover:border-amber-500/30 group-hover:scale-110 transition-all shadow-inner shrink-0 hidden sm:flex">
                      <span className="text-2xl md:text-3xl">📝</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* DAFTAR SILABUS */}
        <section>
          <div className="mb-6 md:mb-8 flex items-center gap-3 md:gap-4">
            <h3
              className={`text-lg md:text-xl font-black text-white uppercase tracking-widest italic border-l-4 pl-3 md:pl-4 py-0.5 leading-none ${isSideQuest ? "border-amber-500" : "border-cyan-400"}`}
            >
              Daftar <span className={themeColor}>Materi</span>
            </h3>
            <div className="h-[1px] flex-1 bg-white/5" />
          </div>

          {data.lessons && data.lessons.length > 0 ? (
            <div className="grid gap-3 md:gap-4">
              {data.lessons.map((lesson: any, index: number) => (
                <Link
                  key={lesson._id}
                  href={`/courses/${level}/${lesson.slug}`}
                  className={`group flex flex-row items-start sm:items-center gap-4 md:gap-6 p-5 md:p-8 rounded-2xl md:rounded-[2rem] border transition-all ${
                    isSideQuest
                      ? "bg-cyber-surface border-white/5 hover:border-amber-500/50 hover:bg-amber-500/5 shadow-md"
                      : "bg-cyber-surface border-white/5 hover:border-cyan-400/50 hover:bg-cyan-400/5 shadow-md"
                  }`}
                >
                  <div
                    className={`w-12 h-12 md:w-14 md:h-14 shrink-0 rounded-xl md:rounded-2xl flex items-center justify-center font-black text-lg md:text-xl font-mono border shadow-inner transition-colors leading-none pb-0.5 mt-1 sm:mt-0 ${
                      isSideQuest
                        ? "bg-amber-500/10 border-amber-500/30 text-amber-500 group-hover:bg-amber-500 group-hover:text-black"
                        : "bg-cyan-400/10 border-cyan-400/30 text-cyan-400 group-hover:bg-cyan-400 group-hover:text-black"
                    }`}
                  >
                    {(index + 1).toString().padStart(2, "0")}
                  </div>

                  <div className="flex-1 min-w-0">
                    {/* PERBAIKAN: Menghapus truncate, membiarkan teks turun baris (leading-snug) */}
                    <h4 className="text-base sm:text-lg md:text-2xl font-black text-white mb-1 md:mb-2 group-hover:tracking-wide transition-all italic uppercase drop-shadow-md leading-snug">
                      {lesson.title}
                    </h4>
                    {lesson.summary && (
                      <p className="text-[#c4cfde]/60 text-[11px] sm:text-xs md:text-sm font-medium line-clamp-2 md:line-clamp-3 leading-relaxed pr-2">
                        {lesson.summary}
                      </p>
                    )}
                  </div>

                  <div
                    className={`hidden md:flex shrink-0 w-10 h-10 rounded-full border items-center justify-center transition-all ${
                      isSideQuest
                        ? "border-amber-500/30 text-amber-500 group-hover:bg-amber-500 group-hover:text-black"
                        : "border-cyan-400/30 text-cyan-400 group-hover:bg-cyan-400 group-hover:text-black"
                    }`}
                  >
                    →
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center p-8 md:p-12 rounded-2xl md:rounded-[3rem] border border-white/5 bg-cyber-surface shadow-inner">
              <span className="text-4xl md:text-5xl mb-4 block opacity-50">
                🚧
              </span>
              <p className="text-white/40 font-mono text-xs md:text-sm uppercase tracking-widest">
                Belum ada bab materi yang dipublikasikan di level ini.
              </p>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
