/**
 * LOKASI FILE: app/(main)/library/vocab/VocabClient.tsx
 * KONSEP: Mobile-First Neumorphic (Kamus Kosakata)
 */

"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import dynamic from "next/dynamic";
import { Search, Home, Library, Loader2, Filter, Languages, LibraryBig, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import TTSReader from "@/components/features/tools/tts/TTSReader";

const PdfGenerator = dynamic(() => import("@/components/features/pdf/PdfGenerator"), {
  ssr: false,
  loading: () => <Loader2 className="animate-spin text-primary" size={20} />
});
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
import { Switch } from "@/components/ui/switch";
import * as wanakana from "wanakana";
import { splitFurigana } from "@/lib/furigana";

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
const ITEMS_PER_PAGE = 50;

interface VocabItem {
  _id: string;
  word: string;
  furigana?: string;
  romaji?: string;
  meaning: string;
  hinshi?: string;
}

interface VocabClientProps {
  initialData?: VocabItem[];
}

export default function VocabClient({ initialData = [] }: VocabClientProps) {
  const [level, setLevel] = useState("N5");
  const [hinshi, setHinshi] = useState("all");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [showRomaji, setShowRomaji] = useState(true);
  // Inisialisasi dengan data dari server
  const [vocabList, setVocabList] = useState<VocabItem[]>(initialData);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 500);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    // Jangan fetch ulang jika ini adalah render pertama dan filter masih default (N5, all, empty search)
    // karena data sudah disediakan oleh server.
    const isDefaultFilter = level === "N5" && hinshi === "all" && debouncedSearch === "";
    const isFirstRender = vocabList === initialData && currentPage === 1;

    if (isFirstRender && isDefaultFilter && initialData.length > 0) {
      // Kita tetap butuh ambil total count sekali di awal
      fetchTotalCount();
      return;
    }

    setCurrentPage(1);
    fetchData(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [level, hinshi, debouncedSearch]);

  const fetchTotalCount = async () => {
    const baseLevel = level.toLowerCase();
    const jlptLevel = `jlpt-${baseLevel}`;
    const kanaSearch = wanakana.toHiragana(debouncedSearch.trim());
    const kataSearch = wanakana.toKatakana(debouncedSearch.trim());

    let queryStr = `count(*[_type == "vocab" && course_category->slug.current in [$baseLevel, $jlptLevel]`;
    if (debouncedSearch.trim() !== "") {
      queryStr += ` && (word match $search + "*" || romaji match $search + "*" || meaning match $search + "*" || word match $kana + "*" || furigana match $kana + "*" || word match $kata + "*")`;
    }
    if (hinshi !== "all") {
      queryStr += ` && hinshi == $hinshi`;
    }
    queryStr += `])`;

    try {
      const count = await client.fetch(queryStr, {
        baseLevel,
        jlptLevel,
        search: debouncedSearch.trim(),
        kana: kanaSearch,
        kata: kataSearch,
        hinshi,
      });
      setTotalItems(count);
    } catch (error) {
      console.error("Gagal mengambil count:", error);
    }
  };

  const fetchData = async (page: number) => {
    setLoading(true);
    const start = (page - 1) * ITEMS_PER_PAGE;
    const end = start + ITEMS_PER_PAGE;
    const baseLevel = level.toLowerCase();
    const jlptLevel = `jlpt-${baseLevel}`;
    const kanaSearch = wanakana.toHiragana(debouncedSearch.trim());
    const kataSearch = wanakana.toKatakana(debouncedSearch.trim());

    let filterStr = `_type == "vocab" && course_category->slug.current in [$baseLevel, $jlptLevel]`;
    if (debouncedSearch.trim() !== "") {
      filterStr += ` && (word match $search + "*" || romaji match $search + "*" || meaning match $search + "*" || word match $kana + "*" || furigana match $kana + "*" || word match $kata + "*")`;
    }
    if (hinshi !== "all") {
      filterStr += ` && hinshi == $hinshi`;
    }

    const queryStr = `{
      "items": *[${filterStr}] | order(romaji asc) [$start...$end] { _id, word, furigana, romaji, meaning, hinshi },
      "total": count(*[${filterStr}])
    }`;

    try {
      const { items, total } = await client.fetch(queryStr, {
        baseLevel,
        jlptLevel,
        search: debouncedSearch.trim(),
        kana: kanaSearch,
        kata: kataSearch,
        hinshi,
        start,
        end,
      });
      setVocabList(items);
      setTotalItems(total);
    } catch (error) {
      console.error("Gagal mengambil data:", error);
    } finally {
      setLoading(false);
    }
  };

  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    fetchData(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="w-full flex flex-col flex-1 pb-24 px-4 md:px-8">
      {/* Breadcrumb Navigation */}
      <nav className="mb-8 md:mb-12 flex flex-wrap items-center gap-2 md:gap-4 text-xs md:text-xs font-bold text-muted-foreground uppercase tracking-widest">
        <Link href="/dashboard" className="hover:text-primary transition-colors flex items-center gap-1.5 md:gap-2">
          <Home size={14} /> Beranda
        </Link>
        <span className="text-muted-foreground/20">/</span>
        <Link href="/library" className="hover:text-primary transition-colors flex items-center gap-1.5 md:gap-2">
          <Library size={14} /> Pustaka
        </Link>
        <span className="text-muted-foreground/20">/</span>
        <span className="text-primary flex items-center gap-1.5 md:gap-2">
          <Languages size={14} /> Kosakata
        </span>
      </nav>

      {/* Header Section */}
      <header className="mb-6 md:mb-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 md:gap-8 border-b border-border pb-6 md:pb-12">
          <div className="flex items-center gap-4 md:gap-6">
            <Card className="w-12 h-12 md:w-16 md:h-16 shrink-0 rounded-2xl bg-primary/10 border-primary/20 flex items-center justify-center neo-inset shadow-none">
              <LibraryBig size={24} className="text-primary md:w-8 md:h-8" />
            </Card>
            <div className="text-left">
              <h1 className="text-3xl md:text-5xl lg:text-6xl font-black text-foreground tracking-tight leading-none mb-1 md:mb-2">
                Kamus <span className="text-primary">Kosakata</span>
              </h1>
              <span className="text-[10px] md:text-xs text-muted-foreground font-medium tracking-tight uppercase tracking-widest">Kumpulan kata penting buat naklukin JLPT.</span>
            </div>
          </div>
          <div className="flex items-center justify-between md:justify-end gap-4 w-full md:w-auto">
             <div className="flex flex-col items-start md:items-end gap-0.5">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Total Koleksi</span>
                <span className="text-[10px] md:text-xs font-black text-foreground">{vocabList.length} Kata</span>
             </div>
             <PdfGenerator data={vocabList} type="vocab" level={level} />
          </div>
        </div>
      </header>

      {/* Filter & Search Section */}
      <div className="flex flex-col gap-4 md:gap-6 mb-8 md:mb-16 bg-card p-4 md:p-8 rounded-[1.5rem] md:rounded-[2rem] border border-border neo-card shadow-sm">
        <div className="relative w-full group">
          <Search className="absolute left-5 md:left-6 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors z-10" size={18} />
          <Input
            placeholder="Cari kanji atau arti..."
            className="w-full pl-12 md:pl-14 pr-6 py-5 md:py-7 h-auto bg-muted/30 border-border rounded-xl md:rounded-[1.5rem] text-xs md:text-base text-foreground placeholder:text-muted-foreground font-medium neo-inset shadow-none focus-visible:ring-primary/30"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="flex flex-col lg:flex-row gap-4">
          <div className="w-full lg:w-1/2 flex bg-muted/30 border border-border rounded-xl md:rounded-2xl p-1 md:p-2 neo-inset shadow-none overflow-x-auto no-scrollbar">
            {LEVELS.map((l) => (
                <Button
                  key={l}
                  variant="ghost"
                  onClick={() => setLevel(l)}
                  className={`flex-1 rounded-lg md:rounded-xl h-10 md:h-14 text-[10px] md:text-xs font-bold uppercase tracking-widest transition-all duration-300 ${
                    level === l
                      ? "bg-primary text-primary-foreground shadow-lg"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  }`}
                >
                  {l}
                </Button>
            ))}
          </div>
          
          <div className="w-full lg:w-1/2 relative group">
             <div className="absolute left-5 top-1/2 -translate-y-1/2 text-muted-foreground z-10 group-focus-within:text-primary transition-colors">
                <Filter size={16} />
             </div>
             <Select value={hinshi} onValueChange={setHinshi}>
                <SelectTrigger className="w-full pl-12 md:pl-14 h-10 md:h-14 py-5 md:py-6 bg-muted/30 border-border rounded-xl md:rounded-2xl text-[10px] md:text-xs font-bold uppercase tracking-widest neo-inset shadow-none text-muted-foreground focus:ring-primary/30 transition-all">
                  <SelectValue placeholder="Tipe Kata" />
                </SelectTrigger>
                <SelectContent className="bg-card border-border rounded-2xl overflow-hidden shadow-2xl p-1">
                  {HINSHI.map((h) => (
                    <SelectItem 
                      key={h.value} 
                      value={h.value}
                      className="text-[10px] md:text-xs font-bold tracking-wide py-3 md:py-4 rounded-xl focus:bg-primary focus:text-primary-foreground transition-colors cursor-pointer"
                    >
                      {h.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
          </div>

          <div className="w-full lg:w-auto flex items-center justify-between lg:justify-end gap-4 px-4 py-3 bg-muted/20 border border-border rounded-xl md:rounded-2xl neo-inset">
            <div className="flex flex-col">
              <span className="text-[10px] font-black uppercase tracking-widest text-foreground">Tampilkan Romaji</span>
              <span className="text-[8px] font-bold text-muted-foreground uppercase tracking-tight">Pemandu bacaan Latin</span>
            </div>
            <Switch 
              checked={showRomaji} 
              onCheckedChange={setShowRomaji}
              className="data-[state=checked]:bg-primary"
            />
          </div>
        </div>
      </div>

      {/* Data Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-4 md:gap-5 items-stretch">
        <AnimatePresence mode="popLayout">
          {vocabList.map((vocab, idx) => (
            <motion.div
              key={vocab._id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ delay: (idx % 12) * 0.03 }}
              className="flex h-full w-full"
            >
              <Card className="p-4 md:p-6 h-full w-full flex flex-col bg-card border border-border rounded-2xl group hover:border-primary/40 hover:bg-primary/[0.03] hover:shadow-xl transition-all duration-300 shadow-sm">
                <div className="flex justify-between items-center mb-3 md:mb-4">
                  <Badge variant="outline" className="px-2 py-0.5 md:px-2.5 md:py-1 text-[9px] md:text-xs font-bold uppercase tracking-wider rounded-lg text-muted-foreground border-border h-auto">
                    {vocab.hinshi ? (
                      vocab.hinshi === 'noun' ? 'Kata Benda' :
                      vocab.hinshi === 'i-adjective' ? 'Sifat-I' :
                      vocab.hinshi === 'na-adjective' ? 'Sifat-Na' :
                      vocab.hinshi === 'adverb' ? 'Keterangan' :
                      vocab.hinshi === 'particle' ? 'Partikel' :
                      vocab.hinshi === 'conjunction' ? 'Penghubung' :
                      vocab.hinshi === 'pronoun' ? 'Kata Ganti' :
                      vocab.hinshi === 'expression' ? 'Ungkapan' : 
                      vocab.hinshi.replace("-", " ")
                    ) : "Umum"}
                  </Badge>
                  <TTSReader text={vocab.word} minimal={true} />
                </div>

                <div className="flex-1 space-y-1.5 mb-4">
                  <div className="text-2xl md:text-3xl font-black text-foreground font-japanese block group-hover:text-primary transition-colors duration-300 leading-tight tracking-tight">
                    {splitFurigana(vocab.word, vocab.furigana || "").map((chunk, i) => (
                      chunk.furi ? (
                        <ruby key={i}>
                          {chunk.text}
                          <rt className="text-xs md:text-xs text-primary/80 font-bold tracking-widest not-italic">
                            {chunk.furi}
                          </rt>
                        </ruby>
                      ) : (
                        <span key={i}>{chunk.text}</span>
                      )
                    ))}
                  </div>
                  <AnimatePresence>
                    {showRomaji && (
                      <motion.p 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="text-xs md:text-xs font-bold text-muted-foreground/40 uppercase tracking-widest group-hover:text-muted-foreground transition-colors overflow-hidden"
                      >
                        {vocab.romaji || (vocab.furigana ? wanakana.toRomaji(vocab.furigana) : "")}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </div>

                <div className="mt-auto pt-3 border-t border-border">
                  <p className="text-xs md:text-[13px] font-medium text-muted-foreground leading-snug group-hover:text-foreground transition-colors line-clamp-2">
                    {vocab.meaning}
                  </p>
                </div>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <div className="mt-12 md:mt-20 flex flex-col items-center gap-8 w-full">
        {loading ? (
          <div className="flex items-center gap-4 text-primary text-xs md:text-sm font-bold uppercase tracking-widest animate-pulse">
            <Loader2 className="animate-spin" size={20} /> Lagi ngambil data kosakata...
          </div>
        ) : vocabList.length > 0 ? (
          <div className="flex flex-col items-center gap-6 w-full">
            <div className="flex items-center gap-1.5 md:gap-3 flex-wrap justify-center">
              {/* First Page */}
              <Button
                variant="ghost"
                disabled={currentPage === 1}
                onClick={() => handlePageChange(1)}
                className="w-10 h-10 md:w-12 md:h-12 p-0 rounded-xl bg-muted border border-border text-muted-foreground hover:text-foreground hover:border-primary/40 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-sm"
              >
                <ChevronsLeft size={16} />
              </Button>

              {/* Prev Page */}
              <Button
                variant="ghost"
                disabled={currentPage === 1}
                onClick={() => handlePageChange(currentPage - 1)}
                className="w-10 h-10 md:w-12 md:h-12 p-0 rounded-xl bg-muted border border-border text-muted-foreground hover:text-foreground hover:border-primary/40 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-sm"
              >
                <ChevronLeft size={16} />
              </Button>

              {/* Page Numbers */}
              {(() => {
                const pages = [];
                const maxVisible = 5;
                let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
                const end = Math.min(totalPages, start + maxVisible - 1);

                if (end - start + 1 < maxVisible) {
                  start = Math.max(1, end - maxVisible + 1);
                }

                for (let i = start; i <= end; i++) {
                  pages.push(
                    <Button
                      key={i}
                      variant="ghost"
                      onClick={() => handlePageChange(i)}
                      className={`w-10 h-10 md:w-12 md:h-12 p-0 rounded-xl border transition-all font-bold text-xs md:text-sm ${
                        currentPage === i
                          ? "bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/20 scale-110 z-10"
                          : "bg-muted border-border text-muted-foreground hover:text-foreground hover:border-primary/40"
                      }`}
                    >
                      {i}
                    </Button>
                  );
                }
                return pages;
              })()}

              {/* Next Page */}
              <Button
                variant="ghost"
                disabled={currentPage === totalPages}
                onClick={() => handlePageChange(currentPage + 1)}
                className="w-10 h-10 md:w-12 md:h-12 p-0 rounded-xl bg-muted border border-border text-muted-foreground hover:text-foreground hover:border-primary/40 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-sm"
              >
                <ChevronRight size={16} />
              </Button>

              {/* Last Page */}
              <Button
                variant="ghost"
                disabled={currentPage === totalPages}
                onClick={() => handlePageChange(totalPages)}
                className="w-10 h-10 md:w-12 md:h-12 p-0 rounded-xl bg-muted border border-border text-muted-foreground hover:text-foreground hover:border-primary/40 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-sm"
              >
                <ChevronsRight size={16} />
              </Button>
            </div>
            
            <div className="text-[10px] md:text-xs font-bold text-muted-foreground uppercase tracking-widest bg-muted/50 px-4 py-2 rounded-full border border-border">
              Halaman <span className="text-foreground">{currentPage}</span> dari <span className="text-foreground">{totalPages}</span>
            </div>
          </div>
        ) : !loading ? (
          <Card className="py-16 md:py-24 text-center w-full border border-dashed border-border bg-muted/20 rounded-2xl px-4">
            <div className="flex justify-center mb-5">
               <div className="w-14 h-14 rounded-full bg-primary/5 flex items-center justify-center border border-primary/10">
                  <Search size={24} className="text-muted-foreground" />
               </div>
            </div>
            <p className="text-muted-foreground font-bold text-sm md:text-base tracking-wide">
              Waduh, kosakata yang kamu cari gak ada nih. Coba kata lain yuk!
            </p>
          </Card>
        ) : null}
      </div>
    </div>
  );
}
