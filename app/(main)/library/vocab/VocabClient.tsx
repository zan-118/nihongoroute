/**
 * LOKASI FILE: app/(main)/library/vocab/VocabClient.tsx
 * KONSEP: Mobile-First Neumorphic (Kamus Kosakata)
 */

"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { client } from "@/sanity/lib/client";
import { Search, Home, Library, BookOpen, Loader2, Filter, Languages, ArrowRight, LibraryBig } from "lucide-react";
import TTSReader from "@/components/TTSReader";
import PdfGenerator from "@/components/PdfGenerator";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const LEVELS = ["N5", "N4", "N3", "N2"];
const HINSHI = [
  { label: "Semua Tipe", value: "all" },
  { label: "Kata Benda (Meishi)", value: "noun" },
  { label: "Kata Sifat-I (I-Keiyoushi)", value: "i-adjective" },
  { label: "Kata Sifat-Na (Na-Keiyoushi)", value: "na-adjective" },
  { label: "Kata Keterangan (Fukushi)", value: "adverb" },
  { label: "Partikel (Joshi)", value: "particle" },
  { label: "Kata Penghubung (Setsuzokushi)", value: "conjunction" },
  { label: "Kata Ganti (Daimeishi)", value: "pronoun" },
  { label: "Ungkapan (Hyougen)", value: "expression" },
];
const ITEMS_PER_PAGE = 30;

export default function VocabClient() {
  const [level, setLevel] = useState("N5");
  const [hinshi, setHinshi] = useState("all");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [vocabList, setVocabList] = useState<any[]>([]);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 500);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    setVocabList([]);
    setPage(0);
    setHasMore(true);
    fetchData(0, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [level, hinshi, debouncedSearch]);

  const fetchData = async (currentPage: number, isReset = false) => {
    if (loading) return;
    setLoading(true);
    const start = currentPage * ITEMS_PER_PAGE;
    const end = start + ITEMS_PER_PAGE;
    const baseLevel = level.toLowerCase();
    const jlptLevel = `jlpt-${baseLevel}`;

    let queryStr = `*[_type == "vocab" && course_category->slug.current in [$baseLevel, $jlptLevel]`;
    if (debouncedSearch.trim() !== "") {
      queryStr += ` && (word match $search + "*" || romaji match $search + "*" || meaning match $search + "*")`;
    }
    if (hinshi !== "all") {
      queryStr += ` && hinshi == $hinshi`;
    }
    queryStr += `] | order(romaji asc) [$start...$end] { _id, word, furigana, romaji, meaning, hinshi }`;

    try {
      const data = await client.fetch(queryStr, {
        baseLevel,
        jlptLevel,
        search: debouncedSearch.trim(),
        hinshi,
        start,
        end,
      });
      if (data.length < ITEMS_PER_PAGE) setHasMore(false);
      setVocabList((prev) => (isReset ? data : [...prev, ...data]));
    } catch (error) {
      console.error("Gagal mengambil data:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchData(nextPage, false);
  };
  // ======================
  // RENDER
  // ======================
  return (
    <div className="w-full flex flex-col flex-1 pb-24 px-4 md:px-8">
      {/* Breadcrumb Navigation */}
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
          <Languages size={14} /> Kosakata
        </span>
      </nav>

      {/* Header Section */}
      <header className="mb-8 md:mb-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 md:gap-8 border-b border-white/5 pb-8 md:pb-12">
          <div className="flex items-center gap-5 md:gap-6">
            <Card className="w-14 h-14 md:w-16 md:h-16 shrink-0 rounded-2xl bg-cyber-neon/10 border-cyber-neon/20 flex items-center justify-center neo-inset shadow-none">
              <LibraryBig size={28} className="text-cyber-neon md:w-8 md:h-8" />
            </Card>
            <div className="text-left">
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-black text-white tracking-tight leading-none mb-2">
                Kamus <span className="text-cyber-neon">Kosakata</span>
              </h1>
              <span className="text-xs md:text-sm text-slate-400 font-medium tracking-wide">Kumpulan kata penting untuk memperkaya bahasamu.</span>
            </div>
          </div>
          <div className="flex items-center justify-between md:justify-end gap-4 w-full md:w-auto">
             <div className="flex flex-col items-start md:items-end gap-1">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Jumlah Kata</span>
                <span className="text-xs md:text-sm font-black text-white">{vocabList.length} Kata</span>
             </div>
             <PdfGenerator data={vocabList} type="vocab" level={level} />
          </div>
        </div>
      </header>

      {/* Filter & Search Section */}
      <div className="flex flex-col gap-5 md:gap-6 mb-10 md:mb-16 bg-cyber-surface p-5 md:p-8 rounded-[2rem] border border-white/5 neo-card shadow-none">
        <div className="relative w-full group">
          <Search className="absolute left-5 md:left-6 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-cyber-neon transition-colors z-10" size={20} />
          <Input
            placeholder="Cari kanji, romaji, atau arti kata..."
            className="w-full pl-12 md:pl-14 pr-6 py-6 md:py-7 h-auto bg-black/40 border-white/5 rounded-2xl md:rounded-[1.5rem] text-sm md:text-base text-white placeholder:text-slate-600 font-medium neo-inset shadow-none focus-visible:ring-cyber-neon/30"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="flex flex-col lg:flex-row gap-5">
          <div className="w-full lg:w-1/2 flex bg-black/40 border border-white/5 rounded-2xl p-1.5 md:p-2 neo-inset shadow-none overflow-x-auto no-scrollbar">
            {LEVELS.map((l) => (
              <Button
                key={l}
                variant="ghost"
                onClick={() => setLevel(l)}
                className={`flex-1 rounded-xl h-12 md:h-14 text-xs md:text-sm font-bold tracking-wider transition-all duration-300 ${
                  level === l
                    ? "bg-cyber-neon text-black shadow-[0_0_15px_rgba(0,238,255,0.4)]"
                    : "text-slate-500 hover:text-white hover:bg-white/5"
                }`}
              >
                {l}
              </Button>
            ))}
          </div>
          
          <div className="w-full lg:w-1/2 relative group">
             <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 z-10 group-focus-within:text-cyber-neon transition-colors">
                <Filter size={18} />
             </div>
             <Select value={hinshi} onValueChange={setHinshi}>
                <SelectTrigger className="w-full pl-12 md:pl-14 h-12 md:h-14 py-6 bg-black/40 border-white/5 rounded-2xl text-xs md:text-sm font-bold tracking-wide neo-inset shadow-none text-slate-400 focus:ring-cyber-neon/30 transition-all">
                  <SelectValue placeholder="Cari Berdasarkan Tipe" />
                </SelectTrigger>
                <SelectContent className="bg-cyber-surface border-white/10 rounded-2xl overflow-hidden shadow-2xl p-1">
                  {HINSHI.map((h) => (
                    <SelectItem 
                      key={h.value} 
                      value={h.value}
                      className="text-xs font-bold tracking-wide py-3 md:py-4 rounded-xl focus:bg-cyber-neon focus:text-black transition-colors cursor-pointer"
                    >
                      {h.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
          </div>
        </div>
      </div>

      {/* Data Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-6 md:gap-8 items-stretch">
        <AnimatePresence mode="popLayout">
          {vocabList.map((vocab, idx) => (
            <motion.div
              key={vocab._id}
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ delay: (idx % 10) * 0.05 }}
              className="flex h-full w-full"
            >
              <Card className="p-5 md:p-8 h-full w-full flex flex-col bg-slate-900/40 backdrop-blur-xl border-white/10 rounded-[2.5rem] hover:border-cyber-neon/50 hover:bg-cyber-neon/[0.02] transition-all duration-500 neo-card shadow-none group relative overflow-hidden hover:scale-[1.03] hover:shadow-[0_20px_50px_rgba(0,0,0,0.5),0_0_30px_rgba(0,238,255,0.1)]">
                {/* Interactive Gradient Glow */}
                <div className="absolute inset-0 bg-gradient-to-br from-cyber-neon/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                
                <div className="flex justify-between items-start mb-6 md:mb-8 relative z-10">
                  <Badge variant="outline" className="px-3 py-1.5 md:px-4 md:py-2 text-[9px] md:text-xs font-black uppercase tracking-[0.2em] rounded-xl bg-black/20 backdrop-blur-md text-slate-400 border-white/10 h-auto">
                    {vocab.hinshi ? vocab.hinshi.replace("-", " ") : "TIDAK DIKETAHUI"}
                  </Badge>
                  <TTSReader text={vocab.word} minimal={true} />
                </div>

                <div className="mb-6 md:mb-8 relative z-10 flex-1">
                  <div className="min-h-[70px] md:min-h-[100px] flex flex-col justify-center">
                    <ruby className="text-2xl md:text-4xl font-black text-white font-japanese block group-hover:text-cyber-neon transition-colors duration-500 drop-shadow-2xl leading-tight italic">
                      {vocab.word}
                      <rt className="text-[10px] md:text-xs text-cyber-neon font-black tracking-[0.3em] opacity-80 pt-1 md:pt-2 not-italic">
                        {vocab.furigana || "—"}
                      </rt>
                    </ruby>
                  </div>
                  <div className="mt-4 md:mt-6 flex items-center gap-3">
                     <div className="h-0.5 w-6 md:w-8 bg-cyber-neon/40 rounded-full group-hover:w-10 transition-all duration-500" />
                     <p className="text-[10px] md:text-sm font-black text-slate-500 uppercase tracking-[0.3em] group-hover:text-slate-400 transition-colors">
                       {vocab.romaji}
                     </p>
                  </div>
                </div>

                <div className="mt-auto pt-5 md:pt-6 border-t border-white/10 relative z-10">
                  <p className="text-xs md:text-base font-bold text-slate-300 leading-relaxed group-hover:text-white transition-colors duration-500 line-clamp-3 min-h-[2.5rem] md:min-h-[3rem] italic">
                    {vocab.meaning}
                  </p>
                </div>

                {/* Decorative Elements */}
                <div className="absolute -bottom-4 -right-4 text-[10rem] md:text-[12rem] font-black text-white/[0.03] pointer-events-none group-hover:text-cyber-neon/[0.06] transition-all duration-700 rotate-6 italic">
                   {idx + 1}
                </div>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Pagination & Status */}
      <div className="mt-12 md:mt-16 flex justify-center w-full">
        {loading ? (
          <div className="flex items-center gap-4 text-cyber-neon text-xs md:text-sm font-bold uppercase tracking-widest animate-pulse">
            <Loader2 className="animate-spin" size={20} /> Memuat Kosakata...
          </div>
        ) : hasMore && vocabList.length > 0 ? (
          <Button
            variant="ghost"
            onClick={loadMore}
            className="w-full sm:w-auto px-10 py-6 md:px-14 md:py-8 h-auto text-xs md:text-sm font-bold uppercase tracking-widest rounded-2xl md:rounded-3xl bg-black/40 border-white/5 neo-card shadow-none hover:bg-cyber-neon hover:text-black transition-all gap-3 md:gap-4 group"
          >
            Muat Lebih Banyak <ArrowRight size={18} className="group-hover:translate-x-1.5 transition-transform duration-300" />
          </Button>
        ) : vocabList.length === 0 && !loading ? (
          <Card className="py-24 md:py-32 text-center w-full border border-dashed border-white/10 bg-black/20 rounded-[3rem] md:rounded-[4rem] neo-inset shadow-none px-4">
            <div className="flex justify-center mb-6 md:mb-8">
               <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-cyber-neon/10 flex items-center justify-center border border-cyber-neon/20">
                  <Search size={32} className="text-slate-500 md:w-10 md:h-10" />
               </div>
            </div>
            <p className="text-slate-400 font-bold text-sm md:text-base tracking-wide">
              Tidak ada kosakata yang cocok dengan kriteria pencarian Anda.
            </p>
          </Card>
        ) : null}
      </div>
    </div>
  );
}
