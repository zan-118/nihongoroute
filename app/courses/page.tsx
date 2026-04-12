import Link from "next/link";
import { client } from "@/sanity/lib/client";

export const revalidate = 3600;

interface CategoryData {
  _id: string;
  title: string;
  slug: { current: string };
}

interface LibraryCardProps {
  href: string;
  icon: string;
  title: string;
  color: "blue" | "green" | "pink";
}

export default async function CoursesLandingPage() {
  const jlptCategories: CategoryData[] = await client.fetch(
    `*[_type == "course_category" && type == "jlpt"] | order(title desc)`,
  );

  return (
    <main className="min-h-screen px-4 md:px-8 pt-24 pb-32 bg-cyber-bg relative overflow-hidden">
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />

      <div className="max-w-6xl mx-auto relative z-10">
        <header className="mb-16 text-center md:text-left border-b border-white/5 pb-10">
          <p className="text-cyber-neon text-[10px] font-black uppercase tracking-[0.5em] mb-3 drop-shadow-[0_0_5px_rgba(0,255,239,0.5)]">
            Curriculum Path
          </p>
          <h1 className="text-5xl md:text-7xl font-black text-white uppercase italic tracking-tighter leading-none drop-shadow-lg">
            Choose Your <span className="text-cyber-neon">Level</span>
          </h1>
        </header>

        <section className="mb-16">
          <Link
            href="/courses/basics"
            className="group block relative overflow-hidden bg-gradient-to-br from-blue-600/10 to-cyber-surface border border-blue-500/20 p-8 md:p-10 rounded-[3rem] hover:border-blue-400/50 transition-all shadow-[0_10px_30px_rgba(0,0,0,0.5)] active:scale-[0.98]"
          >
            <div className="absolute inset-0 bg-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center gap-6">
              <div className="w-20 h-20 bg-cyber-bg rounded-2xl flex items-center justify-center border border-white/5 shadow-inner group-hover:border-blue-500/50 transition-colors">
                <span className="text-5xl group-hover:scale-110 transition-transform drop-shadow-md">
                  🖋️
                </span>
              </div>
              <div>
                <p className="text-blue-400 text-[10px] font-black uppercase tracking-[0.3em] mb-2 bg-blue-500/10 px-3 py-1 rounded-md border border-blue-500/20 w-max">
                  Phase 0 / Start Here
                </p>
                <h2 className="text-4xl font-black text-white uppercase italic tracking-tighter drop-shadow-md">
                  Kana Basics
                </h2>
                <p className="text-[#c4cfde]/60 text-sm mt-2 max-w-md">
                  Pelajari huruf Hiragana dan Katakana sebelum memulai
                  perjalanan belajar Anda.
                </p>
              </div>
            </div>
          </Link>
        </section>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 mb-24">
          {jlptCategories.map((category) => (
            <Link
              key={category._id}
              href={`/courses/${category.slug.current}`}
              className="group relative h-[300px]"
            >
              <div className="absolute inset-0 bg-cyber-neon blur-[50px] opacity-0 group-hover:opacity-20 transition-opacity duration-500" />
              <div className="relative bg-cyber-surface p-10 rounded-[3rem] border border-white/5 group-hover:border-cyber-neon/50 transition-all flex flex-col items-center text-center h-full shadow-[15px_15px_40px_rgba(0,0,0,0.6),-10px_-10px_30px_rgba(255,255,255,0.02)] active:shadow-[inset_4px_4px_10px_rgba(0,0,0,0.5)] overflow-hidden">
                <div className="absolute top-0 left-10 right-10 h-[2px] bg-gradient-to-r from-transparent via-white/20 to-transparent group-hover:via-cyber-neon transition-colors" />
                <span className="text-[10px] font-black text-white/30 group-hover:text-cyber-neon uppercase tracking-[0.4em] mb-auto transition-colors">
                  Path Unlocked
                </span>
                <h2 className="text-5xl font-black text-white italic group-hover:scale-110 transition-transform uppercase drop-shadow-lg z-10 leading-tight">
                  {category.title}
                </h2>
                <div className="h-1 w-12 bg-white/10 rounded-full my-6 group-hover:bg-cyber-neon/50 transition-colors" />
                <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] mt-auto flex items-center gap-2 group-hover:text-cyber-neon">
                  Explore Syllabus{" "}
                  <span className="text-lg leading-none group-hover:translate-x-1 transition-transform">
                    →
                  </span>
                </p>
              </div>
            </Link>
          ))}
        </div>

        <section className="pt-16 border-t border-white/5">
          <header className="flex flex-col md:flex-row justify-between items-end mb-12 gap-4">
            <div>
              <h2 className="text-4xl font-black text-white uppercase italic tracking-tighter drop-shadow-md">
                The <span className="text-cyber-neon">Library</span>
              </h2>
              <p className="text-[#c4cfde]/50 mt-2 text-sm max-w-md">
                Pusat data referensi tata bahasa, kata kerja, dan panduan cepat.
              </p>
            </div>
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-cyber-neon bg-cyber-neon/10 px-4 py-2 rounded-xl border border-cyber-neon/20">
              Reference DB
            </span>
          </header>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <LibraryCard
              href="/library/verbs"
              icon="🔍"
              title="Verbs Dictionary"
              color="blue"
            />
            <LibraryCard
              href="/library/grammar"
              icon="📖"
              title="Grammar Guide"
              color="green"
            />
            <LibraryCard
              href="/library/cheatsheet"
              icon="📋"
              title="Cheat Sheets"
              color="pink"
            />
          </div>
        </section>
      </div>
    </main>
  );
}

function LibraryCard({ href, icon, title, color }: LibraryCardProps) {
  const colorMap: Record<string, string> = {
    blue: "hover:border-blue-500/50 group-hover:text-blue-400 group-hover:shadow-[0_0_20px_rgba(59,130,246,0.2)]",
    green:
      "hover:border-green-500/50 group-hover:text-green-400 group-hover:shadow-[0_0_20px_rgba(34,197,94,0.2)]",
    pink: "hover:border-pink-500/50 group-hover:text-pink-400 group-hover:shadow-[0_0_20px_rgba(236,72,153,0.2)]",
  };
  return (
    <Link
      href={href}
      className={`bg-cyber-surface p-8 rounded-[2.5rem] border border-white/5 transition-all duration-300 text-center group shadow-[6px_6px_15px_rgba(0,0,0,0.5)] active:shadow-[inset_4px_4px_10px_rgba(0,0,0,0.5)] ${colorMap[color]}`}
    >
      <div className="w-20 h-20 mx-auto bg-cyber-bg rounded-2xl flex items-center justify-center border border-white/5 shadow-inner mb-6">
        <span className="text-4xl group-hover:scale-110 transition-transform drop-shadow-md">
          {icon}
        </span>
      </div>
      <h3 className="text-white font-black uppercase italic tracking-[0.2em] text-xs">
        {title}
      </h3>
    </Link>
  );
}
