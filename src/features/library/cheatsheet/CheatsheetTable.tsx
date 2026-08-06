/**
 * @file CheatsheetTable.tsx
 * @description Komponen tabel interaktif tingkat lanjut untuk merender item cheatsheet.
 * Menyediakan tiga mode tampilan yang sepenuhnya responsif dan mobile-first: Tabel (List), Kartu (Grid), dan Kuis (Flashcard Mode).
 */

"use client";

// ======================
// IMPOR
// ======================
import { useState } from "react";
import { 
 LayoutGrid, 
 Layers, 
 ChevronLeft, 
 ChevronRight, 
 Shuffle, 
 Eye, 
 EyeOff, 
 Info
} from "@/components/ui/icons";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { m, AnimatePresence } from "framer-motion";
import * as wanakana from "wanakana";
import { SmartJapanese } from "@/components/ui/japanese";
import { cn } from "@/lib/utils";

// ======================
// TIPE DATA
// ======================

/**
 * Represents a single item in the cheatsheet.
 */
interface SheetItem {
 /** Explanation or translation label */
 label: string;
 /** Japanese text (Kanji/Kana) */
 jp: string;
 /** Romaji representation */
 romaji: string;
}

/**
 * Props for the CheatsheetTable component.
 */
interface CheatsheetTableProps {
 /** Array of cheatsheet items to display */
 items: SheetItem[];
}

/**
 * Available view modes for the cheatsheet.
 */
type ViewMode = "table" | "flashcard";

// ======================
// EKSEKUSI UTAMA
// ======================

/**
 * Interactive table component for rendering cheatsheet items.
 * Supports standard table view and interactive flashcard quiz view.
 */
export function CheatsheetTable({ items }: CheatsheetTableProps) {
 // Active view mode state
 const [viewMode, setViewMode] = useState<ViewMode>("table");

 // State untuk Flashcard Mode
 // Initialize flashcard items state with a copy of the original items array
 const [flashcardItems, setFlashcardItems] = useState<SheetItem[]>(() => [...items]);
 const [currentIndex, setCurrentIndex] = useState(0);
 const [isFlipped, setIsFlipped] = useState(false);

 /**
 * Formats label text by highlighting specific Japanese learning keywords.
 * @param text - Raw label text
 * @returns React node with highlighted keywords
 */
 const formatLabel = (text: string) => {
 if (!text) return text;
 const keywords = [
 "Contoh", "Catatan", "Penting", "Fakta budaya", 
 "Perubahan fonetis", "Nuansa", "Tips", "Catatan menarik",
 "Pengecualian penting", "Batas", "Fakta budaya", "Nuansa sosial"
 ];
 
 // Escape special regex characters and join keywords with OR operator
 const pattern = new RegExp(`(${keywords.map(k => k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')}:)`, 'g');
 const parts = text.split(pattern);

 return (
 <span>
 {parts.map((part, i) =>
 pattern.test(part)
 ? <strong key={`${part}-${i}`} className="text-primary font-bold">{part}</strong>
 : <span key={`${part}-${i}`}>{part}</span>
 )}
 </span>
 );
 };



 /**
 * Shuffles the flashcard items array randomly and resets index.
 */
 const handleShuffle = () => {
 // Randomize array order
 const shuffled = [...flashcardItems].sort(() => Math.random() - 0.5);
 setFlashcardItems(shuffled);
 setCurrentIndex(0);
 setIsFlipped(false);
 toast.success("Oke, materinya udah diacak!");
 };

 /**
 * Navigates to the next flashcard.
 */
 const handleNextCard = () => {
 if (currentIndex < flashcardItems.length - 1) {
 setCurrentIndex(prev => prev + 1);
 setIsFlipped(false);
 }
 };

 /**
 * Navigates to the previous flashcard.
 */
 const handlePrevCard = () => {
 if (currentIndex > 0) {
 setCurrentIndex(prev => prev - 1);
 setIsFlipped(false);
 }
 };

 // Render fallback message if no items are provided
 if (!items || items.length === 0) {
 return (
 <div className="px-8 py-20 text-center text-muted-foreground font-medium italic bg-[hsl(var(--card)/0.2)] rounded-6xl border border-border glass">
 Belum ada data tersedia untuk cheatsheet ini.
 </div>
 );
 }

 return (
 <div className="space-y-8 w-full">
 {/* Tab Switcher */}
 <div className="flex flex-wrap items-center justify-between gap-4 pb-2 border-b border-border/40 font-sans">
 <div className="flex items-center gap-2 p-1 rounded-full border border-border/50 bg-muted/20 backdrop-blur-md">
 <Button
 id="view-mode-table"
 type="button"
 variant="ghost"
 size="sm"
 onClick={() => setViewMode("table")}
 className={cn(
 "rounded-full gap-2 text-xs font-mono font-bold px-4 h-9 transition-all",
 viewMode === "table" ? "bg-amber-500 text-amber-950 font-black shadow-sm" : "text-muted-foreground hover:text-foreground"
 )}
 aria-label="Tampilan Tabel"
 >
 <LayoutGrid size={14} /> Tabel Data
 </Button>
 <Button
 id="view-mode-flashcard"
 type="button"
 variant="ghost"
 size="sm"
 onClick={() => setViewMode("flashcard")}
 className={cn(
 "rounded-full gap-2 text-xs font-mono font-bold px-4 h-9 transition-all",
 viewMode === "flashcard" ? "bg-amber-500 text-amber-950 font-black shadow-sm" : "text-muted-foreground hover:text-foreground"
 )}
 aria-label="Tampilan Flashcard Mode"
 >
 <Layers size={14} /> Flashcard Mode ({items.length})
 </Button>
 </div>

 <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
 <Info size={14} className="text-amber-500" />
 {viewMode === "table" && "Tabel data referensi ringkas & padat."}
 {viewMode === "flashcard" && "Uji hafalan dengan mode kuis interaktif."}
 </div>
 </div>

 {/* Render Berdasarkan Tampilan Terpilih */}
 <AnimatePresence mode="wait">
 {/* 1. VIEW MODE: PURE DATA TABLE */}
 {viewMode === "table" && (
 <m.div
 key="table-view"
 initial={{ opacity: 0, y: 15 }}
 animate={{ opacity: 1, y: 0 }}
 exit={{ opacity: 0, y: -15 }}
 transition={{ duration: 0.3 }}
 className="w-full overflow-x-auto font-sans"
 >
 <table className="w-full min-w-160 text-left border-collapse">
 <thead>
 <tr className="border-b-2 border-border/80 text-[10px] font-mono font-black uppercase tracking-widest text-muted-foreground/80 bg-muted/20">
 <th className="py-3 px-4 w-12 text-center">NO</th>
 <th className="py-3 px-4 w-52">TULISAN JEPANG</th>
 <th className="py-3 px-4 w-48">ROMAJI</th>
 <th className="py-3 px-4">ARTI / PENJELASAN</th>
 </tr>
 </thead>
 <tbody className="divide-y divide-border/30 font-sans">
 {items.map((item, idx) => (
 <tr 
 key={`${item.jp}-${idx}`} 
 className="hover:bg-amber-500/5 transition-colors group"
 >
 {/* NO */}
 <td className="py-3.5 px-4 font-mono text-xs font-bold text-muted-foreground/60 text-center align-top">
 {String(idx + 1).padStart(2, '0')}
 </td>

 {/* JEPANG */}
 <td className="py-3.5 px-4 font-japanese font-black text-lg text-foreground group-hover:text-amber-400 transition-colors align-top">
 {item.jp}
 </td>

 {/* ROMAJI */}
 <td className="py-3.5 px-4 text-xs font-mono font-bold text-amber-500 uppercase tracking-wider align-top">
 {item.romaji}
 </td>

 {/* ARTI */}
 <td className="py-3.5 px-4 text-xs sm:text-sm text-foreground/90 font-medium leading-relaxed align-top">
 {formatLabel(item.label)}
 </td>
 </tr>
 ))}
 </tbody>
 </table>
 </m.div>
 )}

 {/* 3. VIEW MODE: FLASHCARD QUIZ (Fixed 3D Flipping & Overlap with CSS styles) */}
 {viewMode === "flashcard" && (
 <m.div
 key="flashcard-view"
 initial={{ opacity: 0, y: 15 }}
 animate={{ opacity: 1, y: 0 }}
 exit={{ opacity: 0, y: -15 }}
 transition={{ duration: 0.3 }}
 className="flex flex-col items-center gap-8 max-w-2xl mx-auto w-full no-print"
 >
 {/* Header Flashcards */}
 <div className="flex items-center justify-between w-full border-b border-border pb-4">
 <span className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground">
 Kuis Kartu: {currentIndex + 1} / {flashcardItems.length}
 </span>
 <Button
 id="shuffle-flashcards"
 type="button"
 variant="outline"
 size="sm"
 onClick={handleShuffle}
 className="gap-2 rounded-lg text-xs font-bold border-border bg-card hover:bg-primary/10 hover:text-primary transition-colors"
 aria-label="Acak urutan kartu"
 >
 <Shuffle size={14} /> Acak Kartu
 </Button>
 </div>

 {/* Area Flashcard Interaktif 3D */}
 <div 
 id="flashcard-touch-area"
 onClick={() => setIsFlipped(!isFlipped)}
 className="w-full h-120 md:h-112 rounded-2xl cursor-pointer relative select-none group"
 style={{ perspective: "1000px" }}
 >
 <div 
 className="w-full h-full relative rounded-2xl transition-transform duration-700 shadow-md border border-border/50 dark:border-white/10 bg-card"
 style={{ 
 transformStyle: "preserve-3d", 
 transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)"
 }}
 >
 {/* SISI DEPAN (Jepang saja) */}
 <div 
 className="absolute inset-0 flex flex-col items-center justify-center p-6 md:p-8 text-center gap-6"
 style={{ 
 backfaceVisibility: "hidden", 
 WebkitBackfaceVisibility: "hidden" 
 }}
 >
 <div className="text-[10px] font-black text-muted-foreground/45 uppercase tracking-[0.3em]">
 Bahasa Jepang (Ketuk untuk Jawaban)
 </div>
 <div className="text-5xl md:text-7xl font-japanese font-black text-foreground tracking-tighter leading-snug">
 {flashcardItems[currentIndex]?.jp}
 </div>
 <div className="flex items-center gap-2 text-xs font-bold text-primary bg-primary/10 px-4 py-1.5 rounded-[4px] border border-primary/20 mt-4">
 <Eye size={14} /> Tampilkan Detail
 </div>
 </div>

 {/* SISI BELAKANG (Detail & Arti) */}
 <div 
 className="absolute inset-0 flex flex-col items-center justify-between p-6 md:p-8 text-center bg-card rounded-2xl border border-border/50 dark:border-white/10 shadow-sm"
 style={{ 
 backfaceVisibility: "hidden", 
 WebkitBackfaceVisibility: "hidden",
 transform: "rotateY(180deg)" 
 }}
 >
 <div className="text-[10px] font-black text-primary uppercase tracking-[0.3em]">
 Kunci Arti & Penjelasan
 </div>

 <div className="flex-1 flex flex-col items-center justify-center gap-3 py-4 max-w-md">
 <div className="text-3xl md:text-4xl font-japanese font-black text-foreground tracking-tight leading-[1.6]">
 <SmartJapanese 
 word={flashcardItems[currentIndex]?.jp || ""} 
 furigana={wanakana.toHiragana(flashcardItems[currentIndex]?.romaji || "")} 
 />
 </div>
 <div className="text-[11px] font-black text-primary uppercase tracking-widest italic leading-none">
 {flashcardItems[currentIndex]?.romaji}
 </div>
 <div className="text-sm md:text-base font-bold text-foreground leading-relaxed mt-2 line-clamp-4">
 {formatLabel(flashcardItems[currentIndex]?.label)}
 </div>
 </div>

 <div className="flex items-center gap-2 text-[10px] font-semibold text-muted-foreground/50">
 <EyeOff size={12} /> Ketuk untuk melihat depan
 </div>
 </div>
 </div>
 </div>

 {/* Navigasi & Progres Bar */}
 <div className="w-full space-y-6">
 {/* Progres Bar Visual */}
 <div className="w-full h-1 bg-muted rounded-[4px] overflow-hidden">
 <div 
 className="h-full bg-primary transition-all duration-500"
 style={{ width: `${((currentIndex + 1) / flashcardItems.length) * 100}%` }}
 />
 </div>

 {/* Tombol Navigasi */}
 <div className="flex items-center justify-between">
 <Button
 id="flashcard-prev"
 type="button"
 variant="outline"
 size="icon"
 className="w-10 h-10 rounded-lg border-border bg-card hover:bg-primary/10 hover:text-primary disabled:opacity-30 disabled:pointer-events-none transition-colors"
 onClick={handlePrevCard}
 disabled={currentIndex === 0}
 aria-label="Kartu sebelumnya"
 >
 <ChevronLeft size={20} />
 </Button>

 <div className="text-xs font-black text-muted-foreground/70 uppercase tracking-widest">
 Materi <span className="text-foreground">{currentIndex + 1}</span> dari {flashcardItems.length}
 </div>

 <Button
 id="flashcard-next"
 type="button"
 variant="outline"
 size="icon"
 className="w-10 h-10 rounded-lg border-border bg-card hover:bg-primary/10 hover:text-primary disabled:opacity-30 disabled:pointer-events-none transition-colors"
 onClick={handleNextCard}
 disabled={currentIndex === flashcardItems.length - 1}
 aria-label="Kartu berikutnya"
 >
 <ChevronRight size={20} />
 </Button>
 </div>
 </div>
 </m.div>
 )}
 </AnimatePresence>
 </div>
 );
}