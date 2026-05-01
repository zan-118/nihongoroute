"use client";

import React from "react";
import { Trash2, Eye, EyeOff, RotateCcw, Zap } from "lucide-react";
import AnimatedKanji from "@/components/AnimatedKanji";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useWritingCanvas } from "./features/tools/canvas/useWritingCanvas";

interface WritingCanvasProps {
  character: string;
  strokeColor?: string;
  guideColor?: string;
}

export default function WritingCanvas({ 
  character, 
  strokeColor = "#ef4444", 
  guideColor = "#a855f7" 
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
  } = useWritingCanvas({ strokeColor });

  return (
    <div className="flex flex-col gap-4 w-full max-w-[280px] sm:max-w-sm mx-auto">
      <Card
        ref={containerRef}
        className="relative w-full aspect-square bg-black/60 border-2 border-white/5 rounded-[3rem] overflow-hidden group touch-none neo-inset shadow-none"
        style={{ touchAction: 'none' }}
      >
        <div className="absolute inset-0 bg-[linear-gradient(rgba(239,68,68,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(239,68,68,0.02)_1px,transparent_1px)] bg-[size:25%_25%] opacity-40 pointer-events-none" />
        
        <div className="absolute inset-0 pointer-events-none opacity-20">
          <div className="absolute top-1/2 left-0 right-0 h-[1px] bg-red-500/40 border-dashed" />
          <div className="absolute left-1/2 top-0 bottom-0 w-[1px] bg-red-500/40 border-dashed" />
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
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
          className="absolute inset-0 w-full h-full cursor-crosshair z-10"
          style={{ touchAction: 'none' }}
        />

        <div className="absolute top-4 left-4 flex items-center gap-2 z-20">
           <Zap size={12} className="text-red-500 animate-pulse" />
           <span className="text-[8px] font-black uppercase tracking-[0.3em] text-red-500/60 italic">Writing_Module_Active</span>
        </div>
      </Card>

      <Card className="grid grid-cols-3 gap-2 bg-cyber-surface p-2 md:p-3 rounded-[2rem] border-white/5 neo-card shadow-none">
        <Button
          variant="ghost"
          onClick={() => setShowGuide(!showGuide)}
          className={`flex flex-col items-center justify-center gap-2 h-auto py-3 rounded-2xl text-[9px] font-black uppercase tracking-widest transition-all neo-inset ${
            showGuide
              ? "bg-red-500/10 text-red-500 border-red-500/30"
              : "bg-black/40 text-slate-500 border-white/5"
          }`}
        >
          {showGuide ? <Eye size={18} /> : <EyeOff size={18} />}
          <span className="italic">Guide</span>
        </Button>

        <Button
          variant="ghost"
          onClick={handleReplay}
          className="flex flex-col items-center justify-center gap-2 h-auto py-3 rounded-2xl bg-black/40 text-slate-500 border-white/5 text-[9px] font-black uppercase tracking-widest hover:text-purple-400 hover:border-purple-500/30 transition-all neo-inset"
        >
          <RotateCcw size={18} />
          <span className="italic">Replay</span>
        </Button>

        <Button
          variant="ghost"
          onClick={clearCanvas}
          className="flex flex-col items-center justify-center gap-2 h-auto py-3 rounded-2xl bg-black/40 text-slate-500 border-white/5 text-[9px] font-black uppercase tracking-widest hover:text-red-500 hover:border-red-500/30 transition-all neo-inset"
        >
          <Trash2 size={18} />
          <span className="italic">Clear</span>
        </Button>
      </Card>
    </div>
  );
}
