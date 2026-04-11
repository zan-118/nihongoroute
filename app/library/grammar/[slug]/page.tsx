import { client } from "@/sanity/lib/client";
import { PortableText } from "@portabletext/react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import TTSReader from "@/components/TTSReader";

// 1. Definisikan query secara terpisah agar rapi
const articleQuery = `*[_type == "grammar_article" && slug.current == $slug][0] {
  title,
  content
}`;

// 2. Kustomisasi komponen Portable Text
const ptComponents = {
  types: {
    exampleSentence: ({ value }: any) => (
      <div className="bg-[#1e2024] p-6 rounded-2xl border border-white/5 my-6 shadow-xl group hover:border-[#0ef]/30 transition-all flex justify-between items-center gap-4">
        <div className="flex-1">
          {/* Teks Bahasa Jepang */}
          <p className="text-2xl font-black text-white mb-2 group-hover:text-[#0ef] transition-colors font-japanese leading-relaxed">
            {value.jp}
          </p>
          {/* Terjemahan Bahasa Indonesia */}
          <p className="text-[#c4cfde]/60 italic text-sm border-l-2 border-[#0ef] pl-4">
            {value.id}
          </p>
        </div>

        {/* Tombol TTS (Text-to-Speech) */}
        <div className="shrink-0">
          <TTSReader text={value.jp} minimal={true} />
        </div>
      </div>
    ),
  },
  block: {
    h2: ({ children }: any) => (
      <h2 className="text-2xl font-black text-[#0ef] mt-10 mb-4 italic uppercase tracking-wider">
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
  // 3. Await params sesuai standar Next.js (versi 15/16)
  const { slug } = await params;

  // 4. Kirim variabel 'slug' sebagai parameter untuk mencegah parse error
  const article = await client.fetch(articleQuery, { slug });

  if (!article) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-[#1f242d] text-[#c4cfde] px-4 py-20">
      <article className="max-w-3xl mx-auto">
        {/* Breadcrumb Navigasi */}
        <nav className="mb-12">
          <Link
            href="/library/grammar"
            className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-white/40 hover:text-[#0ef] transition-all group"
          >
            <ChevronLeft
              size={16}
              className="group-hover:-translate-x-1 transition-transform"
            />
            Kembali ke Archives
          </Link>
        </nav>

        {/* Header Artikel */}
        <header className="mb-16">
          <h1 className="text-4xl md:text-6xl font-black text-white italic leading-tight uppercase tracking-tighter">
            {article.title}
          </h1>
          <div className="h-1 w-24 bg-[#0ef] mt-6 rounded-full shadow-[0_0_15px_#0ef]" />
        </header>

        {/* Konten Utama dari Sanity */}
        <div className="prose prose-invert max-w-none">
          <PortableText value={article.content} components={ptComponents} />
        </div>

        {/* Footer */}
        <footer className="mt-20 pt-8 border-t border-white/5 text-center">
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-white/20 italic">
            NihongoRoute Grammar Reference • N5 Level
          </p>
        </footer>
      </article>
    </div>
  );
}
