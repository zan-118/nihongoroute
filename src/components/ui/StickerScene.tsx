"use client";

/**
 * @file StickerScene.tsx
 * @description Komponen interaktif bertema Visual Novel (Petualangan Jepang) untuk peragaan dialog.
 * Mengintegrasikan panggung latar belakang, stiker karakter, dan dialog box overlay di dalam satu wadah.
 * Mendukung sinkronisasi penuh dengan audio player eksternal (seekToLine & activeIndex).
 */

import React, { useState, useEffect } from "react";
import { m, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, MessageSquare, RotateCcw, Play } from "@/components/ui/icons";
import Image from "next/image";
import { cn } from "@/lib/utils";

/**
 * Dialogue line structure.
 */
interface DialogueLine {
  speaker?: string;
  text: string | unknown[];
  translation?: string;
  startTime?: number;
}

/**
 * Props for StickerScene component.
 */
interface StickerSceneProps {
  dialogue: DialogueLine[];
  activeIndex?: number;
  seekToLine?: (startTime: number) => void;
  backgroundUrl?: string;
  title?: string;
  borderless?: boolean;
}

/**
 * Portable text node structure.
 */
interface PortableTextNode {
  text?: string;
  children?: { text?: string }[];
}

/**
 * Extract text from string or portable text array.
 */
function extractLineText(text: string | unknown[]): string {
  // Return string directly
  if (typeof text === "string") return text;
  // Parse portable text array
  if (Array.isArray(text)) {
    return (text as unknown as PortableTextNode[])
      .map((block) =>
        block?.children?.map((c) => c?.text || "").join("") || block?.text || ""
      )
      .join(" ");
  }
  return String(text || "");
}

/**
 * Map character keys to asset paths and colors.
 */
const characterAssets: Record<string, { src: string; color: string; rgb: string }> = {
  ayu: { src: "/characters/ayu.png", color: "border-secondary/50", rgb: "220, 20, 60" },
  ken: { src: "/characters/ken.png", color: "border-primary/50", rgb: "0, 255, 255" },
  takahashi: { src: "/characters/ken.png", color: "border-primary/50", rgb: "0, 255, 255" },
  dito: { src: "/characters/ken.png", color: "border-primary/50", rgb: "0, 255, 255" },
  lala: { src: "/characters/ayu.png", color: "border-secondary/50", rgb: "220, 20, 60" },
  zundamon: { src: "/characters/zundamon.png", color: "border-success/50", rgb: "0, 200, 100" },
};

/**
 * Interactive visual novel dialogue scene.
 */
export function StickerScene({
  dialogue,
  activeIndex,
  seekToLine,
  backgroundUrl = "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1200&q=80",
  title = "Sesi Dialog Interaktif",
  borderless = false,
}: StickerSceneProps) {
  // Track active index internally if not synced
  const [internalIndex, setInternalIndex] = useState(0);

  // Check if index synced with external audio player
  const isSynced = typeof activeIndex === "number" && activeIndex >= 0;
  const currentIndex = isSynced ? activeIndex : internalIndex;



  if (!dialogue || dialogue.length === 0) return null;

  // Get current active line
  const currentLine = dialogue[currentIndex] || dialogue[0];
  const rawSpeaker = currentLine.speaker || "Narator";
  const activeSpeakerKey = rawSpeaker.toLowerCase().trim();

  // Get maximum 3 unique speakers for stage display
  const uniqueSpeakers = Array.from(
    new Set(
      dialogue
        .map((d) => d.speaker?.toLowerCase().trim())
        .filter((s): s is string => !!s && s !== "narrator" && s !== "narator" && s !== "instruction")
    )
  ).slice(0, 3);

  // Handle next line navigation
  const handleNext = () => {
    const nextIndex = Math.min(dialogue.length - 1, currentIndex + 1);
    if (isSynced && seekToLine) {
      const line = dialogue[nextIndex];
      if (line && typeof line.startTime === "number") {
        seekToLine(line.startTime);
      }
    } else {
      setInternalIndex(nextIndex);
    }
  };

  // Handle previous line navigation
  const handlePrev = () => {
    const prevIndex = Math.max(0, currentIndex - 1);
    if (isSynced && seekToLine) {
      const line = dialogue[prevIndex];
      if (line && typeof line.startTime === "number") {
        seekToLine(line.startTime);
      }
    } else {
      setInternalIndex(prevIndex);
    }
  };

  // Reset dialogue to start
  const handleReset = () => {
    if (isSynced && seekToLine) {
      const line = dialogue[0];
      if (line && typeof line.startTime === "number") {
        seekToLine(line.startTime);
      }
    } else {
      setInternalIndex(0);
    }
  };

  const textVal = extractLineText(currentLine.text);
  const translationVal = currentLine.translation;

  return (
    <div className="w-full flex flex-col">
      {/* 🏙️ Latar Belakang Panggung (Visual Stage) */}
      <div className="relative w-full aspect-[16/9] rounded-xl border border-border bg-muted overflow-hidden shadow-2xl">
        <Image
          src={backgroundUrl}
          alt="Panggung Latar Belakang"
          fill
          unoptimized
          className="object-cover object-top brightness-[0.8] scale-105 select-none"
        />

        {/* Header Overlay */}
        <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-30">
          <div className="px-3 py-1.5 rounded-xl bg-background/80  border border-border/60 flex items-center gap-1.5 shadow-sm">
            <MessageSquare size={13} className="text-primary" />
            <span className="text-[10px] font-black uppercase tracking-wider text-foreground">{title}</span>
          </div>
          <div className="text-[10px] font-black text-white px-2.5 py-1 rounded-lg bg-black/60  border border-white/10 shadow-sm">
            {currentIndex + 1} / {dialogue.length}
          </div>
        </div>

        {/* 🎭 Panggung Karakter (Stiker) */}
        <div className="absolute inset-x-0 bottom-0 top-12 flex justify-around items-end px-4 md:px-12 pointer-events-none z-10 overflow-hidden pb-4">
          {uniqueSpeakers.map((speakerKey) => {
            const asset = characterAssets[speakerKey];
            if (!asset) return null;

            const isActive = activeSpeakerKey === speakerKey;

            return (
              <m.div
                key={speakerKey}
                animate={{
                  scale: isActive ? 1.05 : 0.9,
                  y: isActive ? -5 : 20,
                  opacity: isActive ? 1 : 0.35,
                }}
                transition={{ type: "spring", stiffness: 200, damping: 20 }}
                className={cn(
                  "relative w-[85px] sm:w-[120px] md:w-[170px] h-[95%] rounded-t-[2rem] border-x border-t bg-background/50 flex flex-col justify-end transition-all duration-300",
                  isActive ? asset.color : "border-transparent",
                  isActive && "shadow-[0_-10px_25px_rgba(var(--color-rgb),0.1)]"
                )}
                style={
                  isActive
                    ? ({ "--color-rgb": asset.rgb } as React.CSSProperties)
                    : undefined
                }
              >
                {/* Gambar Karakter */}
                <div className="relative w-full h-[95%]">
                  <Image
                    src={asset.src}
                    alt={speakerKey}
                    fill
                    unoptimized
                    className="object-contain object-bottom select-none mix-blend-multiply dark:mix-blend-normal"
                  />
                </div>

                {/* Speaker Tag Name */}
                <div
                  className={cn(
                    "absolute bottom-0 inset-x-0 py-1 text-center text-[9px] font-black uppercase tracking-widest text-white transition-colors duration-300",
                    isActive ? "bg-primary" : "bg-muted-foreground/30"
                  )}
                >
                  {speakerKey}
                </div>
              </m.div>
            );
          })}
        </div>
      </div>

      {/* 💬 Kotak Dialog Visual Novel (Separate Card Below Stage) */}
      <div className="w-full mt-4 p-5 sm:p-6 bg-card/45  border border-border/80 rounded-xl shadow-xl flex flex-col gap-4 glass mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/40 pb-3">
          {/* Label Pembicara */}
          <span
            className={cn(
              "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest text-white shadow-sm self-start",
              activeSpeakerKey === "zundamon" ? "bg-success" :
              (activeSpeakerKey === "ayu" || activeSpeakerKey === "lala") ? "bg-secondary" :
              (activeSpeakerKey === "narrator" || activeSpeakerKey === "narator") ? "bg-muted-foreground" : "bg-primary"
            )}
          >
            {rawSpeaker}
          </span>

          {/* 🎮 Mini Control Panel */}
          <div className="flex items-center gap-1.5 self-end sm:self-auto">
            {typeof currentLine.startTime === "number" && seekToLine && (
              <button
                onClick={() => seekToLine(currentLine.startTime!)}
                className="px-2.5 py-1.5 rounded-lg bg-primary hover:bg-primary/95 text-white transition-all shadow-md flex items-center gap-1 font-bold text-[9px] uppercase tracking-wider"
                title="Putar dialog baris ini"
                aria-label="Putar dialog baris ini"
              >
                <Play size={10} fill="currentColor" />
                <span>Putar</span>
              </button>
            )}
            <button
              onClick={handleReset}
              className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
              title="Reset"
              aria-label="Reset"
            >
              <RotateCcw size={13} />
            </button>
            <button
              onClick={handlePrev}
              disabled={currentIndex === 0}
              className="p-1.5 rounded-lg border border-border/60 bg-background/50 hover:bg-muted text-foreground disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm"
              aria-label="Kembali"
            >
              <ChevronLeft size={13} />
            </button>
            <button
              onClick={handleNext}
              disabled={currentIndex === dialogue.length - 1}
              className="px-3 py-1.5 rounded-lg bg-primary hover:bg-primary/95 text-white disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-md flex items-center gap-0.5 font-bold text-[9px] uppercase tracking-wider"
              aria-label="Lanjut"
            >
              <span>Lanjut</span>
              <ChevronRight size={10} />
            </button>
          </div>
        </div>

        {/* Konten Ucapan */}
        <div className="min-h-[50px] sm:min-h-[55px] flex flex-col justify-center">
          <p className="text-sm sm:text-base font-bold text-foreground leading-relaxed">
            {textVal}
          </p>
          {translationVal && (
            <p className="text-[11px] sm:text-xs text-muted-foreground italic leading-relaxed mt-0.5">
              {translationVal}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}