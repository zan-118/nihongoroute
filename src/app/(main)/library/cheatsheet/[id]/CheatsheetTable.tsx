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
  Copy, 
  List, 
  Grid, 
  Layers, 
  ChevronLeft, 
  ChevronRight, 
  Shuffle, 
  Eye, 
  EyeOff, 
  Info,
  Check
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import * as wanakana from "wanakana";
import { SmartJapanese } from "@/components/ui/SmartJapanese";
import { cn } from "@/lib/utils";

// ======================
// TIPE DATA
// ======================
interface SheetItem {
  label: string;
  jp: string;
  romaji: string;
}

interface CheatsheetTableProps {
  items: SheetItem[];
}

type ViewMode = "table" | "grid" | "flashcard";

// ======================
// EKSEKUSI UTAMA
// ======================

export function CheatsheetTable({ items }: CheatsheetTableProps) {
  const [viewMode, setViewMode] = useState<ViewMode>("table");
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  // State untuk Flashcard Mode
  const [flashcardItems, setFlashcardItems] = useState<SheetItem[]>(() => [...items]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  // Menangani format tulisan pelabelan khusus
  const formatLabel = (text: string) => {
    if (!text) return text;
    const keywords = [
      "Contoh", "Catatan", "Penting", "Fakta budaya", 
      "Perubahan fonetis", "Nuansa", "Tips", "Catatan menarik",
      "Pengecualian penting", "Batas", "Fakta budaya", "Nuansa sosial"
    ];
    
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

  // Salin teks Jepang ke clipboard
  const handleCopy = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    toast.success("Disalin ke papan klip!");
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  // Mengacak daftar flashcard
  const handleShuffle = () => {
    const shuffled = [...flashcardItems].sort(() => Math.random() - 0.5);
    setFlashcardItems(shuffled);
    setCurrentIndex(0);
    setIsFlipped(false);
    toast.success("Materi berhasil diacak!");
  };

  const handleNextCard = () => {
    if (currentIndex < flashcardItems.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setIsFlipped(false);
    }
  };

  const handlePrevCard = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
      setIsFlipped(false);
    }
  };

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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-2 rounded-[2rem] border border-border bg-[rgba(var(--card-rgb),0.1)] backdrop-blur-md w-full no-print">
        <div className="flex items-center gap-1.5 p-1 bg-[rgba(var(--muted-rgb),0.2)] rounded-2xl w-fit">
          <Button
            id="view-mode-table"
            type="button"
            variant={viewMode === "table" ? "secondary" : "ghost"}
            size="sm"
            onClick={() => setViewMode("table")}
            className={cn("rounded-xl gap-2 font-bold px-4", viewMode === "table" && "shadow-sm")}
            aria-label="Tampilan Tabel"
          >
            <List size={16} /> Tabel
          </Button>
          <Button
            id="view-mode-grid"
            type="button"
            variant={viewMode === "grid" ? "secondary" : "ghost"}
            size="sm"
            onClick={() => setViewMode("grid")}
            className={cn("rounded-xl gap-2 font-bold px-4", viewMode === "grid" && "shadow-sm")}
            aria-label="Tampilan Kartu"
          >
            <Grid size={16} /> Kartu
          </Button>
          <Button
            id="view-mode-flashcard"
            type="button"
            variant={viewMode === "flashcard" ? "secondary" : "ghost"}
            size="sm"
            onClick={() => setViewMode("flashcard")}
            className={cn("rounded-xl gap-2 font-bold px-4", viewMode === "flashcard" && "shadow-sm")}
            aria-label="Tampilan Kuis Flashcard"
          >
            <Layers size={16} /> Mode Kuis
          </Button>
        </div>

        <div className="flex items-center gap-2 text-xs text-muted-foreground font-semibold px-4">
          <Info size={14} className="text-primary" />
          {viewMode === "table" && "Gunakan tabel untuk tinjauan menyeluruh."}
          {viewMode === "grid" && "Gunakan kartu untuk mempermudah pemetaan visual."}
          {viewMode === "flashcard" && "Uji hafalanmu dengan sistem flashcard interaktif."}
        </div>
      </div>

      {/* Render Berdasarkan Tampilan Terpilih */}
      <AnimatePresence mode="wait">
        {/* 1. VIEW MODE: TABLE (Fully Responsive Flex/Grid Implementation) */}
        {viewMode === "table" && (
          <motion.div
            key="table-view"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.3 }}
            className="w-full rounded-[2.5rem] border border-border bg-[rgba(var(--card-rgb),0.2)] backdrop-blur-md shadow-2xl overflow-hidden glass"
          >
            {/* Header: Hanya terlihat di md ke atas */}
            <div className="hidden md:flex items-center bg-[rgba(var(--muted-rgb),0.3)] border-b border-border px-8 py-5 text-[10px] font-black uppercase tracking-widest text-primary">
              <div className="w-16 text-center">No</div>
              <div className="flex-1">Materi Bahasa Jepang</div>
              <div className="w-24 text-right">Aksi</div>
            </div>

            {/* List Row Item */}
            <div className="divide-y divide-border/40">
              {items.map((item, idx) => (
                <div 
                  key={`${item.jp}-${idx}`} 
                  className="flex flex-col md:flex-row md:items-center gap-4 md:gap-0 px-6 md:px-8 py-6 group hover:bg-[rgba(var(--primary-rgb),0.02)] transition-all duration-300"
                >
                  {/* Nomor Baris */}
                  <div className="md:w-16 text-left md:text-center font-black text-muted-foreground/30 text-xs md:text-sm italic group-hover:text-primary transition-colors flex items-center gap-2 md:block">
                    <span className="md:hidden not-italic font-bold text-[9px] uppercase tracking-wider text-muted-foreground">No.</span>
                    {String(idx + 1).padStart(2, '0')}
                  </div>

                  {/* Isi Konten */}
                  <div className="flex-1 space-y-3">
                    <div className="flex flex-col gap-1">
                      <div className="text-2xl md:text-3xl font-japanese font-black text-foreground tracking-tighter leading-[1.6]">
                        <SmartJapanese 
                          word={item.jp || ""} 
                          furigana={wanakana.toHiragana(item.romaji || "")} 
                        />
                      </div>
                      <div className="text-[10px] font-black text-primary uppercase tracking-[0.2em] italic opacity-90">
                        {item.romaji}
                      </div>
                    </div>
                    <div className="text-sm md:text-base font-semibold text-foreground leading-relaxed group-hover:text-primary transition-colors">
                      {formatLabel(item.label)}
                    </div>
                  </div>

                  {/* Opsi / Aksi */}
                  <div className="md:w-24 flex md:block justify-end items-center border-t border-border/10 pt-4 md:pt-0 md:border-none">
                    <Button 
                      id={`copy-btn-table-${idx}`}
                      variant="ghost" 
                      size="icon"
                      className="w-10 h-10 rounded-xl hover:bg-[rgba(var(--primary-rgb),0.1)] hover:text-primary text-muted-foreground transition-all"
                      aria-label={`Salin tulisan ${item.jp}`}
                      onClick={() => handleCopy(item.jp, idx)}
                    >
                      {copiedIndex === idx ? (
                        <Check size={18} className="text-success animate-scale" aria-hidden="true" />
                      ) : (
                        <Copy size={16} aria-hidden="true" />
                      )}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* 2. VIEW MODE: GRID CARDS */}
        {viewMode === "grid" && (
          <motion.div
            key="grid-view"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {items.map((item, idx) => (
              <Card 
                key={`${item.jp}-${idx}`} 
                className="group relative bg-[rgba(var(--card-rgb),0.3)] border border-border hover:border-[rgba(var(--primary-rgb),0.4)] rounded-[2rem] p-6 flex flex-col justify-between gap-6 transition-all duration-500 hover:shadow-[0_15px_40px_rgba(var(--primary-rgb),0.1)] glass"
              >
                <div className="absolute top-4 right-4 z-20">
                  <Button 
                    id={`copy-btn-grid-${idx}`}
                    variant="ghost" 
                    size="icon"
                    className="w-9 h-9 rounded-lg bg-[rgba(var(--muted-rgb),0.2)] border border-border hover:bg-[rgba(var(--primary-rgb),0.1)] hover:text-primary text-muted-foreground transition-all"
                    aria-label={`Salin tulisan ${item.jp}`}
                    onClick={() => handleCopy(item.jp, idx)}
                  >
                    {copiedIndex === idx ? (
                      <Check size={16} className="text-success" aria-hidden="true" />
                    ) : (
                      <Copy size={14} aria-hidden="true" />
                    )}
                  </Button>
                </div>

                <div className="space-y-4">
                  <div className="text-[10px] font-black text-muted-foreground/40 italic">
                    REF #{String(idx + 1).padStart(2, '0')}
                  </div>

                  <div className="flex flex-col gap-1">
                    <div className="text-3xl font-japanese font-black text-foreground leading-[1.6]">
                      <SmartJapanese 
                        word={item.jp || ""} 
                        furigana={wanakana.toHiragana(item.romaji || "")} 
                      />
                    </div>
                    <span className="text-[10px] font-black text-primary uppercase tracking-widest italic leading-none">
                      {item.romaji}
                    </span>
                  </div>

                  <div className="text-sm font-semibold text-muted-foreground leading-relaxed pt-2 border-t border-[rgba(var(--border-rgb),0.1)]">
                    {formatLabel(item.label)}
                  </div>
                </div>

                <div className="text-[8px] font-black text-muted-foreground/30 uppercase tracking-widest">
                  NihongoRoute Lexical System
                </div>
              </Card>
            ))}
          </motion.div>
        )}

        {/* 3. VIEW MODE: FLASHCARD QUIZ (Fixed 3D Flipping & Overlap with CSS styles) */}
        {viewMode === "flashcard" && (
          <motion.div
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
              className="w-full h-[26rem] md:h-[24rem] rounded-[3rem] cursor-pointer relative select-none group"
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
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
