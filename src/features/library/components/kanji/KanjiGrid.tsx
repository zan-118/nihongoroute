"use client";

/**
 * @file KanjiGrid.tsx
 * @description Komponen grid visualizer daftar karakter Kanji luring di NihongoRoute.
 * Menampilkan ubin-ubin kanji interaktif berarsitektur Double-Bezel (Doppelrand).
 */

import { Loader2, ArrowUpRight, Search } from "@/components/ui/icons";
import Link from "next/link";

export interface KanjiGridItem {
 id?: string;
 _id?: string;
 character: string;
 jlpt?: string;
 meaning?: string;
 slug?: string;
}

interface KanjiGridProps {
 kanjis: KanjiGridItem[];
 isFetching: boolean;
}

/**
 * Double-Bezel bento grid component displaying kanji tiles.
 * 
 * @param props Component properties.
 * @returns React element.
 */
export function KanjiGrid({ kanjis, isFetching }: KanjiGridProps) {
 return (
 <div className="relative font-sans">
 {/* Loading Overlay */}
 {isFetching && (
 <div className="absolute inset-0 z-50 flex items-center justify-center bg-background/50 backdrop-blur-md rounded-3xl">
 <Loader2 className="size-10 animate-spin text-primary" />
 </div>
 )}
 
 {/* Grid of Kanji Tiles */}
 <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-0 border-t border-l border-border/30 min-h-[400px]">
 {kanjis.map((kanji) => (
 <div
 key={kanji.id || kanji._id}
 style={{
 contentVisibility: "auto",
 containIntrinsicSize: "0 140px",
 }}
 className="group font-sans"
 >
 <Link href={`/library/kanji/${kanji.slug || kanji.id || kanji._id}`} className="block h-full">
 <div className="w-full aspect-square p-3 border-b border-r border-border/30 hover:border-rose-500/50 transition-colors flex flex-col items-center justify-between text-center relative group-active:scale-[0.98]">
 {/* Top Meta */}
 <div className="w-full flex justify-between items-center">
 <span className="text-[9px] font-mono font-bold text-rose-500 uppercase tracking-wider">
 {kanji.jlpt || "KANJI"}
 </span>
 <ArrowUpRight size={12} className="text-muted-foreground/40 group-hover:text-rose-500 transition-colors" />
 </div>

 {/* Main Character */}
 <span className="text-4xl sm:text-5xl font-black text-foreground font-japanese tracking-tight group-hover:text-rose-500 group-hover:scale-110 transition-transform duration-300 my-auto">
 {kanji.character}
 </span>
 
 {/* Meaning */}
 <span className="text-[10px] font-semibold text-muted-foreground group-hover:text-foreground transition-colors line-clamp-1 w-full">
 {kanji.meaning}
 </span>
 </div>
 </Link>
 </div>
 ))}
 </div>

 {/* Empty State */}
 {kanjis.length === 0 && !isFetching && (
 <div className="flex flex-col items-center justify-center py-24 text-center p-8 rounded-[2.25rem] bg-card/20 border border-border/40 font-sans">
 <div className="size-16 rounded-full bg-muted/40 border border-border/60 flex items-center justify-center mb-4">
 <Search size={24} className="text-muted-foreground/60" aria-hidden="true" />
 </div>
 <h3 className="text-base font-black text-foreground uppercase tracking-widest font-mono">Karakter Kanji Tidak Ditemukan</h3>
 <p className="text-muted-foreground font-medium text-xs mt-2 max-w-sm">Silakan sesuaikan kata kunci pencarian atau ganti filter level JLPT.</p>
 </div>
 )}
 </div>
 );
}