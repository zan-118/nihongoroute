/**
 * @file app/(main)/library/grammar/page.tsx
 * @description Halaman indeks katalog panduan tata bahasa (Bunpou). Menggunakan teknik "Client-Side Fetching" untuk memfilter dan memuat daftar bab dari CMS secara asinkron berdasarkan level yang dipilih.
 * @module Client Component
 */

"use client";

import { useState, useEffect } from "react";
import { client } from "@/sanity/lib/client";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { BookOpen, Home, Library, Bookmark, Search, Activity, BookText, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

// Matriks kategori rentang level JLPT yang tersedia
const LEVELS = ["n5", "n4", "n3", "n2", "n1"];

/**
 * Komponen Induk Layar Katalog Tata Bahasa.
 * Menyediakan pemilih tab antar-level JLPT, kemudian memicu *hook* reaktif untuk mengambil metadata artikel terkait (judul dan slug) dari Sanity CMS.
 * 
 * @returns {JSX.Element} Grid presentasi daftar tautan panduan pola kalimat yang dianimasikan secara beruntun.
 */
export default function GrammarArticlesPage() {
  const [selectedLevel, setSelectedLevel] = useState("n5");
  const [articles, setArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchGrammar() {
      setLoading(true);
      const baseLevel = selectedLevel.toLowerCase();
      // Memeriksa dokumen dengan slug dasar maupun awalan 'jlpt-' guna menangani penamaan silang.
      const jlptLevel = `jlpt-${baseLevel}`;

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
  // ======================
  // RENDER
  // ======================
  return (
    <main className="w-full relative overflow-hidden flex flex-1 flex-col pb-24 px-4 md:px-8 lg:px-12">
      {/* Background Neural Overlays */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:60px_60px] pointer-events-none z-0" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(0,238,255,0.05)_0%,transparent_70%)] pointer-events-none z-0" />

      <div className="max-w-7xl mx-auto w-full relative z-10 pt-8 md:pt-10">
        <nav className="mb-8 md:mb-12 flex flex-wrap items-center gap-2 md:gap-4 text-[10px] md:text-xs font-bold text-slate-500 uppercase tracking-widest">
          <Link href="/dashboard" className="hover:text-cyber-neon transition-colors flex items-center gap-1.5 md:gap-2">
            <Home size={14} /> Beranda
          </Link>
          <span className="text-white/10">/</span>
          <Link href="/library" className="hover:text-cyber-neon transition-colors flex items-center gap-1.5 md:gap-2">
            <Library size={14} /> Pustaka
          </Link>
          <span className="text-white/10">/</span>
          <span className="text-cyber-neon flex items-center gap-1.5 md:gap-2 drop-shadow-[0_0_8px_rgba(0,238,255,0.5)]">
            <BookOpen size={14} /> Tata Bahasa
          </span>
        </nav>

        <header className="mb-10 md:mb-16">
          <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-8 md:gap-10 border-b border-white/5 pb-8 md:pb-16">
            <div className="flex items-center gap-5 md:gap-6">
              <Card className="w-14 h-14 md:w-16 md:h-16 shrink-0 rounded-2xl bg-cyber-neon/10 border-cyber-neon/20 flex items-center justify-center neo-inset shadow-none">
                <BookOpen size={28} className="text-cyber-neon md:w-8 md:h-8" />
              </Card>
              <div className="text-left">
                <h1 className="text-4xl md:text-6xl lg:text-7xl font-black text-white tracking-tight leading-none mb-2">
                  Panduan <span className="text-cyber-neon">Bunpou</span>
                </h1>
                <span className="text-xs md:text-sm text-slate-400 font-medium tracking-wide">Dokumentasi pola kalimat dan sintaksis.</span>
              </div>
            </div>

            <nav className="inline-flex p-1.5 md:p-2 bg-black/40 rounded-2xl md:rounded-[2rem] border border-white/5 neo-card shadow-none overflow-x-auto w-full xl:w-auto no-scrollbar">
              {LEVELS.map((lvl) => (
                <Button
                  key={lvl}
                  variant="ghost"
                  onClick={() => setSelectedLevel(lvl)}
                  className={`flex-1 md:flex-none px-6 md:px-12 py-5 md:py-6 h-auto rounded-xl md:rounded-2xl text-xs md:text-sm font-bold uppercase tracking-widest transition-all duration-300 ${
                    selectedLevel === lvl
                      ? "bg-cyber-neon text-black shadow-[0_0_15px_rgba(0,238,255,0.4)]"
                      : "text-slate-500 hover:text-white hover:bg-white/5"
                  }`}
                >
                  {lvl}
                </Button>
              ))}
            </nav>
          </div>
        </header>

        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 lg:gap-10 items-stretch">
          <AnimatePresence mode="popLayout">
            {loading ? (
              [...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="h-56 md:h-64 bg-cyber-surface border border-white/5 rounded-3xl md:rounded-[3.5rem] animate-pulse neo-card shadow-none"
                />
              ))
            ) : articles.length > 0 ? (
              articles.map((article, idx) => (
                <motion.div
                  key={article._id}
                  initial={{ opacity: 0, scale: 0.95, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: (idx % 10) * 0.05 }}
                  className="group relative flex h-full w-full"
                >
                  <Link
                    href={`/library/grammar/${article.slug}`}
                    className="block w-full h-full"
                  >
                    <Card className="h-full p-8 md:p-10 lg:p-12 bg-cyber-surface border-white/5 rounded-3xl md:rounded-[3.5rem] hover:border-cyber-neon/40 transition-all duration-500 neo-card shadow-none flex flex-col justify-between overflow-hidden relative cursor-pointer group">
                      {/* Decorative Element */}
                      <div className="absolute -bottom-6 -right-6 md:-bottom-10 md:-right-10 text-[10rem] md:text-[12rem] font-black text-white/[0.02] group-hover:text-cyber-neon/[0.04] transition-all duration-700 pointer-events-none uppercase">
                        {selectedLevel}
                      </div>
                      
                      <div className="relative z-10 flex-1">
                        <div className="flex justify-between items-start mb-8 md:mb-10">
                          <Card className="w-12 h-12 md:w-16 md:h-16 rounded-2xl bg-black/40 border border-white/5 shadow-none flex items-center justify-center group-hover:border-cyber-neon/30 group-hover:bg-cyber-neon/5 transition-all duration-300 neo-inset">
                            <Bookmark
                              size={24}
                              className="text-slate-500 group-hover:text-cyber-neon transition-colors duration-300 md:w-7 md:h-7"
                            />
                          </Card>
                          <Badge variant="outline" className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-slate-500 border-white/10 px-3 py-1.5 md:px-4 md:py-2 neo-inset h-auto">
                            ID: {article.slug.substring(0, 8).toUpperCase()}
                          </Badge>
                        </div>
                        
                        <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-white tracking-tight leading-none group-hover:text-cyber-neon transition-colors duration-500 drop-shadow-lg">
                          {article.title}
                        </h2>
                        <div className="mt-5 md:mt-6 flex items-center gap-3">
                           <div className="h-0.5 w-4 md:w-6 bg-cyber-neon/40 rounded-full" />
                           <span className="text-[10px] md:text-xs font-bold text-slate-500 uppercase tracking-widest leading-none">Blok Sintaksis</span>
                        </div>
                      </div>

                      <div className="mt-10 md:mt-12 pt-8 md:pt-10 border-t border-white/10 flex items-center justify-between text-[10px] md:text-xs font-bold uppercase tracking-widest relative z-10">
                        <span className="text-slate-500 group-hover:text-cyber-neon transition-colors duration-300">
                          Baca Panduan
                        </span>
                        <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-black/40 border border-white/10 flex items-center justify-center group-hover:bg-cyber-neon group-hover:text-black group-hover:border-none group-hover:translate-x-2 transition-all duration-300 neo-inset shadow-none">
                           <ArrowRight size={18} className="md:w-5 md:h-5" />
                        </div>
                      </div>
                    </Card>
                  </Link>
                </motion.div>
              ))
            ) : (
              <Card className="col-span-full py-24 md:py-32 lg:py-40 border border-dashed border-white/10 bg-black/20 rounded-3xl md:rounded-[4rem] text-center neo-inset shadow-none px-4">
                <div className="flex justify-center mb-8 md:mb-10">
                   <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-cyber-neon/5 flex items-center justify-center border border-cyber-neon/10">
                      <BookText size={32} className="text-slate-500 md:w-10 md:h-10" />
                   </div>
                </div>
                <p className="text-slate-400 font-bold uppercase tracking-widest text-xs md:text-sm">
                  Data tata bahasa belum tersedia untuk level {selectedLevel.toUpperCase()}
                </p>
              </Card>
            )}
          </AnimatePresence>
        </section>
      </div>
    </main>
  );
}
