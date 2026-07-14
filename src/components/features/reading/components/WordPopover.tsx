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
import { Button } from "@/components/ui/button";
import { SmartJapanese } from "@/components/ui/SmartJapanese";
import { BookmarkCheck, BookmarkPlus, ExternalLink, Loader2, Trash2, X } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import AddToSRSButton from "@/components/features/srs/actions/AddToSRSButton";
import { useUIStore } from "@/store/useUIStore";

// ==========================================
// TIPE DATA / INTERFACE
// ==========================================
/**
 * Props for WordPopover component.
 */
interface WordPopoverProps {
  /** Element trigger popover. */
  children: React.ReactNode;
  /** Target Japanese word. */
  word: string;
  /** Optional reading of word. */
  reading?: string;
}

// ==========================================
// KOMPONEN UTAMA
// ==========================================
/**
 * Interactive popover component. Fetches word data from Supabase on click.
 */
export default function WordPopover({ children, word, reading }: WordPopoverProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const readingState = useUIStore((state) => state.readingState);
  const vocabularyBank = useUIStore((state) => state.readingVocabularyBank);
  const addReadingVocabulary = useUIStore((state) => state.addReadingVocabulary);
  const removeReadingVocabulary = useUIStore((state) => state.removeReadingVocabulary);
  const addNotification = useUIStore((state) => state.addNotification);

  // Track screen size to toggle mobile drawer layout.
  useEffect(() => {
    if (!isOpen) return;
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, [isOpen]);

  // ==========================================
  // QUERY & FETCH DATA (REAL-TIME)
  // ==========================================
  // Fetch word details from Supabase database.
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
    enabled: isOpen, // Only fetch when popover opens.
    staleTime: 1000 * 60 * 5, // 5 menit
  });

  const collectibleWord = vocab?.word || word;
  const collectibleReading = vocab?.furigana || reading;
  // Unique key for local vocabulary bank storage.
  const bankId = [
    readingState.sourceId || "reading",
    collectibleWord,
    collectibleReading || "",
  ]
    .join("|")
    .toLowerCase();
  const isCollected = !!vocabularyBank[bankId];

  /**
   * Add or remove word from local reading vocabulary bank.
   */
  const handleToggleCollection = () => {
    if (!collectibleWord.trim()) return;

    if (isCollected) {
      removeReadingVocabulary(bankId);
      return;
    }

    addReadingVocabulary({
      word: collectibleWord,
      reading: collectibleReading,
      meaning: vocab?.meaning || undefined,
      slug: vocab?.slug || undefined,
      jlpt: vocab?.jlpt || undefined,
      sourceId: readingState.sourceId,
      sourceTitle: readingState.sourceTitle,
      sourceHref: readingState.sourceHref,
    });

    addNotification({
      title: "Kosakata Disimpan",
      message: `${collectibleWord} masuk ke bank kosakata bacaan.`,
      type: "success",
    });
  };

  // Animation variants for mobile drawer vs desktop popover.
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
              className="fixed inset-0 z-[60] bg-background/60 "
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
                "p-5 border border-border/60 shadow-2xl bg-card relative",
                isMobile 
                  ? "rounded-t-[2.5rem] pb-8" 
                  : "rounded-xl glass bg-card/80 "
              )}>
                {isMobile && (
                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    className="absolute top-4 right-4 text-muted-foreground hover:text-foreground p-1.5 rounded-xl bg-muted/50 transition-colors border border-border/40 z-30"
                    aria-label="Tutup"
                  >
                    <X size={14} />
                  </button>
                )}
                {isLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 size={24} className="animate-spin text-primary" />
                  </div>
                ) : vocab ? (
                  <div className="space-y-4">
                    <div className="flex justify-between items-start pr-8 md:pr-0">
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
                       <Button asChild variant="outline" size="sm" className="flex-1 rounded-xl">
                         <Link href={`/library/vocab/${vocab.slug}`}>
                           <ExternalLink data-icon="inline-start" />
                           Detail
                         </Link>
                       </Button>
                       <Button
                         type="button"
                         variant={isCollected ? "secondary" : "outline"}
                         size="sm"
                         onClick={handleToggleCollection}
                         className="rounded-xl"
                       >
                         {isCollected ? (
                           <BookmarkCheck data-icon="inline-start" />
                         ) : (
                           <BookmarkPlus data-icon="inline-start" />
                         )}
                         {isCollected ? "Tersimpan" : "Simpan"}
                       </Button>
                       <AddToSRSButton wordId={vocab._id} />
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-6 space-y-3">
                    <p className="text-xs text-muted-foreground font-medium italic">Kosakata tidak ditemukan di database NihongoRoute.</p>
                    <Button
                      type="button"
                      variant={isCollected ? "secondary" : "outline"}
                      size="sm"
                      onClick={handleToggleCollection}
                      className="rounded-xl"
                    >
                      {isCollected ? (
                        <Trash2 data-icon="inline-start" />
                      ) : (
                        <BookmarkPlus data-icon="inline-start" />
                      )}
                      {isCollected ? "Hapus" : "Simpan Kata"}
                    </Button>
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