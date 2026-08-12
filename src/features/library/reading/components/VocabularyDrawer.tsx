"use client";

/**
 * @file VocabularyDrawer.tsx
 * @description Slide-over sheet untuk daftar kosakata yang terkumpul selama membaca.
 */

import { AnimatePresence, m } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ReadingVocabularyCollector } from "@/features/library/reading/components/ReadingVocabularyCollector";

interface VocabularyDrawerProps {
  /** Status drawer terbuka. */
  open: boolean;
  /** Callback menutup drawer. */
  onClose: () => void;
  /** ID lesson/sumber untuk kolektor kosakata. */
  lessonId?: string;
}

/**
 * Kosakata Slide-Over Sheet Drawer.
 */
export function VocabularyDrawer({ open, onClose, lessonId }: VocabularyDrawerProps) {
  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <m.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-100 cursor-pointer"
          />
          {/* Panel Drawer */}
          <m.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 bottom-0 w-full sm:w-105 bg-background/95 border-l border-border z-101 shadow-2xl p-6 overflow-y-auto glass flex flex-col"
          >
            <div className="flex items-center justify-between border-b border-border/40 pb-4 mb-4">
              <div className="flex items-center gap-2">
                <span className="text-xs font-black uppercase tracking-widest text-foreground">
                  Kosakata Terkumpul
                </span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="rounded-xl text-[10px] font-black uppercase h-8"
              >
                Tutup
              </Button>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar">
              {lessonId && <ReadingVocabularyCollector sourceId={lessonId} />}
            </div>
          </m.div>
        </>
      )}
    </AnimatePresence>
  );
}
