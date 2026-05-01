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
import { Input } from "@/components/ui/input";

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
  const [searchTerm, setSearchTerm] = useState("");
  const [articles, setArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchGrammar() {
      setLoading(true);
      const baseLevel = selectedLevel.toLowerCase();
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

  const filteredArticles = articles.filter(art => 
    art.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // ======================
  // RENDER
  // ======================
  return (
    <main className="w-full relative overflow-hidden flex flex-1 flex-col pb-24 px-4 md:px-8 lg:px-12">
      {/* Background Neural Overlays */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:60px_60px] pointer-events-none z-0" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(0,238,255,0.05)_0%,transparent_70%)] pointer-events-none z-0" />

      <div className="max-w-7xl mx-auto w-full relative z-10 pt-8 md:pt-10">
        <nav className="mb-6 md:mb-10 flex flex-wrap items-center gap-2 md:gap-4 text-[10px] md:text-xs font-bold text-slate-500 uppercase tracking-widest">
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

        <header className="mb-8 md:mb-12">
          <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-6 md:gap-8 border-b border-white/5 pb-8 md:pb-12">
            <div className="flex items-center gap-4 md:gap-6">
              <Card className="w-12 h-12 md:w-16 md:h-16 shrink-0 rounded-2xl bg-cyber-neon/10 border-cyber-neon/20 flex items-center justify-center neo-inset shadow-none">
                <BookOpen size={24} className="text-cyber-neon md:w-8 md:h-8" />
              </Card>
              <div className="text-left">
                <h1 className="text-3xl md:text-5xl lg:text-7xl font-black text-white tracking-tight leading-none mb-1 md:mb-2">
                  Panduan <span className="text-cyber-neon">Tata Bahasa</span>
                </h1>
                <span className="text-[10px] md:text-sm text-slate-400 font-medium tracking-wide">Pahami pola kalimat biar ngomongnya gak kaku dan makin lancar!</span>
              </div>
            </div>

            <nav className="inline-flex p-1 bg-black/40 rounded-xl md:rounded-[2rem] border border-white/5 neo-card shadow-none overflow-x-auto w-full xl:w-auto no-scrollbar">
              {LEVELS.map((lvl) => (
                <Button
                  key={lvl}
                  variant="ghost"
                  onClick={() => {
                    setSelectedLevel(lvl);
                    setSearchTerm("");
                  }}
                  className={`flex-1 md:flex-none px-6 md:px-10 py-4 md:py-5 h-auto rounded-lg md:rounded-2xl text-[10px] md:text-sm font-bold uppercase tracking-widest transition-all duration-300 ${
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

        {/* SEARCH SECTION */}
        <div className="mb-8 md:mb-12 relative group max-w-2xl">
          <Search className="absolute left-4 md:left-6 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-cyber-neon transition-colors z-10" size={18} />
          <Input
            placeholder="Cari pola kalimat apa? (misal: ~koto ga aru)..."
            className="w-full pl-11 md:pl-14 pr-6 py-5 md:py-6 h-auto bg-black/40 border-white/5 rounded-xl md:rounded-[1.5rem] text-xs md:text-base text-white placeholder:text-slate-600 font-medium neo-inset shadow-none focus-visible:ring-cyber-neon/30"
            value={searchTerm}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
          />
        </div>

        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 lg:gap-10 items-stretch">
          <AnimatePresence mode="popLayout">
            {loading ? (
              [...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="h-56 md:h-64 bg-cyber-surface border border-white/5 rounded-3xl md:rounded-[3.5rem] animate-pulse neo-card shadow-none"
                />
              ))
            ) : filteredArticles.length > 0 ? (
              filteredArticles.map((article, idx) => (
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
                    <Card className="h-full p-6 md:p-10 lg:p-12 bg-slate-900/40 backdrop-blur-xl border-white/10 rounded-[2.5rem] md:rounded-[3.5rem] hover:border-cyber-neon/50 hover:bg-cyber-neon/[0.03] transition-all duration-500 neo-card shadow-none flex flex-col justify-between overflow-hidden relative cursor-pointer group hover:scale-[1.03] hover:shadow-[0_20px_50px_rgba(0,0,0,0.5),0_0_30px_rgba(0,238,255,0.1)]">
                      {/* Interactive Gradient Glow */}
                      <div className="absolute inset-0 bg-gradient-to-br from-cyber-neon/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                      
                      {/* Decorative Element */}
                      <div className="absolute -bottom-6 -right-6 md:-bottom-10 md:-right-10 text-[10rem] md:text-[12rem] font-black text-white/[0.03] group-hover:text-cyber-neon/[0.06] transition-all duration-700 pointer-events-none uppercase italic">
                        {selectedLevel}
                      </div>
                      
                      <div className="relative z-10 flex-1">
                        <div className="flex justify-between items-start mb-6 md:mb-10">
                          <div className="w-10 h-10 md:w-16 md:h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center group-hover:border-cyber-neon/40 group-hover:bg-cyber-neon/10 transition-all duration-500 shadow-inner">
                            <Bookmark
                              size={20}
                              className="text-slate-500 group-hover:text-cyber-neon transition-colors duration-500 md:w-7 md:h-7"
                            />
                          </div>
                          <Badge variant="outline" className="text-[9px] md:text-xs font-bold uppercase tracking-[0.2em] text-slate-500 border-white/10 px-3 py-1.5 md:px-4 md:py-2 bg-black/20 backdrop-blur-md h-auto">
                            ID: {article.slug.substring(0, 8).toUpperCase()}
                          </Badge>
                        </div>
                        
                        <h2 className="text-2xl md:text-4xl lg:text-5xl font-black text-white tracking-tighter leading-[1.1] group-hover:text-cyber-neon transition-colors duration-500 drop-shadow-2xl italic">
                          {article.title}
                        </h2>
                        <div className="mt-4 md:mt-6 flex items-center gap-3">
                           <div className="h-0.5 w-6 md:w-10 bg-cyber-neon/40 rounded-full group-hover:w-12 transition-all duration-500" />
                           <span className="text-[9px] md:text-xs font-black text-slate-500 uppercase tracking-[0.3em] leading-none group-hover:text-slate-400 transition-colors">Sintaksis</span>
                        </div>
                      </div>

                      <div className="mt-8 md:mt-12 pt-6 md:pt-10 border-t border-white/10 flex items-center justify-between text-[9px] md:text-xs font-black uppercase tracking-[0.3em] relative z-10">
                        <span className="text-slate-500 group-hover:text-cyber-neon transition-colors duration-300">
                          Pelajari Modul
                        </span>
                        <div className="w-8 h-8 md:w-12 md:h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-cyber-neon group-hover:text-black group-hover:border-none group-hover:translate-x-2 transition-all duration-500 shadow-lg">
                           <ArrowRight size={16} className="md:w-5 md:h-5" />
                        </div>
                      </div>
                    </Card>
                  </Link>
                </motion.div>
              ))
            ) : (
              <Card className="col-span-full py-16 md:py-32 lg:py-40 border border-dashed border-white/10 bg-black/20 rounded-3xl md:rounded-[4rem] text-center neo-inset shadow-none px-4">
                <div className="flex justify-center mb-6 md:mb-10">
                   <div className="w-16 h-16 md:w-24 md:h-24 rounded-full bg-cyber-neon/5 flex items-center justify-center border border-cyber-neon/10">
                      <BookText size={28} className="text-slate-500 md:w-10 md:h-10" />
                   </div>
                </div>
                <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px] md:text-sm mb-6">
                  {searchTerm 
                    ? `Waduh, hasil buat "${searchTerm}" gak ketemu nih...` 
                    : `Sabar ya, materi tata bahasa buat level ${selectedLevel.toUpperCase()} belum ada nih.`}
                </p>
                {searchTerm && (
                  <Button 
                    onClick={() => setSearchTerm("")}
                    variant="outline"
                    className="bg-cyber-neon/10 border-cyber-neon/30 text-cyber-neon hover:bg-cyber-neon hover:text-black rounded-xl px-6 font-bold uppercase tracking-widest text-[10px] transition-all"
                  >
                    Hapus Filter
                  </Button>
                )}
              </Card>
            )}
          </AnimatePresence>
        </section>
      </div>
    </main>
  );
}
