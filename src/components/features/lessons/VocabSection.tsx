"use client";

/**
 * @file VocabSection.tsx
 * @description Komponen seksi kosakata (VocabSection) dalam halaman pelajaran. Menampilkan detail kata, romaji, jenis kata, tombol tambah ke SRS, dan pemutar TTS.
 */

// ======================
// IMPOR
// ======================
import React, { useState } from "react";
import * as wanakana from "wanakana";
import { SmartJapanese } from "@/components/ui/SmartJapanese";
import TTSReader from "@/components/features/tools/tts/TTSReader";
import AddToSRSButton from "@/components/features/srs/actions/AddToSRSButton";
import { ChevronDown, ChevronUp } from "lucide-react";

// ======================
// ANTARMUKA / TIPE DATA
// ======================
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
}

interface VocabSectionProps {
  vocabList: VocabLessonItem[];
}

// ======================
// KARTU KOSAKATA INDIVIDU (STATEFUL)
// ======================
const VocabCard: React.FC<{ v: VocabLessonItem; idx: number }> = ({ v, idx }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const meaning = v.meaning || v.meaning_id || "-";
  const maxLength = 80;
  const isLong = meaning.length > maxLength;

  const displayedMeaning = isLong && !isExpanded 
    ? meaning.slice(0, maxLength) + "..." 
    : meaning;

  return (
    <div
      className="neo-card p-4 md:p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 md:gap-6 group hover:border-[rgba(var(--primary-rgb),0.3)] transition-colors duration-300"
    >
      <div className="flex-1 w-full">
        <div className="flex items-center gap-2 mb-3">
          <span 
            className="text-[10px] font-bold text-primary uppercase tracking-widest px-2 py-0.5 rounded"
            style={{ backgroundColor: "rgba(var(--primary-rgb), 0.1)" }}
          >
            {v.romaji || (v.furigana ? wanakana.toRomaji(v.furigana) : "-")}
          </span>
          {v.hinshi && (
            <span 
              className="text-[9px] font-mono font-black text-secondary uppercase tracking-widest px-2 py-0.5 rounded border"
              style={{ backgroundColor: "rgba(var(--secondary-rgb), 0.1)", borderColor: "rgba(var(--secondary-rgb), 0.2)" }}
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
              className="text-[9px] font-mono font-black uppercase tracking-widest px-2 py-0.5 rounded border"
              style={v.transitivity === "transitive" 
                ? { color: "var(--warning)", backgroundColor: "rgba(var(--warning-rgb), 0.1)", borderColor: "rgba(var(--warning-rgb), 0.2)" }
                : { color: "var(--primary)", backgroundColor: "rgba(var(--primary-rgb), 0.1)", borderColor: "rgba(var(--primary-rgb), 0.2)" }
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
                className="text-[10px] font-bold text-secondary border px-2 py-0.5 rounded-lg"
                style={{ backgroundColor: "rgba(var(--secondary-rgb), 0.05)", borderColor: "rgba(var(--secondary-rgb), 0.2)" }}
              >
                ON: {v.onyomi}
              </span>
            )}
            {v.kunyomi && (
              <span 
                className="text-[10px] font-bold text-success border px-2 py-0.5 rounded-lg"
                style={{ backgroundColor: "rgba(var(--success-rgb), 0.05)", borderColor: "rgba(var(--success-rgb), 0.2)" }}
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
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-[11px] font-black text-primary hover:text-secondary ml-2 uppercase tracking-wider select-none shrink-0"
            >
              {isExpanded ? "Sembunyikan" : "Selengkapnya"}
            </button>
          )}
        </div>
      </div>
      <div className="flex flex-row sm:flex-col gap-3 shrink-0 w-full sm:w-auto justify-end">
        {(v._id || v.id) && <AddToSRSButton wordId={v._id || v.id || ""} />}
        {v.word && <TTSReader text={v.word} minimal={true} speaker="indah" />}
      </div>
    </div>
  );
};

// ======================
// EKSEKUSI UTAMA
// ======================
export const VocabSection: React.FC<VocabSectionProps> = ({ vocabList }) => {
  const [showAll, setShowAll] = useState(false);
  if (!vocabList || vocabList.length === 0) return null;

  const hasMoreThanTen = vocabList.length > 10;
  const visibleVocabs = showAll ? vocabList : vocabList.slice(0, 10);

  return (
    <section id="vocabulary">
      <div className="flex items-center gap-4 mb-10">
        <h2 className="text-xl font-black uppercase tracking-tight text-foreground flex items-center gap-3">
          <span className="text-2xl not-italic">単語</span> Kosakata (Vocab)
        </h2>
        <div className="h-[1px] flex-1 bg-border" />
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
            className="inline-flex items-center gap-2.5 px-7 py-3.5 rounded-xl font-black uppercase tracking-widest text-[9px] sm:text-[10px] border shadow-md transition-all duration-300 bg-card hover:bg-primary/5 hover:border-primary/30 text-muted-foreground hover:text-primary active:scale-95"
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
