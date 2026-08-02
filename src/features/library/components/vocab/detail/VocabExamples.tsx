"use client";

/**
 * @file VocabExamples.tsx
 * @description Komponen penampil contoh kalimat penggunaan kosakata (Vocab Examples).
 * Mendukung pembacaan furigana (SmartJapanese), romaji (Latin), dan arti terjemahan bahasa Indonesia.
 */

// ==========================================
// IMPOR UTAMA
// ==========================================
import { Card } from "@/components/ui/card";
import { Layers } from "@/components/ui/icons";
import { SmartJapanese } from "@/components/ui/japanese";

// ==========================================
// ANTARMUKA & TIPE DATA
// ==========================================

/**
 * Structure representing a vocabulary sentence example.
 */
interface Example {
 /** Japanese text (short key) */
 jp?: string;
 /** Japanese text (long key) */
 japanese?: string;
 /** Indonesian translation (short key) */
 id?: string;
 /** Indonesian translation (long key) */
 indonesian?: string;
 /** Furigana reading guide */
 furigana?: string;
 /** Romaji transliteration */
 romaji?: string;
 /** Meaning translation */
 meaning?: string;
}

/**
 * Properties for the VocabExamples component.
 */
interface VocabExamplesProps {
 /** Array of sentence examples */
 examples?: Example[];
}

// ==========================================
// KOMPONEN UTAMA: VocabExamples
// ==========================================
/**
 * Renders list of vocabulary usage examples with Japanese, Romaji, and Indonesian translation.
 * 
 * @param props Component properties.
 * @returns Card component containing list of examples.
 */
export function VocabExamples({ examples }: VocabExamplesProps) {
 return (
 <Card className="p-6 md:p-8 bg-card/20 border-border rounded-2xl md:rounded-3xl hover:border-primary/40 transition-all group overflow-hidden relative font-sans glass shadow-[0_0_20px_hsl(var(--primary)/0.02)]">
 <div className="flex items-center gap-3 mb-6">
 <Layers size={18} aria-hidden="true" className="text-primary" />
 <h2 className="text-sm uppercase tracking-[0.2em] text-foreground">Contoh Penggunaan</h2>
 </div>

 {/* Daftar Contoh Kalimat */}
 <div className="space-y-4">
 {examples?.map((ex) => (
 <div key={ex.jp || ex.japanese} className="p-5 pl-6 bg-[hsl(var(--card)/0.3)] border border-border rounded-lg relative overflow-hidden group/item hover:border-primary/30 transition-all duration-300 shadow-sm">
 {/* Aksen Batang Warna Kiri */}
 <div className="absolute top-0 left-0 w-1 h-full bg-primary/20 group-hover/item:bg-primary transition-all duration-300" />
 
 <div className="mb-3 flex flex-col gap-1">
 {/* Kalimat Ejaan Bahasa Jepang (Furigana Presisi 0.55em) */}
 <p className="text-lg md:text-xl font-bold text-foreground font-japanese leading-relaxed">
 {/* Fallback to japanese field if jp field missing */}
 <SmartJapanese word={ex.jp || ex.japanese || ""} furigana={ex.furigana} />
 </p>
 {ex.romaji && (
 <span className="text-[10px] md:text-xs font-black text-muted-foreground uppercase tracking-[0.2em] font-sans opacity-60">
 {ex.romaji}
 </span>
 )}
 </div>

 {/* Arti Terjemahan Bahasa Indonesia */}
 <div className="flex items-start gap-3 border-t border-border/50 pt-3">
 <div className="size-1.5 rounded-full bg-primary/40 mt-1.5 shrink-0" />
 <p className="text-sm font-semibold text-muted-foreground italic leading-relaxed">
 {/* Fallback chain for translation text */}
 {ex.meaning || ex.id || ex.indonesian}
 </p>
 </div>
 </div>
 ))}
 {/* Render fallback message when no examples exist */}
 {(!examples || examples.length === 0) && (
 <p className="text-xs text-muted-foreground italic">Belum ada contoh kalimat untuk kata ini.</p>
 )}
 </div>
 </Card>
 );
}