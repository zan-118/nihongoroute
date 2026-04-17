"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import TTSReader from "@/components/TTSReader";
import FlashcardMaster from "@/components/FlashcardMaster";
import {
  Search,
  BrainCircuit,
  Home,
  Layers,
  Database,
  ChevronDown,
} from "lucide-react";

export interface VerbData {
  _id: string;
  group: number;
  jisho: string;
  meaning: string;
  masu: string;
  furigana?: string;
  te?: string;
  nai?: string;
  ta?: string;
  teiru?: string;
  tai?: string;
  nakereba?: string;
  kanou?: string;
  shieki?: string;
  ukemi?: string;
  katei?: string;
  ikou?: string;
  meirei?: string;
}

export default function VerbListClient({
  initialVerbs,
}: {
  initialVerbs: VerbData[];
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeGroup, setActiveGroup] = useState<number | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [isFlashcardMode, setIsFlashcardMode] = useState(false);

  const filteredVerbs = initialVerbs.filter((verb) => {
    const matchesSearch =
      verb.jisho.toLowerCase().includes(searchTerm.toLowerCase()) ||
      verb.meaning.toLowerCase().includes(searchTerm.toLowerCase()) ||
      verb.masu.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesGroup = activeGroup ? verb.group === activeGroup : true;
    return matchesSearch && matchesGroup;
  });

  if (isFlashcardMode && filteredVerbs.length > 0) {
    const flashcardData = filteredVerbs.map((verb) => ({
      _id: verb._id,
      word: verb.jisho,
      meaning: verb.meaning,
      furigana: verb.furigana,
      romaji: verb.masu,
      level: { code: "library" },
    }));

    return (
      <section className="animate-in fade-in zoom-in-95 duration-300 max-w-2xl mx-auto w-full mt-4 md:mt-8">
        <button
          onClick={() => setIsFlashcardMode(false)}
          className="mb-8 flex items-center justify-center gap-2 text-white/50 hover:text-white transition-colors text-[10px] md:text-xs font-bold uppercase tracking-widest bg-white/5 hover:bg-white/10 px-6 py-3 rounded-xl border border-white/10 w-full sm:w-auto mx-auto sm:mx-0"
        >
          ← Kembali ke Kamus
        </button>
        <FlashcardMaster cards={flashcardData} type="vocab" />
      </section>
    );
  }

  return (
    <section className="w-full flex flex-col mt-2 md:mt-4">
      {/* BREADCRUMB */}
      <nav className="mb-6 flex flex-wrap items-center gap-2 text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] font-mono">
        <Link
          href="/dashboard"
          className="text-white/30 hover:text-cyan-400 transition-colors flex items-center gap-1.5 p-2 rounded-lg hover:bg-white/5"
        >
          <Home size={14} /> Beranda
        </Link>
        <span className="text-white/10">/</span>
        <Link
          href="/library"
          className="text-white/40 hover:text-cyan-400 transition-colors flex items-center gap-1.5 p-2 rounded-lg hover:bg-white/5"
        >
          <Layers size={14} /> Koleksi
        </Link>
        <span className="text-white/10">/</span>
        <span className="text-cyan-400 bg-cyan-400/10 px-3 py-1.5 rounded-lg border border-cyan-400/20 flex items-center gap-1.5 shadow-[0_0_15px_rgba(34,211,238,0.15)]">
          <Database size={14} /> Kata Kerja
        </span>
      </nav>

      <header className="mb-8 border-b border-white/5 pb-6">
        <h1 className="text-4xl md:text-6xl font-black text-white uppercase italic tracking-tighter drop-shadow-lg flex items-center gap-3 leading-none">
          <Database className="text-cyan-400 w-8 h-8 md:w-12 md:h-12 shrink-0" />
          <span>
            Matriks <span className="text-cyan-400">Verba</span>
          </span>
        </h1>
      </header>

      {/* FILTER & SEARCH */}
      <div className="flex flex-col gap-4 mb-8 bg-cyber-surface p-4 md:p-6 rounded-[2rem] border border-white/5 shadow-inner">
        <div className="relative w-full">
          <Search
            className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500"
            size={18}
          />
          <input
            type="text"
            placeholder="Cari arti, bentuk masu, atau huruf jepang..."
            className="w-full pl-12 pr-6 py-4 bg-[#0a0c10] border border-white/5 rounded-xl focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 outline-none text-sm text-white transition-all shadow-inner font-medium placeholder:text-white/30"
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {["Semua", 1, 2, 3].map((g) => {
            const isActive =
              g === "Semua" ? activeGroup === null : activeGroup === g;
            return (
              <button
                key={g}
                onClick={() =>
                  setActiveGroup(g === "Semua" ? null : (g as number))
                }
                className={`px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl text-[9px] sm:text-[10px] font-black uppercase tracking-widest transition-all border flex-1 sm:flex-none text-center ${
                  isActive
                    ? "bg-cyan-400/10 text-cyan-400 border-cyan-400/30 shadow-[0_0_15px_rgba(34,211,238,0.2)]"
                    : "bg-[#0a0c10] text-slate-400 border-white/5 hover:bg-white/5 hover:text-white shadow-inner"
                }`}
              >
                {g === "Semua" ? "Semua Golongan" : `Golongan ${g}`}
              </button>
            );
          })}
        </div>
      </div>

      {/* BANNER AKSI */}
      {filteredVerbs.length > 0 && (
        <div className="mb-8 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 bg-gradient-to-r from-cyan-900/20 to-transparent border-l-4 border-cyan-400 p-4 md:p-5 rounded-r-2xl border-y border-r border-white/5">
          <p className="text-slate-300 text-xs sm:text-sm font-medium text-center sm:text-left">
            Menampilkan{" "}
            <strong className="text-cyan-400 font-bold">
              {filteredVerbs.length}
            </strong>{" "}
            kata kerja.
          </p>
          <button
            onClick={() => setIsFlashcardMode(true)}
            className="flex items-center justify-center gap-2 bg-cyan-400 text-black w-full sm:w-auto px-6 py-3 rounded-xl font-black uppercase text-[10px] sm:text-xs tracking-widest hover:scale-105 active:scale-95 transition-all shadow-[0_0_15px_rgba(34,211,238,0.3)]"
          >
            <BrainCircuit size={16} /> Latih Flashcard
          </button>
        </div>
      )}

      {/* DATA GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        <AnimatePresence>
          {filteredVerbs.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="col-span-full py-20 text-center border border-dashed border-white/10 rounded-[3rem] bg-cyber-surface shadow-inner"
            >
              <div className="text-5xl mb-4 opacity-50">🕵️</div>
              <p className="text-slate-400 font-mono text-sm uppercase tracking-widest">
                Tidak ada kata kerja yang cocok.
              </p>
            </motion.div>
          ) : (
            filteredVerbs.map((verb) => {
              const isExpanded = expandedId === verb._id;
              const badgeColor =
                verb.group === 1
                  ? "text-blue-400 bg-blue-500/10 border-blue-500/30"
                  : verb.group === 2
                    ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/30"
                    : "text-purple-400 bg-purple-500/10 border-purple-500/30";

              return (
                <motion.article
                  key={verb._id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className={`bg-cyber-surface border rounded-[2rem] overflow-hidden transition-all duration-300 ${
                    isExpanded
                      ? "border-cyan-400/50 shadow-[0_0_30px_rgba(34,211,238,0.1)]"
                      : "border-white/5 hover:border-white/20 shadow-[6px_6px_15px_rgba(0,0,0,0.4)]"
                  }`}
                >
                  {/* HEADER KARTU (KLIK UNTUK BUKA) */}
                  <div
                    onClick={() => setExpandedId(isExpanded ? null : verb._id)}
                    className="p-5 sm:p-6 flex flex-col gap-4 cursor-pointer group"
                  >
                    <div className="flex justify-between items-start">
                      <span
                        className={`px-3 py-1.5 text-[9px] font-black uppercase tracking-widest rounded-lg border shadow-inner ${badgeColor}`}
                      >
                        Golongan {verb.group}
                      </span>
                      <div className="flex items-center gap-3">
                        <TTSReader text={verb.jisho} minimal={true} />
                        <div
                          className={`w-8 h-8 rounded-full border flex items-center justify-center transition-all ${
                            isExpanded
                              ? "bg-cyan-400/20 border-cyan-400/50 text-cyan-400 rotate-180"
                              : "bg-white/5 border-white/10 text-slate-400 group-hover:text-white group-hover:bg-white/10"
                          }`}
                        >
                          <ChevronDown size={16} />
                        </div>
                      </div>
                    </div>

                    <div className="mt-2">
                      <ruby className="text-3xl sm:text-4xl md:text-5xl font-black text-white font-japanese block group-hover:text-cyan-400 transition-colors drop-shadow-md leading-none">
                        {verb.jisho}
                        <rt className="text-[10px] sm:text-xs text-cyan-400 font-normal tracking-widest opacity-80 pt-1">
                          {verb.furigana}
                        </rt>
                      </ruby>
                      <p className="inline-block mt-4 px-3.5 py-1.5 bg-[#0a0c10] border border-white/5 rounded-xl text-xs sm:text-sm font-bold text-[#c4cfde] shadow-inner">
                        {verb.meaning}
                      </p>
                    </div>
                  </div>

                  {/* KONTEN EXPANDED (DETAIL KONJUGASI) */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="bg-black/40 border-t border-white/5 overflow-hidden"
                      >
                        <div className="p-5 sm:p-6 flex flex-col gap-6">
                          {/* GRUP DASAR */}
                          <div className="flex flex-col gap-3">
                            <h4 className="text-[9px] font-black text-cyan-400 uppercase tracking-[0.2em] flex items-center gap-2">
                              <div className="h-[1px] flex-1 bg-gradient-to-r from-cyan-400/50 to-transparent" />
                              Bentuk Dasar
                              <div className="h-[1px] flex-1 bg-gradient-to-l from-cyan-400/50 to-transparent" />
                            </h4>
                            <div className="grid grid-cols-2 gap-2 sm:gap-3">
                              <ConjugationCard
                                label="Masu (Sopan)"
                                value={verb.masu}
                              />
                              <ConjugationCard
                                label="Te (Sambung)"
                                value={verb.te}
                              />
                              <ConjugationCard
                                label="Nai (Negatif)"
                                value={verb.nai}
                              />
                              <ConjugationCard
                                label="Ta (Lampau)"
                                value={verb.ta}
                              />
                            </div>
                          </div>

                          {/* GRUP LANJUTAN */}
                          <div className="flex flex-col gap-3">
                            <h4 className="text-[9px] font-black text-cyan-400 uppercase tracking-[0.2em] flex items-center gap-2">
                              <div className="h-[1px] flex-1 bg-gradient-to-r from-cyan-400/50 to-transparent" />
                              Bentuk Lanjutan
                              <div className="h-[1px] flex-1 bg-gradient-to-l from-cyan-400/50 to-transparent" />
                            </h4>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3">
                              <ConjugationCard
                                label="Te-iru (Sedang)"
                                value={verb.teiru}
                              />
                              <ConjugationCard
                                label="Kanou (Bisa)"
                                value={verb.kanou}
                              />
                              <ConjugationCard
                                label="Ukemi (Pasif)"
                                value={verb.ukemi}
                              />
                              <ConjugationCard
                                label="Shieki (Kausatif)"
                                value={verb.shieki}
                              />
                            </div>
                          </div>

                          {/* GRUP EKSPRESI */}
                          <div className="flex flex-col gap-3">
                            <h4 className="text-[9px] font-black text-cyan-400 uppercase tracking-[0.2em] flex items-center gap-2">
                              <div className="h-[1px] flex-1 bg-gradient-to-r from-cyan-400/50 to-transparent" />
                              Ekspresi & Kondisi
                              <div className="h-[1px] flex-1 bg-gradient-to-l from-cyan-400/50 to-transparent" />
                            </h4>
                            <div className="grid grid-cols-2 md:grid-cols-5 gap-2 sm:gap-3">
                              <ConjugationCard
                                label="Tai (Ingin)"
                                value={verb.tai}
                              />

                              <ConjugationCard
                                label="Katei (Andaikan)"
                                value={verb.katei}
                              />
                              <ConjugationCard
                                label="Ikou (Ajakan)"
                                value={verb.ikou}
                              />
                              <ConjugationCard
                                label="Meirei (Perintah)"
                                value={verb.meirei}
                              />
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.article>
              );
            })
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}

// Sub-komponen yang telah diperbarui agar lebih estetik dan mentoleransi data kosong
function ConjugationCard({ label, value }: { label: string; value?: string }) {
  if (!value || value === "-") return null;
  return (
    <div className="bg-[#0a0c10] p-3 sm:p-4 rounded-xl border border-white/5 shadow-inner flex flex-col justify-center gap-1 hover:border-cyan-400/30 transition-colors group/card">
      <span className="block text-[8px] sm:text-[9px] font-black uppercase tracking-[0.1em] text-slate-500 group-hover/card:text-cyan-400/70 transition-colors">
        {label}
      </span>
      <span className="text-sm sm:text-base font-bold font-japanese tracking-wide text-white group-hover/card:text-cyan-50">
        {value}
      </span>
    </div>
  );
}
