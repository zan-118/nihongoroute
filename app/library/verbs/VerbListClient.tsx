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
  teshimau?: string;
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
      <section className="animate-in fade-in zoom-in-95 duration-300 max-w-xl mx-auto pb-24">
        <button
          onClick={() => setIsFlashcardMode(false)}
          className="mb-8 flex items-center gap-2 text-white/50 hover:text-white transition-colors text-xs font-bold uppercase tracking-widest bg-white/5 px-4 py-3 rounded-xl border border-white/5 w-full sm:w-auto justify-center"
        >
          ← Kembali ke Kamus
        </button>
        <FlashcardMaster cards={flashcardData} type="vocab" />
      </section>
    );
  }

  return (
    <section className="pb-24">
      {/* BREADCRUMB */}
      <nav className="mb-6 flex flex-wrap items-center gap-2 text-[9px] md:text-xs font-black uppercase tracking-[0.2em] font-mono">
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
        <h1 className="text-4xl md:text-6xl font-black text-white uppercase italic tracking-tighter drop-shadow-lg flex items-center gap-3">
          <Database className="text-cyan-400 w-8 h-8 md:w-12 md:h-12" /> Matriks{" "}
          <span className="text-cyan-400">Verba</span>
        </h1>
      </header>

      {/* ✨ PERBAIKAN 1: Filter & Search Lebih Ramping untuk Mobile */}
      <div className="flex flex-col gap-4 mb-8">
        <div className="relative w-full">
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
            size={18}
          />
          <input
            type="text"
            placeholder="Cari arti, romaji, atau kana..."
            className="w-full pl-12 pr-4 py-4 bg-cyber-surface border border-white/10 rounded-2xl focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 outline-none text-sm text-white transition-all shadow-inner font-mono"
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
                className={`px-4 py-2.5 rounded-xl text-[10px] sm:text-xs font-black uppercase tracking-widest transition-all border flex-1 sm:flex-none text-center ${
                  isActive
                    ? "bg-cyan-500/20 text-cyan-400 border-cyan-500/50 shadow-[0_0_15px_rgba(34,211,238,0.2)]"
                    : "bg-cyber-surface text-slate-400 border-white/5 hover:bg-white/5 hover:text-white"
                }`}
              >
                {g === "Semua" ? "Semua" : `Gol. ${g}`}
              </button>
            );
          })}
        </div>
      </div>

      {/* ✨ PERBAIKAN 2: Banner Aksi Pintar yang tidak berdesakan */}
      {filteredVerbs.length > 0 && (
        <div className="mb-6 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 bg-cyan-400/5 border border-cyan-400/20 p-4 rounded-2xl">
          <p className="text-slate-300 text-xs sm:text-sm font-medium text-center sm:text-left">
            Menampilkan{" "}
            <strong className="text-cyan-400">{filteredVerbs.length}</strong>{" "}
            kata kerja
          </p>
          <button
            onClick={() => setIsFlashcardMode(true)}
            className="flex items-center justify-center gap-2 bg-cyan-400 text-black w-full sm:w-auto px-6 py-3 rounded-xl font-black uppercase text-[10px] sm:text-xs tracking-widest hover:scale-105 transition-transform shadow-[0_0_15px_rgba(34,211,238,0.3)]"
          >
            <BrainCircuit size={16} /> Latih Daftar Ini
          </button>
        </div>
      )}

      {/* ✨ PERBAIKAN 3: Desain Kartu Mobile First yang Elegan */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
        <AnimatePresence>
          {filteredVerbs.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="col-span-full py-20 text-center border-2 border-dashed border-white/10 rounded-3xl"
            >
              <p className="text-slate-500 font-mono text-sm uppercase tracking-widest">
                Kosakata tidak ditemukan.
              </p>
            </motion.div>
          ) : (
            filteredVerbs.map((verb) => {
              const isExpanded = expandedId === verb._id;

              // Tentukan warna berdasarkan golongan
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
                      : "border-white/5 hover:border-white/20 shadow-lg"
                  }`}
                >
                  {/* Bagian Atas Kartu (Bisa Diklik untuk Expand) */}
                  <div
                    onClick={() => setExpandedId(isExpanded ? null : verb._id)}
                    className="p-5 sm:p-6 flex flex-col gap-4 cursor-pointer group"
                  >
                    {/* Header Kecil: Badge Golongan & Aksi */}
                    <div className="flex justify-between items-center">
                      <span
                        className={`px-3 py-1 text-[9px] font-black uppercase tracking-widest rounded-full border ${badgeColor}`}
                      >
                        Golongan {verb.group}
                      </span>
                      <div className="flex items-center gap-3">
                        <TTSReader text={verb.jisho} minimal={true} />
                        <div
                          className={`w-8 h-8 rounded-full border flex items-center justify-center transition-all ${
                            isExpanded
                              ? "bg-cyan-400/20 border-cyan-400/50 text-cyan-400 rotate-180"
                              : "bg-white/5 border-white/10 text-slate-400 group-hover:text-white"
                          }`}
                        >
                          <ChevronDown size={16} />
                        </div>
                      </div>
                    </div>

                    {/* Konten Utama: Kanji & Arti */}
                    <div className="mt-2">
                      <ruby className="text-4xl sm:text-5xl font-black text-white font-japanese mb-1 block group-hover:text-cyan-400 transition-colors drop-shadow-md">
                        {verb.jisho}
                        <rt className="text-[11px] sm:text-xs text-cyan-400 font-normal tracking-widest opacity-90">
                          {verb.furigana}
                        </rt>
                      </ruby>
                      <p className="inline-block mt-3 px-3 py-1.5 bg-black/30 border border-white/5 rounded-lg text-xs sm:text-sm font-bold text-slate-300">
                        {verb.meaning}
                      </p>
                    </div>
                  </div>

                  {/* Bagian Detail Ekstra (Expanded) */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="bg-[#0a0c10]/50 border-t border-white/5"
                      >
                        <div className="p-5 sm:p-6 grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                          <ConjugationCard
                            label="Masu (Sopan)"
                            value={verb.masu}
                            color="text-white"
                          />
                          <ConjugationCard
                            label="Te (Sambung)"
                            value={verb.te}
                            color="text-yellow-400"
                          />
                          <ConjugationCard
                            label="Nai (Negatif)"
                            value={verb.nai}
                            color="text-red-400"
                          />
                          <ConjugationCard
                            label="Ta (Lampau)"
                            value={verb.ta}
                            color="text-blue-400"
                          />
                          <ConjugationCard
                            label="Te-iru (Sedang)"
                            value={verb.teiru}
                            color="text-emerald-400"
                          />
                          <ConjugationCard
                            label="Tai (Ingin)"
                            value={verb.tai}
                            color="text-pink-400"
                          />
                          <ConjugationCard
                            label="Kanou (Bisa)"
                            value={verb.kanou}
                            color="text-cyan-400"
                          />
                          <ConjugationCard
                            label="Meirei (Perintah)"
                            value={verb.meirei}
                            color="text-orange-400"
                          />
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

// Sub-komponen Kotak Konjugasi yang lebih ringkas
function ConjugationCard({
  label,
  value,
  color,
}: {
  label: string;
  value?: string;
  color?: string;
}) {
  if (!value) return null;
  return (
    <div className="bg-cyber-surface p-3 rounded-xl border border-white/5 shadow-inner flex flex-col justify-center">
      <span className="block text-[8px] sm:text-[9px] font-black uppercase tracking-widest text-slate-500 mb-1">
        {label}
      </span>
      <span
        className={`text-sm sm:text-base font-bold font-japanese tracking-wide ${color || "text-white"}`}
      >
        {value}
      </span>
    </div>
  );
}
