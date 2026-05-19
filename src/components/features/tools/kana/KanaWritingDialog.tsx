"use client";

import { motion, AnimatePresence } from "framer-motion";
import { PenTool, Sparkles } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import WritingCanvas from "@/components/features/tools/writing/WritingCanvas";
import { KanaType } from "./kana-data";

interface KanaWritingDialogProps {
  selectedChar: { char: string; romaji: string } | null;
  setSelectedChar: (char: { char: string; romaji: string } | null) => void;
  type: KanaType;
  themeColor: string;
  themeBorder: string;
}

export function KanaWritingDialog({
  selectedChar,
  setSelectedChar,
  type,
  themeColor,
  themeBorder,
}: KanaWritingDialogProps) {
  const isHira = type === "hiragana";

  return (
    <Dialog
      open={!!selectedChar}
      onOpenChange={(open) => !open && setSelectedChar(null)}
    >
      <DialogContent className="max-w-md p-0 border-none bg-transparent shadow-none">
        <AnimatePresence>
          {selectedChar && (
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className={`relative bg-card p-5 md:p-8 rounded-2xl border ${themeBorder} shadow-2xl max-w-[95vw] sm:max-w-md w-full max-h-[90vh] flex flex-col mx-auto overflow-y-auto custom-scrollbar`}
            >
              <div className="relative z-10 flex flex-col h-full">
                <header className="flex items-center gap-3 mb-5 sm:mb-6 pr-10 shrink-0">
                  <div
                    className={`w-10 h-10 shrink-0 rounded-xl ${isHira ? "bg-primary/10" : "bg-secondary/10"} border ${themeBorder} flex items-center justify-center shadow-sm`}
                  >
                    <PenTool size={18} className={themeColor} />
                  </div>
                  <DialogHeader className="p-0">
                    <span
                      className={`font-mono uppercase tracking-[0.2em] text-xs sm:text-xs font-black ${themeColor} block leading-none mb-1.5 text-left`}
                    >
                      Latihan Menulis
                    </span>
                    <DialogTitle className="text-foreground text-lg sm:text-xl font-black uppercase tracking-tight leading-none text-left">
                      Cara Menulis
                    </DialogTitle>
                  </DialogHeader>
                </header>

                <div className="bg-muted p-4 sm:p-5 rounded-xl border border-border flex justify-between items-center mb-6 shrink-0">
                  <div className="flex items-center gap-4">
                    <p className="text-4xl sm:text-5xl font-black text-foreground font-japanese leading-none">
                      {selectedChar!.char}
                    </p>
                    <p
                      className={`font-mono uppercase tracking-widest text-[10px] sm:text-sm font-bold ${themeColor}`}
                    >
                      &quot;{selectedChar!.romaji}&quot;
                    </p>
                  </div>
                  <div
                    className={`px-3 py-1.5 rounded-lg bg-background border border-border text-[8px] sm:text-xs font-bold uppercase tracking-widest ${themeColor}`}
                  >
                    Sistem {type}
                  </div>
                </div>

                <div className="w-full flex-1 flex flex-col justify-center min-h-[300px] mb-2 bg-background rounded-xl border border-border overflow-hidden">
                  <WritingCanvas 
                    character={selectedChar!.char} 
                    strokeColor={isHira ? "rgb(var(--primary-rgb))" : "rgb(var(--secondary-rgb))"}
                    guideColor={isHira ? "rgb(var(--primary-rgb))" : "rgb(var(--secondary-rgb))"}
                  />
                </div>

                <p className="text-center text-xs text-muted-foreground font-bold uppercase tracking-[0.2em] mt-4 shrink-0">
                  <Sparkles size={10} className="inline mr-1 text-primary" />{" "}
                  Yuk, coba tulis huruf ini di kanvas!
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}
