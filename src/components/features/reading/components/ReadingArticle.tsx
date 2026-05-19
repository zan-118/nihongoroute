"use client";

import { motion, AnimatePresence } from "framer-motion";
import FuriganaDisplay from "@/components/ui/FuriganaDisplay";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ReadingArticleProps {
  paragraphs: string[];
  hiraganaParagraphs: string[];
  romajiParagraphs: string[];
  translationParagraphs: string[];
  mode: "kanji" | "furigana" | "romaji" | "hiragana";
  fontSize: "standard" | "large" | "extra";
  showTranslation: boolean;
  isZenMode: boolean;
  onComplete?: () => void;
}

export function ReadingArticle({
  paragraphs,
  hiraganaParagraphs,
  romajiParagraphs,
  translationParagraphs,
  mode,
  fontSize,
  showTranslation,
  isZenMode,
  onComplete,
}: ReadingArticleProps) {
  const fontSizeClasses = {
    standard: "text-xl md:text-2xl",
    large: "text-2xl md:text-4xl",
    extra: "text-4xl md:text-5xl",
  };

  return (
    <motion.article
      layout
      className={cn(
        "p-8 md:p-16 lg:p-24 rounded-[3rem] transition-all duration-700 relative",
        isZenMode 
          ? "bg-transparent shadow-none border-none" 
          : "bg-card/10 backdrop-blur-3xl border border-border/40 shadow-[0_40px_100px_-20px_rgba(var(--background-rgb),0.2)]"
      )}
    >
      <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-transparent via-primary/20 to-transparent opacity-50" />
      
      <div className="space-y-16 relative z-10">
        {paragraphs.map((para, idx) => (
          <div key={idx} className="group/para relative">
            <FuriganaDisplay 
              text={para} 
              furigana={hiraganaParagraphs[idx] || ""} 
              romaji={romajiParagraphs[idx]}
              mode={mode}
              size="medium"
              interactive={true}
              className={cn(
                "transition-all duration-500",
                fontSizeClasses[fontSize]
              )}
            />
            
            <AnimatePresence>
              {showTranslation && (
                <motion.p 
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 5 }}
                  className="mt-6 text-base md:text-lg text-muted-foreground/80 italic font-medium leading-relaxed border-l-2 border-primary/20 pl-6"
                >
                  {translationParagraphs[idx]}
                </motion.p>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>

      {!isZenMode && (
        <div className="mt-24 pt-12 border-t border-border/40 flex flex-col items-center gap-8">
           <div className="flex items-center gap-4">
              <Sparkles size={20} className="text-warning animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground">Selesaikan Bacaan Untuk XP</span>
           </div>
           <Button 
             onClick={onComplete}
             className="px-16 py-8 h-auto rounded-2xl text-xs font-black uppercase tracking-[0.3em] bg-primary text-primary-foreground shadow-[0_20px_50px_-10px_rgba(var(--primary-rgb),0.4)] hover:shadow-[0_20px_70px_-10px_rgba(var(--primary-rgb),0.6)] hover:scale-105 active:scale-95 transition-all"
           >
             Tandai Selesai
           </Button>
        </div>
      )}
    </motion.article>
  );
}
