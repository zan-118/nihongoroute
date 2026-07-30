"use client";

/**
 * @file VocabSection.tsx
 * @description Komponen seksi kosakata (VocabSection) dalam halaman pelajaran. Menampilkan detail kata, romaji, jenis kata, tombol tambah ke SRS, dan pemutar TTS.
 */

// ======================
// IMPOR
// ======================
import React, { useState } from "react";
import { toRomaji } from "wanakana";
import { SmartJapanese } from "@/components/ui/japanese";
import { TTSReader } from "@/components/features/media";
import AddToSRSButton from "@/components/features/srs/actions/AddToSRSButton";
import { ChevronDown, ChevronUp } from "@/components/ui/icons";

// ======================
// ANTARMUKA / TIPE DATA
// ======================

/**
 * Vocab item data structure. Hold word, reading, meaning, grammar info.
 */
export interface VocabLessonItem {
  _id?: string;
  id?: string;
  romaji?: string;
  furigana?: string;
  hinshi?: string | string[];
  transitivity?: string;
  word?: string;
  onyomi?: string;
  kunyomi?: string;
  meaning?: string;
  meaning_id?: string;
  audio_url?: string;
}

/**
 * Props for VocabSection component. Contain list of vocab items.
 */
interface VocabSectionProps {
  vocabList: VocabLessonItem[];
}

// ======================
// KARTU KOSAKATA INDIVIDU (STATEFUL)
// ======================

/**
 * Card component. Show single vocab item. Handle meaning expansion, audio play, SRS add.
 */
const VocabCard: React.FC<{ v: VocabLessonItem; idx: number }> = ({ v, idx }) => {
  // Track expansion state for long meaning text.
  const [isExpanded, setIsExpanded] = useState(false);
  // Fallback meaning if empty.
  const meaning = v.meaning || v.meaning_id || "-";
  const maxLength = 80;
  const isLong = meaning.length > maxLength;

  // Truncate long meaning text. Prevent layout break.
  const displayedMeaning = isLong && !isExpanded 
    ? meaning.slice(0, maxLength) + "..." 
    : meaning;

  return (
    <div className="relative group/wrapper h-full">
      {/* Tombou Register Mark */}
      <div className="absolute -top-1.5 -right-1.5 w-3.5 h-3.5 pointer-events-none z-20">
        <div className="absolute top-0 right-0 w-3.5 h-px bg-primary/20 group-hover/wrapper:bg-primary transition-colors duration-500" />
        <div className="absolute top-0 right-0 w-px h-3.5 bg-primary/20 group-hover/wrapper:bg-primary transition-colors duration-500" />
      </div>

      <div
        className="p-6 md:p-8 border border-border/50 dark:border-white/10 rounded-2xl bg-card shadow-[0_4px_25px_rgba(0,0,0,0.015)] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 group hover:border-primary/45 transition-all duration-500 h-full"
      >
        <div className="flex-1 w-full">
          <div className="flex items-center gap-2 mb-3">
            <span 
              className="text-[10px] font-bold text-primary uppercase tracking-widest px-2 py-0.5 rounded-[4px]"
              style={{ backgroundColor: "rgb(var(--primary-rgb)/0.1)" }}
            >
              {/* Convert furigana to romaji if romaji */}
              {v.romaji || (v.furigana ? toRomaji(v.furigana) : "-")}
            </span>
            {v.hinshi && (
              <span 
                className="text-[9px] font-mono font-black text-secondary uppercase tracking-widest px-2 py-0.5 rounded-[4px] border border-secondary/20"
                style={{ backgroundColor: "rgb(var(--secondary-rgb)/0.1)" }}
              >
                {Array.isArray(v.hinshi) ? v.hinshi.join(", ") : (
                  v.hinshi === "Meishi" ? "Kata Benda" :
                  v.hinshi === "Doushi" ? "Kata Kerja" :
                  v.hinshi === "I-Keiyoushi" ? "Kata Sifat-I" :
                  v.hinshi === "Na-Keiyoushi" ? "Kata Sifat-Na" : v.hinshi
                )}
              </span>
            )}
            {v.transitivity && (
              <span 
                className="text-[9px] font-mono font-black uppercase tracking-widest px-2 py-0.5 rounded-[4px] border"
                style={v.transitivity === "transitive" 
                  ? { color: "hsl(var(--warning))", backgroundColor: "rgb(var(--warning-rgb)/0.1)", borderColor: "rgb(var(--warning-rgb)/0.2)" }
                  : { color: "hsl(var(--primary))", backgroundColor: "rgb(var(--primary-rgb)/0.1)", borderColor: "rgb(var(--primary-rgb)/0.2)" }
                }
              >
                {v.transitivity === "transitive" ? "Transitif" : "Intransitif"}
              </span>
            )}
          </div>
          <h4 className="group-hover:text-primary transition-colors tracking-tight mb-2">
             <div className="text-2xl md:text-3xl font-black text-foreground">
                <SmartJapanese word={v.word || ""} furigana={v.furigana} />
             </div>
          </h4>
          
          {(v.onyomi || v.kunyomi) && (
            <div className="flex flex-wrap gap-2 mb-3">
              {v.onyomi && (
                <span 
                  className="text-[10px] font-bold text-secondary border px-2 py-0.5 rounded-[4px] border-secondary/20"
                  style={{ backgroundColor: "rgb(var(--secondary-rgb)/0.05)" }}
                >
                  ON: {v.onyomi}
                </span>
              )}
              {v.kunyomi && (
                <span 
                  className="text-[10px] font-bold text-success border px-2 py-0.5 rounded-[4px] border-success/20"
                  style={{ backgroundColor: "rgb(var(--success-rgb)/0.05)" }}
                >
                  KUN: {v.kunyomi}
                </span>
              )}
            </div>
          )}

          <div className="text-[13px] md:text-sm text-muted-foreground font-medium leading-relaxed">
            {displayedMeaning}
            {isLong && (
              <button
                type="button"
                onClick={() => setIsExpanded(!isExpanded)}
                className="text-[11px] font-black text-primary hover:text-secondary ml-2 uppercase tracking-wider select-none shrink-0"
              >
                {isExpanded ? "Sembunyikan" : "Selengkapnya"}
              </button>
            )}
          </div>
        </div>
        <div className="flex flex-row sm:flex-col gap-3 shrink-0 w-full sm:w-auto justify-end">
          {(v._id || v.id) && <AddToSRSButton wordId={v._id || v.id || ""} variant="action" />}
          {v.word && <TTSReader text={v.word} minimal={true} speaker="indah" audioUrl={v.audio_url} />}
        </div>
      </div>
    </div>
  );
};

// ======================
// EKSEKUSI UTAMA
// ======================

/**
 * Section component. Render list of vocab cards. Handle pagination if item count exceed 10.
 */
export const VocabSection: React.FC<VocabSectionProps> = ({ vocabList }) => {
  // Track visibility state for items beyond index 10.
  const [showAll, setShowAll] = useState(false);
  if (!vocabList || vocabList.length === 0) return null;

  const hasMoreThanTen = vocabList.length > 10;
  // Limit initial view to 10 items. Improve render speed.
  const visibleVocabs = showAll ? vocabList : vocabList.slice(0, 10);

  return (
    <section id="vocabulary">
      <div className="flex items-center gap-4 mb-10">
        <h2 className="text-xl font-black uppercase tracking-tight text-foreground flex items-center gap-3">
          <span className="text-2xl not-italic">単語</span> Kosakata (Vocab)
        </h2>
        <div className="h-px flex-1 bg-border" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {visibleVocabs.map((v: VocabLessonItem, idx: number) => {
          if (!v) return null;
          return <VocabCard key={v._id || v.id || idx} v={v} idx={idx} />;
        })}
      </div>
      {hasMoreThanTen && (
        <div className="flex justify-center pt-8">
          <button
            onClick={() => setShowAll(!showAll)}
            className="inline-flex items-center gap-2.5 px-7 py-3.5 rounded-lg rounded-br-none font-black uppercase tracking-widest text-[9px] sm:text-[10px] border shadow-sm transition-all duration-300 bg-card hover:bg-primary/5 hover:border-primary/30 text-muted-foreground hover:text-primary active:scale-95"
            aria-label={showAll ? "Sembunyikan kosakata tambahan" : "Tampilkan semua kosakata"}
          >
            <span>{showAll ? "Sembunyikan" : `Lihat Selanjutnya (${vocabList.length - 10} lainnya)`}</span>
            {showAll ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
          </button>
        </div>
      )}
    </section>
  );
};