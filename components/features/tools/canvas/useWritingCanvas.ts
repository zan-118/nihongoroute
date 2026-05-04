import { useRef, useState, useEffect, useCallback } from "react";
import { useUserStore } from "@/store/useUserStore";
import { useSRSStore } from "@/store/useSRSStore";
import { useUIStore } from "@/store/useUIStore";

interface UseWritingCanvasProps {
  strokeColor: string;
}

/**
 * @file useWritingCanvas.ts
 * @description Hook untuk mengelola kanvas latihan menulis.
 * Dioptimalkan dengan PointerEvents untuk mendukung sensitivitas tekanan (pressure sensitivity)
 * layaknya menulis dengan kuas (Fude) dan terintegrasi dengan sistem XP.
 */

export function useWritingCanvas({ strokeColor }: UseWritingCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [showGuide, setShowGuide] = useState(true);
  const [replayKey, setReplayKey] = useState(0);
  const [hasDrawn, setHasDrawn] = useState(false);
  const [showXP, setShowXP] = useState(false);
  
  const { name, xp, level, streak, todayReviewCount, lastStudyDate, studyDays, inventory } = useUserStore();
    const { srs } = useSRSStore();
    const { notifications, settings } = useUIStore();
    const addXP = { name, xp, level, streak, todayReviewCount, lastStudyDate, studyDays, inventory, srs, notifications, settings };

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
        ctx.lineWidth = 8;
        ctx.strokeStyle = strokeColor;
        ctx.shadowBlur = 4;
        ctx.shadowColor = strokeColor + "66";

        const img = new Image();
        img.src = dataUrl;
        img.onload = () =>
          ctx.drawImage(img, 0, 0, container.clientWidth, container.clientHeight);
      }
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);
    
    return () => window.removeEventListener("resize", resizeCanvas);
  }, [strokeColor]);

  const startDrawing = useCallback((e: React.PointerEvent) => {
    // Only allow primary pointer (mouse left click, touch, pen)
    if (e.button !== 0 && e.pointerType === "mouse") return;
    
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
    setHasDrawn(true);

    // Haptic feedback for supported devices
    if ("vibrate" in navigator) navigator.vibrate(5);
  }, []);

  const draw = useCallback(
    (e: React.PointerEvent) => {
      if (!isDrawing) return;
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext("2d");
      if (!canvas || !ctx) return;

      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      // Efek kuas: Variasi lebar garis berdasarkan tekanan (default 0.5 jika tidak didukung)
      const pressure = e.pressure || 0.5;
      ctx.lineWidth = 4 + (pressure * 16); 
      
      ctx.lineTo(x, y);
      ctx.stroke();
    },
    [isDrawing]
  );

  const stopDrawing = useCallback(() => {
    setIsDrawing(false);
  }, []);

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (ctx && canvas) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      if (hasDrawn) {
        addXP(2);
        setShowXP(true);
        setTimeout(() => setShowXP(false), 1500);
        setHasDrawn(false);
      }
    }
  };

  const handleReplay = () => {
    clearCanvas();
    setReplayKey((prev) => prev + 1);
  };

  return {
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
  };
}
