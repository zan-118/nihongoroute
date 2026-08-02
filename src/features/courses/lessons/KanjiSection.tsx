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
import { ChevronDown, ChevronUp } from "@/components/ui/icons";
import AddToSRSButton from "@/features/srs/actions/AddToSRSButton";

// ======================
// ANTARMUKA / TIPE DATA
// ======================

/**
 * Represents a single kanji item in a lesson.
 */
export interface KanjiLessonItem {
 /** Unique identifier from database */
 _id?: string;
 /** Alternative unique identifier */
 id?: string;
 /** The kanji character symbol */
 character: string;
 /** Meaning of the kanji character */
 meaning?: string;
 /** URL slug for the kanji detail page */
 slug?: string;
}

/**
 * Props for the KanjiSection component.
 */
interface KanjiSectionProps {
 /** Array of kanji items to display */
 kanjiList: KanjiLessonItem[];
}

// ======================
// EKSEKUSI UTAMA
// ======================

/**
 * Renders a grid of kanji characters with links to their details.
 * Limits initial display to 10 items with a toggle to show all.
 */
export const KanjiSection: React.FC<KanjiSectionProps> = ({ kanjiList }) => {
 // State to toggle visibility of kanji items beyond the initial limit
 const [showAll, setShowAll] = useState(false);
 
 // Render nothing if list is empty or undefined
 if (!kanjiList || kanjiList.length === 0) return null;

 // Check if list exceeds the default display limit of 10
 const hasMoreThanTen = kanjiList.length > 10;
 
 // Slice list based on toggle state
 const visibleKanjis = showAll ? kanjiList : kanjiList.slice(0, 10);

 return (
 <section id="kanji">
 <div className="flex items-center gap-4 mb-10">
 <h2 className="text-xl uppercase tracking-tight text-foreground flex items-center gap-3">
 <span className="text-2xl not-italic">漢字</span> Kanji Pelajaran
 </h2>
 <div className="h-px flex-1 bg-border" />
 </div>
 <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5 md:gap-6">
 {visibleKanjis.map((k: KanjiLessonItem) => (
 <Link
 key={k._id || k.id}
 href={`/library/kanji/${k.slug || k.character}`}
 className="p-6 border border-border/50 dark:border-white/10 rounded-2xl bg-card shadow-[0_4px_25px_rgba(0,0,0,0.015)] flex flex-col items-center justify-center group hover:border-primary/45 transition-all duration-500 relative group/card"
 >
 {/* Tombou Register Mark */}
 <div className="absolute -top-1.5 -right-1.5 w-3.5 h-3.5 pointer-events-none z-20">
 <div className="absolute top-0 right-0 w-3.5 h-px bg-primary/20 group-hover/card:bg-primary transition-colors duration-500" />
 <div className="absolute top-0 right-0 w-px h-3.5 bg-primary/20 group-hover/card:bg-primary transition-colors duration-500" />
 </div>

 {/* Tombol Tambah ke SRS Langsung */}
 <div 
 className="absolute top-3 right-3 z-30 opacity-60 hover:opacity-100 transition-opacity"
 onClick={(e) => {
 e.preventDefault();
 e.stopPropagation();
 }}
 >
 <AddToSRSButton wordId={k._id || k.id || ""} variant="action" />
 </div>

 <span className="text-4xl font-black mb-3 group-hover:scale-105 transition-transform">
 {k.character}
 </span>
 <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest text-center opacity-60 group-hover:opacity-100 transition-opacity">
 {k.meaning}
 </span>
 </Link>
 ))}
 </div>
 {hasMoreThanTen && (
 <div className="flex justify-center pt-8">
 <button
 onClick={() => setShowAll(!showAll)}
 className="inline-flex items-center gap-2.5 px-7 py-3.5 rounded-lg rounded-br-none font-black uppercase tracking-widest text-[9px] sm:text-[10px] border shadow-sm transition-all duration-300 bg-card hover:bg-primary/5 hover:border-primary/30 text-muted-foreground hover:text-primary active:scale-95"
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