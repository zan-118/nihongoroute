"use client";

/**
 * @file StudyPanel.tsx
 * @description Panel belajar: visualizer (StickerScene/IllustrationGallery) dan transkrip percakapan flat.
 */

import { useEffect, useMemo, useRef } from "react";
import { m } from "framer-motion";
import { VolumeUp } from "@/components/ui/icons";
import { cn } from "@/lib/utils";
import { StickerScene } from "@/components/ui/StickerScene";
import { IllustrationGallery } from "@/components/ui/IllustrationGallery";
import { SmartJapanese } from "@/components/ui/japanese";
import { TranscriptLine } from "../../types";

/** Represents a node structure in PortableText format. */
interface PortableTextNode {
  text?: string;
  children?: { text?: string }[];
}

/** Extracts plain text from a transcript line's text field. */
function extractLineText(text: TranscriptLine["text"]): string {
  if (typeof text === "string") return text;
  if (Array.isArray(text)) {
    return (text as unknown as PortableTextNode[])
      .map((block) => block?.children?.map((c) => c?.text || "").join("") || block?.text || "")
      .join(" ");
  }
  return String(text || "");
}

/** Props untuk StudyPanel. */
interface StudyPanelProps {
  transcript: TranscriptLine[];
  currentActiveIndex: number;
  seekToLine: (startTime: number) => void;
  speakingIndex: number;
  loadingIndex: number;
  speakLine: (line: TranscriptLine, index: number) => void;
  stopLineTTS: () => void;
  isTranscriptHidden: boolean;
  showTranslation: boolean;
  imageUrl?: string;
  illustrations: { title?: string; content: string }[];
  title: string;
}

/**
 * Panel belajar utama: visualizer + transkrip flat.
 */
export function StudyPanel({
  transcript,
  currentActiveIndex,
  seekToLine,
  speakingIndex,
  loadingIndex,
  speakLine,
  stopLineTTS,
  isTranscriptHidden,
  showTranslation,
  imageUrl,
  illustrations,
  title,
}: StudyPanelProps) {
  // Auto-scroll active transcript line into view
  const activeLineRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (activeLineRef.current && scrollContainerRef.current) {
      const parent = scrollContainerRef.current;
      const child = activeLineRef.current;
      const parentRect = parent.getBoundingClientRect();
      const childRect = child.getBoundingClientRect();
      const relativeTop = childRect.top - parentRect.top + parent.scrollTop;
      const targetScroll = relativeTop - parentRect.height / 2 + childRect.height / 2;
      // Guard: scrollTo tidak tersedia di semua environment (mis. jsdom).
      if (typeof parent.scrollTo === "function") {
        parent.scrollTo({ top: targetScroll, behavior: "smooth" });
      }
    }
  }, [currentActiveIndex]);

  // Speaker Alignment Memo: Assigns left/right layout positions to speakers dynamically
  const speakerSides = useMemo(() => {
    const sides: Record<string, "left" | "right"> = {};
    let nonNarratorCount = 0;
    transcript.forEach((line) => {
      if (line.speaker) {
        const lower = line.speaker.toLowerCase().trim();
        const isNarrator = lower === "narrator" || lower === "narator" || lower === "instruction";
        if (!isNarrator && !sides[line.speaker]) {
          sides[line.speaker] = nonNarratorCount % 2 === 0 ? "left" : "right";
          nonNarratorCount++;
        }
      }
    });
    return sides;
  }, [transcript]);

  return (
  <>
{/* Visualizer Stage */}
 {transcript.some((t) => t.speaker) ? (
 <StickerScene
 dialogue={transcript}
 activeIndex={currentActiveIndex}
 seekToLine={seekToLine}
 backgroundUrl={imageUrl}
 title="Peragaan Percakapan Interaktif"
 borderless={true}
 />
 ) : (
 <IllustrationGallery
 illustrations={illustrations}
 fallbackImage={imageUrl}
 title={title}
 />
 )}

 {/* Flat Conversation Transcript Feed */}
 <div className="relative w-full">
 <div
 ref={scrollContainerRef}
 className="max-h-125 overflow-y-auto pr-2 custom-scrollbar flex flex-col gap-4 relative z-10"
 >
 {transcript.map((line, idx) => {
 const isActive = idx === currentActiveIndex;
 const isSpeaking = speakingIndex === idx;
 const isLoading = loadingIndex === idx;

 const speaker = line.speaker;
 let align = "self-start items-start text-left";
 let bubbleClass = "rounded-lg rounded-tl-none bg-muted/10 border-border/80 hover:bg-muted/15";
 let textAccent = "text-primary";

 // Align bubbles based on speaker side mapping
 if (speaker) {
 const side = speakerSides[speaker];
 if (side === "right") {
 align = "self-end items-end text-right";
 bubbleClass = "rounded-lg rounded-tr-none bg-primary/5 border-primary/20 hover:bg-primary/10";
 textAccent = "text-secondary";
 }
 }

 return (
 <div key={line._key || idx} className={cn("flex flex-col w-full max-w-[85%] sm:max-w-[75%]", align)}>
 <m.div
 ref={isActive ? activeLineRef : null}
 onClick={() => seekToLine(line.startTime)}
 animate={{ scale: isActive ? 1.01 : 1, opacity: isActive ? 1 : 0.75 }}
 className={cn(
 "group relative p-4 pr-12 cursor-pointer transition-all duration-300 border rounded-lg w-full",
 bubbleClass,
 isActive && "border-primary/50 shadow-sm scale-[1.01]"
 )}
 >
 {/* Speaker Indicator */}
 {speaker && (
 <div className={cn("flex items-center gap-1.5 mb-1.5 text-[9px] font-black uppercase tracking-wider", textAccent)}>
 <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
 <span>{speaker}</span>
 </div>
 )}

 {/* Japanese text */}
 {!isTranscriptHidden ? (
 <div className="text-base sm:text-lg font-japanese font-medium leading-relaxed text-foreground">
 <SmartJapanese word={extractLineText(line.text)} furigana={line.furigana} />
 </div>
 ) : (
 <div className="h-4 w-32 rounded bg-muted/20 animate-pulse" />
 )}

 {/* Translation */}
 {(!isTranscriptHidden && (isActive || showTranslation)) && (
 <p className="text-xs sm:text-sm text-muted-foreground/80 italic border-t border-border/40 pt-2 mt-2 leading-relaxed">
 {line.translation}
 </p>
 )}

 {/* PlayCircle button per line */}
 <button
 onClick={(e) => {
 e.stopPropagation();
 if (isSpeaking || isLoading) {
 stopLineTTS();
 } else {
 speakLine(line, idx);
 }
 }}
 className="absolute top-4 right-4 p-1 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
 aria-label="Putar baris audio"
 >
 <VolumeUp size={14} className={cn(isSpeaking && "text-success animate-bounce")} />
 </button>
 </m.div>
 </div>
 );
 })}
 </div>
 </div>
</>
  );
}
