"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { SmartJapanese } from "@/components/ui/SmartJapanese";
import { ExternalLink, Plus, Loader2 } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface WordPopoverProps {
  children: React.ReactNode;
  word: string;
  reading?: string;
}

/**
 * WordPopover: Menampilkan popup informasi kosakata saat teks diklik.
 * Mengambil data secara real-time dari Supabase.
 */
export default function WordPopover({ children, word, reading }: WordPopoverProps) {
  const [isOpen, setIsOpen] = useState(false);

  // Query untuk mencari data kosakata yang cocok
  const { data: vocab, isLoading } = useQuery({
    queryKey: ["vocab-lookup", word, reading],
    queryFn: async () => {
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
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

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
            {/* Backdrop for mobile */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 z-[60] md:hidden bg-background/20 backdrop-blur-sm"
            />
            
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className="absolute bottom-full left-1/2 -translate-x-1/2 mb-4 w-72 z-[70] pointer-events-auto"
            >
              <div className="p-5 rounded-3xl glass border border-border/60 shadow-[0_20px_50px_-15px_rgba(var(--background-rgb),0.3)] bg-card/80 backdrop-blur-2xl">
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
                         <button className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest hover:bg-primary/20 transition-all">
                           <ExternalLink size={12} /> Detail
                         </button>
                       </Link>
                       <button className="flex items-center justify-center p-2.5 rounded-xl bg-muted/40 border border-border text-muted-foreground hover:bg-primary/10 hover:text-primary transition-all">
                          <Plus size={16} />
                       </button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-6 space-y-3">
                    <p className="text-xs text-muted-foreground font-medium italic">Kosakata tidak ditemukan di database NihongoRoute.</p>
                    <div className="flex flex-col gap-1 items-center" />
                  </div>
                )}
                
                {/* Tail Decoration */}
                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-card/80 border-r border-b border-border/60 rotate-45 transform" />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
