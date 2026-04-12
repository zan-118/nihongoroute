import Link from "next/link";
import { Languages, Table, Book, PenTool } from "lucide-react";

const categories = [
  {
    title: "Kana Basics",
    desc: "Hiragana & Katakana interaktif dengan Stroke Order.",
    href: "/jlpt/basics",
    icon: (
      <PenTool className="w-8 h-8 text-blue-400 drop-shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
    ),
    color: "blue",
  },
  {
    title: "Verbs Matrix",
    desc: "120+ Verba N5 dengan mesin konjugasi otomatis.",
    href: "/library/verbs",
    icon: (
      <Languages className="w-8 h-8 text-cyber-neon drop-shadow-[0_0_8px_rgba(0,255,239,0.5)]" />
    ),
    color: "cyan",
  },
  {
    title: "Grammar Archive",
    desc: "Penjelasan pola kalimat JLPT secara mendalam.",
    href: "/library/grammar",
    icon: (
      <Book className="w-8 h-8 text-green-400 drop-shadow-[0_0_8px_rgba(34,197,94,0.5)]" />
    ),
    color: "green",
  },
  {
    title: "Data Sheets",
    desc: "Tabel angka, waktu, partikel, dan kosakata tematik.",
    href: "/library/cheatsheet",
    icon: (
      <Table className="w-8 h-8 text-purple-400 drop-shadow-[0_0_8px_rgba(168,85,247,0.5)]" />
    ),
    color: "purple",
  },
];

export default function LibraryHub() {
  const colorStyles: Record<string, string> = {
    blue: "hover:border-blue-500/50 group-hover:shadow-[0_0_30px_rgba(59,130,246,0.15)]",
    cyan: "hover:border-cyber-neon/50 group-hover:shadow-[0_0_30px_rgba(0,255,239,0.15)]",
    green:
      "hover:border-green-500/50 group-hover:shadow-[0_0_30px_rgba(34,197,94,0.15)]",
    purple:
      "hover:border-purple-500/50 group-hover:shadow-[0_0_30px_rgba(168,85,247,0.15)]",
  };

  return (
    <main className="min-h-screen bg-cyber-bg p-8 pt-32 pb-32 flex flex-col items-center relative overflow-hidden">
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />

      <div className="max-w-6xl w-full relative z-10">
        <header className="text-center mb-20">
          <p className="text-cyber-neon text-[10px] font-black uppercase tracking-[0.5em] mb-4 drop-shadow-[0_0_5px_rgba(0,255,239,0.5)]">
            Reference Database
          </p>
          <h1 className="text-5xl md:text-7xl font-black text-white italic tracking-tighter uppercase mb-6 drop-shadow-lg">
            The <span className="text-cyber-neon">Library</span>
          </h1>
          <div className="h-1 w-24 bg-gradient-to-r from-transparent via-cyber-neon to-transparent mx-auto rounded-full shadow-[0_0_15px_rgba(0,255,239,0.8)]" />
        </header>

        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          {categories.map((cat) => (
            <Link href={cat.href} key={cat.title}>
              <article
                className={`group p-8 md:p-10 rounded-[3rem] bg-cyber-surface border border-white/5 transition-all duration-300 active:scale-95 h-full flex flex-col items-center text-center relative overflow-hidden shadow-[15px_15px_40px_rgba(0,0,0,0.6),-10px_-10px_30px_rgba(255,255,255,0.02)] active:shadow-[inset_4px_4px_10px_rgba(0,0,0,0.5)] ${colorStyles[cat.color]}`}
              >
                <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

                <div className="w-20 h-20 rounded-2xl bg-cyber-bg border border-white/5 shadow-inner mb-8 flex items-center justify-center group-hover:scale-110 transition-transform">
                  {cat.icon}
                </div>
                <h2 className="text-xl font-black text-white mb-3 uppercase italic tracking-tight transition-colors relative z-10">
                  {cat.title}
                </h2>
                <p className="text-[#c4cfde]/50 leading-relaxed text-xs italic font-medium relative z-10">
                  {cat.desc}
                </p>
              </article>
            </Link>
          ))}
        </section>
      </div>
    </main>
  );
}
