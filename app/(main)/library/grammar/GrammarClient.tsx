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

const LEVELS = ["n5", "n4", "n3", "n2", "n1"];

interface GrammarArticle {
  _id: string;
  title: string;
  slug: string;
}

interface GrammarClientProps {
  initialArticles?: GrammarArticle[];
}

export default function GrammarClient({ initialArticles = [] }: GrammarClientProps) {
  const [selectedLevel, setSelectedLevel] = useState("n5");
  const [searchTerm, setSearchTerm] = useState("");
  const [articles, setArticles] = useState<GrammarArticle[]>(initialArticles);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Hindari fetch ulang jika masih di level default (n5) dan ini render pertama
    if (selectedLevel === "n5" && articles === initialArticles && initialArticles.length > 0) {
      return;
    }

    async function fetchGrammar() {
      setLoading(true);
      const baseLevel = selectedLevel.toLowerCase();
      const jlptLevel = `jlpt-${baseLevel}`;

      const queryStr = `*[_type == "grammar_article" && (course_category->slug.current match $baseLevel + "*" || course_category->slug.current match "jlpt-" + $baseLevel + "*")] | order(title asc) { 
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

  return (
    <div className="max-w-7xl mx-auto w-full relative z-10 pt-4 md:pt-10">
      <nav className="mb-6 md:mb-10 flex flex-wrap items-center gap-2 md:gap-4 text-xs md:text-xs font-bold text-muted-foreground uppercase tracking-widest">
        <Link href="/dashboard" className="hover:text-primary transition-colors flex items-center gap-1.5 md:gap-2">
          <Home size={14} /> Beranda
        </Link>
        <span className="text-muted-foreground/20">/</span>
        <Link href="/library" className="hover:text-primary transition-colors flex items-center gap-1.5 md:gap-2">
          <Library size={14} /> Pustaka
        </Link>
        <span className="text-muted-foreground/20">/</span>
        <span className="text-primary flex items-center gap-1.5 md:gap-2">
          <BookOpen size={14} /> Tata Bahasa
        </span>
      </nav>

      <header className="mb-6 md:mb-12">
        <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-6 md:gap-8 border-b border-border pb-6 md:pb-12">
          <div className="flex items-center gap-4 md:gap-6">
            <Card className="w-12 h-12 md:w-16 md:h-16 shrink-0 rounded-2xl bg-primary/10 border-primary/20 flex items-center justify-center neo-inset shadow-none">
              <BookOpen size={24} className="text-primary md:w-8 md:h-8" />
            </Card>
            <div className="text-left">
              <h1 className="text-3xl md:text-5xl lg:text-6xl font-black text-foreground tracking-tight leading-none mb-1 md:mb-2">
                Panduan <span className="text-primary">Tata Bahasa</span>
              </h1>
              <span className="text-[10px] md:text-xs text-muted-foreground font-medium tracking-tight uppercase tracking-widest">Pahami pola kalimat biar naklukin JLPT.</span>
            </div>
          </div>

          <nav className="inline-flex p-1 bg-muted/50 dark:bg-black/40 rounded-xl md:rounded-[2rem] border border-border dark:border-white/5 neo-card shadow-none overflow-x-auto w-full xl:w-auto no-scrollbar">
            {LEVELS.map((lvl) => (
              <Button
                key={lvl}
                variant="ghost"
                onClick={() => {
                  setSelectedLevel(lvl);
                  setSearchTerm("");
                }}
                className={`flex-1 md:flex-none px-4 md:px-10 py-3 md:py-5 h-auto rounded-lg md:rounded-2xl text-[10px] md:text-xs font-bold uppercase tracking-widest transition-all duration-300 ${
                  selectedLevel === lvl
                    ? "bg-primary text-primary-foreground shadow-lg"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
              >
                {lvl}
              </Button>
            ))}
          </nav>
        </div>
      </header>

      {/* SEARCH SECTION */}
      <div className="mb-6 md:mb-12 relative group max-w-2xl">
        <Search className="absolute left-4 md:left-6 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors z-10" size={18} />
        <Input
          placeholder="Cari pola kalimat..."
          className="w-full pl-11 md:pl-14 pr-6 py-4 md:py-6 h-auto bg-muted/30 border-border rounded-xl md:rounded-[1.5rem] text-xs md:text-base text-foreground placeholder:text-muted-foreground/50 font-medium neo-inset shadow-none focus-visible:ring-primary/30"
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
                className="h-48 md:h-52 bg-muted/50 border border-border rounded-2xl animate-pulse"
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
                  <Card className="h-full p-5 md:p-6 bg-card border border-border rounded-2xl hover:border-primary/40 hover:bg-primary/[0.03] hover:shadow-xl transition-all duration-300 flex flex-col justify-between cursor-pointer group">
                    <div className="flex-1">
                      {/* Top row */}
                      <div className="flex justify-between items-center mb-4">
                        <div className="w-9 h-9 md:w-10 md:h-10 rounded-xl bg-muted border border-border flex items-center justify-center group-hover:border-primary/30 group-hover:bg-primary/10 transition-all duration-300">
                          <Bookmark
                            size={16}
                            className="text-muted-foreground group-hover:text-primary transition-colors duration-300 md:w-[18px] md:h-[18px]"
                          />
                        </div>
                        <Badge variant="outline" className="text-xs md:text-xs font-bold uppercase tracking-wider text-muted-foreground border-border px-2.5 py-1 rounded-lg h-auto">
                          {article.slug.substring(0, 8).toUpperCase()}
                        </Badge>
                      </div>
                      
                      {/* Title */}
                      <h2 className="text-lg md:text-xl font-black text-foreground tracking-tight leading-snug group-hover:text-primary transition-colors duration-300 mb-2 line-clamp-3">
                        {article.title}
                      </h2>
                      <span className="text-xs md:text-xs font-bold text-muted-foreground/50 uppercase tracking-widest">Sintaksis</span>
                    </div>

                    {/* Bottom CTA */}
                    <div className="mt-4 pt-3 border-t border-border flex items-center justify-between">
                      <span className="text-xs md:text-xs font-bold text-muted-foreground/60 uppercase tracking-wider group-hover:text-primary transition-colors">
                        Pelajari Modul
                      </span>
                      <div className="w-7 h-7 md:w-8 md:h-8 rounded-lg bg-muted border border-border flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground group-hover:border-none transition-all duration-300">
                         <ArrowRight size={14} />
                      </div>
                    </div>
                  </Card>
                </Link>
              </motion.div>
            ))
          ) : (
            <Card className="col-span-full py-16 md:py-24 border border-dashed border-border bg-muted/20 rounded-2xl text-center px-4">
              <div className="flex justify-center mb-5">
                 <div className="w-14 h-14 rounded-full bg-primary/5 flex items-center justify-center border border-primary/10">
                    <BookText size={24} className="text-muted-foreground" />
                 </div>
              </div>
              <p className="text-muted-foreground font-bold uppercase tracking-widest text-xs md:text-sm mb-6">
                {searchTerm 
                  ? `Waduh, hasil buat "${searchTerm}" gak ketemu nih...` 
                  : `Sabar ya, materi tata bahasa buat level ${selectedLevel.toUpperCase()} belum ada nih.`}
              </p>
              {searchTerm && (
                <Button 
                  onClick={() => setSearchTerm("")}
                  variant="outline"
                  className="bg-primary/10 border-primary/30 text-primary hover:bg-primary hover:text-primary-foreground rounded-xl px-6 font-bold uppercase tracking-widest text-xs transition-all"
                >
                  Hapus Filter
                </Button>
              )}
            </Card>
          )}
        </AnimatePresence>
      </section>
    </div>
  );
}
