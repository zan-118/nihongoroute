import { motion } from "framer-motion";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { PenTool, X, Sparkles } from "lucide-react";
import WritingCanvas from "@/components/WritingCanvas";

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
          className="relative bg-[#121417] p-6 md:p-8 rounded-2xl border border-white/[0.08] shadow-2xl max-w-md w-full flex flex-col"
        >
          <div className="relative z-10 flex flex-col">
            <header className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 shrink-0 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
                  <PenTool size={18} className="text-purple-400" />
                </div>
                <div className="text-left">
                  <span className="block font-bold text-[9px] uppercase tracking-widest text-purple-500/50 mb-0.5">Latihan Kanji</span>
                  <h3 className="text-white text-lg font-black uppercase tracking-tight leading-none">Cara Menulis</h3>
                </div>
              </div>
              <Button
                variant="ghost"
                onClick={onClose}
                className="w-9 h-9 p-0 rounded-lg bg-white/[0.04] hover:bg-white hover:text-black transition-all border border-white/[0.08]"
              >
                <X size={18} />
              </Button>
            </header>

            <div className="bg-black/20 p-4 rounded-xl border border-white/[0.06] flex justify-between items-center mb-6">
              <div className="flex items-center gap-4">
                <p className="text-4xl font-black text-white font-japanese leading-none">
                  {kanjiChar}
                </p>
                <p className="font-mono uppercase tracking-widest text-[9px] font-bold text-purple-500/60">
                  &quot;{word}&quot;
                </p>
              </div>
              <div className="px-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.08] text-[8px] font-bold uppercase tracking-widest text-purple-500">
                KANJI_MODE
              </div>
            </div>

            <div className="w-full flex-1 flex flex-col justify-center min-h-[300px] mb-2">
              <WritingCanvas 
                character={kanjiChar} 
                strokeColor="#a855f7" 
                guideColor="#a855f7"
              />
            </div>

            <p className="text-center text-[9px] text-slate-500 font-bold uppercase tracking-widest mt-4">
              <Sparkles size={10} className="inline mr-1 text-purple-400/50" />{" "}
              Tulis goresan kanji di atas secara berurutan!
            </p>
          </div>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}
