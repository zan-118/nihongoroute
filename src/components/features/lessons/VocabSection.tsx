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
      className="neo-card p-4 md:p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 md:gap-6 group hover:border-primary/30 transition-colors duration-300"
    >
      <div className="flex-1 w-full">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-[10px] font-bold text-primary uppercase tracking-widest bg-primary/10 px-2 py-0.5 rounded">
            {v.romaji || (v.furigana ? wanakana.toRomaji(v.furigana) : "-")}
          </span>
          {v.hinshi && (
            <span className="text-[9px] font-mono font-black text-secondary uppercase tracking-widest bg-secondary/10 border border-secondary/20 px-2 py-0.5 rounded">
              {Array.isArray(v.hinshi) ? v.hinshi.join(", ") : (
                v.hinshi === "Meishi" ? "Kata Benda" :
                v.hinshi === "Doushi" ? "Kata Kerja" :
                v.hinshi === "I-Keiyoushi" ? "Kata Sifat-I" :
                v.hinshi === "Na-Keiyoushi" ? "Kata Sifat-Na" : v.hinshi
              )}
            </span>
          )}
          {v.transitivity && (
            <span className={`text-[9px] font-mono font-black uppercase tracking-widest px-2 py-0.5 rounded border ${
              v.transitivity === "transitive" 
                ? "text-warning bg-warning/10 border-warning/20" 
                : "text-primary bg-primary/10 border-primary/20"
            }`}>
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
              <span className="text-[10px] font-bold text-secondary border border-secondary/20 px-2 py-0.5 rounded-lg bg-secondary/5">
                ON: {v.onyomi}
              </span>
            )}
            {v.kunyomi && (
              <span className="text-[10px] font-bold text-success border border-success/20 px-2 py-0.5 rounded-lg bg-success/5">
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
        {v.word && <TTSReader text={v.word} minimal={true} />}
      </div>
    </div>
  );
};

// ======================
// EKSEKUSI UTAMA
// ======================
export const VocabSection: React.FC<VocabSectionProps> = ({ vocabList }) => {
  if (!vocabList || vocabList.length === 0) return null;

  return (
    <section id="vocabulary">
      <div className="flex items-center gap-4 mb-10">
        <h2 className="text-xl font-black uppercase tracking-tight text-foreground flex items-center gap-3">
          <span className="text-2xl not-italic">単語</span> Kosakata (Vocab)
        </h2>
        <div className="h-[1px] flex-1 bg-border" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {vocabList.map((v: VocabLessonItem, idx: number) => {
          if (!v) return null;
          return <VocabCard key={v._id || v.id || idx} v={v} idx={idx} />;
        })}
      </div>
    </section>
  );
};
