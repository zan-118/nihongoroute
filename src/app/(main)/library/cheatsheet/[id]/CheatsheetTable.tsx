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
  List, 
  Layers, 
  ChevronLeft, 
  ChevronRight, 
  Shuffle, 
  Eye, 
  EyeOff, 
  Info
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { m, AnimatePresence } from "framer-motion";
import * as wanakana from "wanakana";
import { SmartJapanese } from "@/components/ui/SmartJapanese";
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
      <div className="px-8 py-20 text-center text-muted-foreground font-medium italic bg-[rgba(var(--card-rgb),0.2)] rounded-[3rem] border border-border glass">
        Belum ada data tersedia untuk cheatsheet ini.
      </div>
    );
  }

  return (
    <div className="space-y-8 w-full">
      {/* Pengontrol Mode Tampilan (Premium Tab Switcher) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-3 rounded-[2rem] border border-border bg-[rgba(var(--card-rgb),0.1)]  w-full no-print glass">
        <div className="flex items-center gap-1.5 p-1 bg-[rgba(var(--muted-rgb),0.2)] rounded-lg w-fit">
          <Button
            id="view-mode-table"
            type="button"
            variant={viewMode === "table" ? "secondary" : "ghost"}
            size="sm"
            onClick={() => setViewMode("table")}
            className={cn("rounded-xl gap-2 font-bold px-5 py-4", viewMode === "table" && "shadow-sm")}
            aria-label="Tampilan Tabel"
          >
            <List size={16} /> Tabel Referensi
          </Button>
          <Button
            id="view-mode-flashcard"
            type="button"
            variant={viewMode === "flashcard" ? "secondary" : "ghost"}
            size="sm"
            onClick={() => setViewMode("flashcard")}
            className={cn("rounded-xl gap-2 font-bold px-5 py-4", viewMode === "flashcard" && "shadow-sm")}
            aria-label="Tampilan Kuis Flashcard"
          >
            <Layers size={16} /> Mode Kuis
          </Button>
        </div>

        <div className="flex items-center gap-2 text-xs text-muted-foreground font-semibold px-4">
          <Info size={14} className="text-primary" />
          {viewMode === "table" && "Tinjauan cepat dan padat materi belajar."}
          {viewMode === "flashcard" && "Uji hafalanmu dengan sistem kuis flashcard interaktif."}
        </div>
      </div>

      {/* Render Berdasarkan Tampilan Terpilih */}
      <AnimatePresence mode="wait">
        {/* 1. VIEW MODE: TABLE (Fully Responsive Compact Table Implementation) */}
        {viewMode === "table" && (
          <m.div
            key="table-view"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.3 }}
            className="w-full rounded-[2rem] border border-border bg-[rgba(var(--card-rgb),0.2)]  shadow-2xl overflow-hidden glass"
          >
            {/* Header: Hanya terlihat di md ke atas */}
            <div className="hidden md:flex items-center bg-[rgba(var(--muted-rgb),0.3)] border-b border-border px-8 py-4 text-[10px] font-black uppercase tracking-widest text-primary">
              <div className="w-16 text-center">No</div>
              <div className="w-48 pl-2">Tulisan Jepang</div>
              <div className="w-48 pl-2">Romaji</div>
              <div className="flex-1 pl-2">Arti / Penjelasan</div>
            </div>

            {/* List Row Item */}
            <div className="divide-y divide-border/40">
              {items.map((item, idx) => (
                <div 
                  key={`${item.jp}-${idx}`} 
                  className="flex flex-col md:flex-row md:items-center px-6 md:px-8 py-4 hover:bg-[rgba(var(--primary-rgb),0.02)] transition-all duration-200"
                >
                  {/* Nomor Baris */}
                  <div className="md:w-16 text-left md:text-center font-bold text-muted-foreground/45 text-xs md:text-sm">
                    <span className="md:hidden font-bold text-[9px] uppercase tracking-wider text-muted-foreground/50 mr-2">No.</span>
                    {String(idx + 1).padStart(2, '0')}
                  </div>

                  {/* Tulisan Jepang */}
                  <div className="md:w-48 font-japanese font-black text-lg md:text-xl text-foreground select-all mt-2 md:mt-0 pl-0 md:pl-2">
                    {item.jp}
                  </div>

                  {/* Romaji */}
                  <div className="md:w-48 text-xs font-mono font-bold text-primary/80 uppercase tracking-wider mt-1 md:mt-0 pl-0 md:pl-2">
                    {item.romaji}
                  </div>

                  {/* Arti / Penjelasan */}
                  <div className="flex-1 text-xs md:text-sm text-foreground/95 font-semibold leading-relaxed mt-2 md:mt-0 pl-0 md:pl-2">
                    {formatLabel(item.label)}
                  </div>
                </div>
              ))}
            </div>
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
                className="gap-2 rounded-xl text-xs font-bold border-border bg-[rgba(var(--card-rgb),0.2)] hover:bg-[rgba(var(--primary-rgb),0.1)] hover:text-primary transition-colors"
                aria-label="Acak urutan kartu"
              >
                <Shuffle size={14} /> Acak Kartu
              </Button>
            </div>

            {/* Area Flashcard Interaktif 3D */}
            <div 
              id="flashcard-touch-area"
              onClick={() => setIsFlipped(!isFlipped)}
              className="w-full h-[30rem] md:h-[28rem] rounded-[3rem] cursor-pointer relative select-none group"
              style={{ perspective: "1000px" }}
            >
              <div 
                className="w-full h-full relative rounded-[3rem] transition-transform duration-700 shadow-[0_20px_50px_rgba(var(--foreground-rgb),0.05)] group-hover:shadow-[0_25px_60px_rgba(var(--primary-rgb),0.08)] border border-border glass"
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
                  <div className="flex items-center gap-2 text-xs font-bold text-primary bg-[rgba(var(--primary-rgb),0.1)] px-4 py-1.5 rounded-full border border-[rgba(var(--primary-rgb),0.2)] mt-4">
                    <Eye size={14} /> Tampilkan Detail
                  </div>
                </div>

                {/* SISI BELAKANG (Detail & Arti) */}
                <div 
                  className="absolute inset-0 flex flex-col items-center justify-between p-6 md:p-8 text-center bg-[rgba(var(--background-rgb),0.96)] rounded-[3rem] border border-[rgba(var(--primary-rgb),0.25)] shadow-inner"
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
              <div className="w-full h-2 bg-[rgba(var(--muted-rgb),0.2)] rounded-full overflow-hidden">
                <div 
                  className="h-full bg-primary transition-all duration-500 shadow-[0_0_10px_rgba(var(--primary-rgb),0.5)]"
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
                  className="w-12 h-12 rounded-full border-border bg-[rgba(var(--card-rgb),0.2)] hover:bg-[rgba(var(--primary-rgb),0.1)] hover:text-primary disabled:opacity-30 disabled:pointer-events-none transition-colors"
                  onClick={handlePrevCard}
                  disabled={currentIndex === 0}
                  aria-label="Kartu sebelumnya"
                >
                  <ChevronLeft size={20} />
                </Button>

                <div className="text-sm font-black text-muted-foreground/70 uppercase tracking-widest">
                  Materi <span className="text-foreground">{currentIndex + 1}</span> dari {flashcardItems.length}
                </div>

                <Button
                  id="flashcard-next"
                  type="button"
                  variant="outline"
                  size="icon"
                  className="w-12 h-12 rounded-full border-border bg-[rgba(var(--card-rgb),0.2)] hover:bg-[rgba(var(--primary-rgb),0.1)] hover:text-primary disabled:opacity-30 disabled:pointer-events-none transition-colors"
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