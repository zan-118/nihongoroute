/**
 * @file WritingCanvas.tsx
 * @description Komponen kanvas interaktif untuk melatih penulisan karakter Kanji/Kana menggunakan mouse atau touch input.
 * Mendukung animasi urutan goresan (stroke order) dan pembersihan kanvas secara real-time.
 * @module WritingCanvas
 */

"use client";

// ======================
// IMPORTS
// ======================
import React, { useRef, useState, useEffect, useCallback } from "react";
import { Trash2, Eye, EyeOff, RotateCcw, Zap } from "lucide-react";
import AnimatedKanji from "./AnimatedKanji";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

// ======================
// TYPES
// ======================
interface WritingCanvasProps {
  character: string;
  strokeColor?: string; // Warna goresan tangan (default: red-500)
  guideColor?: string; // Warna panduan stroke order (default: purple-500)
}

// ======================
// MAIN EXECUTION
// ======================

/**
 * Komponen WritingCanvas: Menyediakan area menggambar digital dengan panduan karakter.
 * 
 * @param {WritingCanvasProps} props - Karakter yang akan dilatih penulisan-nya.
 * @returns {JSX.Element} Antarmuka kanvas menulis.
 */
export default function WritingCanvas({ 
  character, 
  strokeColor = "#ef4444", 
  guideColor = "#a855f7" 
}: WritingCanvasProps) {
  // Refs & State
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [showGuide, setShowGuide] = useState(true);
  const [replayKey, setReplayKey] = useState(0);

  // ======================
  // EFFECTS
  // ======================

  /**
   * Mengatur ukuran kanvas dan mencegah scroll browser saat menyentuh kanvas.
   */
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
        ctx.strokeStyle = strokeColor;
        ctx.shadowBlur = 8;
        ctx.shadowColor = strokeColor + "99"; // Transparansi 60%

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

    // Mencegah scroll pada touch devices secara paksa
    const preventScroll = (e: TouchEvent) => {
      if (e.target === canvas) {
        e.preventDefault();
      }
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);
    
    // Gunakan listener non-passive untuk mendukung preventDefault()
    canvas.addEventListener("touchstart", preventScroll as any, { passive: false });
    canvas.addEventListener("touchmove", preventScroll as any, { passive: false });
    canvas.addEventListener("touchend", preventScroll as any, { passive: false });

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      canvas.removeEventListener("touchstart", preventScroll as any);
      canvas.removeEventListener("touchmove", preventScroll as any);
      canvas.removeEventListener("touchend", preventScroll as any);
    };
  }, []);

  // ======================
  // HELPER FUNCTIONS
  // ======================

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

  // ======================
  // RENDER
  // ======================
  return (
    <div className="flex flex-col gap-4 w-full max-w-[280px] sm:max-w-sm mx-auto">
      {/* AREA KANVAS */}
      <Card
        ref={containerRef}
        className="relative w-full aspect-square bg-black/60 border-2 border-white/5 rounded-[3rem] overflow-hidden group touch-none neo-inset shadow-none"
        style={{ touchAction: 'none' }}
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
            <AnimatedKanji 
              character={character} 
              triggerKey={replayKey} 
              color={guideColor}
            />
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
          style={{ touchAction: 'none' }}
        />

        {/* Status Indicator */}
        <div className="absolute top-4 left-4 flex items-center gap-2 z-20">
           <Zap size={12} className="text-red-500 animate-pulse" />
           <span className="text-[8px] font-black uppercase tracking-[0.3em] text-red-500/60 italic">Writing_Module_Active</span>
        </div>
      </Card>

      {/* KONTROL BAWAH */}
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

