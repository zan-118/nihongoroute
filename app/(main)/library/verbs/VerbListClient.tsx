/**
 * LOKASI FILE: app/(main)/library/verbs/VerbListClient.tsx
 * KONSEP: Mobile-First Neumorphic (Matriks Konjugasi Kata Kerja)
 * POLA: Card Grid + Popup Modal untuk detail konjugasi
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
  Activity,
  ArrowLeft,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  X,
  Sparkles,
  Layers,
  Volume2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

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
  
  tai?: string;
  
  kanou?: string;
  shieki?: string;
  ukemi?: string;
  katei?: string;
  ikou?: string;
  meirei?: string;
}

const ITEMS_PER_PAGE = 30;

export default function VerbListClient({
  initialVerbs,
}: {
  initialVerbs: VerbData[];
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeGroup, setActiveGroup] = useState<number | null>(null);
  const [selectedVerb, setSelectedVerb] = useState<VerbData | null>(null);
  const [isFlashcardMode, setIsFlashcardMode] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const filteredVerbs = initialVerbs.filter((verb) => {
    const matchesSearch =
      verb.jisho.toLowerCase().includes(searchTerm.toLowerCase()) ||
      verb.meaning.toLowerCase().includes(searchTerm.toLowerCase()) ||
      verb.masu.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesGroup = activeGroup ? verb.group === activeGroup : true;
    return matchesSearch && matchesGroup;
  });

  // Pagination calculations
  const totalPages = Math.ceil(filteredVerbs.length / ITEMS_PER_PAGE);
  const startIdx = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedVerbs = filteredVerbs.slice(startIdx, startIdx + ITEMS_PER_PAGE);

  // Reset page when filters change
  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };
  const handleGroupChange = (group: number | null) => {
    setActiveGroup(group);
    setCurrentPage(1);
  };

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
          <ArrowLeft size={18} /> Kembali ke Daftar
        </Button>
        <FlashcardMaster cards={flashcardData} />
      </div>
    );
  }

  // Badge color by group
  const getBadgeColor = (group: number) => {
    if (group === 1) return "text-blue-400 bg-blue-500/10 border-blue-500/20";
    if (group === 2) return "text-emerald-400 bg-emerald-500/10 border-emerald-500/20";
    return "text-purple-400 bg-purple-500/10 border-purple-500/20";
  };

  // Group color for modal accent
  const getGroupAccent = (group: number) => {
    if (group === 1) return { ring: "ring-blue-500/30", glow: "shadow-[0_0_60px_rgba(59,130,246,0.15)]", accent: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/20" };
    if (group === 2) return { ring: "ring-emerald-500/30", glow: "shadow-[0_0_60px_rgba(16,185,129,0.15)]", accent: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20" };
    return { ring: "ring-purple-500/30", glow: "shadow-[0_0_60px_rgba(168,85,247,0.15)]", accent: "text-purple-400", bg: "bg-purple-500/10", border: "border-purple-500/20" };
  };

  // Conjugation sections for the modal
  const getConjugationSections = (verb: VerbData) => [
    {
      title: "Bentuk Dasar",
      icon: <Sparkles size={14} />,
      items: [
        { label: "Bentuk Masu (Sopan)", value: verb.masu },
        { label: "Bentuk Te (Sambung)", value: verb.te },
        { label: "Bentuk Nai (Negatif)", value: verb.nai },
        { label: "Bentuk Ta (Lampau)", value: verb.ta },
      ],
    },
    {
      title: "Bentuk Ekspresif",
      icon: <Volume2 size={14} />,
      items: [
        { label: "Ingin (Tai)", value: verb.tai },
        { label: "Potensial (Bisa)", value: verb.kanou },
        { label: "Volisional (Mari)", value: verb.ikou },
        { label: "Kondisional (Jika)", value: verb.katei },
      ],
    },
    {
      title: "Bentuk Lanjut",
      icon: <Layers size={14} />,
      items: [
        { label: "Kausatif (Menyuruh)", value: verb.shieki },
        { label: "Pasif (Di-)", value: verb.ukemi },
        { label: "Perintah", value: verb.meirei },
      ],
    },
  ];

  // ======================
  // RENDER
  // ======================
  return (
    <div className="w-full flex flex-col flex-1 pb-24 px-4 md:px-8 lg:px-12">
      <nav className="mb-8 md:mb-12 flex flex-wrap items-center gap-2 md:gap-4 text-[9px] md:text-[10px] font-bold text-slate-500 uppercase tracking-widest">
        <Link href="/dashboard" className="hover:text-cyber-neon transition-colors flex items-center gap-1.5 md:gap-2">
          <Home size={14} /> Beranda
        </Link>
        <span className="text-white/10">/</span>
        <Link href="/library" className="hover:text-cyber-neon transition-colors flex items-center gap-1.5 md:gap-2">
          <Library size={14} /> Pustaka
        </Link>
        <span className="text-white/10">/</span>
        <span className="text-cyber-neon flex items-center gap-1.5 md:gap-2">
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
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white tracking-tight leading-none mb-2">
                Kamus <span className="text-cyber-neon">Kata Kerja</span>
              </h1>
              <span className="text-[10px] md:text-xs text-slate-500 font-medium tracking-tight uppercase tracking-widest">Ubah bentuk kata kerja jadi lebih gampang.</span>
            </div>
          </div>
          <div className="flex items-center justify-between md:justify-end gap-6 w-full md:w-auto">
             <div className="flex flex-col items-start md:items-end gap-1">
                <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Jumlah Kata</span>
                <span className="text-[10px] md:text-xs font-black text-white">{filteredVerbs.length} Kata</span>
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
              placeholder="Cari kata kerja atau arti yang kamu mau..."
              className="w-full pl-12 md:pl-16 pr-6 md:pr-8 py-6 md:py-8 h-auto bg-black/40 border-white/5 rounded-2xl md:rounded-[2rem] text-sm md:text-base text-white placeholder:text-slate-600 font-medium neo-inset shadow-none focus-visible:ring-cyber-neon/30"
              value={searchTerm}
              onChange={(e) => handleSearchChange(e.target.value)}
            />
          </div>

          <div className="flex flex-wrap gap-2 md:gap-3">
             {[null, 1, 2, 3].map((g) => (
               <Button
                 key={g === null ? "all" : g}
                 variant="ghost"
                 onClick={() => handleGroupChange(g)}
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

      {/* Card Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5 items-start">
        <AnimatePresence mode="popLayout">
          {filteredVerbs.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="col-span-full py-20 md:py-28 text-center border border-dashed border-white/10 rounded-2xl bg-black/20 neo-inset shadow-none px-4"
            >
              <div className="flex justify-center mb-5">
                 <div className="w-16 h-16 rounded-full bg-cyber-neon/5 flex items-center justify-center border border-cyber-neon/10">
                    <Search size={24} className="text-slate-500" />
                 </div>
              </div>
              <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">
                Waduh, kata kerjanya gak ketemu nih...
              </p>
            </motion.div>
          ) : (
            paginatedVerbs.map((verb, idx) => {
              const badgeColor = getBadgeColor(verb.group);
              return (
                <motion.div
                  key={verb._id}
                  layout
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ delay: (idx % 12) * 0.03 }}
                  className="h-full"
                >
                  <Card
                    onClick={() => setSelectedVerb(verb)}
                    className="h-full bg-white/[0.03] border border-white/[0.06] rounded-2xl cursor-pointer group hover:border-cyber-neon/40 hover:bg-cyber-neon/[0.03] hover:shadow-[0_0_30px_rgba(0,238,255,0.06)] active:scale-[0.99] transition-all duration-300"
                  >
                    <div className="p-5 md:p-6 flex flex-col gap-4 h-full">
                      {/* Top row: badge + actions */}
                      <div className="flex justify-between items-center">
                        <Badge
                          variant="outline"
                          className={`px-2.5 py-1 text-[9px] md:text-[10px] font-bold uppercase tracking-wider rounded-lg border h-auto ${badgeColor}`}
                        >
                          Gol. {verb.group}
                        </Badge>
                        <div className="flex items-center gap-2">
                          <TTSReader text={verb.jisho} minimal={true} />
                        </div>
                      </div>

                      {/* Main content */}
                      <div className="flex-1 space-y-2">
                        <ruby className="text-2xl md:text-3xl font-black text-white font-japanese block group-hover:text-cyber-neon transition-colors duration-300 leading-tight tracking-tight">
                          {verb.jisho}
                          <rt className="text-[9px] md:text-[10px] text-cyber-neon/80 font-bold tracking-widest not-italic">
                            {verb.furigana}
                          </rt>
                        </ruby>
                        <p className="text-xs md:text-[13px] font-medium text-slate-500 leading-snug group-hover:text-slate-300 transition-colors line-clamp-2">
                          {verb.meaning}
                        </p>
                      </div>

                      {/* Bottom: conjugation preview */}
                      <div className="pt-3 border-t border-white/[0.06] flex items-center justify-between gap-2">
                        <div className="flex gap-1.5 flex-wrap min-w-0">
                          {verb.masu && (
                            <span className="px-2 py-0.5 text-[9px] font-semibold text-slate-500 bg-white/[0.04] rounded-md border border-white/[0.06] font-japanese truncate">
                              {verb.masu}
                            </span>
                          )}
                          {verb.te && (
                            <span className="px-2 py-0.5 text-[9px] font-semibold text-slate-500 bg-white/[0.04] rounded-md border border-white/[0.06] font-japanese truncate">
                              {verb.te}
                            </span>
                          )}
                        </div>
                        <span className="text-[9px] font-bold text-slate-600 uppercase tracking-wider group-hover:text-cyber-neon transition-colors whitespace-nowrap shrink-0">
                          Detail →
                        </span>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              );
            })
          )}
        </AnimatePresence>
      </div>

      {/* ============================================ */}
      {/* PAGINATION CONTROLS                           */}
      {/* ============================================ */}
      {totalPages > 1 && (
        <div className="mt-10 md:mt-14 flex flex-col items-center gap-5">
          {/* Page info */}
          <div className="flex items-center gap-3 text-[10px] md:text-xs font-bold text-slate-500 uppercase tracking-widest">
            <span>Halaman <span className="text-cyber-neon">{currentPage}</span> dari {totalPages}</span>
            <span className="text-white/10">|</span>
            <span>{filteredVerbs.length} Kata Kerja</span>
          </div>

          {/* Pagination buttons */}
          <div className="flex items-center gap-1.5 md:gap-2 flex-wrap justify-center">
            {/* First page */}
            <Button
              variant="ghost"
              disabled={currentPage === 1}
              onClick={() => { setCurrentPage(1); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
              className="w-10 h-10 md:w-12 md:h-12 p-0 rounded-xl bg-black/40 border border-white/5 text-slate-500 hover:text-white hover:border-cyber-neon/40 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              <ChevronsLeft size={16} />
            </Button>

            {/* Previous page */}
            <Button
              variant="ghost"
              disabled={currentPage === 1}
              onClick={() => { setCurrentPage((p) => Math.max(1, p - 1)); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
              className="w-10 h-10 md:w-12 md:h-12 p-0 rounded-xl bg-black/40 border border-white/5 text-slate-500 hover:text-white hover:border-cyber-neon/40 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              <ChevronLeft size={16} />
            </Button>

            {/* Page numbers */}
            {(() => {
              const pages: number[] = [];
              const maxVisible = 5;
              let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
              const end = Math.min(totalPages, start + maxVisible - 1);
              if (end - start + 1 < maxVisible) start = Math.max(1, end - maxVisible + 1);
              for (let i = start; i <= end; i++) pages.push(i);

              return (
                <>
                  {start > 1 && (
                    <>
                      <Button
                        variant="ghost"
                        onClick={() => { setCurrentPage(1); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                        className="w-10 h-10 md:w-12 md:h-12 p-0 rounded-xl bg-black/40 border border-white/5 text-slate-400 hover:text-white hover:border-cyber-neon/40 text-xs md:text-sm font-bold transition-all"
                      >
                        1
                      </Button>
                      {start > 2 && <span className="text-slate-600 px-1">…</span>}
                    </>
                  )}
                  {pages.map((page) => (
                    <Button
                      key={page}
                      variant="ghost"
                      onClick={() => { setCurrentPage(page); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                      className={`w-10 h-10 md:w-12 md:h-12 p-0 rounded-xl text-xs md:text-sm font-bold transition-all ${
                        page === currentPage
                          ? "bg-cyber-neon text-black border-none shadow-[0_0_15px_rgba(0,238,255,0.4)]"
                          : "bg-black/40 border border-white/5 text-slate-400 hover:text-white hover:border-cyber-neon/40"
                      }`}
                    >
                      {page}
                    </Button>
                  ))}
                  {end < totalPages && (
                    <>
                      {end < totalPages - 1 && <span className="text-slate-600 px-1">…</span>}
                      <Button
                        variant="ghost"
                        onClick={() => { setCurrentPage(totalPages); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                        className="w-10 h-10 md:w-12 md:h-12 p-0 rounded-xl bg-black/40 border border-white/5 text-slate-400 hover:text-white hover:border-cyber-neon/40 text-xs md:text-sm font-bold transition-all"
                      >
                        {totalPages}
                      </Button>
                    </>
                  )}
                </>
              );
            })()}

            {/* Next page */}
            <Button
              variant="ghost"
              disabled={currentPage === totalPages}
              onClick={() => { setCurrentPage((p) => Math.min(totalPages, p + 1)); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
              className="w-10 h-10 md:w-12 md:h-12 p-0 rounded-xl bg-black/40 border border-white/5 text-slate-500 hover:text-white hover:border-cyber-neon/40 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              <ChevronRight size={16} />
            </Button>

            {/* Last page */}
            <Button
              variant="ghost"
              disabled={currentPage === totalPages}
              onClick={() => { setCurrentPage(totalPages); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
              className="w-10 h-10 md:w-12 md:h-12 p-0 rounded-xl bg-black/40 border border-white/5 text-slate-500 hover:text-white hover:border-cyber-neon/40 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              <ChevronsRight size={16} />
            </Button>
          </div>
        </div>
      )}

      {/* ============================================ */}
      {/* CONJUGATION DETAIL MODAL                      */}
      {/* ============================================ */}
      <Dialog open={!!selectedVerb} onOpenChange={(open) => !open && setSelectedVerb(null)}>
        <DialogContent hideClose className="max-w-3xl w-[95vw] max-h-[85vh] overflow-y-auto bg-[#0a0e17] border border-white/[0.08] rounded-2xl p-0 gap-0 shadow-[0_0_60px_rgba(0,0,0,0.6)] no-scrollbar">
          {selectedVerb && (() => {
            const groupStyle = getGroupAccent(selectedVerb.group);
            const sections = getConjugationSections(selectedVerb);
            return (
              <>
                {/* Modal Header */}
                <div className="sticky top-0 z-20 bg-[#0a0e17]/95 backdrop-blur-xl border-b border-white/[0.06] p-5 md:p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-4">
                        <Badge
                          variant="outline"
                          className={`px-3 py-1.5 text-[9px] md:text-xs font-black uppercase tracking-[0.2em] rounded-xl border h-auto bg-black/20 ${getBadgeColor(selectedVerb.group)}`}
                        >
                          Golongan {selectedVerb.group}
                        </Badge>
                        <TTSReader text={selectedVerb.jisho} minimal={true} />
                      </div>

                      <DialogTitle asChild>
                        <ruby className="text-3xl md:text-4xl font-black text-white font-japanese block leading-tight tracking-tight">
                          {selectedVerb.jisho}
                          <rt className="text-[10px] md:text-xs text-cyber-neon/80 font-bold tracking-widest not-italic">
                            {selectedVerb.furigana}
                          </rt>
                        </ruby>
                      </DialogTitle>

                      <DialogDescription asChild>
                        <div className="mt-2 md:mt-3">
                          <p className="text-sm md:text-base font-medium text-slate-500">
                            {selectedVerb.meaning}
                          </p>
                        </div>
                      </DialogDescription>
                    </div>

                    {/* Custom Close Button */}
                    <button
                      onClick={() => setSelectedVerb(null)}
                      className="w-9 h-9 md:w-10 md:h-10 shrink-0 rounded-xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center text-slate-500 hover:text-white hover:bg-white/10 transition-all duration-200"
                    >
                      <X size={18} />
                    </button>
                  </div>
                </div>

                {/* Modal Body — Conjugation Sections */}
                <div className="p-5 md:p-6 space-y-5 md:space-y-6">
                  {sections.map((section) => {
                    // Skip section if all items are empty
                    const hasValues = section.items.some((item) => item.value);
                    if (!hasValues) return null;

                    return (
                      <div key={section.title}>
                        {/* Section Header */}
                        <div className="flex items-center gap-3 mb-4 md:mb-5">
                          <div className={`w-8 h-8 md:w-9 md:h-9 rounded-xl flex items-center justify-center ${groupStyle.bg} ${groupStyle.border} border`}>
                            <span className={groupStyle.accent}>{section.icon}</span>
                          </div>
                          <h3 className="text-xs md:text-sm font-black uppercase tracking-widest text-slate-400">
                            {section.title}
                          </h3>
                        </div>

                        {/* Items Grid */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
                          {section.items.map((item) => (
                            <ConjugationCell
                              key={item.label}
                              label={item.label}
                              value={item.value}
                            />
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Modal Footer */}
                <div className="sticky bottom-0 z-20 bg-[#0a0e17]/95 backdrop-blur-xl border-t border-white/[0.06] px-5 md:px-6 py-3 md:py-4 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Activity size={12} className="text-cyber-neon animate-pulse" />
                    <span className="text-[10px] md:text-xs font-bold text-slate-500 uppercase tracking-widest">
                      Matriks Konjugasi
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    onClick={() => setSelectedVerb(null)}
                    className="h-auto px-5 py-2.5 md:px-6 md:py-3 text-[10px] md:text-xs font-bold uppercase tracking-widest rounded-xl bg-white/5 border border-white/10 text-slate-400 hover:bg-cyber-neon hover:text-black hover:border-none transition-all"
                  >
                    Tutup
                  </Button>
                </div>
              </>
            );
          })()}
        </DialogContent>
      </Dialog>

      <footer className="mt-16 md:mt-24 pt-10 md:pt-16 border-t border-white/10 flex flex-col sm:flex-row justify-between items-center gap-6">
         <div className="flex items-center gap-3">
            <Activity size={16} className="text-cyber-neon animate-pulse" />
            <span className="text-slate-500 font-bold text-[10px] md:text-xs uppercase tracking-widest">Matriks Konjugasi Siap!</span>
         </div>
         <Link href="/library" className="w-full sm:w-auto">
            <Button variant="ghost" className="w-full px-8 py-6 md:px-10 md:py-7 h-auto text-[10px] md:text-xs font-bold uppercase tracking-widest rounded-2xl bg-black/40 border-white/5 neo-card shadow-none hover:bg-cyber-neon hover:text-black transition-all gap-3 group">
               <ArrowLeft size={16} className="group-hover:-translate-x-1.5 transition-transform duration-300" /> Kembali ke Pustaka
            </Button>
         </Link>
      </footer>
    </div>
  );
}

/**
 * ConjugationCell — Single conjugation form display cell for the modal
 */
function ConjugationCell({ label, value }: { label: string; value?: string }) {
  return (
    <div className="flex flex-col gap-2">
      <span className="text-[8px] md:text-[9px] font-bold text-cyber-neon/70 uppercase tracking-widest leading-tight line-clamp-2 min-h-[2em]">
        {label}
      </span>
      <div className="p-3 md:p-4 rounded-xl bg-white/[0.03] border border-white/[0.08] hover:border-cyber-neon/30 transition-all duration-300 group/cell flex items-center justify-center min-h-[3.5rem] md:min-h-[4rem]">
        <p className="text-sm md:text-base font-japanese font-black text-white text-center leading-none group-hover/cell:text-cyber-neon transition-colors">
          {value || "—"}
        </p>
      </div>
    </div>
  );
}
