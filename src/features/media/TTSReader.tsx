/**
 * @file TTSReader.tsx
 * @description Text-to-Speech (TTS) AI audio playback button component for Japanese text in the media domain module.
 */

"use client";

// ==========================================
// Import & Dependencies
// ==========================================
import React from "react";
import { Button } from "@/components/ui/button";
import { VolumeUp, SoundModule } from "@/components/ui/icons";
import { useTTSReader } from "./useTTSReader";

// ==========================================
// Component Props Interface
// ==========================================
export interface TTSReaderProps {
 /** Japanese text content to read. */
 text: string;
 /** Render minimal icon-only button. */
 minimal?: boolean;
 /** Voice speaker identifier. */
 speaker?: string;
 /** Render small icon-only button. */
 small?: boolean;
 /** Pre-existing audio source URL. */
 audioUrl?: string | null;
}

// ==========================================
// Main Component
// ==========================================
export function TTSReader({ text, minimal = false, speaker, small = false, audioUrl }: TTSReaderProps) {
 const { isPlaying, hasJapanese, speak } = useTTSReader(text, speaker, audioUrl);

 if (!hasJapanese || !text) return null;

 return (
 <Button
 variant="ghost"
 onClick={(e) => {
 e.preventDefault();
 e.stopPropagation();
 speak();
 }}
 className={`flex items-center justify-center gap-3 border transition-all font-black uppercase tracking-[0.2em] h-auto italic ${
 small
 ? "w-8 h-8 rounded-lg"
 : minimal
 ? "w-12 h-12 md:w-14 md:h-14 rounded-lg"
 : "px-6 py-2.5 rounded-xl w-max text-xs"
 } ${
 isPlaying
 ? "bg-destructive/10 border-destructive/40 text-destructive shadow-[0_0_20px_hsl(var(--destructive)/0.2)] neo-card"
 : "bg-muted/50 border-border text-muted-foreground hover:text-destructive hover:border-destructive/30 neo-inset shadow-none"
 }`}
 title="Vocal_Synthesis_Execution"
 aria-label={isPlaying ? "Berhenti mendengarkan" : "Dengarkan pengucapan"}
 >
 {isPlaying ? (
 <SoundModule size={small ? 14 : minimal ? 24 : 16} className="animate-pulse" />
 ) : (
 <VolumeUp size={small ? 14 : minimal ? 24 : 16} />
 )}
 {!minimal && !small && (isPlaying ? "Hentikan" : "Dengar")}
 </Button>
 );
}

export default TTSReader;
