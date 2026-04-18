"use client";

import React, { useRef, useState, useEffect, useCallback } from "react";
import { Trash2, Eye, EyeOff, RotateCcw } from "lucide-react";
import AnimatedKanji from "./AnimatedKanji";

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
        ctx.lineWidth = 12;
        ctx.strokeStyle = "#22d3ee"; // text-cyan-400

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
    <div className="flex flex-col gap-4 w-full max-w-sm mx-auto">
      {/* AREA KANVAS */}
      <div
        ref={containerRef}
        className="relative w-full aspect-square bg-[#0a0c10] border-2 border-white/10 rounded-3xl overflow-hidden shadow-[inset_0_10px_30px_rgba(0,0,0,0.8)] group touch-none"
      >
        {/* Garis Bantu Tanda Plus Samar */}
        <div className="absolute inset-0 pointer-events-none border border-white/5 opacity-20">
          <div className="absolute top-1/2 left-0 right-0 h-[1px] bg-white/20 border-dashed" />
          <div className="absolute left-1/2 top-0 bottom-0 w-[1px] bg-white/20 border-dashed" />
        </div>

        {/* Lapis Bawah: Animasi Stroke Order SVG */}
        {showGuide && (
          <div className="absolute inset-4 pointer-events-none z-0">
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
      </div>

      {/* KONTROL BAWAH */}
      <div className="flex items-center justify-between gap-2 sm:gap-4 bg-cyber-surface p-2 rounded-2xl border border-white/5">
        <button
          onClick={() => setShowGuide(!showGuide)}
          className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-[9px] sm:text-[10px] font-black uppercase tracking-widest transition-all ${
            showGuide
              ? "bg-cyan-400/10 text-cyan-400 border border-cyan-400/30"
              : "bg-transparent text-slate-200 border border-transparent hover:bg-white/5"
          }`}
        >
          {showGuide ? <Eye size={16} /> : <EyeOff size={16} />}
          <span className="hidden sm:block">Panduan</span>
        </button>

        <button
          onClick={handleReplay}
          className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/30 text-[9px] sm:text-[10px] font-black uppercase tracking-widest hover:bg-purple-500 hover:text-black transition-all"
        >
          <RotateCcw size={16} />
          <span className="hidden sm:block">Putar Ulang</span>
        </button>

        <button
          onClick={clearCanvas}
          className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-red-500/10 text-red-400 border border-red-500/30 text-[9px] sm:text-[10px] font-black uppercase tracking-widest hover:bg-red-500 hover:text-black transition-all"
        >
          <Trash2 size={16} />
          <span className="hidden sm:block">Hapus</span>
        </button>
      </div>
    </div>
  );
}
