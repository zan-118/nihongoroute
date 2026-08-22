/**
 * @file KanjiReadings.tsx
 * @description Komponen bento untuk menampilkan cara baca Onyomi (cara baca Cina) dan Kunyomi (cara baca Jepang asli) dari sebuah Kanji.
 */


// IMPORT & DEPENDENSI

import { Card } from "@/components/ui/card";
import { PlayCircle } from "@/components/ui/icons";


// TIPE DATA / INTERFACE

/**
 * Props for KanjiReadings component.
 */
interface KanjiReadingsProps {
 /**
 * Chinese reading of kanji. Usually katakana.
 */
 onyomi?: string;
 /**
 * Japanese reading of kanji. Usually hiragana.
 */
 kunyomi?: string;
}


// KOMPONEN UTAMA

/**
 * Render Onyomi and Kunyomi readings in bento grid.
 * 
 * @param props - Component properties.
 * @returns Bento grid layout with readings.
 */
export function KanjiReadings({ onyomi, kunyomi }: KanjiReadingsProps) {

 // RENDER KOMPONEN

 return (
 /* Grid layout split. Onyomi left, Kunyomi right. */
 <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full">
 {/* Bento Onyomi */}
 <Card className="p-6 md:p-8 bg-card/20 border-border rounded-2xl md:rounded-3xl hover:border-primary/40 transition-all relative overflow-hidden flex flex-col justify-center group glass shadow-sm">
 {/* Decorative background icon. Scale up on hover. */}
 <div className="absolute top-4 right-6 opacity-[0.05] group-hover:scale-110 transition-transform text-primary">
 <PlayCircle size={40} aria-hidden="true" />
 </div>
 <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary block mb-2 md:mb-3 relative z-10">Onyomi</span>
 <span className="text-2xl md:text-3xl lg:text-4xl font-japanese font-black text-foreground leading-tight tracking-tight relative z-10">
 {/* Fallback to dash if reading missing. */}
 {onyomi || "—"}
 </span>
 </Card>

 {/* Bento Kunyomi */}
 <Card className="p-6 md:p-8 bg-card/20 border-border rounded-2xl md:rounded-3xl hover:border-primary/40 transition-all relative overflow-hidden flex flex-col justify-center group glass shadow-sm">
 {/* Decorative background icon. Scale up on hover. */}
 <div className="absolute top-4 right-6 opacity-[0.05] group-hover:scale-110 transition-transform text-success">
 <PlayCircle size={40} aria-hidden="true" />
 </div>
 <span className="text-[10px] font-black uppercase tracking-[0.2em] text-success block mb-2 md:mb-3 relative z-10">Kunyomi</span>
 <span className="text-2xl md:text-3xl lg:text-4xl font-japanese font-black text-foreground leading-tight tracking-tight relative z-10">
 {/* Fallback to dash if reading missing. */}
 {kunyomi || "—"}
 </span>
 </Card>
 </div>
 );
}