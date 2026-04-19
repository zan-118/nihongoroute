/**
 * LOKASI FILE: app/(main)/library/verbs/VerbListClient.tsx
 * KONSEP: Mobile-First Neumorphic (Matriks Konjugasi Kata Kerja)
 */

"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import TTSReader from "@/components/TTSReader";
import FlashcardMaster from "@/components/FlashcardMaster";
import {
  Search,
  Home,
  Library,
  ChevronDown,
  Activity,
  ArrowLeft,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

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
      <div className="animate-in fade-in zoom-in-95 duration-500 max-w-2xl mx-auto w-full mt-10 px-4 flex-1 pb-24">
        <Button
          variant="ghost"
          onClick={() => setIsFlashcardMode(false)}
          className="mb-8 flex items-center justify-center gap-3 px-8 py-6 rounded-2xl text-[10px] md:text-xs font-bold uppercase tracking-widest w-full sm:w-auto mx-auto sm:mx-0 neo-card bg-black/40 border-white/5 hover:bg-white hover:text-black transition-all"
        >
          <ArrowLeft size={18} /> KEMBALI KE MATRIKS
        </Button>
        <FlashcardMaster cards={flashcardData} />
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col flex-1 pb-24 px-4 md:px-8 lg:px-12">
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
          <RefreshCw size={14} /> Kata Kerja
        </span>
      </nav>

      <header className="mb-10 md:mb-16">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 md:gap-10 border-b border-white/5 pb-8 md:pb-12">
          <div className="flex items-center gap-5 md:gap-6">
            <Card className="w-14 h-14 md:w-16 md:h-16 shrink-0 rounded-2xl bg-cyber-neon/10 border-cyber-neon/20 flex items-center justify-center neo-inset shadow-none">
              <RefreshCw size={28} className="text-cyber-neon md:w-8 md:h-8" />
            </Card>
            <div className="text-left">
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-black text-white tracking-tight leading-none mb-2">
                Matriks <span className="text-cyber-neon">Kata Kerja</span>
              </h1>
              <span className="text-xs md:text-sm text-slate-400 font-medium tracking-wide">Pusat pelatihan konjugasi interaktif.</span>
            </div>
          </div>
          <div className="flex items-center justify-between md:justify-end gap-6 w-full md:w-auto">
             <div className="flex flex-col items-start md:items-end gap-1">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Total Data</span>
                <span className="text-xs md:text-sm font-black text-white">{filteredVerbs.length} Kata</span>
             </div>
             <Button
               onClick={() => setIsFlashcardMode(true)}
               className="h-auto py-4 px-6 md:py-5 md:px-8 rounded-xl md:rounded-2xl bg-cyber-neon hover:bg-white text-black font-bold uppercase tracking-widest transition-all shadow-[0_0_20px_rgba(0,238,255,0.3)] border-none text-xs md:text-sm"
             >
               Mulai Latihan
             </Button>
          </div>
        </div>
      </header>

      <div className="mb-10 md:mb-16 bg-cyber-surface p-6 md:p-10 rounded-[2rem] md:rounded-[3rem] border border-white/5 neo-card shadow-none">
        <div className="flex flex-col gap-6 md:gap-8">
           <div className="relative group w-full">
            <Search
              className="absolute left-5 md:left-7 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-cyber-neon transition-colors z-10"
              size={20}
            />
            <Input
              placeholder="Cari kata kerja atau arti..."
              className="w-full pl-12 md:pl-16 pr-6 md:pr-8 py-6 md:py-8 h-auto bg-black/40 border-white/5 rounded-2xl md:rounded-[2rem] text-sm md:text-base text-white placeholder:text-slate-600 font-medium neo-inset shadow-none focus-visible:ring-cyber-neon/30"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex flex-wrap gap-2 md:gap-3">
             {[null, 1, 2, 3].map((g) => (
               <Button
                 key={g === null ? "all" : g}
                 variant="ghost"
                 onClick={() => setActiveGroup(g)}
                 className={`px-4 py-2 md:px-6 md:py-3 h-auto rounded-xl text-[10px] md:text-xs font-bold uppercase tracking-widest transition-all border ${
                   activeGroup === g 
                     ? "bg-cyber-neon text-black border-none shadow-[0_0_15px_rgba(0,238,255,0.4)]" 
                     : "bg-black/20 border-white/5 text-slate-400 hover:border-cyber-neon/40 hover:text-white"
                 }`}
               >
                 {g === null ? "Semua Golongan" : `Golongan ${g}`}
               </Button>
             ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-10 items-start">
        <AnimatePresence mode="popLayout">
          {filteredVerbs.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="col-span-full py-24 md:py-32 lg:py-48 text-center border border-dashed border-white/10 rounded-[3rem] md:rounded-[4rem] bg-black/20 neo-inset shadow-none px-4"
            >
              <div className="flex justify-center mb-6 md:mb-10">
                 <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-cyber-neon/5 flex items-center justify-center border border-cyber-neon/10">
                    <Search size={32} className="text-slate-500 md:w-10 md:h-10" />
                 </div>
              </div>
              <p className="text-slate-400 font-bold text-xs md:text-sm uppercase tracking-widest">
                Kata kerja tidak ditemukan
              </p>
            </motion.div>
          ) : (
            filteredVerbs.map((verb, idx) => {
              const isExpanded = expandedId === verb._id;
              const badgeColor =
                verb.group === 1
                  ? "text-blue-400 bg-blue-500/10 border-blue-500/20"
                  : verb.group === 2
                    ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/20"
                    : "text-purple-400 bg-purple-500/10 border-purple-500/20";
              return (
                <motion.div
                  key={verb._id}
                  layout
                  initial={{ opacity: 0, scale: 0.95, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: (idx % 10) * 0.05 }}
                  className={`${isExpanded ? "col-span-full" : "h-full"}`}
                >
                  <Card
                    className={`bg-cyber-surface border overflow-hidden transition-all duration-500 rounded-[2.5rem] md:rounded-[3.5rem] neo-card shadow-none ${isExpanded ? "border-cyber-neon/50 shadow-[0_0_40px_rgba(0,238,255,0.15)]" : "border-white/5 hover:border-cyber-neon/40"}`}
                  >
                    <div
                      onClick={() => setExpandedId(isExpanded ? null : verb._id)}
                      className="p-8 md:p-10 lg:p-12 flex flex-col gap-6 md:gap-8 cursor-pointer group relative"
                    >
                      <div className="flex justify-between items-start relative z-10">
                        <Badge
                          variant="outline"
                          className={`px-3 py-1.5 md:px-4 md:py-2 text-[10px] md:text-xs font-bold uppercase tracking-widest rounded-xl border h-auto neo-inset ${badgeColor}`}
                        >
                          GOLONGAN {verb.group}
                        </Badge>
                        <div className="flex items-center gap-4 md:gap-6">
                          <TTSReader text={verb.jisho} minimal={true} />
                          <div
                            className={`w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl border flex items-center justify-center transition-all duration-500 neo-inset shadow-none ${isExpanded ? "bg-cyber-neon border-none text-black rotate-180" : "bg-black/40 border-white/10 text-slate-500 group-hover:text-cyber-neon group-hover:border-cyber-neon/40"}`}
                          >
                            <ChevronDown size={20} className={isExpanded ? "" : "group-hover:translate-y-1 transition-transform md:w-6 md:h-6"} />
                          </div>
                        </div>
                      </div>
                      
                      <div className="relative z-10 flex-1">
                        <ruby className="text-4xl md:text-5xl lg:text-7xl font-black text-white font-japanese block group-hover:text-cyber-neon transition-colors duration-500 drop-shadow-xl leading-tight">
                          {verb.jisho}
                          <rt className="text-xs md:text-sm lg:text-base text-cyber-neon font-bold tracking-widest opacity-80 pt-2 md:pt-4">
                            {verb.furigana}
                          </rt>
                        </ruby>
                        <div className="mt-6 md:mt-10 flex flex-wrap items-center gap-3 md:gap-4">
                           <div className="h-0.5 w-4 md:w-6 bg-cyber-neon/40 rounded-full" />
                           <p className="text-sm md:text-base lg:text-xl font-bold text-slate-400 leading-tight group-hover:text-white transition-colors duration-500 line-clamp-2">
                             {verb.meaning}
                           </p>
                        </div>
                      </div>

                      {/* Ghost Background Number */}
                      <div className="absolute -bottom-6 -right-6 md:-bottom-10 md:-right-10 text-[10rem] md:text-[12rem] font-black text-white/[0.02] pointer-events-none group-hover:text-cyber-neon/[0.04] transition-all duration-700 rotate-6">
                         {idx + 1}
                      </div>
                    </div>

                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.4, ease: "circOut" }}
                          className="border-t border-white/10 bg-black/20"
                        >
                          <div className="p-6 md:p-10 lg:p-14">
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 md:gap-6 lg:gap-8">
                              <ConjugationItem label="Bentuk Masu" value={verb.masu} />
                              <ConjugationItem label="Bentuk Te" value={verb.te} />
                              <ConjugationItem label="Bentuk Nai" value={verb.nai} />
                              <ConjugationItem label="Bentuk Ta" value={verb.ta} />
                              <ConjugationItem label="Potensial (Bisa)" value={verb.kanou} />
                              <ConjugationItem label="Sedang/Telah" value={verb.teiru} />
                              <ConjugationItem label="Ingin (Tai)" value={verb.tai} />
                              <ConjugationItem label="Harus (Nakereba)" value={verb.nakereba} />
                              <ConjugationItem label="Kausatif (Menyuruh)" value={verb.shieki} />
                              <ConjugationItem label="Pasif (Di-)" value={verb.ukemi} />
                              <ConjugationItem label="Kondisional (Jika)" value={verb.katei} />
                              <ConjugationItem label="Volisional (Mari)" value={verb.ikou} />
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </Card>
                </motion.div>
              );
            })
          )}
        </AnimatePresence>
      </div>

      <footer className="mt-16 md:mt-24 pt-10 md:pt-16 border-t border-white/10 flex flex-col sm:flex-row justify-between items-center gap-6">
         <div className="flex items-center gap-3">
            <Activity size={16} className="text-cyber-neon animate-pulse" />
            <span className="text-slate-500 font-bold text-[10px] md:text-xs uppercase tracking-widest">Sistem Konjugasi Aktif</span>
         </div>
         <Link href="/library" className="w-full sm:w-auto">
            <Button variant="ghost" className="w-full px-8 py-6 md:px-10 md:py-7 h-auto text-[10px] md:text-xs font-bold uppercase tracking-widest rounded-2xl bg-black/40 border-white/5 neo-card shadow-none hover:bg-cyber-neon hover:text-black transition-all gap-3 group">
               <ArrowLeft size={16} className="group-hover:-translate-x-1.5 transition-transform duration-300" /> KEMBALI KE PUSTAKA
            </Button>
         </Link>
      </footer>
    </div>
  );
}

function ConjugationItem({ label, value }: { label: string; value?: string }) {
  return (
    <div className="flex flex-col gap-2 md:gap-4">
      <span className="text-[9px] md:text-[10px] font-bold text-cyber-neon/80 uppercase tracking-widest leading-tight min-h-[2.5em] md:min-h-0">
        {label}
      </span>
      <Card className="p-4 md:p-6 lg:p-8 rounded-xl md:rounded-2xl bg-black/40 border border-white/5 neo-inset shadow-none hover:border-cyber-neon/40 transition-all duration-300 group/item flex-1 flex items-center justify-center min-h-[4.5rem]">
        <p className="text-base md:text-xl lg:text-2xl font-japanese font-black text-white text-center leading-none group-hover/item:text-cyber-neon transition-colors">
          {value || "—"}
        </p>
      </Card>
    </div>
  );
}
