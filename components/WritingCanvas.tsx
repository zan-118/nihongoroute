/**
 * LOKASI FILE: components/WritingCanvas.tsx
 * KONSEP: Cyber-Dark Neumorphic (Neural Writing Terminal)
 */

"use client";

import React, { useRef, useState, useEffect, useCallback } from "react";
import { Trash2, Eye, EyeOff, RotateCcw, Zap } from "lucide-react";
import AnimatedKanji from "./AnimatedKanji";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface WritingCanvasProps {
  character: string;
}

export default function WritingCanvas({ character }: WritingCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [showGuide, setShowGuide] = useState(true);

  // State ini digunakan untuk me-restart animasi SVG
  const [replayKey, setReplayKey] = useState(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const resizeCanvas = () => {
      const dataUrl = canvas.toDataURL();
      const ratio = window.devicePixelRatio || 1;
      canvas.width = container.clientWidth * ratio;
      canvas.height = container.clientHeight * ratio;
      canvas.style.width = `${container.clientWidth}px`;
      canvas.style.height = `${container.clientHeight}px`;

      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.scale(ratio, ratio);
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        ctx.lineWidth = 10;
        ctx.strokeStyle = "#ef4444"; // red-500
        ctx.shadowBlur = 8;
        ctx.shadowColor = "rgba(239, 68, 68, 0.6)";

        const img = new Image();
        img.src = dataUrl;
        img.onload = () =>
          ctx.drawImage(
            img,
            0,
            0,
            container.clientWidth,
            container.clientHeight,
          );
      }
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);
    return () => window.removeEventListener("resize", resizeCanvas);
  }, []);

  const startDrawing = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x =
      ("touches" in e
        ? e.touches[0].clientX
        : (e as React.MouseEvent).clientX) - rect.left;
    const y =
      ("touches" in e
        ? e.touches[0].clientY
        : (e as React.MouseEvent).clientY) - rect.top;

    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
  }, []);

  const draw = useCallback(
    (e: React.MouseEvent | React.TouchEvent) => {
      e.preventDefault();
      if (!isDrawing) return;
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext("2d");
      if (!canvas || !ctx) return;

      const rect = canvas.getBoundingClientRect();
      const x =
        ("touches" in e
          ? e.touches[0].clientX
          : (e as React.MouseEvent).clientX) - rect.left;
      const y =
        ("touches" in e
          ? e.touches[0].clientY
          : (e as React.MouseEvent).clientY) - rect.top;

      ctx.lineTo(x, y);
      ctx.stroke();
    },
    [isDrawing],
  );

  const stopDrawing = useCallback(() => setIsDrawing(false), []);

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (ctx && canvas) ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  const handleReplay = () => {
    clearCanvas();
    setReplayKey((prev) => prev + 1);
  };

  return (
    <div className="flex flex-col gap-6 w-full max-w-sm mx-auto">
      {/* AREA KANVAS */}
      <Card
        ref={containerRef}
        className="relative w-full aspect-square bg-black/60 border-2 border-white/5 rounded-[3rem] overflow-hidden group touch-none neo-inset shadow-none"
      >
        {/* Background Grid Protocol */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(239,68,68,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(239,68,68,0.02)_1px,transparent_1px)] bg-[size:25%_25%] opacity-40 pointer-events-none" />
        
        {/* Crosshair Center */}
        <div className="absolute inset-0 pointer-events-none opacity-20">
          <div className="absolute top-1/2 left-0 right-0 h-[1px] bg-red-500/40 border-dashed" />
          <div className="absolute left-1/2 top-0 bottom-0 w-[1px] bg-red-500/40 border-dashed" />
        </div>

        {/* Lapis Bawah: Animasi Stroke Order SVG */}
        {showGuide && (
          <div className="absolute inset-8 pointer-events-none z-0">
            <AnimatedKanji character={character} triggerKey={replayKey} />
          </div>
        )}

        {/* Lapis Atas: HTML5 Canvas untuk Menggambar */}
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
        />

        {/* Status Indicator */}
        <div className="absolute top-4 left-4 flex items-center gap-2 z-20">
           <Zap size={12} className="text-red-500 animate-pulse" />
           <span className="text-[8px] font-black uppercase tracking-[0.3em] text-red-500/60 italic">Writing_Module_Active</span>
        </div>
      </Card>

      {/* KONTROL BAWAH */}
      <Card className="grid grid-cols-3 gap-3 bg-cyber-surface p-3 rounded-[2rem] border-white/5 neo-card shadow-none">
        <Button
          variant="ghost"
          onClick={() => setShowGuide(!showGuide)}
          className={`flex flex-col items-center justify-center gap-2 h-auto py-4 rounded-2xl text-[9px] font-black uppercase tracking-widest transition-all neo-inset ${
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
          className="flex flex-col items-center justify-center gap-2 h-auto py-4 rounded-2xl bg-black/40 text-slate-500 border-white/5 text-[9px] font-black uppercase tracking-widest hover:text-purple-400 hover:border-purple-500/30 transition-all neo-inset"
        >
          <RotateCcw size={18} />
          <span className="italic">Replay</span>
        </Button>

        <Button
          variant="ghost"
          onClick={clearCanvas}
          className="flex flex-col items-center justify-center gap-2 h-auto py-4 rounded-2xl bg-black/40 text-slate-500 border-white/5 text-[9px] font-black uppercase tracking-widest hover:text-red-500 hover:border-red-500/30 transition-all neo-inset"
        >
          <Trash2 size={18} />
          <span className="italic">Clear</span>
        </Button>
      </Card>
    </div>
  );
}
