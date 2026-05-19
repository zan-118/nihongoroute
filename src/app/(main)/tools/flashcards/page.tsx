/**
 * @file app/(main)/tools/flashcards/page.tsx
 * @description Pusat Latihan Flashcard (General Flashcards).
 * Orchestrator untuk pemilihan kategori, mode, dan sesi latihan.
 */

"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getFlashcardsByMode } from "@/actions/flashcard.actions";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Zap, 
  RotateCw, 
  ChevronLeft, 
  Flame,
  PenTool
} from "lucide-react";
import FlashcardMaster from "@/components/features/flashcards/master/FlashcardMaster";
import { MasterCardData } from "@/components/features/flashcards/master/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

// Modular Components
import { FlashcardSetup } from "@/components/features/flashcards/FlashcardSetup";

type ModeLatihan = "vocab" | "kanji" | "survival";

function FlashcardsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const categorySlug = searchParams.get("category");

  const [selectedLevel, setSelectedLevel] = useState<string | "all" | null>(null);
  const [selectedMode, setSelectedMode] = useState<ModeLatihan | null>(null);
  const [cards, setCards] = useState<MasterCardData[]>([]);
  const [isFetchingCards, setIsFetchingCards] = useState(false);
  const [hasAutoFetched, setHasAutoFetched] = useState(false);

  // Trigger otomatis jika masuk via URL ?category=slug
  useEffect(() => {
    if (categorySlug && !hasAutoFetched) {
      requestAnimationFrame(() => {
        setHasAutoFetched(true);
        setSelectedLevel(categorySlug.toUpperCase());
      });
    }
  }, [categorySlug, hasAutoFetched]);

  const fetchCardsAndStart = async (level: string, mode: ModeLatihan, amount: number) => {
    setIsFetchingCards(true);
    setSelectedLevel(level);
    setSelectedMode(mode);
      try {
        let combined: MasterCardData[] = [];
        const data = await getFlashcardsByMode(mode, level, amount);

        if (mode === "kanji") {
          combined = data.map((k: any) => ({
            id: k.id,
            docType: "kanji",
            word: k.character,
            meaning: k.meaning,
            details: { onyomi: k.onyomi || undefined, kunyomi: k.kunyomi || undefined },
            slug: k.character,
          }));
        } else {
          combined = data.map((v: any) => ({
            id: v.id,
            docType: "vocab",
            word: v.word,
            meaning: v.meaning_id || "",
            romaji: v.romaji || undefined,
            furigana: v.furigana || undefined,
            slug: v.slug || undefined,
          }));
        }

      combined = combined.sort(() => Math.random() - 0.5);

      if (combined.length === 0) {
        toast.error("Moushiwake arimasen - Data kartu untuk mode ini belum tersedia.");
        setSelectedMode(null);
      } else {
        setCards(combined);
      }
    } catch (error) {
      console.error("Gagal memuat kartu:", error);
      toast.error("Terjadi kendala saat memuat kartu.");
      setSelectedMode(null);
    } finally {
      setIsFetchingCards(false);
    }
  };

  const handleBackFromMode = () => {
    if (categorySlug) {
      router.push(`/courses/${categorySlug}`);
    } else {
      setSelectedLevel(null);
      setSelectedMode(null);
    }
  };

  return (
    <AnimatePresence mode="wait">
      {isFetchingCards ? (
        <motion.div 
          key="loading-cards"
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          exit={{ opacity: 0 }} 
          className="flex-1 flex flex-col items-center justify-center px-4"
        >
          <RotateCw className="text-primary animate-spin mb-4" size={32} />
          <p className="text-muted-foreground font-mono uppercase tracking-widest text-xs animate-pulse font-bold">
            Mengumpulkan kartu...
          </p>
        </motion.div>
      ) : !selectedMode ? (
        <FlashcardSetup 
          defaultLevel={categorySlug?.toUpperCase() || null}
          onStart={fetchCardsAndStart}
        />
      ) : (
        <motion.div 
          key="session" 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          exit={{ opacity: 0, y: -20 }} 
          transition={{ duration: 0.3 }} 
          className="flex-1 w-full px-4 md:px-8 relative overflow-hidden flex flex-col items-center"
        >
          <div className="relative z-10 w-full max-w-2xl mt-4 sm:mt-8">
            <header className="flex justify-between items-center mb-10">
              <Button onClick={() => setSelectedMode(null)} variant="ghost" className="text-muted-foreground hover:text-foreground text-xs font-bold uppercase tracking-widest bg-muted/50 h-auto px-4 py-2.5 rounded-xl border border-border">
                <ChevronLeft size={14} className="mr-2" /> Ganti Mode
              </Button>
              <Badge variant="outline" className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest flex items-center gap-2 h-auto ${selectedMode === "kanji" ? "bg-secondary/10 border-secondary/30 text-secondary" : selectedMode === "survival" ? "bg-destructive/10 border-destructive/30 text-destructive" : "bg-primary/10 border-primary/30 text-primary"}`}>
                {selectedMode === "survival" ? <Flame size={16} /> : selectedMode === "kanji" ? <PenTool size={16} /> : <Zap size={16} />}
                <span>Mode {selectedMode}</span>
              </Badge>
            </header>

            <FlashcardMaster
              key={cards[0]?.id}
              cards={cards}
              type={selectedMode === "kanji" ? "kanji" : "vocab"}
              mode={selectedMode === "survival" ? "tantangan" : "latihan"}
              isFixedMode={true}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default function FlashcardsPage() {
  return (
    <Suspense fallback={
      <div className="flex-1 flex flex-col items-center justify-center px-4">
        <RotateCw className="text-primary animate-spin mb-4" size={32} />
        <p className="text-muted-foreground font-mono uppercase tracking-widest text-xs animate-pulse font-bold">
          Memuat Modul...
        </p>
      </div>
    }>
      <FlashcardsContent />
    </Suspense>
  );
}
