"use client";

import { useState, useEffect } from "react";
import { client } from "@/sanity/lib/client";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { BookOpen, Home, Layers } from "lucide-react";

const LEVELS = ["n5", "n4", "n3", "n2", "n1"];

export default function GrammarArticlesPage() {
  const [selectedLevel, setSelectedLevel] = useState("n5");
  const [articles, setArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchGrammar() {
      setLoading(true);

      // ✨ PERBAIKAN 1: Menyiapkan dua kemungkinan format slug (n5 atau jlpt-n5)
      const baseLevel = selectedLevel.toLowerCase();
      const jlptLevel = `jlpt-${baseLevel}`;

      // ✨ PERBAIKAN 2: Menggunakan relasi course_category agar terhubung dengan struktur baru
      const queryStr = `*[_type == "grammar_article" && course_category->slug.current in [$baseLevel, $jlptLevel]] | order(title asc) { 
        _id, 
        title, 
        "slug": slug.current 
      }`;

      try {
        const data = await client.fetch(queryStr, { baseLevel, jlptLevel });
        setArticles(data);
      } catch (error) {
        console.error("Gagal memuat tata bahasa:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchGrammar();
  }, [selectedLevel]);

  return (
    <main className="w-full relative overflow-hidden flex flex-1 flex-col  ">
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />

      <div className="max-w-6xl mx-auto relative z-10">
        <nav className="mb-12 flex flex-wrap items-center gap-2 text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] font-mono">
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
          <span className="text-indigo-400 bg-indigo-500/10 px-3 py-1.5 rounded-lg border border-indigo-500/20 flex items-center gap-1.5 shadow-[0_0_15px_rgba(99,102,241,0.15)]">
            <BookOpen size={14} /> Tata Bahasa
          </span>
        </nav>

        <header className="mb-16 text-center border-b border-white/5 pb-12">
          <h1 className="text-5xl md:text-7xl font-black text-white italic uppercase tracking-tighter mb-12 drop-shadow-lg">
            Panduan{" "}
            <span className="text-indigo-400 drop-shadow-[0_0_20px_rgba(99,102,241,0.4)]">
              Tata Bahasa
            </span>
          </h1>

          <nav className="inline-flex p-1.5 bg-cyber-surface rounded-2xl border border-white/5 shadow-inner overflow-x-auto max-w-full">
            {LEVELS.map((lvl) => (
              <button
                key={lvl}
                onClick={() => setSelectedLevel(lvl)}
                className={`px-6 md:px-10 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all duration-300 ${
                  selectedLevel === lvl
                    ? "bg-indigo-500 text-white shadow-[0_0_20px_rgba(99,102,241,0.4)]"
                    : "text-white/40 hover:text-white hover:bg-white/5"
                }`}
              >
                {lvl}
              </button>
            ))}
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
                    <div className="h-full p-8 bg-cyber-surface border border-white/5 rounded-[2.5rem] hover:border-indigo-500/40 transition-all duration-300 shadow-[6px_6px_15px_rgba(0,0,0,0.5)] hover:shadow-[0_0_30px_rgba(99,102,241,0.15)] flex flex-col justify-between overflow-hidden relative">
                      <div className="absolute -bottom-4 -right-4 text-8xl font-black italic text-white/[0.02] group-hover:text-indigo-500/[0.05] transition-colors pointer-events-none">
                        {selectedLevel.toUpperCase()}
                      </div>
                      <div className="relative z-10">
                        <div className="w-12 h-12 rounded-2xl bg-cyber-bg border border-white/5 shadow-inner flex items-center justify-center mb-6 group-hover:border-indigo-500/30 transition-colors">
                          <BookOpen
                            size={20}
                            className="text-white/20 group-hover:text-indigo-400 transition-colors"
                          />
                        </div>
                        <h2 className="text-xl md:text-2xl font-black text-white italic uppercase tracking-tighter leading-tight group-hover:text-indigo-400 transition-colors drop-shadow-sm">
                          {article.title}
                        </h2>
                      </div>
                      <div className="mt-8 flex items-center justify-between text-[10px] font-black uppercase tracking-[0.2em] relative z-10">
                        <span className="text-white/30 group-hover:text-white/80 transition-colors">
                          Pelajari
                        </span>
                        <span className="text-white/20 group-hover:text-indigo-400 group-hover:translate-x-1 transition-all text-lg leading-none">
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
                  Belum ada data untuk level {selectedLevel.toUpperCase()}
                </p>
              </div>
            )}
          </AnimatePresence>
        </section>
      </div>
    </main>
  );
}
