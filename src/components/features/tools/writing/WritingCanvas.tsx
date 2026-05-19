"use client";

import React from "react";
import { Trash2, Eye, EyeOff, RotateCcw, Zap } from "lucide-react";
import AnimatedKanji from "@/components/features/tools/writing/AnimatedKanji";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import XPPop from "@/components/features/gamification/XPPop";
import { useWritingCanvas } from "../canvas/useWritingCanvas";

interface WritingCanvasProps {
  character?: string;
  strokeColor?: string;
  guideColor?: string;
  className?: string;
}

export default function WritingCanvas({ 
  character = "", 
  strokeColor = "#ef4444", 
  guideColor = "#a855f7",
  className = "max-w-[280px] sm:max-w-sm mx-auto"
}: WritingCanvasProps) {
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
  } = useWritingCanvas({ strokeColor });

  return (
    <div className={`flex flex-col gap-4 w-full ${className}`}>
      <Card
        ref={containerRef}
        className="relative w-full aspect-square bg-muted/50 dark:bg-card/40 border border-border rounded-2xl overflow-hidden group touch-none shadow-none"
        style={{ touchAction: 'none' }}
      >
        <div className="absolute inset-0 bg-[linear-gradient(rgba(var(--foreground-rgb),0.01)_1px,transparent_1px),linear-gradient(90deg,rgba(var(--foreground-rgb),0.01)_1px,transparent_1px)] bg-[size:25%_25%] opacity-40 pointer-events-none" />
        
        <div className="absolute inset-0 pointer-events-none opacity-10">
          <div className="absolute top-1/2 left-0 right-0 h-[1px] bg-destructive/30 border-dashed" />
          <div className="absolute left-1/2 top-0 bottom-0 w-[1px] bg-destructive/30 border-dashed" />
        </div>

        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-40">
          <XPPop show={showXP} amount={2} />
        </div>

        {showGuide && (
          <div className="absolute inset-8 pointer-events-none z-0">
            <AnimatedKanji 
              character={character} 
              triggerKey={replayKey} 
              color={guideColor}
            />
          </div>
        )}

        <canvas
          ref={canvasRef}
          onPointerDown={startDrawing}
          onPointerMove={draw}
          onPointerUp={stopDrawing}
          onPointerLeave={stopDrawing}
          className="absolute inset-0 w-full h-full cursor-crosshair z-10"
        />

        <div className="absolute top-3 left-3 flex items-center gap-2 z-20">
           <Zap size={10} className="text-destructive animate-pulse" />
           <span className="text-[7px] font-bold uppercase tracking-widest text-destructive/40">WRITING_ACTIVE</span>
        </div>
      </Card>

      <Card className="grid grid-cols-3 gap-2 bg-muted/50 p-2 rounded-2xl border-border shadow-none">
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
