/**
 * @file WritingCanvas.tsx
 * @description Komponen kanvas coretan (canvas drawing) interaktif untuk melatih penulisan Hiragana, Katakana, dan Kanji, terintegrasi dengan sensor akurasi goresan.
 */

// ==========================================
// IMPORT & DEPENDENSI
// ==========================================
import React from "react";
import { Trash2, Eye, EyeOff, RotateCcw, Zap, CheckCircle } from "lucide-react";
import AnimatedKanji from "@/components/features/tools/writing/AnimatedKanji";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import XPPop from "@/components/features/gamification/XPPop";
import { useWritingCanvas } from "../canvas/useWritingCanvas";

// ==========================================
// TIPE DATA / INTERFACE
// ==========================================
/**
 * Props for WritingCanvas component.
 */
interface WritingCanvasProps {
  /** Character to write. */
  character?: string;
  /** Color of user stroke. */
  strokeColor?: string;
  /** Color of guide stroke. */
  guideColor?: string;
  /** Custom CSS classes. */
  className?: string;
}

// ==========================================
// KOMPONEN UTAMA
// ==========================================
/**
 * Interactive canvas component for Japanese writing practice.
 * Detects stroke accuracy and provides visual feedback.
 */
export default function WritingCanvas({ 
  character = "", 
  strokeColor = "rgb(var(--primary-rgb))", 
  guideColor = "rgb(var(--secondary-rgb))",
  className = "max-w-[280px] sm:max-w-sm mx-auto"
}: WritingCanvasProps) {
  // Get canvas state and drawing handlers.
  const {
    canvasRef,
    containerRef,
    showGuide,
    setShowGuide,
    replayKey,
    startDrawing,
    draw,
    stopDrawing,
    clearCanvas,
    handleReplay,
    showXP,
    currentStrokeIndex,
    totalStrokes,
    strokeError,
    isCompleted,
  } = useWritingCanvas({ character, strokeColor });

  // Compute dynamic styles based on success or error state.
  const containerClass = `relative w-full aspect-square rounded-lg overflow-hidden group touch-none transition-all duration-500 border ${
    isCompleted
      ? "border-success/40 shadow-[0_0_30px_rgb(var(--success-rgb)/0.25)] bg-success/5"
      : strokeError
      ? "border-destructive/40 shadow-[0_0_30px_rgb(var(--destructive-rgb)/0.3)] bg-destructive/5 animate-pulse"
      : "border-border shadow-[0_0_20px_rgb(var(--primary-rgb)/0.12)] bg-muted/40 dark:bg-card/30 glass"
  }`;

  // ==========================================
  // RENDER KOMPONEN
  // ==========================================
  return (
    <div className={`flex flex-col gap-4 w-full ${className}`}>
      <Card
        ref={containerRef}
        className={containerClass}
        style={{ touchAction: 'none' }}
      >
        {/* Render background grid lines. */}
        <div className="absolute inset-0 bg-[linear-gradient(rgb(var(--foreground-rgb)/0.01)_1px,transparent_1px),linear-gradient(90deg,rgb(var(--foreground-rgb)/0.01)_1px,transparent_1px)] bg-[size:25%_25%] opacity-40 pointer-events-none" />
        
        {/* Render center guidelines. */}
        <div className="absolute inset-0 pointer-events-none opacity-10">
          <div className="absolute top-1/2 left-0 right-0 h-[1px] bg-destructive/30 border-dashed" />
          <div className="absolute left-1/2 top-0 bottom-0 w-[1px] bg-destructive/30 border-dashed" />
        </div>

        {/* Show XP pop animation on success. */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-40">
          <XPPop show={showXP} amount={10} />
        </div>

        {/* Overlay Sukses Coretan Selesai */}
        {isCompleted && (
          <div className="absolute inset-0 bg-background/85  flex flex-col items-center justify-center gap-4 z-30 transition-all duration-300 animate-in fade-in">
            <div className="h-14 w-14 rounded-full bg-success/15 border border-success/30 flex items-center justify-center text-success shadow-[0_0_20px_rgb(var(--success-rgb)/0.3)]">
              <CheckCircle size={28} className="animate-premium-bounce" />
            </div>
            <div className="text-center space-y-1">
              <h4 className="text-xs uppercase tracking-widest text-success">Latihan Selesai!</h4>
              <p className="text-[9px] text-muted-foreground">Kanji "{character}" Berhasil Ditulis</p>
            </div>
            <Button 
              size="sm"
              variant="outline"
              onClick={handleReplay}
              className="mt-2 text-[8px] font-bold uppercase tracking-wider rounded-xl bg-success/10 border-success/30 text-success hover:bg-success/20 transition-all px-4 py-1.5"
            >
              Tulis Lagi
            </Button>
          </div>
        )}

        {/* Tooltip Deteksi Kesalahan Coretan */}
        {strokeError && (
          <div className="absolute bottom-5 left-1/2 -translate-x-1/2 px-4 py-2 rounded-xl bg-destructive/10 border border-destructive/20  text-[9px] font-bold uppercase tracking-wider text-destructive shadow-[0_0_15px_rgb(var(--destructive-rgb)/0.25)] animate-premium-bounce z-30">
            {strokeError === "reverse" ? "Arah guratan terbalik!" : "Guratan kurang tepat!"}
          </div>
        )}

        {showGuide && character && (
          <>
            {/* Tracing guide in the background */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0 select-none">
              <span className="text-[140px] sm:text-[180px] font-japanese text-foreground/10 font-bold leading-none animate-pulse">
                {character}
              </span>
            </div>
            {/* Stroke order animation guide. */}
            <div className="absolute inset-8 pointer-events-none z-0">
              <AnimatedKanji 
                character={character} 
                triggerKey={replayKey} 
                color={guideColor}
              />
            </div>
          </>
        )}

        {/* Interactive drawing canvas. */}
        <canvas
          ref={canvasRef}
          onPointerDown={startDrawing}
          onPointerMove={draw}
          onPointerUp={stopDrawing}
          onPointerLeave={stopDrawing}
          className="absolute inset-0 w-full h-full cursor-crosshair z-10"
        />

        {/* Show current stroke progress. */}
        <div className="absolute top-3 left-3 flex items-center gap-2 z-20">
           <Zap size={10} className="text-destructive animate-pulse" />
           <span className="text-[7px] font-mono font-bold uppercase tracking-widest text-muted-foreground">
             {totalStrokes > 0 ? `Guratan ${currentStrokeIndex + 1} / ${totalStrokes}` : "WRITING_ACTIVE"}
           </span>
        </div>
      </Card>

      {/* Control panel for guide, replay, and clear actions. */}
      <Card className="grid grid-cols-3 gap-2 bg-muted/50 p-2 rounded-lg border-border shadow-none">
        {character && (
          <>
            <Button
              variant="ghost"
              onClick={() => setShowGuide(!showGuide)}
              className={`flex flex-col items-center justify-center gap-1.5 h-auto py-2.5 rounded-xl text-[8px] font-bold uppercase tracking-wider transition-all ${
                showGuide
                  ? "bg-destructive/10 text-destructive border-destructive/20"
                  : "bg-muted dark:bg-card/50 text-muted-foreground border-border"
              } border`}
            >
              {showGuide ? <Eye size={16} /> : <EyeOff size={16} />}
              <span>Guide</span>
            </Button>

            <Button
              variant="ghost"
              onClick={handleReplay}
              className="flex flex-col items-center justify-center gap-1.5 h-auto py-2.5 rounded-xl bg-muted dark:bg-card/50 text-muted-foreground border border-border text-[8px] font-bold uppercase tracking-wider hover:text-secondary hover:border-secondary/20 transition-all"
            >
              <RotateCcw size={16} />
              <span>Replay</span>
            </Button>
          </>
        )}

        <Button
          variant="ghost"
          onClick={clearCanvas}
          className={`flex flex-col items-center justify-center gap-1.5 h-auto py-2.5 rounded-xl bg-muted dark:bg-card/50 text-muted-foreground border border-border text-[8px] font-bold uppercase tracking-wider hover:text-destructive hover:border-destructive/20 transition-all ${!character ? 'col-span-3' : ''}`}
        >
          <Trash2 size={16} />
          <span>Clear</span>
        </Button>
      </Card>
    </div>
  );
}