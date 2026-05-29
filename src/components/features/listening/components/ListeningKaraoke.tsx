"use client";

/**
 * @file ListeningKaraoke.tsx
 * @description Komponen transkrip interaktif dengan efek sinkronisasi waktu karaoke.
 * Menggulirkan transkrip secara otomatis ke baris aktif berdasarkan audio yang diputar,
 * serta menampilkan terjemahan bahasa Indonesia secara premium.
 */

// ==========================================
// IMPOR UTAMA
// ==========================================
import React, { useRef, useEffect, useState } from "react";
import { m, AnimatePresence } from "framer-motion";
import { Languages } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TranscriptLine } from "../types";
import { cn } from "@/lib/utils";

// ==========================================
// ANTARMUKA & TIPE DATA
// ==========================================
interface PortableTextNode {
  text?: string;
  children?: { text?: string }[];
}

interface ListeningKaraokeProps {
  transcript: TranscriptLine[];
  activeIndex: number;
  seekToLine: (startTime: number) => void;
}

// ==========================================
// KOMPONEN UTAMA: ListeningKaraoke
// ==========================================
/**
 * Komponen transkrip interaktif yang tersinkronisasi dengan pemutaran audio.
 * 
 * @param {ListeningKaraokeProps} props Properti untuk komponen karaoke menyimak.
 */
export default function ListeningKaraoke({ 
  transcript, 
  activeIndex, 
  seekToLine 
}: ListeningKaraokeProps) {
  const [showTranslation, setShowTranslation] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const activeLineRef = useRef<HTMLDivElement>(null);

  // Gulir otomatis secara halus ke posisi baris transkrip yang sedang aktif
  useEffect(() => {
    if (activeLineRef.current && scrollContainerRef.current) {
      activeLineRef.current.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  }, [activeIndex]);

  return (
    <div className="flex flex-col gap-6 w-full max-w-4xl mx-auto p-4 lg:p-8">
      {/* Kontrol Header Transkrip */}
      <div className="flex items-center justify-between px-2">
        <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/50">
          Transkrip Interaktif
        </h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowTranslation(!showTranslation)}
          className={cn(
            "rounded-full gap-2 transition-all",
            showTranslation ? "bg-primary/10 text-primary border-primary/20" : "text-muted-foreground hover:bg-background/5"
          )}
        >
          <Languages size={14} />
          <span className="text-[10px] font-bold uppercase tracking-widest">
            {showTranslation ? "Sembunyikan Terjemahan" : "Tampilkan Terjemahan"}
          </span>
        </Button>
      </div>

      {/* Area Tampilan Transkrip */}
      <div className="relative bg-card rounded-[3rem] border border-border shadow-2xl overflow-hidden p-8 lg:p-12">

        {/* Pendar Latar Belakang Dekoratif (Gaya Siber) */}
        <div className="absolute -top-24 -left-24 size-64 bg-primary/5 blur-[100px] rounded-full pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 size-64 bg-primary/5 blur-[100px] rounded-full pointer-events-none" />
        
        <div 
          ref={scrollContainerRef}
          className="relative max-h-[600px] overflow-y-auto pr-4 custom-scrollbar flex flex-col gap-6 z-10"
        >
          {transcript.map((line, index) => {
            const isActive = index === activeIndex;
            
            return (
              <m.div
                key={line._key || index}
                ref={isActive ? activeLineRef : null}
                initial={false}
                animate={{
                  scale: isActive ? 1.02 : 1,
                  opacity: isActive ? 1 : 0.6,
                }}
                onClick={() => seekToLine(line.startTime)}
                className={cn(
                  "group relative p-8 rounded-[2rem] cursor-pointer transition-all duration-500",
                  "border border-transparent",
                  isActive 
                    ? "bg-primary/10 border-primary/30 shadow-[0_0_40px_-10px_rgba(var(--primary-rgb),0.2)]" 
                    : "bg-muted/30 border-border hover:bg-muted/50"
                )}
              >
                {/* Penanda Pembicara */}
                {line.speaker && (
                  <div className="flex items-center gap-2 mb-3">
                    <div className={cn(
                      "w-1 h-3 rounded-full transition-colors",
                      isActive ? "bg-primary shadow-[0_0_10px_rgba(var(--primary-rgb),0.8)]" : "bg-background/10"
                    )} />
                    <span className={cn(
                      "text-[10px] font-black uppercase tracking-[0.3em] transition-colors",
                      isActive ? "text-primary" : "text-muted-foreground/40"
                    )}>
                      {line.speaker}
                    </span>
                  </div>
                )}
 
                {/* Konten Teks Bahasa Jepang */}
                <div className={cn(
                  "text-xl lg:text-2xl font-japanese font-medium leading-[1.6] transition-all",
                  isActive ? "text-foreground" : "text-foreground/40 group-hover:text-foreground/70"
                )}>
                  {typeof line.text === "string"
                    ? line.text
                    : Array.isArray(line.text)
                      ? (line.text as unknown as PortableTextNode[])
                          .map((block: PortableTextNode) =>
                            block?.children
                              ?.map((c: { text?: string }) => c?.text || "")
                              .join("") || block?.text || ""
                          )
                          .join(" ")
                      : String(line.text || "")}
                </div>
 
                {/* Terjemahan Dinamis (Opsional) */}
                <AnimatePresence initial={false}>
                  {(isActive || showTranslation) && (
                    <m.div
                      initial={{ height: 0, opacity: 0, marginTop: 0 }}
                      animate={{ height: "auto", opacity: 1, marginTop: 16 }}
                      exit={{ height: 0, opacity: 0, marginTop: 0 }}
                      className="overflow-hidden"
                    >
                      <p className={cn(
                        "text-base font-medium leading-relaxed border-t pt-4 transition-colors",
                        isActive ? "text-primary/70 border-primary/10 italic" : "text-muted-foreground/30 border-border"
                      )}>
                        {line.translation}
                      </p>
                    </m.div>
                  )}
                </AnimatePresence>
 
                {/* Bilah Indikator Garis Aktif (Gaya Siber) */}
                {isActive && (
                  <m.div 
                    layoutId="active-indicator"
                    className="absolute -left-[1px] top-8 bottom-8 w-[2px] bg-primary rounded-full shadow-[0_0_15px_rgba(var(--primary-rgb),1)]"
                  />
                )}
              </m.div>
            );
          })}
        </div>
 
        {/* Efek Pudar Gradasi Masking Atas & Bawah */}
        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-card/80 via-card/20 to-transparent z-20 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-card/80 via-card/20 to-transparent z-20 pointer-events-none" />
      </div>
    </div>
  );
}

