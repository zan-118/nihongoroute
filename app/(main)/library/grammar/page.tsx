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
import { BookOpen, Home, Library, Bookmark, Search, BookText, ArrowRight } from "lucide-react";
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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
        <nav className="mb-6 md:mb-10 flex flex-wrap items-center gap-2 md:gap-4 text-[9px] md:text-[10px] font-bold text-slate-500 uppercase tracking-widest">
          <Link href="/dashboard" className="hover:text-cyber-neon transition-colors flex items-center gap-1.5 md:gap-2">
            <Home size={14} /> Beranda
          </Link>
          <span className="text-white/10">/</span>
          <Link href="/library" className="hover:text-cyber-neon transition-colors flex items-center gap-1.5 md:gap-2">
            <Library size={14} /> Pustaka
          </Link>
          <span className="text-white/10">/</span>
          <span className="text-cyber-neon flex items-center gap-1.5 md:gap-2">
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
                <h1 className="text-3xl md:text-5xl lg:text-6xl font-black text-white tracking-tight leading-none mb-1 md:mb-2">
                  Panduan <span className="text-cyber-neon">Tata Bahasa</span>
                </h1>
                <span className="text-[10px] md:text-xs text-slate-500 font-medium tracking-tight uppercase tracking-widest">Pahami pola kalimat biar naklukin JLPT.</span>
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
                  className={`flex-1 md:flex-none px-6 md:px-10 py-4 md:py-5 h-auto rounded-lg md:rounded-2xl text-[10px] md:text-xs font-bold uppercase tracking-widest transition-all duration-300 ${
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

        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5 items-stretch">
          <AnimatePresence mode="popLayout">
            {loading ? (
              [...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="h-48 md:h-52 bg-white/[0.02] border border-white/[0.06] rounded-2xl animate-pulse"
                />
              ))
            ) : filteredArticles.length > 0 ? (
              filteredArticles.map((article, idx) => (
                <motion.div
                  key={article._id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ delay: (idx % 12) * 0.03 }}
                  className="group flex h-full w-full"
                >
                  <Link
                    href={`/library/grammar/${article.slug}`}
                    className="block w-full h-full"
                  >
                    <Card className="h-full p-5 md:p-6 bg-white/[0.03] border border-white/[0.06] rounded-2xl hover:border-cyber-neon/40 hover:bg-cyber-neon/[0.03] hover:shadow-[0_0_30px_rgba(0,238,255,0.06)] transition-all duration-300 flex flex-col justify-between cursor-pointer group">
                      <div className="flex-1">
                        {/* Top row */}
                        <div className="flex justify-between items-center mb-4">
                          <div className="w-9 h-9 md:w-10 md:h-10 rounded-xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center group-hover:border-cyber-neon/30 group-hover:bg-cyber-neon/10 transition-all duration-300">
                            <Bookmark
                              size={16}
                              className="text-slate-500 group-hover:text-cyber-neon transition-colors duration-300 md:w-[18px] md:h-[18px]"
                            />
                          </div>
                          <Badge variant="outline" className="text-[9px] md:text-[10px] font-bold uppercase tracking-wider text-slate-500 border-white/[0.08] px-2.5 py-1 rounded-lg h-auto">
                            {article.slug.substring(0, 8).toUpperCase()}
                          </Badge>
                        </div>
                        
                        {/* Title */}
                        <h2 className="text-lg md:text-xl font-black text-white tracking-tight leading-snug group-hover:text-cyber-neon transition-colors duration-300 mb-2 line-clamp-3">
                          {article.title}
                        </h2>
                        <span className="text-[9px] md:text-[10px] font-bold text-slate-600 uppercase tracking-widest">Sintaksis</span>
                      </div>

                      {/* Bottom CTA */}
                      <div className="mt-4 pt-3 border-t border-white/[0.06] flex items-center justify-between">
                        <span className="text-[9px] md:text-[10px] font-bold text-slate-600 uppercase tracking-wider group-hover:text-cyber-neon transition-colors">
                          Pelajari Modul
                        </span>
                        <div className="w-7 h-7 md:w-8 md:h-8 rounded-lg bg-white/[0.04] border border-white/[0.06] flex items-center justify-center group-hover:bg-cyber-neon group-hover:text-black group-hover:border-none transition-all duration-300">
                           <ArrowRight size={14} />
                        </div>
                      </div>
                    </Card>
                  </Link>
                </motion.div>
              ))
            ) : (
              <Card className="col-span-full py-16 md:py-24 border border-dashed border-white/10 bg-black/20 rounded-2xl text-center px-4">
                <div className="flex justify-center mb-5">
                   <div className="w-14 h-14 rounded-full bg-cyber-neon/5 flex items-center justify-center border border-cyber-neon/10">
                      <BookText size={24} className="text-slate-500" />
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
