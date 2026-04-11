import Link from "next/link";
import { Languages, Table, Book, PenTool } from "lucide-react";

const categories = [
  {
    title: "Kana Basics",
    desc: "Hiragana & Katakana interaktif dengan Stroke Order.",
    href: "/jlpt/basics",
    icon: <PenTool className="w-8 h-8 text-blue-400" />,
    border: "border-blue-500/20",
  },
  {
    title: "Verbs Dictionary",
    desc: "120+ Verba N5 dengan mesin konjugasi otomatis.",
    href: "/library/verbs",
    icon: <Languages className="w-8 h-8 text-[#0ef]" />,
    border: "border-[#0ef]/20",
  },
  {
    title: "Grammar Guide",
    desc: "Penjelasan pola kalimat N5 secara mendalam.",
    href: "/library/grammar",
    icon: <Book className="w-8 h-8 text-green-400" />,
    border: "border-green-500/20",
  },
  {
    title: "Cheat Sheets",
    desc: "Tabel angka, waktu, partikel, dan kosakata tematik.",
    href: "/library/cheatsheet",
    icon: <Table className="w-8 h-8 text-purple-400" />,
    border: "border-purple-500/20",
  },
];

export default function LibraryHub() {
  return (
    <div className="min-h-screen bg-[#1f242d] p-8 py-32 flex flex-col items-center">
      <div className="max-w-6xl w-full">
        <header className="text-center mb-20">
          <h1 className="text-5xl md:text-7xl font-black text-white italic tracking-tighter uppercase mb-4">
            The <span className="text-[#0ef]">Library</span>
          </h1>
          <div className="h-1 w-24 bg-[#0ef] mx-auto rounded-full shadow-[0_0_15px_#0ef]" />
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((cat) => (
            <Link href={cat.href} key={cat.title}>
              <div
                className={`group p-8 rounded-[2.5rem] bg-[#1e2024] border ${cat.border} transition-all duration-300 hover:scale-[1.02] active:scale-95 h-full flex flex-col items-center text-center relative overflow-hidden shadow-2xl`}
              >
                <div className="p-5 rounded-2xl bg-white/5 mb-8 group-hover:scale-110 transition-transform">
                  {cat.icon}
                </div>
                <h2 className="text-xl font-black text-white mb-4 uppercase italic tracking-tight group-hover:text-[#0ef] transition-colors">
                  {cat.title}
                </h2>
                <p className="text-[#c4cfde]/40 leading-relaxed text-xs italic">
                  {cat.desc}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
