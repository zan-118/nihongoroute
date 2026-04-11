import Link from "next/link";
import { client } from "@/sanity/lib/client";

export const revalidate = 3600;

export default async function JLPTLandingPage() {
  const levels = await client.fetch(`*[_type == "level"] | order(code desc)`);

  return (
    <div className="min-h-screen px-4 md:px-8 py-24 bg-[#1f242d]">
      <div className="max-w-6xl mx-auto">
        {/* BASICS SECTION (NEW) */}
        <section className="mb-16">
          <Link
            href="/jlpt/basics"
            className="group block relative overflow-hidden bg-gradient-to-r from-blue-600/20 to-transparent border border-blue-500/20 p-8 rounded-[3rem] hover:border-blue-400 transition-all shadow-2xl"
          >
            <div className="flex items-center gap-6">
              <span className="text-5xl group-hover:scale-110 transition-transform">
                🖋️
              </span>
              <div>
                <h2 className="text-2xl font-black text-white uppercase  italic tracking-tighter">
                  Kana Basics
                </h2>
                <p className="text-blue-400/60 text-xs font-bold uppercase tracking-widest mt-1">
                  Start Here: Hiragana & Katakana
                </p>
              </div>
            </div>
          </Link>
        </section>

        <header className="mb-12 text-center md:text-left">
          <p className="text-[#0ef] text-[10px] font-black uppercase tracking-[0.5em] mb-2">
            Curriculum Path
          </p>
          <h1 className="text-5xl md:text-7xl font-black text-white uppercase italic tracking-tighter leading-none">
            Choose Your <span className="text-[#0ef]">Level</span>
          </h1>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-24">
          {levels.map((level: any) => (
            <Link
              key={level._id}
              href={`/jlpt/${level.code}`}
              className="group relative"
            >
              <div className="absolute inset-0 bg-[#0ef] blur-[40px] opacity-0 group-hover:opacity-10 transition-opacity" />
              <div className="relative bg-[#1e2024] p-10 rounded-[2.5rem] border border-white/5 group-hover:border-[#0ef]/50 transition-all flex flex-col items-center text-center h-full">
                <span className="text-xs font-black text-[#0ef] uppercase tracking-[0.3em] mb-4">
                  Mastery
                </span>
                <h2 className="text-6xl font-black text-white mb-4 italic group-hover:scale-110 transition-transform uppercase">
                  {level.name}
                </h2>
                <div className="h-1 w-10 bg-white/5 rounded-full mb-6" />
                <p className="text-sm text-[#c4cfde]/40 font-medium uppercase tracking-widest mt-auto">
                  Explore Syllabus →
                </p>
              </div>
            </Link>
          ))}
        </div>

        {/* REFERENCE HUB */}
        <section className="pt-16 border-t border-white/5">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-black text-white uppercase italic tracking-tighter">
              The <span className="text-[#0ef]">Library</span>
            </h2>
            <p className="text-[#c4cfde]/50 mt-2 text-sm italic">
              Pusat data referensi tata bahasa, verba, dan cheatsheet tematik.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-5xl mx-auto">
            <Link
              href="/library/verbs"
              className="bg-[#1e2024] p-8 rounded-[2rem] border border-white/5 hover:border-blue-500/30 transition-all text-center group"
            >
              <span className="text-4xl block mb-4 group-hover:scale-110 transition-transform">
                🔍
              </span>
              <h3 className="text-white font-black uppercase italic tracking-widest text-sm">
                Verbs Dictionary
              </h3>
            </Link>
            <Link
              href="/library/grammar"
              className="bg-[#1e2024] p-8 rounded-[2rem] border border-white/5 hover:border-green-500/30 transition-all text-center group"
            >
              <span className="text-4xl block mb-4 group-hover:scale-110 transition-transform">
                📖
              </span>
              <h3 className="text-white font-black uppercase italic tracking-widest text-sm">
                Grammar Guide
              </h3>
            </Link>
            <Link
              href="/library/cheatsheet"
              className="bg-[#1e2024] p-8 rounded-[2rem] border border-white/5 hover:border-pink-500/30 transition-all text-center group"
            >
              <span className="text-4xl block mb-4 group-hover:scale-110 transition-transform">
                📋
              </span>
              <h3 className="text-white font-black uppercase italic tracking-widest text-sm">
                Cheat Sheets
              </h3>
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
