/**
 * @file KanaWritingDialog.tsx
 * @description Interactive stroke writing dialog component for Kana practice (Hiragana/Katakana) utilizing integrated offline-first stroke canvas.
 */

// Import & Dependencies

import { m, AnimatePresence } from "framer-motion";
import React, { useCallback, useRef, useEffect } from "react";
import { Pencil, VolumeUp } from "@/components/ui/icons";
import {
 Dialog,
 DialogContent,
 DialogHeader,
 DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import WritingCanvas from "@/features/tools/stroke-canvas/WritingCanvas";
import { fetchTTSAudio, speakWithWebSpeech } from "@/lib/audio/tts";
import { KanaType } from "./kana-data";

// Component Props Interface

/**
 * Props for KanaWritingDialog component.
 */
interface KanaWritingDialogProps {
 /** Selected character data. Null hides dialog. */
 selectedChar: { char: string; romaji: string } | null;
 /** State setter for selected character. */
 setSelectedChar: (char: { char: string; romaji: string } | null) => void;
 /** Kana type. Hiragana or katakana. */
 type: KanaType;
 /** CSS class for text/icon color. */
 themeColor: string;
 /** CSS class for border color. */
 themeBorder: string;
}

// Main Component

/**
 * Dialog component for interactive kana writing practice.
 * Uses canvas to draw and trace characters.
 */
export function KanaWritingDialog({
 selectedChar,
 setSelectedChar,
 type,
 themeColor,
 themeBorder,
}: KanaWritingDialogProps) {
 // Check if hiragana. Determine color scheme.
 const isHira = type === "hiragana";
 
  // Audio element reference for Edge TTS playback
  const audioRef = useRef<HTMLAudioElement | null>(null);

  /**
   * Putar audio pelafalan karakter kana aktif menggunakan Edge TTS.
   */
  const speakKana = useCallback(async () => {
    if (!selectedChar?.char) return;

    try {
      const ttsUrl = await fetchTTSAudio(selectedChar.char, "indah");
      if (ttsUrl) {
        if (!audioRef.current) {
          audioRef.current = new Audio();
        }
        audioRef.current.src = ttsUrl;
        await audioRef.current.play();
        return;
      }
    } catch (err) {
      console.warn("[Kana Writing] Gagal memutar Edge TTS, beralih ke Web Speech fallback:", err);
    }

    // Fallback: Web Speech API
    speakWithWebSpeech(selectedChar.char, "indah", 0.9);
  }, [selectedChar]);

  // Cleanup audio on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

 // RENDER KOMPONEN

 return (
 <Dialog
 // Open when character selected.
 open={!!selectedChar}
 // Clear selection on close.
 onOpenChange={(open) => !open && setSelectedChar(null)}
 >
 <DialogContent className="max-w-md p-0 border-none bg-transparent shadow-none">
 <AnimatePresence>
 {selectedChar && (
 <m.div
 initial={{ scale: 0.95, opacity: 0, y: 20 }}
 animate={{ scale: 1, opacity: 1, y: 0 }}
 exit={{ scale: 0.95, opacity: 0, y: 20 }}
 className={`relative bg-card p-5 md:p-8 rounded-lg border ${themeBorder} shadow-2xl max-w-[95vw] sm:max-w-md w-full max-h-[90vh] flex flex-col mx-auto overflow-y-auto custom-scrollbar`}
 >
 <div className="relative z-10 flex flex-col h-full">
 <header className="flex items-center gap-3 mb-5 sm:mb-6 pr-10 shrink-0">
 <div
 className={`w-10 h-10 shrink-0 rounded-xl ${isHira ? "bg-primary/10" : "bg-secondary/10"} border ${themeBorder} flex items-center justify-center shadow-sm`}
 >
 <Pencil size={18} className={themeColor} />
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
 <div>
 <p
 className={`font-mono uppercase tracking-widest text-[10px] sm:text-sm font-bold ${themeColor}`}
 >
 &quot;{selectedChar!.romaji}&quot;
 </p>
 <Button
 type="button"
 variant="ghost"
 size="sm"
 onClick={speakKana}
 className="h-6 px-1.5 mt-1 text-[9px] font-bold gap-1 text-muted-foreground hover:text-foreground"
 >
 <VolumeUp size={12} className="text-primary" />
 <span>Dengar</span>
 </Button>
 </div>
 </div>
 <div
 className={`px-3 py-1.5 rounded-lg bg-background border border-border text-[8px] sm:text-xs font-bold uppercase tracking-widest ${themeColor}`}
 >
 Sistem {type}
 </div>
 </div>

 <div className="w-full flex-1 flex flex-col justify-center min-h-75 mb-2 bg-background rounded-xl border border-border overflow-hidden">
 {/* Canvas for drawing. Pass character and theme colors. */}
 <WritingCanvas 
 character={selectedChar!.char} 
 strokeColor={isHira ? "hsl(var(--primary))" : "hsl(var(--secondary))"}
 guideColor={isHira ? "hsl(var(--primary))" : "hsl(var(--secondary))"}
 />
 </div>

 <p className="text-center text-xs text-muted-foreground font-bold uppercase tracking-[0.2em] mt-4 shrink-0">
 {" "}
 Yuk, coba tulis huruf ini di kanvas!
 </p>
 </div>
 </m.div>
 )}
 </AnimatePresence>
 </DialogContent>
 </Dialog>
 );
}