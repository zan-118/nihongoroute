/**
 * @file WritingPracticeModal.tsx
 * @description Modal dialog component for Kanji writing practice within flashcards, embedding interactive stroke canvas with stroke direction validation.
 */

// Import & Dependencies

import { m } from "framer-motion";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Pencil, X } from "@/components/ui/icons";
import WritingCanvas from "@/features/tools/stroke-canvas/WritingCanvas";

// Component Props Interface

/**
 * Props for WritingPracticeModal component.
 */
interface WritingPracticeModalProps {
 /** Target word containing kanji character. */
 word: string;
 /** Controls modal visibility. */
 isOpen: boolean;
 /** Callback triggered on modal close. */
 onClose: () => void;
}

// Main Component

/**
 * Modal dialog containing interactive kanji writing canvas.
 */
export function WritingPracticeModal({
 word,
 isOpen,
 onClose,
}: WritingPracticeModalProps) {
 // Extract first character for writing practice.
 const kanjiChar = word.charAt(0);

 // RENDER KOMPONEN

 return (
 <Dialog open={isOpen} onOpenChange={onClose}>
 <DialogContent className="max-w-md p-0 border-none bg-transparent shadow-none">
 <DialogTitle className="sr-only">Latihan Menulis Kanji</DialogTitle>
 {/* Animated modal body */}
 <m.div
 initial={{ scale: 0.95, opacity: 0, y: 20 }}
 animate={{ scale: 1, opacity: 1, y: 0 }}
 className="relative bg-card p-6 md:p-8 rounded-lg border border-border shadow-2xl max-w-md w-full flex flex-col"
 >
 <div className="relative z-10 flex flex-col">
 <header className="flex items-center justify-between mb-6">
 <div className="flex items-center gap-3">
 <div className="size-10 shrink-0 rounded-xl bg-secondary/10 border border-secondary/20 flex items-center justify-center">
 <Pencil size={18} className="text-secondary" />
 </div>
 <div className="text-left">
 <span className="block font-bold text-xs uppercase tracking-widest text-secondary/50 mb-0.5">Latihan Kanji</span>
 <h3 className="text-foreground text-lg uppercase tracking-tight leading-none">Cara Menulis</h3>
 </div>
 </div>
 <Button
 variant="ghost"
 onClick={onClose}
 className="size-9 p-0 rounded-lg bg-muted/50 hover:bg-muted hover:text-foreground transition-all border border-border"
 >
 <X size={18} />
 </Button>
 </header>

 <div className="bg-muted/30 p-4 rounded-xl border border-border flex justify-between items-center mb-6">
 <div className="flex items-center gap-4">
 <p className="text-4xl font-black text-foreground font-japanese leading-none">
 {kanjiChar}
 </p>
 <p className="font-mono uppercase tracking-widest text-xs font-bold text-secondary/60">
 &quot;{word}&quot;
 </p>
 </div>
 <div className="px-3 py-1.5 rounded-lg bg-muted/50 border border-border text-[8px] font-bold uppercase tracking-widest text-secondary">
 MODE KANJI
 </div>
 </div>

 {/* Interactive canvas for stroke order validation */}
 <div className="w-full flex-1 flex flex-col justify-center min-h-75 mb-2">
 <WritingCanvas 
 character={kanjiChar} 
 strokeColor="hsl(var(--secondary))" 
 guideColor="hsl(var(--secondary)/0.3)"
 />
 </div>

 <p className="text-center text-xs text-muted-foreground font-bold uppercase tracking-widest mt-4">
 {" "}
 Tulis goresan kanji di atas secara berurutan!
 </p>
 </div>
 </m.div>
 </DialogContent>
 </Dialog>
 );
}