"use client";

import { useState, useEffect } from "react";
import { client } from "@/sanity/lib/client";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { BookOpen, ChevronRight } from "lucide-react";

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
      // Filter menggunakan slug.current yang diawali dengan level (n5-xxx)
      const query = `*[_type == "grammar_article" && slug.current match $level + "*"] | order(title asc) {
        _id, 
        title, 
        "slug": slug.current
      }`;
      const data = await client.fetch(query, { level: selectedLevel });
      setArticles(data);
      setLoading(false);
    }
    fetchGrammar();
  }, [selectedLevel]);

  return (
    <div className="min-h-screen bg-[#1f242d] px-4 md:px-8 py-24 md:py-32">
      <div className="max-w-7xl mx-auto">
        <header className="mb-16 text-center">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 inline-block px-4 py-1.5 rounded-full bg-[#0ef]/5 border border-[#0ef]/20 text-[10px] text-[#0ef] font-black tracking-[0.3em] uppercase backdrop-blur-sm"
          >
            Archive Repository
          </motion.div>

          <h1 className="text-6xl md:text-8xl font-black text-white italic uppercase tracking-tighter mb-12">
            Grammar{" "}
            <span className="text-[#0ef] drop-shadow-[0_0_20px_rgba(0,255,239,0.3)]">
              Library
            </span>
          </h1>

          {/* TAB FILTER LEVEL */}
          <div className="inline-flex flex-wrap justify-center gap-2 bg-[#1e2024]/50 p-2 rounded-[2rem] border border-white/5 backdrop-blur-xl shadow-2xl">
            {LEVELS.map((lvl) => (
              <button
                key={lvl}
                onClick={() => setSelectedLevel(lvl)}
                className={`px-8 py-3 rounded-[1.5rem] text-xs font-black uppercase tracking-widest transition-all duration-300 ${
                  selectedLevel === lvl
                    ? "bg-[#0ef] text-[#1f242d] shadow-[0_0_25px_rgba(0,255,239,0.4)] scale-105"
                    : "text-white/30 hover:text-white hover:bg-white/5"
                }`}
              >
                {lvl}
              </button>
            ))}
          </div>
        </header>

        {/* GRID SYSTEM: 1 Kolom (Mobile), 2 Kolom (Tablet), 3 Kolom (Desktop) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence mode="popLayout">
            {loading ? (
              // Loading State (Skeleton-like grid)
              [...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="h-40 bg-[#1e2024] border border-white/5 rounded-[2.5rem] animate-pulse"
                />
              ))
            ) : articles.length > 0 ? (
              articles.map((article, idx) => (
                <motion.div
                  key={article._id}
                  initial={{ opacity: 0, scale: 0.9, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  whileHover={{ y: -8 }}
                  className="group relative h-full"
                >
                  <Link
                    href={`/library/grammar/${article.slug}`}
                    className="block h-full"
                  >
                    <div className="h-full p-8 bg-[#1e2024] border border-white/5 rounded-[2.5rem] hover:border-[#0ef]/30 transition-all duration-500 shadow-xl overflow-hidden flex flex-col justify-between">
                      {/* Dekorasi Background */}
                      <div className="absolute top-0 right-0 p-8 opacity-[0.02] text-7xl font-black italic group-hover:opacity-[0.05] transition-opacity">
                        {selectedLevel.toUpperCase()}
                      </div>

                      <div className="relative z-10">
                        <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center mb-6 group-hover:bg-[#0ef]/10 transition-colors">
                          <BookOpen
                            size={20}
                            className="text-white/20 group-hover:text-[#0ef] transition-colors"
                          />
                        </div>
                        <h2 className="text-xl md:text-2xl font-black text-white italic uppercase tracking-tighter leading-tight group-hover:text-[#0ef] transition-colors">
                          {article.title}
                        </h2>
                      </div>

                      <div className="mt-8 flex items-center justify-between text-[10px] font-black uppercase tracking-[0.2em]">
                        <span className="text-white/20 group-hover:text-white/60 transition-colors">
                          View Study Guide
                        </span>
                        <ChevronRight
                          size={16}
                          className="text-white/10 group-hover:text-[#0ef] group-hover:translate-x-1 transition-all"
                        />
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))
            ) : (
              // Empty State
              <div className="col-span-full py-24 border-2 border-dashed border-white/5 rounded-[3rem] text-center">
                <span className="text-5xl mb-6 block">📂</span>
                <p className="text-white/20 font-black uppercase tracking-[0.4em] italic">
                  Data for {selectedLevel.toUpperCase()} is not available yet
                </p>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
