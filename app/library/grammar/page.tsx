import { client } from "@/sanity/lib/client";
import { allGrammarArticlesQuery } from "@/lib/queries";
import Link from "next/link";

export default async function GrammarArticlesPage() {
  const articles = await client.fetch(allGrammarArticlesQuery);

  return (
    <div className="min-h-screen bg-[#1f242d] px-4 py-16">
      <div className="max-w-3xl mx-auto">
        <header className="mb-12">
          <p className="text-[#0ef] text-[10px] font-black uppercase tracking-[0.5em] mb-2">
            Bunpou
          </p>
          <h1 className="text-4xl md:text-5xl font-black text-white italic uppercase tracking-tighter">
            Panduan Tata Bahasa
          </h1>
        </header>

        <div className="space-y-4">
          {articles.map((article: any) => (
            <Link
              key={article._id}
              href={`/reference/grammar/${article.slug}`}
              className="block p-6 bg-[#1e2024] border border-white/5 rounded-[2rem] hover:border-[#0ef]/30 hover:bg-[#0ef]/5 transition-all group"
            >
              <h2 className="text-xl font-black text-white uppercase italic group-hover:text-[#0ef] transition-colors">
                {article.title}
              </h2>
              <p className="text-[#c4cfde]/40 mt-3 text-[10px] font-bold uppercase tracking-widest group-hover:text-white/60">
                Baca selengkapnya →
              </p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
