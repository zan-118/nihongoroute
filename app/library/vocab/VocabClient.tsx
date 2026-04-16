"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { client } from "@/sanity/lib/client";
import { Search, Home, Layers, BookOpen, Loader2 } from "lucide-react";
import TTSReader from "@/components/TTSReader";

const LEVELS = ["N5", "N4", "N3", "N2"];
const HINSHI = [
  { label: "Semua", value: "all" },
  { label: "Kata Benda (Noun)", value: "noun" },
  { label: "Kata Sifat (Adj)", value: "adjective" },
  { label: "Keterangan (Adverb)", value: "adverb" },
  { label: "Partikel", value: "particle" },
  { label: "Ungkapan", value: "expression" },
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

  // Debounce untuk Search agar tidak spam request ke Sanity
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 500);
    return () => clearTimeout(timer);
  }, [search]);

  // Reset pagination saat filter berubah
  useEffect(() => {
    setVocabList([]);
    setPage(0);
    setHasMore(true);
    fetchData(0, true);
  }, [level, hinshi, debouncedSearch]);

  const fetchData = async (currentPage: number, isReset = false) => {
    if (loading) return;
    setLoading(true);

    const start = currentPage * ITEMS_PER_PAGE;
    const end = start + ITEMS_PER_PAGE;

    // GROQ Query yang efisien dengan parameter
    const query = `*[_type == "kosakata" 
      && category != "kanji" 
      && vocabId match "VOC-" + $level + "*"
      && ($search == "" || word match $search + "*" || romaji match $search + "*" || meaning match $search + "*")
      && ($hinshi == "all" || category == $hinshi)
    ] | order(romaji asc) [$start...$end] {
      _id, vocabId, word, furigana, romaji, meaning, category
    }`;

    try {
      const data = await client.fetch(query, {
        level,
        search: debouncedSearch,
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

  return (
    <section className="w-full flex flex-col mt-2 md:mt-4">
      {/* BREADCRUMB */}
      <nav className="mb-6 flex flex-wrap items-center gap-2 text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] font-mono">
        <Link
          href="/dashboard"
          className="text-white/30 hover:text-rose-400 transition-colors flex items-center gap-1.5 p-2 rounded-lg hover:bg-white/5"
        >
          <Home size={14} /> Beranda
        </Link>
        <span className="text-white/10">/</span>
        <Link
          href="/library"
          className="text-white/40 hover:text-rose-400 transition-colors flex items-center gap-1.5 p-2 rounded-lg hover:bg-white/5"
        >
          <Layers size={14} /> Koleksi
        </Link>
        <span className="text-white/10">/</span>
        <span className="text-rose-400 bg-rose-400/10 px-3 py-1.5 rounded-lg border border-rose-400/20 flex items-center gap-1.5 shadow-[0_0_15px_rgba(244,63,94,0.15)]">
          <BookOpen size={14} /> Kosakata
        </span>
      </nav>

      <header className="mb-8 border-b border-white/5 pb-6">
        <h1 className="text-4xl md:text-6xl font-black text-white uppercase italic tracking-tighter drop-shadow-lg flex items-center gap-3 leading-none">
          <BookOpen className="text-rose-400 w-8 h-8 md:w-12 md:h-12 shrink-0" />
          <span>
            Kamus <span className="text-rose-400">Kosakata</span>
          </span>
        </h1>
      </header>

      {/* FILTER & SEARCH CONTAINER */}
      <div className="flex flex-col gap-4 mb-8 bg-cyber-surface p-4 md:p-6 rounded-[2rem] border border-white/5 shadow-inner">
        {/* Search Bar */}
        <div className="relative w-full">
          <Search
            className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500"
            size={18}
          />
          <input
            type="text"
            placeholder="Cari kanji, romaji, atau arti bahasa Indonesia..."
            className="w-full pl-12 pr-6 py-4 bg-[#0a0c10] border border-white/5 rounded-xl focus:border-rose-400 focus:ring-1 focus:ring-rose-400 outline-none text-sm text-white transition-all shadow-inner font-medium placeholder:text-white/30"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Level & Hinshi Controls */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex bg-[#0a0c10] border border-white/5 rounded-xl overflow-hidden shadow-inner">
            {LEVELS.map((l) => (
              <button
                key={l}
                onClick={() => setLevel(l)}
                className={`flex-1 px-4 py-3 text-[10px] font-black uppercase tracking-widest transition-colors ${
                  level === l
                    ? "bg-rose-400 text-black shadow-[0_0_15px_rgba(244,63,94,0.3)]"
                    : "text-slate-400 hover:bg-white/5 hover:text-white"
                }`}
              >
                {l}
              </button>
            ))}
          </div>

          <select
            value={hinshi}
            onChange={(e) => setHinshi(e.target.value)}
            className="flex-1 bg-[#0a0c10] border border-white/5 rounded-xl px-4 py-3 text-sm text-slate-300 focus:border-rose-400 outline-none shadow-inner"
          >
            {HINSHI.map((h) => (
              <option key={h.value} value={h.value}>
                {h.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* DATA GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <AnimatePresence>
          {vocabList.map((vocab) => (
            <motion.article
              key={vocab._id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-cyber-surface border border-white/5 hover:border-rose-400/30 rounded-2xl p-5 shadow-[6px_6px_15px_rgba(0,0,0,0.4)] hover:shadow-[0_0_20px_rgba(244,63,94,0.1)] transition-all group flex flex-col"
            >
              <div className="flex justify-between items-start mb-4">
                <span className="px-2.5 py-1 text-[8px] font-black uppercase tracking-widest rounded-md bg-white/5 text-slate-400 border border-white/10">
                  {vocab.category}
                </span>
                <TTSReader text={vocab.word} minimal={true} />
              </div>

              <div className="mb-4">
                <ruby className="text-3xl font-black text-white font-japanese block group-hover:text-rose-400 transition-colors">
                  {vocab.word}
                  <rt className="text-[10px] text-rose-400 font-normal tracking-widest opacity-80 pt-1">
                    {vocab.furigana}
                  </rt>
                </ruby>
                <p className="text-xs font-mono text-slate-500 uppercase tracking-tighter mt-2">
                  {vocab.romaji}
                </p>
              </div>

              <p className="mt-auto pt-4 border-t border-white/5 text-sm font-semibold text-[#c4cfde]">
                {vocab.meaning}
              </p>
            </motion.article>
          ))}
        </AnimatePresence>
      </div>

      {/* LOADER & LOAD MORE BUTTON */}
      <div className="mt-10 flex justify-center w-full">
        {loading ? (
          <div className="flex items-center gap-2 text-rose-400 text-sm font-bold uppercase tracking-widest animate-pulse">
            <Loader2 className="animate-spin" size={18} /> Memuat...
          </div>
        ) : hasMore && vocabList.length > 0 ? (
          <button
            onClick={loadMore}
            className="bg-white/5 hover:bg-rose-400 hover:text-black border border-white/10 text-white px-8 py-3 rounded-xl text-[10px] md:text-xs font-black uppercase tracking-[0.2em] transition-all shadow-[0_0_15px_rgba(255,255,255,0.05)] hover:shadow-[0_0_20px_rgba(244,63,94,0.3)]"
          >
            Muat Lebih Banyak
          </button>
        ) : vocabList.length === 0 && !loading ? (
          <div className="py-10 text-center w-full border border-dashed border-white/10 rounded-3xl">
            <p className="text-slate-500 font-mono text-sm uppercase tracking-widest">
              Tidak ada kata yang cocok.
            </p>
          </div>
        ) : null}
      </div>
    </section>
  );
}
