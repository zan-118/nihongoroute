"use client";

import { useState, useEffect } from "react";
import { client } from "@/sanity/lib/client";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { BookOpen } from "lucide-react";

const LEVELS = ["n5", "n4", "n3", "n2", "n1"];

interface GrammarArticle {
  _id: string;
  title: string;
  slug: string;
}

export default function GrammarArticlesPage() {
  const [selectedLevel, setSelectedLevel] = useState("n5");
  const [articles, setArticles] = useState<GrammarArticle[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchGrammar() {
      setLoading(true);
      const query = `*[_type == "grammar_article" && slug.current match $level + "*"] | order(title asc) {
        _id, title, "slug": slug.current
      }`;
      const data = await client.fetch(query, { level: selectedLevel });
      setArticles(data);
      setLoading(false);
    }
    fetchGrammar();
  }, [selectedLevel]);

  return (
    <main className="min-h-screen bg-cyber-bg px-4 md:px-8 pt-24 pb-32 relative overflow-hidden">
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />

      <div className="max-w-6xl mx-auto relative z-10">
        <header className="mb-16 text-center border-b border-white/5 pb-12">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 inline-flex items-center gap-2 px-4 py-1.5 rounded bg-green-500/10 border border-green-500/30 text-[10px] text-green-400 font-black tracking-[0.3em] uppercase shadow-[0_0_15px_rgba(34,197,94,0.15)]"
          >
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            Syntax Repository
          </motion.div>

          <h1 className="text-5xl md:text-7xl font-black text-white italic uppercase tracking-tighter mb-12 drop-shadow-lg">
            Grammar{" "}
            <span className="text-green-400 drop-shadow-[0_0_20px_rgba(34,197,94,0.4)]">
              Archive
            </span>
          </h1>

          <nav className="inline-flex p-1.5 bg-cyber-surface rounded-2xl border border-white/5 shadow-inner">
            {LEVELS.map((lvl) => {
              const isActive = selectedLevel === lvl;
              return (
                <button
                  key={lvl}
                  onClick={() => setSelectedLevel(lvl)}
                  className={`px-6 md:px-10 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all duration-300 ${
                    isActive
                      ? "bg-green-500 text-cyber-bg shadow-[0_0_20px_rgba(34,197,94,0.4)]"
                      : "text-white/40 hover:text-white hover:bg-white/5"
                  }`}
                >
                  {lvl}
                </button>
              );
            })}
          </nav>
        </header>

        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          <AnimatePresence mode="popLayout">
            {loading ? (
              [...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="h-48 bg-cyber-surface border border-white/5 rounded-[2.5rem] animate-pulse shadow-inner"
                />
              ))
            ) : articles.length > 0 ? (
              articles.map((article, idx) => (
                <motion.article
                  key={article._id}
                  initial={{ opacity: 0, scale: 0.9, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="group relative h-full"
                >
                  <Link
                    href={`/library/grammar/${article.slug}`}
                    className="block h-full"
                  >
                    <div className="h-full p-8 bg-cyber-surface border border-white/5 rounded-[2.5rem] hover:border-green-500/40 transition-all duration-300 shadow-[6px_6px_15px_rgba(0,0,0,0.5)] hover:shadow-[0_0_30px_rgba(34,197,94,0.15)] flex flex-col justify-between overflow-hidden relative">
                      <div className="absolute -bottom-4 -right-4 text-8xl font-black italic text-white/[0.02] group-hover:text-green-500/[0.05] transition-colors pointer-events-none">
                        {selectedLevel.toUpperCase()}
                      </div>

                      <div className="relative z-10">
                        <div className="w-12 h-12 rounded-2xl bg-cyber-bg border border-white/5 shadow-inner flex items-center justify-center mb-6 group-hover:border-green-500/30 transition-colors">
                          <BookOpen
                            size={20}
                            className="text-white/20 group-hover:text-green-400 transition-colors"
                          />
                        </div>
                        <h2 className="text-xl md:text-2xl font-black text-white italic uppercase tracking-tighter leading-tight group-hover:text-green-400 transition-colors drop-shadow-sm">
                          {article.title}
                        </h2>
                      </div>

                      <div className="mt-8 flex items-center justify-between text-[10px] font-black uppercase tracking-[0.2em] relative z-10">
                        <span className="text-white/30 group-hover:text-white/80 transition-colors">
                          Access File
                        </span>
                        <span className="text-white/20 group-hover:text-green-400 group-hover:translate-x-1 transition-all text-lg leading-none">
                          →
                        </span>
                      </div>
                    </div>
                  </Link>
                </motion.article>
              ))
            ) : (
              <div className="col-span-full py-24 border-2 border-dashed border-white/5 bg-cyber-surface/50 rounded-[3rem] text-center">
                <span className="text-5xl mb-6 block opacity-50">📂</span>
                <p className="text-white/30 font-black uppercase tracking-[0.4em] italic font-mono text-sm">
                  Error 404: {selectedLevel.toUpperCase()} Data Not Found
                </p>
              </div>
            )}
          </AnimatePresence>
        </section>
      </div>
    </main>
  );
}
