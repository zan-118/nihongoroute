"use client";

/**
 * @file KanjiSection.tsx
 * @description Komponen seksi Kanji (KanjiSection) dalam halaman pelajaran. Menampilkan daftar karakter Kanji pelajaran dengan link ke detail pustaka Kanji.
 */

// ======================
// IMPOR
// ======================
import React, { useState } from "react";
import Link from "next/link";
import { ChevronDown, ChevronUp } from "lucide-react";

// ======================
// ANTARMUKA / TIPE DATA
// ======================
export interface KanjiLessonItem {
  _id?: string;
  id?: string;
  character: string;
  meaning?: string;
  slug?: string;
}

interface KanjiSectionProps {
  kanjiList: KanjiLessonItem[];
}

// ======================
// EKSEKUSI UTAMA
// ======================
export const KanjiSection: React.FC<KanjiSectionProps> = ({ kanjiList }) => {
  const [showAll, setShowAll] = useState(false);
  if (!kanjiList || kanjiList.length === 0) return null;

  const hasMoreThanTen = kanjiList.length > 10;
  const visibleKanjis = showAll ? kanjiList : kanjiList.slice(0, 10);

  return (
    <section id="kanji">
      <div className="flex items-center gap-4 mb-10">
        <h2 className="text-xl font-black uppercase italic tracking-tighter text-foreground flex items-center gap-3">
          <span className="text-2xl not-italic">漢字</span> Kanji Pelajaran
        </h2>
        <div className="h-[1px] flex-1 bg-border" />
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5 md:gap-6">
        {visibleKanjis.map((k: KanjiLessonItem) => (
          <Link
            key={k._id || k.id}
            href={`/library/kanji/${k.slug || k.character}`}
            className="p-6 border border-border/80 rounded-[2rem] bg-card/35 shadow-[0_0_30px_rgba(var(--primary-rgb),0.015)] flex flex-col items-center justify-center group hover:border-primary/45 transition-all duration-300 glass"
          >
            <span className="text-4xl font-black mb-3 group-hover:scale-110 transition-transform">
              {k.character}
            </span>
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest text-center">
              {k.meaning}
            </span>
          </Link>
        ))}
      </div>
      {hasMoreThanTen && (
        <div className="flex justify-center pt-8">
          <button
            onClick={() => setShowAll(!showAll)}
            className="inline-flex items-center gap-2.5 px-7 py-3.5 rounded-xl font-black uppercase tracking-widest text-[9px] sm:text-[10px] border shadow-md transition-all duration-300 bg-card hover:bg-primary/5 hover:border-primary/30 text-muted-foreground hover:text-primary active:scale-95"
            aria-label={showAll ? "Sembunyikan kanji tambahan" : "Tampilkan semua kanji"}
          >
            <span>{showAll ? "Sembunyikan" : `Lihat Selanjutnya (${kanjiList.length - 10} lainnya)`}</span>
            {showAll ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
          </button>
        </div>
      )}
    </section>
  );
};
