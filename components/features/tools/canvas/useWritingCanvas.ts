import { useRef, useState, useEffect, useCallback } from "react";

interface UseWritingCanvasProps {
  strokeColor: string;
}

export function useWritingCanvas({ strokeColor }: UseWritingCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [showGuide, setShowGuide] = useState(true);
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
        ctx.strokeStyle = strokeColor;
        ctx.shadowBlur = 8;
        ctx.shadowColor = strokeColor + "99";

        const img = new Image();
        img.src = dataUrl;
        img.onload = () =>
          ctx.drawImage(img, 0, 0, container.clientWidth, container.clientHeight);
      }
    };

    const preventScroll = (e: TouchEvent) => {
      if (e.target === canvas) {
        e.preventDefault();
      }
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);
    
    canvas.addEventListener("touchstart", preventScroll as EventListener, { passive: false });
    canvas.addEventListener("touchmove", preventScroll as EventListener, { passive: false });
    canvas.addEventListener("touchend", preventScroll as EventListener, { passive: false });

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      canvas.removeEventListener("touchstart", preventScroll as EventListener);
      canvas.removeEventListener("touchmove", preventScroll as EventListener);
      canvas.removeEventListener("touchend", preventScroll as EventListener);
    };
  }, [strokeColor]);

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
    [isDrawing]
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
  };
}
