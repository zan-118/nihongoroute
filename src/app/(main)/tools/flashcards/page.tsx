/**
 * @file app/(main)/tools/flashcards/page.tsx
 * @description Pusat Latihan Flashcard (General Flashcards).
 * Orchestrator untuk pemilihan kategori, mode, dan sesi latihan.
 */

"use client";

// ======================
// IMPOR
// ======================
import React, { Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Zap, 
  RotateCw, 
  ChevronLeft, 
  Flame,
  PenTool,
  Mic
} from "lucide-react";
import FlashcardMaster from "@/components/features/flashcards/master/FlashcardMaster";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

// Hook & Komponen Modular
import { useFlashcardSession } from "@/components/features/flashcards/useFlashcardSession";
import { FlashcardSetup } from "@/components/features/flashcards/FlashcardSetup";

function FlashcardsContent() {
  const {
    categorySlug,
    modeParam,
    selectedMode,
    setSelectedMode,
    cards,
    isFetchingCards,
    fetchCardsAndStart,
  } = useFlashcardSession();

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
          defaultMode={modeParam}
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
              <Badge variant="outline" className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest flex items-center gap-2 h-auto ${
                selectedMode === "kanji" ? "bg-secondary/10 border-secondary/30 text-secondary" : 
                selectedMode === "survival" ? "bg-destructive/10 border-destructive/30 text-destructive" : 
                selectedMode === "pronunciation" ? "bg-warning/10 border-warning/30 text-warning" :
                "bg-primary/10 border-primary/30 text-primary"
              }`}>
                {selectedMode === "survival" ? <Flame size={16} /> : 
                 selectedMode === "kanji" ? <PenTool size={16} /> : 
                 selectedMode === "pronunciation" ? <Mic size={16} /> :
                 <Zap size={16} />}
                <span>Mode {selectedMode === "pronunciation" ? "pelafalan" : selectedMode}</span>
              </Badge>
            </header>

            <FlashcardMaster
              key={cards[0]?.id}
              cards={cards}
              type={selectedMode === "kanji" ? "kanji" : "vocab"}
              mode={selectedMode === "survival" ? "tantangan" : selectedMode === "pronunciation" ? "pelafalan" : "latihan"}
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
