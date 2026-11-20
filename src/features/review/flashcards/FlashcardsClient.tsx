"use client";

import React, { Suspense } from "react";
import { m, AnimatePresence } from "framer-motion";
import {
  Zap,
  Restart,
  ChevronLeft,
  Fire,
  Pencil,
  Mic,
  BookOpen,
} from "@/components/ui/icons";
import FlashcardMaster from "@/features/review/flashcards/master/FlashcardMaster";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useFlashcardSession } from "@/features/review/flashcards/useFlashcardSession";
import { FlashcardSetup } from "@/features/review/flashcards/FlashcardSetup";

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
        <m.div
          key="loading-cards"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="flex-1 flex flex-col items-center justify-center px-4"
        >
          <Restart className="text-primary animate-spin mb-4" size={32} />
          <p className="text-muted-foreground font-mono uppercase tracking-widest text-xs font-bold">
            Mengumpulkan kartu...
          </p>
        </m.div>
      ) : !selectedMode ? (
        <FlashcardSetup
          defaultLevel={categorySlug?.toUpperCase() || null}
          defaultMode={modeParam}
          onStart={fetchCardsAndStart}
        />
      ) : (
        <m.div
          key="session"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          className="flex-1 w-full px-4 md:px-8 relative overflow-hidden flex flex-col items-center"
        >
          <div className="relative z-10 w-full max-w-2xl mt-4 sm:mt-8">
            <header className="flex justify-between items-center mb-10">
              <Button
                onClick={() => setSelectedMode(null)}
                variant="ghost"
                className="text-muted-foreground hover:text-foreground text-xs font-bold uppercase tracking-widest bg-muted/50 h-auto px-4 py-2.5 rounded-xl border border-border"
              >
                <ChevronLeft size={14} className="mr-2" /> Ganti Mode
              </Button>
              <Badge
                variant="outline"
                className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest flex items-center gap-2 h-auto ${
                  selectedMode === "kanji"
                    ? "bg-secondary/10 border-secondary/30 text-secondary"
                    : selectedMode === "survival"
                    ? "bg-destructive/10 border-destructive/30 text-destructive"
                    : selectedMode === "pronunciation"
                    ? "bg-warning/10 border-warning/30 text-warning"
                    : selectedMode === "sentence"
                    ? "bg-success/10 border-success/30 text-success"
                    : "bg-primary/10 border-primary/30 text-primary"
                }`}
              >
                {selectedMode === "survival" ? (
                  <Fire size={16} />
                ) : selectedMode === "kanji" ? (
                  <Pencil size={16} />
                ) : selectedMode === "pronunciation" ? (
                  <Mic size={16} />
                ) : selectedMode === "sentence" ? (
                  <BookOpen size={16} />
                ) : (
                  <Zap size={16} />
                )}
                <span>
                  Mode{" "}
                  {selectedMode === "pronunciation"
                    ? "pelafalan"
                    : selectedMode === "sentence"
                    ? "kalimat"
                    : selectedMode}
                </span>
              </Badge>
            </header>

            <FlashcardMaster
              key={cards[0]?.id}
              cards={cards}
              type={selectedMode === "kanji" ? "kanji" : "vocab"}
              mode={
                selectedMode === "survival"
                  ? "tantangan"
                  : selectedMode === "pronunciation"
                  ? "pelafalan"
                  : "latihan"
              }
              isFixedMode={true}
            />
          </div>
        </m.div>
      )}
    </AnimatePresence>
  );
}

export default function FlashcardsClient() {
  return (
    <Suspense
      fallback={
        <div className="flex-1 flex flex-col items-center justify-center px-4">
          <Restart className="text-primary animate-spin mb-4" size={32} />
          <p className="text-muted-foreground font-mono uppercase tracking-widest text-xs font-bold">
            Memuat Modul...
          </p>
        </div>
      }
    >
      <FlashcardsContent />
    </Suspense>
  );
}
