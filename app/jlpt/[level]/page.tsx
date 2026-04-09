import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { client } from "@/sanity/lib/client";

export const revalidate = 3600;

interface Level {
  _id: string;
  code: string;
  name: string;
  description: string | null;
}

interface Lesson {
  _id: string;
  slug: string;
  title: string;
  summary: string | null;
  category: string;
}

interface Props {
  params: Promise<{ level: string }>;
}

async function getLevelData(code: string) {
  const query = `{
    "level": *[_type == "level" && code == $code][0] {
      _id, code, name, description
    },
    "lessons": *[_type == "lesson" && level->code == $code && is_published == true] | order(orderNumber asc) {
      _id,
      "slug": slug.current,
      title,
      summary,
      category
    }
  }`;

  return await client.fetch(query, { code });
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { level: levelCode } = await params;
  const { level } = await getLevelData(levelCode);

  if (!level) return { title: "Level Not Found | NihongoPath" };

  return {
    title: `JLPT ${level.name} Curriculum | NihongoPath`,
    description:
      level.description ??
      `Pelajari semua materi JLPT ${level.name} secara terstruktur.`,
    alternates: { canonical: `/jlpt/${level.code}` },
  };
}

/* KONFIGURASI KATEGORI TAMPILAN */
const CATEGORIES = [
  {
    id: "grammar",
    title: "📖 Tata Bahasa",
    desc: "Pola kalimat & struktur bahasa.",
    color: "from-blue-500/20 to-blue-500/5",
    border: "border-blue-500/30",
    textHover: "group-hover:text-blue-400",
  },
  {
    id: "vocabulary",
    title: "📝 Kosakata",
    desc: "Kumpulan kata tematik.",
    color: "from-green-500/20 to-green-500/5",
    border: "border-green-500/30",
    textHover: "group-hover:text-green-400",
  },
  {
    id: "reading",
    title: "📚 Membaca",
    desc: "Latihan pemahaman teks.",
    color: "from-orange-500/20 to-orange-500/5",
    border: "border-orange-500/30",
    textHover: "group-hover:text-orange-400",
  },
  {
    id: "practice",
    title: "🎯 Latihan",
    desc: "Kuis, Flashcard & Kanji.",
    color: "from-purple-500/20 to-purple-500/5",
    border: "border-purple-500/30",
    textHover: "group-hover:text-purple-400",
  },
];

export default async function LevelPage({ params }: Props) {
  const { level: levelCode } = await params;
  const { level, lessons } = await getLevelData(levelCode);

  if (!level) return notFound();

  // Grouping data lessons berdasarkan category
  const groupedLessons = CATEGORIES.map((cat) => ({
    ...cat,
    items: lessons?.filter((l: Lesson) => l.category === cat.id) || [],
  }));

  return (
    <div className="min-h-screen px-4 md:px-8 py-10 md:py-16 bg-[#1f242d]">
      <div className="max-w-6xl mx-auto">
        {/* HEADER */}
        <header className="mb-12 md:mb-20 text-center md:text-left">
          <p className="text-[#0ef] text-[10px] md:text-xs font-bold uppercase tracking-widest mb-2 md:mb-3">
            Syllabus Overview
          </p>
          <h1 className="text-5xl md:text-7xl font-black text-white uppercase tracking-tighter">
            {level.name}
          </h1>
          {level.description && (
            <p className="mt-4 md:mt-6 text-[#c4cfde]/70 text-sm md:text-base max-w-2xl leading-relaxed mx-auto md:mx-0">
              {level.description}
            </p>
          )}
        </header>

        {/* GRID KATEGORI */}
        <div className="space-y-16 md:space-y-24">
          {groupedLessons.map((category) => (
            <section key={category.id} className="relative">
              {/* Judul Kategori */}
              <div className="mb-6 md:mb-10 flex flex-col md:flex-row md:items-end justify-between border-b border-white/5 pb-4">
                <div>
                  <h2 className="text-2xl md:text-4xl font-black text-white tracking-tight">
                    {category.title}
                  </h2>
                  <p className="text-xs md:text-sm text-[#c4cfde]/60 mt-2 uppercase tracking-widest">
                    {category.desc}
                  </p>
                </div>
              </div>

              {/* Konten Kategori */}
              {category.items.length === 0 && category.id !== "practice" ? (
                <div className="bg-[#1e2024] p-8 rounded-2xl border border-white/5 text-center border-dashed">
                  <p className="text-[#c4cfde]/40 text-xs uppercase tracking-widest">
                    Materi sedang disusun...
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                  {/* Khusus Area Practice: Tambahkan Card Flashcard Bawaan Sistem */}
                  {category.id === "practice" && (
                    <Link
                      href={`/jlpt/${level.code}/flashcards`}
                      className="group block active:scale-[0.98] transition-transform"
                    >
                      <div
                        className={`bg-gradient-to-br ${category.color} h-full p-6 md:p-8 rounded-[2rem] border-2 border-white/10 hover:${category.border} shadow-lg transition-all flex flex-col`}
                      >
                        <div className="flex justify-between items-start mb-4">
                          <span className="text-[10px] text-white/80 font-bold uppercase tracking-widest bg-black/20 px-3 py-1 rounded-full">
                            Sistem
                          </span>
                          <span className="text-white/20 group-hover:text-white transition-colors">
                            ↗
                          </span>
                        </div>
                        <h3 className="text-xl md:text-2xl font-black text-white leading-tight mb-3">
                          🧠 Bank Flashcard Vocab & Kanji
                        </h3>
                        <p className="text-xs md:text-sm text-white/70 leading-relaxed mt-auto">
                          Latih ingatanmu dengan sistem Spaced Repetition untuk
                          ribuan kosakata level ini.
                        </p>
                      </div>
                    </Link>
                  )}

                  {/* Render Materi dari Sanity */}
                  {category.items.map((lesson: Lesson, idx: number) => (
                    <Link
                      key={lesson._id}
                      href={`/jlpt/${level.code}/${lesson.slug}`}
                      className="group block active:scale-[0.98] transition-transform"
                    >
                      <div className="bg-[#1e2024] hover:bg-[#23272b] h-full p-6 md:p-8 rounded-[2rem] border border-white/5 hover:border-white/20 shadow-lg group-hover:-translate-y-1 transition-all flex flex-col">
                        <div className="flex justify-between items-start mb-4">
                          <span className="text-[10px] text-[#c4cfde]/60 font-bold uppercase tracking-widest">
                            Bab {idx + 1}
                          </span>
                          <span className="text-white/20 group-hover:text-white transition-colors">
                            ↗
                          </span>
                        </div>
                        <h3
                          className={`text-lg md:text-xl font-black text-white ${category.textHover} transition-colors leading-tight mb-3`}
                        >
                          {lesson.title}
                        </h3>
                        {lesson.summary && (
                          <p className="text-xs md:text-sm text-[#c4cfde]/50 line-clamp-3 leading-relaxed mt-auto">
                            {lesson.summary}
                          </p>
                        )}
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
