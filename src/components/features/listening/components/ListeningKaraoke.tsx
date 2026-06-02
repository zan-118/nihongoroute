"use client";

/**
 * @file ListeningKaraoke.tsx
 * @description Komponen transkrip interaktif dengan efek sinkronisasi waktu karaoke.
 * Fitur: auto-scroll, loop per baris (shadowing), terjemahan toggle,
 * dan TTS per baris menggunakan Edge TTS (suara pria/wanita otomatis).
 */

import React, { useRef, useEffect, useState } from "react";
import { m, AnimatePresence } from "framer-motion";
import { Languages, Repeat, Volume2, VolumeX, Loader2, Gauge } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TranscriptLine } from "../types";
import { useLineTTS } from "../hooks/useLineTTS";
import { cn } from "@/lib/utils";

interface PortableTextNode {
  text?: string;
  children?: { text?: string }[];
}

interface ListeningKaraokeProps {
  transcript: TranscriptLine[];
  activeIndex: number;
  seekToLine: (startTime: number) => void;
}

function extractLineText(text: TranscriptLine["text"]): string {
  if (typeof text === "string") return text;
  if (Array.isArray(text)) {
    return (text as unknown as PortableTextNode[])
      .map((block) =>
        block?.children?.map((c) => c?.text || "").join("") || block?.text || ""
      )
      .join(" ");
  }
  return String(text || "");
}

export default function ListeningKaraoke({
  transcript,
  activeIndex,
  seekToLine,
}: ListeningKaraokeProps) {
  const [showTranslation, setShowTranslation] = useState(false);
  const [loopingIndex, setLoopingIndex] = useState<number>(-1);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const activeLineRef = useRef<HTMLDivElement>(null);

  const {
    speakingIndex,
    loadingIndex,
    speakLine,
    stopLineTTS,
    lineTTSEnabled,
    toggleLineTTS,
    rate,
    setRate,
  } = useLineTTS({ rate: "medium" });

  // Auto-scroll ke baris aktif
  useEffect(() => {
    if (activeLineRef.current && scrollContainerRef.current) {
      activeLineRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [activeIndex]);

  // Loop: kembalikan audio ke awal baris saat keluar dari baris yang di-loop
  useEffect(() => {
    if (loopingIndex >= 0 && activeIndex !== loopingIndex) {
      const loopLine = transcript[loopingIndex];
      if (loopLine) seekToLine(loopLine.startTime);
    }
  }, [activeIndex, loopingIndex, transcript, seekToLine]);

  const handleToggleLoop = (index: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setLoopingIndex((prev) => (prev === index ? -1 : index));
  };

  const handleLineTTSClick = (line: TranscriptLine, index: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (speakingIndex === index || loadingIndex === index) {
      stopLineTTS();
    } else {
      speakLine(line, index);
    }
  };

  // Get unique list of non-narrator speakers to dynamically align left/right
  const speakerSides = React.useMemo(() => {
    const sides: Record<string, "left" | "right"> = {};
    let nonNarratorCount = 0;
    transcript.forEach((line) => {
      if (line.speaker) {
        const lower = line.speaker.toLowerCase().trim();
        const isNarrator =
          lower === "narrator" ||
          lower === "ナレーター" ||
          lower === "instruction" ||
          lower === "direction" ||
          lower.includes("penjelas");
        
        if (!isNarrator && !sides[line.speaker]) {
          sides[line.speaker] = nonNarratorCount % 2 === 0 ? "left" : "right";
          nonNarratorCount++;
        }
      }
    });
    return sides;
  }, [transcript]);

  const isIdle = activeIndex === -1;

  return (
    <div className="flex flex-col gap-6 w-full max-w-4xl mx-auto p-2 sm:p-4 md:p-6">
      {/* Header Kontrol Transkrip */}
      <div className="flex items-center justify-between px-2">
        <div className="flex items-center gap-3">
          <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/50">
            Transkrip Interaktif
          </h3>

          {/* Indikator idle */}
          <AnimatePresence>
            {isIdle && (
              <m.span
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-muted/50 border border-border"
              >
                <span className="size-1.5 rounded-full bg-muted-foreground/40 animate-pulse" />
                <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground/40">
                  Menunggu...
                </span>
              </m.span>
            )}
          </AnimatePresence>
        </div>

        <div className="flex items-center gap-2">
          {/* Toggle TTS per baris */}
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleLineTTS}
            title={lineTTSEnabled ? "Nonaktifkan AI Voice per baris" : "Aktifkan AI Voice per baris"}
            className={cn(
              "rounded-full gap-2 transition-all",
              lineTTSEnabled
                ? "bg-primary/10 text-primary border border-primary/20"
                : "text-muted-foreground hover:bg-background/5"
            )}
          >
            {lineTTSEnabled ? <Volume2 size={13} /> : <VolumeX size={13} />}
            <span className="text-[10px] font-bold uppercase tracking-widest">
              {lineTTSEnabled ? "AI Voice ON" : "AI Voice"}
            </span>
          </Button>

          {/* Speed selector — hanya tampil saat AI Voice aktif */}
          {lineTTSEnabled && (
            <div className="flex items-center gap-1 p-1 rounded-full bg-muted/30 border border-border">
              {(["slow", "medium", "fast"] as const).map(r => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRate(r)}
                  className={cn(
                    "px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider transition-all",
                    rate === r
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {r === "slow" ? "0.75×" : r === "fast" ? "1.25×" : "1×"}
                </button>
              ))}
            </div>
          )}

          {/* Toggle terjemahan */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowTranslation(!showTranslation)}
            className={cn(
              "rounded-full gap-2 transition-all",
              showTranslation
                ? "bg-primary/10 text-primary border border-primary/20"
                : "text-muted-foreground hover:bg-background/5"
            )}
          >
            <Languages size={13} />
            <span className="text-[10px] font-bold uppercase tracking-widest">
              {showTranslation ? "Sembunyikan" : "Terjemahan"}
            </span>
          </Button>
        </div>
      </div>

      {/* Area Transkrip */}
      <div className="relative bg-card rounded-2xl md:rounded-[3rem] border border-border shadow-2xl overflow-hidden p-3 sm:p-6 md:p-10">
        <div className="absolute -top-24 -left-24 size-64 bg-primary/5 blur-[100px] rounded-full pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 size-64 bg-primary/5 blur-[100px] rounded-full pointer-events-none" />

        <div
          ref={scrollContainerRef}
          className="relative max-h-[600px] overflow-y-auto pr-2 custom-scrollbar flex flex-col gap-4 z-10"
        >
          {transcript.map((line, index) => {
            const isActive   = index === activeIndex;
            const isLooping  = loopingIndex === index;
            const isSpeaking = speakingIndex === index;
            const isLoading  = loadingIndex === index;

            // Determine dialogue alignments & color accents using CSS custom variables strictly
            const speaker = line.speaker;
            let align = "self-center items-center text-center";
            let bubbleClass = "rounded-2xl max-w-[90%]";
            let speakerAccent = "bg-muted-foreground/30";
            let speakerTextColor = "text-muted-foreground";
            let isLeft = false;
            let isRight = false;

            if (speaker) {
              const side = speakerSides[speaker];
              if (side === "left") {
                isLeft = true;
                align = "self-start items-start text-left";
                bubbleClass = cn(
                  "rounded-2xl rounded-tl-none max-w-[85%] sm:max-w-[75%]",
                  "bg-[rgba(var(--primary-rgb),0.03)] border-[rgba(var(--primary-rgb),0.15)]",
                  "hover:bg-[rgba(var(--primary-rgb),0.06)] hover:border-[rgba(var(--primary-rgb),0.25)]",
                  isActive && "bg-[rgba(var(--primary-rgb),0.08)] border-[rgba(var(--primary-rgb),0.4)] shadow-[0_0_20px_rgba(var(--primary-rgb),0.15)] scale-[1.01]"
                );
                speakerAccent = "bg-primary shadow-[0_0_10px_rgba(var(--primary-rgb),0.8)]";
                speakerTextColor = "text-primary";
              } else if (side === "right") {
                isRight = true;
                align = "self-end items-end text-left";
                bubbleClass = cn(
                  "rounded-2xl rounded-tr-none max-w-[85%] sm:max-w-[75%]",
                  "bg-[rgba(var(--secondary-rgb),0.03)] border-[rgba(var(--secondary-rgb),0.15)]",
                  "hover:bg-[rgba(var(--secondary-rgb),0.06)] hover:border-[rgba(var(--secondary-rgb),0.25)]",
                  isActive && "bg-[rgba(var(--secondary-rgb),0.08)] border-[rgba(var(--secondary-rgb),0.4)] shadow-[0_0_20px_rgba(var(--secondary-rgb),0.15)] scale-[1.01]"
                );
                speakerAccent = "bg-secondary shadow-[0_0_10px_rgba(var(--secondary-rgb),0.8)]";
                speakerTextColor = "text-secondary";
              }
            }

            if (!isLeft && !isRight) {
              bubbleClass = cn(
                "rounded-2xl max-w-[90%]",
                "bg-muted/30 border-border hover:bg-muted/50",
                isActive && "bg-primary/10 border-primary/30 shadow-[0_0_20px_rgba(var(--primary-rgb),0.15)] scale-[1.01]"
              );
              speakerAccent = isActive ? "bg-primary shadow-[0_0_10px_rgba(var(--primary-rgb),0.8)]" : "bg-muted-foreground/30";
              speakerTextColor = isActive ? "text-primary" : "text-muted-foreground/60";
            }

            return (
              <div key={line._key || index} className={cn("flex flex-col w-full", align)}>
                <m.div
                  ref={isActive ? activeLineRef : null}
                  initial={false}
                  animate={{
                    scale: isActive ? 1.01 : 1,
                    opacity: isActive ? 1 : 0.8,
                  }}
                  onClick={() => seekToLine(line.startTime)}
                  className={cn(
                    "group relative p-4 sm:p-5 md:p-6 cursor-pointer transition-all duration-300 border",
                    bubbleClass,
                    isLooping  && "ring-2 ring-primary/40 ring-offset-2 ring-offset-card",
                    isSpeaking && "ring-2 ring-success/50 ring-offset-2 ring-offset-card"
                  )}
                >
                  {/* Penanda Pembicara */}
                  {line.speaker && (
                    <div className={cn("flex items-center gap-2 mb-2.5", isRight && "flex-row-reverse")}>
                      <div className={cn(
                        "w-1 h-3 rounded-full transition-colors",
                        speakerAccent
                      )} />
                      <span className={cn(
                        "text-[9px] font-black uppercase tracking-[0.2em] transition-colors",
                        speakerTextColor
                      )}>
                        {line.speaker}
                      </span>
                      {/* Indikator suara sedang diputar di baris ini */}
                      {isSpeaking && (
                        <span className="flex items-center gap-0.5">
                          {[0, 1, 2].map(i => (
                            <span
                              key={i}
                              className="inline-block w-0.5 bg-success rounded-full animate-pulse"
                              style={{
                                height: `${6 + i * 3}px`,
                                animationDelay: `${i * 0.15}s`
                              }}
                            />
                          ))}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Teks Jepang */}
                  <div className={cn(
                    "text-lg sm:text-xl font-japanese font-medium leading-[1.6] transition-all",
                    isActive ? "text-foreground" : "text-foreground/75 group-hover:text-foreground/90"
                  )}>
                    {extractLineText(line.text)}
                  </div>

                  {/* Terjemahan */}
                  <AnimatePresence initial={false}>
                    {(isActive || showTranslation) && (
                      <m.div
                        initial={{ height: 0, opacity: 0, marginTop: 0 }}
                        animate={{ height: "auto", opacity: 1, marginTop: 12 }}
                        exit={{ height: 0, opacity: 0, marginTop: 0 }}
                        className="overflow-hidden"
                      >
                        <p className={cn(
                          "text-sm sm:text-base font-medium leading-relaxed border-t pt-3 transition-colors",
                          isActive
                            ? "text-primary/80 border-primary/20 italic"
                            : "text-muted-foreground/60 border-border"
                        )}>
                          {line.translation}
                        </p>
                      </m.div>
                    )}
                  </AnimatePresence>

                  {/* Tombol-tombol aksi di pojok kanan atas */}
                  <div className={cn(
                    "absolute top-3 right-3 flex items-center gap-1",
                    "opacity-75 lg:opacity-0 lg:group-hover:opacity-100 lg:focus-within:opacity-100 transition-opacity duration-200",
                    (isSpeaking || isLoading || isLooping) && "opacity-100"
                  )}>
                    {/* Tombol AI Voice per baris — hanya tampil kalau TTS diaktifkan */}
                    {lineTTSEnabled && (
                      <button
                        type="button"
                        onClick={(e) => handleLineTTSClick(line, index, e)}
                        title={isSpeaking ? "Hentikan" : isLoading ? "Memuat..." : "Putar dengan AI Voice"}
                        aria-label={isSpeaking ? "Hentikan AI Voice" : "Putar baris ini dengan AI Voice"}
                        className={cn(
                          "p-2 rounded-xl transition-all duration-200 border",
                          isSpeaking
                            ? "bg-success/20 text-success border-success/30"
                            : isLoading
                              ? "bg-muted/50 text-muted-foreground border-transparent cursor-wait"
                              : "bg-muted/50 text-muted-foreground/50 hover:text-primary hover:bg-primary/10 border-transparent"
                        )}
                      >
                        {isLoading
                          ? <Loader2 size={12} className="animate-spin" />
                          : isSpeaking
                            ? <Volume2 size={12} className="animate-pulse" />
                            : <Volume2 size={12} />
                        }
                      </button>
                    )}

                    {/* Tombol Loop / Shadowing */}
                    <button
                      type="button"
                      onClick={(e) => handleToggleLoop(index, e)}
                      title={isLooping ? "Matikan loop" : "Loop baris ini (shadowing)"}
                      aria-label={isLooping ? "Matikan loop baris ini" : "Loop baris ini untuk shadowing"}
                      className={cn(
                        "p-2 rounded-xl transition-all duration-200 border",
                        isLooping
                          ? "bg-primary/20 text-primary border-primary/30"
                          : "bg-muted/50 text-muted-foreground/50 hover:text-primary hover:bg-primary/10 border-transparent"
                      )}
                    >
                      <Repeat size={12} className={cn(isLooping && "animate-pulse")} />
                    </button>
                  </div>

                  {/* Indikator kiri — baris aktif */}
                  {isActive && (
                    <m.div
                      layoutId="active-indicator"
                      className="absolute -left-[1px] top-6 bottom-6 w-[2px] bg-primary rounded-full shadow-[0_0_15px_rgba(var(--primary-rgb),1)]"
                    />
                  )}

                  {/* Indikator kanan — loop aktif */}
                  {isLooping && (
                    <m.div
                      initial={{ scaleY: 0 }}
                      animate={{ scaleY: 1 }}
                      className="absolute -right-[1px] top-6 bottom-6 w-[2px] bg-primary/60 rounded-full"
                    />
                  )}
                </m.div>
              </div>
            );
          })}
        </div>

        {/* Gradient masking atas & bawah */}
        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-card/80 via-card/20 to-transparent z-20 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-card/80 via-card/20 to-transparent z-20 pointer-events-none" />
      </div>

      {/* Status bar bawah */}
      <AnimatePresence>
        {(loopingIndex >= 0 || lineTTSEnabled) && (
          <m.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            className="flex items-center justify-center gap-4 flex-wrap"
          >
            {loopingIndex >= 0 && (
              <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-primary/70">
                <Repeat size={10} className="animate-pulse" />
                Mode Shadowing Aktif
              </span>
            )}
            {lineTTSEnabled && (
              <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-success/70">
                <Volume2 size={10} />
                AI Voice Aktif — klik ikon suara di tiap baris
              </span>
            )}
          </m.div>
        )}
      </AnimatePresence>
    </div>
  );
}
