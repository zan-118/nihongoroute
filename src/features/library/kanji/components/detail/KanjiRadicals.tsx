/**
 * @file KanjiRadicals.tsx
 * @description Komponen bento untuk menampilkan daftar radikal utama penyusun karakter Kanji.
 */


// IMPORT & DEPENDENSI

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";


// TIPE DATA / INTERFACE

/**
 * Props for KanjiRadicals component.
 */
interface KanjiRadicalsProps {
 /** Array of radical characters. */
 radicals?: string[];
}


// KOMPONEN UTAMA

/**
 * Render list of main radicals for kanji character.
 * 
 * @param props - Component properties.
 * @returns Card component containing radical badges.
 */
export function KanjiRadicals({ radicals }: KanjiRadicalsProps) {

 // RENDER KOMPONEN

 return (
 <Card className="p-8 bg-card/20 border-border rounded-2xl md:rounded-3xl hover:border-primary/40 transition-all flex flex-col justify-center glass shadow-sm">
 <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground block mb-4">Radikal Utama</span>
 <div className="flex flex-wrap gap-3">
 {/* Render badges if radicals exist. Fallback to empty message. */}
 {radicals && radicals.length > 0 ? (
 radicals.map((rad, pos) => (
 <Badge key={`radical-${pos}`} variant="secondary" className="px-5 py-2.5 rounded-xl bg-muted/40 border border-border text-2xl font-japanese hover:border-primary/40 transition-all">
 {rad}
 </Badge>
 ))
 ) : (
 <span className="text-sm text-muted-foreground italic">Tidak ada data radikal.</span>
 )}
 </div>
 </Card>
 );
}