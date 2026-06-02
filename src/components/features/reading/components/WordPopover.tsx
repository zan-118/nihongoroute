/**
 * @file WordPopover.tsx
 * @description Komponen popover kata (tooltip interaktif) yang memicu pencarian waktu-nyata (real-time query) data kosakata dari Supabase saat kata dalam artikel diklik.
 */

// ==========================================
// IMPORT & DEPENDENSI
// ==========================================
import React, { useState, useEffect } from "react";
import { m, AnimatePresence } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { SmartJapanese } from "@/components/ui/SmartJapanese";
import { ExternalLink, Loader2 } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import AddToSRSButton from "@/components/features/srs/actions/AddToSRSButton";

// ==========================================
// TIPE DATA / INTERFACE
// ==========================================
interface WordPopoverProps {
  children: React.ReactNode;
  word: string;
  reading?: string;
}

// ==========================================
// KOMPONEN UTAMA
// ==========================================
/**
 * Komponen popover kosakata dinamis.
 */
export default function WordPopover({ children, word, reading }: WordPopoverProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // ==========================================
  // QUERY & FETCH DATA (REAL-TIME)
  // ==========================================
  const { data: vocab, isLoading } = useQuery({
    queryKey: ["vocab-lookup", word, reading],
    queryFn: async () => {
      if (!word || word.length > 30) return null;
      const supabase = createClient();
      const { data, error } = await supabase
        .from("vocab")
        .select("id, slug, word, furigana, romaji, meaning_id, jlpt_level, hinshi")
        .or(`word.eq.${word},furigana.eq.${word}`)
        .limit(1)
        .single();

      if (error && error.code !== "PGRST116") throw error;
      if (!data) return null;

      return {
        _id: data.id,
        slug: data.slug || data.word || data.id,
        word: data.word,
        furigana: data.furigana,
        romaji: data.romaji,
        meaning: data.meaning_id,
        jlpt: data.jlpt_level,
        hinshi: Array.isArray(data.hinshi) ? data.hinshi[0] : data.hinshi,
      };
    },
    enabled: isOpen,
    staleTime: 1000 * 60 * 5, // 5 menit
  });

  const variants = isMobile
    ? {
        initial: { y: "100%", opacity: 0 },
        animate: { y: 0, opacity: 1 },
        exit: { y: "100%", opacity: 0 },
      }
    : {
        initial: { opacity: 0, y: 10, scale: 0.95 },
        animate: { opacity: 1, y: 0, scale: 1 },
        exit: { opacity: 0, y: 10, scale: 0.95 },
      };

  // ==========================================
  // RENDER KOMPONEN
  // ==========================================
  return (
    <div className="relative inline-block group/popover">
      <span 
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "cursor-help transition-all duration-300 decoration-primary/20 decoration-2 underline-offset-4",
          isOpen ? "text-primary underline" : "hover:text-primary hover:underline"
        )}
      >
        {children}
      </span>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Latar Belakang (Backdrop) */}
            <m.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 z-[60] bg-background/60 backdrop-blur-sm"
            />
            
            <m.div
              variants={variants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={isMobile ? { type: "spring", damping: 25, stiffness: 220 } : { duration: 0.2 }}
              className={cn(
                isMobile 
                  ? "fixed bottom-0 inset-x-0 w-full z-[70] pointer-events-auto"
                  : "absolute bottom-full left-1/2 -translate-x-1/2 mb-4 w-72 z-[70] pointer-events-auto"
              )}
            >
              <div className={cn(
                "p-5 border border-border/60 shadow-2xl bg-card",
                isMobile 
                  ? "rounded-t-[2.5rem] pb-8" 
                  : "rounded-3xl glass bg-card/80 backdrop-blur-2xl"
              )}>
                {isLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 size={24} className="animate-spin text-primary" />
                  </div>
                ) : vocab ? (
                  <div className="space-y-4">
                    <div className="flex justify-between items-start">
                      <div className="flex flex-col">
                        <span className="text-2xl font-black font-japanese text-foreground">
                          <SmartJapanese word={vocab.word} furigana={vocab.furigana} />
                        </span>
                        <span className="text-[10px] font-black uppercase tracking-widest text-primary/60 mt-1">
                          {vocab.hinshi || "Kosakata"}
                        </span>
                      </div>
                      <Badge variant="outline" className="border-primary/20 text-primary bg-primary/5 text-[10px] font-black uppercase">
                        {vocab.jlpt || "N/A"}
                      </Badge>
                    </div>

                    <p className="text-sm font-medium text-foreground/80 leading-relaxed">
                      {vocab.meaning}
                    </p>

                    <div className="pt-4 border-t border-border/40 flex items-center justify-between gap-2">
                       <Link 
                        href={`/library/vocab/${vocab.slug}`}
                        className="flex-1"
                       >
                         <button type="button" className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest hover:bg-primary/20 transition-all">
                           <ExternalLink size={12} /> Detail
                         </button>
                       </Link>
                       <AddToSRSButton wordId={vocab._id} />
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-6 space-y-3">
                    <p className="text-xs text-muted-foreground font-medium italic">Kosakata tidak ditemukan di database NihongoRoute.</p>
                  </div>
                )}
                
                {/* Dekorasi Ekor Popover (Hanya Desktop) */}
                {!isMobile && (
                  <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 size-4 bg-card border-r border-b border-border/60 rotate-45 transform" />
                )}
              </div>
            </m.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
