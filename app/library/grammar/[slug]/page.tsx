import { client } from "@/sanity/lib/client";
import { PortableText } from "@portabletext/react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import TTSReader from "@/components/TTSReader";

const articleQuery = `*[_type == "grammar_article" && slug.current == $slug][0] {
  title,
  content
}`;

const ptComponents = {
  types: {
    // Definisi tipe any untuk Sanity components dibiarkan jika skemanya sangat dinamis,
    // tetapi kita perbaiki UI warnanya.
    exampleSentence: ({ value }: any) => (
      <div className="bg-cyber-surface p-6 rounded-2xl border border-white/5 my-6 shadow-xl group hover:border-cyber-neon/30 transition-all flex justify-between items-center gap-4">
        <div className="flex-1">
          <p className="text-2xl font-black text-white mb-2 group-hover:text-cyber-neon transition-colors font-japanese leading-relaxed">
            {value.jp}
          </p>
          <p className="text-[#c4cfde]/60 italic text-sm border-l-2 border-cyber-neon pl-4">
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
      <h2 className="text-2xl font-black text-cyber-neon mt-10 mb-4 italic uppercase tracking-wider">
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

  if (!article) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-cyber-bg text-[#c4cfde] px-4 py-20">
      <article className="max-w-3xl mx-auto">
        <nav className="mb-12">
          <Link
            href="/library/grammar"
            className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-white/40 hover:text-cyber-neon transition-all group"
          >
            <ChevronLeft
              size={16}
              className="group-hover:-translate-x-1 transition-transform"
            />
            Kembali ke Archives
          </Link>
        </nav>

        <header className="mb-16">
          <h1 className="text-4xl md:text-6xl font-black text-white italic leading-tight uppercase tracking-tighter">
            {article.title}
          </h1>
          <div className="h-1 w-24 bg-cyber-neon mt-6 rounded-full shadow-[0_0_15px_rgba(0,255,239,0.8)]" />
        </header>

        <div className="prose prose-invert max-w-none">
          <PortableText value={article.content} components={ptComponents} />
        </div>

        <footer className="mt-20 pt-8 border-t border-white/5 text-center">
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-white/20 italic">
            NihongoRoute Grammar Reference
          </p>
        </footer>
      </article>
    </main>
  );
}
