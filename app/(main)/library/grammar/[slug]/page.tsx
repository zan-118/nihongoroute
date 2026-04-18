import { client } from "@/sanity/lib/client";
import { PortableText } from "@portabletext/react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft, Home, Layers, BookOpen } from "lucide-react";
import TTSReader from "@/components/TTSReader";

const articleQuery = `*[_type == "grammar_article" && slug.current == $slug][0] { title, content }`;

const ptComponents = {
  types: {
    exampleSentence: ({ value }: any) => (
      <div className="bg-cyber-surface p-6 rounded-2xl border border-white/5 my-6 shadow-xl group hover:border-indigo-500/30 transition-all flex justify-between items-center gap-4">
        <div className="flex-1">
          <p className="text-2xl font-black text-white mb-2 group-hover:text-indigo-400 transition-colors font-japanese leading-relaxed">
            {value.jp}
          </p>
          <p className="text-[#c4cfde]/60 italic text-sm border-l-2 border-indigo-500 pl-4">
            {value.id}
          </p>
        </div>
        <div className="shrink-0">
          <TTSReader text={value.jp} minimal={true} />
        </div>
      </div>
    ),
  },
  block: {
    h2: ({ children }: any) => (
      <h2 className="text-2xl font-black text-indigo-400 mt-10 mb-4 italic uppercase tracking-wider">
        {children}
      </h2>
    ),
    normal: ({ children }: any) => (
      <p className="mb-4 text-[#c4cfde]/90 text-base leading-relaxed">
        {children}
      </p>
    ),
  },
};

export default async function GrammarDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const article = await client.fetch(articleQuery, { slug });
  if (!article) notFound();

  return (
    // DIUBAH: py-20 diganti menjadi w-full px-4 md:px-8
    <div className="w-full text-[#c4cfde] px-4 md:px-8 relative overflow-hidden flex flex-col flex-1 mt-4 md:mt-8">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-900/10 via-transparent to-transparent pointer-events-none" />

      <article className="max-w-3xl mx-auto w-full relative z-10 flex-1">
        <nav className="mb-12 flex flex-wrap items-center gap-2 text-[9px] md:text-xs font-black uppercase tracking-[0.2em] font-mono">
          <Link
            href="/dashboard"
            className="text-white/30 hover:text-indigo-400 transition-colors flex items-center gap-1.5 p-2 rounded-lg hover:bg-white/5"
          >
            <Home size={14} /> Beranda
          </Link>
          <span className="text-white/10">/</span>
          <Link
            href="/library"
            className="text-white/40 hover:text-indigo-400 transition-colors flex items-center gap-1.5 p-2 rounded-lg hover:bg-white/5"
          >
            <Layers size={14} /> Koleksi
          </Link>
          <span className="text-white/10">/</span>
          <Link
            href="/library/grammar"
            className="text-white/40 hover:text-indigo-400 transition-colors flex items-center gap-1.5 p-2 rounded-lg hover:bg-white/5"
          >
            <BookOpen size={14} /> Tata Bahasa
          </Link>
          <span className="text-white/10">/</span>
          <span className="text-indigo-400 truncate max-w-[120px] md:max-w-[200px]">
            {article.title}
          </span>
        </nav>

        <header className="mb-16">
          <h1 className="text-4xl md:text-6xl font-black text-white italic leading-tight uppercase tracking-tighter">
            {article.title}
          </h1>
          <div className="h-1 w-24 bg-indigo-500 mt-6 rounded-full shadow-[0_0_15px_rgba(99,102,241,0.8)]" />
        </header>

        <div className="prose prose-invert max-w-none mb-12">
          <PortableText value={article.content} components={ptComponents} />
        </div>

        <footer className="mt-auto pt-8 border-t border-white/5 text-center flex flex-col items-center gap-4">
          <Link
            href="/library/grammar"
            className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] bg-white/5 hover:bg-white/10 px-6 py-3 rounded-xl text-white transition-all"
          >
            <ChevronLeft size={16} /> Kembali ke Daftar
          </Link>
        </footer>
      </article>
    </div>
  );
}
