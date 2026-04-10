import Link from "next/link";
import { client } from "@/sanity/lib/client";

export const revalidate = 3600;

export default async function JLPTLandingPage() {
  const levels = await client.fetch(`*[_type == "level"] | order(code desc)`);

  return (
    <div className="min-h-screen px-4 md:px-8 py-20 bg-[#1f242d]">
      <div className="max-w-6xl mx-auto">
        <header className="mb-20 text-center">
          <p className="text-[#0ef] text-[10px] font-black uppercase tracking-[0.5em] mb-4">
            Official Path
          </p>
          <h1 className="text-5xl md:text-7xl font-black text-white uppercase italic tracking-tighter">
            Choose Your <span className="text-[#0ef]">Level</span>
          </h1>
        </header>

        {/* JLPT LEVELS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-24">
          {levels.map((level: any) => (
            <Link
              key={level._id}
              href={`/jlpt/${level.code}`}
              className="group relative"
            >
              <div className="absolute inset-0 bg-[#0ef] blur-[40px] opacity-0 group-hover:opacity-10 transition-opacity" />
              <div className="relative bg-[#1e2024] p-10 rounded-[2.5rem] border border-white/5 group-hover:border-[#0ef]/50 transition-all flex flex-col items-center text-center">
                <span className="text-xs font-black text-[#0ef] uppercase tracking-[0.3em] mb-4">
                  Mastery
                </span>
                <h2 className="text-6xl font-black text-white mb-4 italic group-hover:scale-110 transition-transform uppercase">
                  {level.name}
                </h2>
                <div className="h-1 w-10 bg-[#0ef]/20 rounded-full mb-6" />
                <p className="text-sm text-[#c4cfde]/40 font-medium uppercase tracking-widest">
                  Explore Syllabus →
                </p>
              </div>
            </Link>
          ))}
        </div>

        {/* NEW SECTION: REFERENCE HUB */}
        <section className="pt-16 border-t border-white/5">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-black text-white uppercase italic tracking-tighter">
              Reference <span className="text-[#0ef]">Hub</span>
            </h2>
            <p className="text-[#c4cfde]/50 mt-2 text-sm italic">
              Panduan cepat tata bahasa dan hafalan angka.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            <Link
              href="/reference/grammar"
              className="bg-gradient-to-br from-blue-500/10 to-transparent p-8 rounded-[2rem] border border-blue-500/20 hover:border-blue-400 transition-all group flex items-center gap-6"
            >
              <span className="text-5xl group-hover:scale-110 transition-transform">
                📖
              </span>
              <div>
                <h3 className="text-xl font-black text-white uppercase italic tracking-tight mb-1">
                  Bunpou (Grammar)
                </h3>
                <p className="text-xs text-blue-400/80 font-bold uppercase tracking-widest">
                  Penjelasan Tata Bahasa
                </p>
              </div>
            </Link>

            <Link
              href="/reference/cheatsheet"
              className="bg-gradient-to-br from-pink-500/10 to-transparent p-8 rounded-[2rem] border border-pink-500/20 hover:border-pink-400 transition-all group flex items-center gap-6"
            >
              <span className="text-5xl group-hover:scale-110 transition-transform">
                📋
              </span>
              <div>
                <h3 className="text-xl font-black text-white uppercase italic tracking-tight mb-1">
                  Cheatsheet
                </h3>
                <p className="text-xs text-pink-400/80 font-bold uppercase tracking-widest">
                  Angka, Waktu & Counter
                </p>
              </div>
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
