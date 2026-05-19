import { motion } from "framer-motion";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { PenTool, X, Sparkles } from "lucide-react";
import WritingCanvas from "@/components/features/tools/writing/WritingCanvas";

interface WritingPracticeModalProps {
  word: string;
  isOpen: boolean;
  onClose: () => void;
}

export function WritingPracticeModal({
  word,
  isOpen,
  onClose,
}: WritingPracticeModalProps) {
  const kanjiChar = word.charAt(0);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md p-0 border-none bg-transparent shadow-none">
        <DialogTitle className="sr-only">Latihan Menulis Kanji</DialogTitle>
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          className="relative bg-card p-6 md:p-8 rounded-2xl border border-border shadow-2xl max-w-md w-full flex flex-col"
        >
          <div className="relative z-10 flex flex-col">
            <header className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 shrink-0 rounded-xl bg-secondary/10 border border-secondary/20 flex items-center justify-center">
                  <PenTool size={18} className="text-secondary" />
                </div>
                <div className="text-left">
                  <span className="block font-bold text-xs uppercase tracking-widest text-secondary/50 mb-0.5">Latihan Kanji</span>
                  <h3 className="text-foreground text-lg font-black uppercase tracking-tight leading-none">Cara Menulis</h3>
                </div>
              </div>
              <Button
                variant="ghost"
                onClick={onClose}
                className="w-9 h-9 p-0 rounded-lg bg-muted/50 hover:bg-muted hover:text-foreground transition-all border border-border"
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
                KANJI_MODE
              </div>
            </div>

            <div className="w-full flex-1 flex flex-col justify-center min-h-[300px] mb-2">
              <WritingCanvas 
                character={kanjiChar} 
                strokeColor="hsl(var(--secondary))" 
                guideColor="hsl(var(--secondary)/0.3)"
              />
            </div>

            <p className="text-center text-xs text-muted-foreground font-bold uppercase tracking-widest mt-4">
              <Sparkles size={10} className="inline mr-1 text-secondary/50" />{" "}
              Tulis goresan kanji di atas secara berurutan!
            </p>
          </div>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}
