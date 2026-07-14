/**
 * @file useWritingCanvas.ts
 * @description Hook kustom untuk mengelola kanvas coretan (canvas drawing) interaktif untuk melatih penulisan Hiragana, Katakana, dan Kanji, terintegrasi dengan sensor akurasi goresan.
 */

// ==========================================
// IMPORT & DEPENDENSI
// ==========================================
import { useRef, useState, useEffect, useCallback } from "react";
import { useUserStore } from "@/store/useUserStore";
import { sounds } from "@/lib/audio";

// ==========================================
// TIPE DATA / INTERFACE
// ==========================================
/**
 * Hook properties.
 */
interface UseWritingCanvasProps {
  /** Character to draw. */
  character: string;
  /** Color of stroke. */
  strokeColor: string;
}

// ==========================================
// FUNGSI PEMBANTU INTERNAL (HELPERS)
// ==========================================

/**
 * Convert CSS color to canvas shadow color. Handle CSS variables, RGB, RGBA, HEX.
 */
const getShadowColor = (colorStr: string, opacity: number): string => {
  if (typeof window === "undefined") return colorStr;
  let resolved = colorStr;
  
  if (colorStr.includes("var(")) {
    try {
      // Resolve CSS variable. Create temp element to read computed style.
      const temp = document.createElement("div");
      temp.style.color = colorStr;
      document.body.appendChild(temp);
      resolved = getComputedStyle(temp).color;
      document.body.removeChild(temp);
    } catch (e) {
      // Default aman cadangan jika getComputedStyle gagal atau di lingkungan pengujian
    }
  }

  // Tangani format rgb(r, g, b)
  if (resolved.startsWith("rgb(")) {
    // Convert RGB to RGBA. Add opacity.
    return resolved.replace("rgb(", "rgba(").replace(")", `, ${opacity})`);
  }
  // Tangani format rgba(r, g, b, a)
  if (resolved.startsWith("rgba(")) {
    return resolved;
  }
  
  // Tangani format HEX
  let hex = resolved.replace("#", "").trim();
  if (hex.length === 3) {
    // Expand 3-digit HEX to 6-digit.
    hex = hex.split("").map((c) => c + c).join("");
  }
  if (hex.length === 6) {
    // Convert 6-digit HEX to RGBA.
    const r = parseInt(hex.slice(0, 2), 16);
    const g = parseInt(hex.slice(2, 4), 16);
    const b = parseInt(hex.slice(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  }
  
  return resolved;
};

// ==========================================
// HOOK UTAMA
// ==========================================
/**
 * Manage drawing canvas, validate strokes, track progress.
 */
export function useWritingCanvas({ character, strokeColor }: UseWritingCanvasProps) {
  // ==========================================
  // STATUS & STATE & REFS
  // ==========================================
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const [isDrawing, setIsDrawing] = useState(false);
  const [showGuide, setShowGuide] = useState(true);
  const [replayKey, setReplayKey] = useState(0);
  const [hasDrawn, setHasDrawn] = useState(false);
  const [showXP, setShowXP] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

  // State untuk melacak data guratan standar dan indeks saat ini
  const [standardPaths, setStandardPaths] = useState<string[]>([]);
  const [currentStrokeIndex, setCurrentStrokeIndex] = useState(0);
  const [strokeError, setStrokeError] = useState<"wrong" | "reverse" | null>(null);
  const [isLocked, setIsLocked] = useState(false);

  // Ref untuk merekam koordinat coretan aktif dan daftar coretan yang benar
  const currentStrokePointsRef = useRef<{ x: number; y: number }[]>([]);
  const correctStrokesRef = useRef<{ x: number; y: number }[][]>([]);

  const addXP = useUserStore((state) => state.addXP);

  // ==========================================
  // EFEK SAMPING (EFFECTS)
  // ==========================================
  // Memuat data guratan KanjiVG dengan dukung Caching Offline-First
  useEffect(() => {
    if (!character) {
      requestAnimationFrame(() => {
        setStandardPaths([]);
        setCurrentStrokeIndex(0);
        setIsCompleted(false);
      });
      correctStrokesRef.current = [];
      return;
    }

    const fetchSVG = async () => {
      try {
        const baseChar = character.charAt(0);
        const code = baseChar.charCodeAt(0).toString(16).padStart(5, "0");
        const url = `https://raw.githubusercontent.com/KanjiVG/kanjivg/master/kanji/${code}.svg`;

        let svgText = "";
        try {
          // Fetch KanjiVG SVG. Use Cache API for offline support.
          const cache = await caches.open("nihongoroute_kanjivg_cache");
          const cachedResponse = await cache.match(url);
          if (cachedResponse) {
            svgText = await cachedResponse.text();
          } else {
            const res = await fetch(url);
            if (!res.ok) throw new Error("SVG fetch failed");
            svgText = await res.text();
            await cache.put(url, new Response(svgText));
          }
        } catch {
          const res = await fetch(url);
          if (!res.ok) throw new Error("SVG fallback failed");
          svgText = await res.text();
        }

        const parser = new DOMParser();
        const doc = parser.parseFromString(svgText, "image/svg+xml");
        const paths = doc.querySelectorAll("path");
        const pathDataList: string[] = [];
        
        paths.forEach((p) => {
          const d = p.getAttribute("d");
          if (d) pathDataList.push(d);
        });

        setStandardPaths(pathDataList);
        setCurrentStrokeIndex(0);
        correctStrokesRef.current = [];
        setStrokeError(null);
        setIsCompleted(false);
      } catch (err) {
        console.error("Gagal memuat SVG KanjiVG:", err);
      }
    };

    fetchSVG();
  }, [character, replayKey]);

  // Melakukan sampling koordinat sepanjang standard path SVG
  const samplePathPoints = useCallback((d: string): { x: number; y: number }[] => {
    const points: { x: number; y: number }[] = [];
    if (typeof document === "undefined") return points;

    try {
      // Sample points along SVG path. Used for stroke comparison.
      const pathEl = document.createElementNS("http://www.w3.org/2000/svg", "path");
      pathEl.setAttribute("d", d);

      const length = pathEl.getTotalLength ? pathEl.getTotalLength() : 100;
      const sampleCount = 5; // Awal, Tengah x3, Akhir
      for (let i = 0; i < sampleCount; i++) {
        const dist = (i / (sampleCount - 1)) * length;
        const pt = pathEl.getPointAtLength ? pathEl.getPointAtLength(dist) : { x: 54, y: 54 };
        points.push({ x: pt.x, y: pt.y });
      }
    } catch (err) {
      console.error("Gagal sampling path:", err);
    }
    return points;
  }, []);

  // Fungsi menggambar ulang isi kanvas
  const redrawCanvas = useCallback((activeStroke?: { x: number; y: number }[], activeColor?: string) => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 1. Gambar seluruh goresan yang SUDAH BENAR dalam neon hijau
    correctStrokesRef.current.forEach((stroke) => {
      if (stroke.length === 0) return;
      ctx.beginPath();
      ctx.moveTo(stroke[0].x, stroke[0].y);
      for (let i = 1; i < stroke.length; i++) {
        ctx.lineTo(stroke[i].x, stroke[i].y);
      }
      ctx.strokeStyle = "rgb(var(--brand-cyan-rgb))";
      ctx.lineWidth = 10;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.shadowBlur = 14;
      ctx.shadowColor = getShadowColor("rgb(var(--brand-cyan-rgb))", 0.6);
      ctx.stroke();
    });

    // 2. Gambar goresan aktif saat ini
    if (activeStroke && activeStroke.length > 0) {
      ctx.beginPath();
      ctx.moveTo(activeStroke[0].x, activeStroke[0].y);
      for (let i = 1; i < activeStroke.length; i++) {
        ctx.lineTo(activeStroke[i].x, activeStroke[i].y);
      }
      ctx.strokeStyle = activeColor || strokeColor;
      ctx.lineWidth = 10;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.shadowBlur = activeColor ? 14 : 12;
      ctx.shadowColor = activeColor ? getShadowColor(activeColor, 0.6) : getShadowColor(strokeColor, 0.4);
      ctx.stroke();
    }
  }, [strokeColor]);

  // Efek resize responsif kanvas dengan ResizeObserver
  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const resizeCanvas = (width: number, height: number) => {
      // Resize canvas. Adjust for device pixel ratio.
      const ratio = window.devicePixelRatio || 1;
      canvas.width = width * ratio;
      canvas.height = height * ratio;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.scale(ratio, ratio);
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        ctx.lineWidth = 10;
        ctx.strokeStyle = strokeColor;
      }
      redrawCanvas();
    };

    if (typeof ResizeObserver !== "undefined") {
      const observer = new ResizeObserver((entries) => {
        const entry = entries[0];
        if (entry) {
          const { width, height } = entry.contentRect;
          resizeCanvas(width, height);
        }
      });
      observer.observe(container);
      return () => observer.disconnect();
    } else {
      // Fallback untuk testing env
      const handleResize = () => {
        resizeCanvas(container.clientWidth, container.clientHeight);
      };
      handleResize();
      window.addEventListener("resize", handleResize);
      return () => window.removeEventListener("resize", handleResize);
    }
  }, [strokeColor, redrawCanvas]);

  // ==========================================
  // LOGIKA PENGENDALI & KOREKSI CORETAN (CORE)
  // ==========================================
  const startDrawing = useCallback((e: React.PointerEvent) => {
    if (isLocked || isCompleted) return;
    if (e.button !== 0 && e.pointerType === "mouse") return;
    
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Start drawing. Record initial point. Vibrate device.
    ctx.beginPath();
    ctx.moveTo(x, y);
    currentStrokePointsRef.current = [{ x, y }];
    setIsDrawing(true);
    setHasDrawn(true);

    if ("vibrate" in navigator) navigator.vibrate(5);
  }, [isLocked, isCompleted]);

  const draw = useCallback((e: React.PointerEvent) => {
    if (!isDrawing || isLocked || isCompleted) return;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Track drawing. Record points. Redraw canvas.
    currentStrokePointsRef.current.push({ x, y });
    redrawCanvas(currentStrokePointsRef.current);
  }, [isDrawing, isLocked, isCompleted, redrawCanvas]);

  // Melakukan validasi koordinat guratan dengan skala standar 109x109
  const validateStroke = useCallback(() => {
    if (currentStrokePointsRef.current.length < 2 || standardPaths.length === 0) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const canvasWidth = rect.width || 1;
    const canvasHeight = rect.height || 1;

    // Konversi koordinat goresan pengguna ke skala 109x109
    const mappedPoints = currentStrokePointsRef.current.map((p) => ({
      x: p.x * (109 / canvasWidth),
      y: p.y * (109 / canvasHeight),
    }));

    const standardPoints = samplePathPoints(standardPaths[currentStrokeIndex]);
    if (standardPoints.length < 2) return;

    const uStart = mappedPoints[0];
    const uMid = mappedPoints[Math.floor(mappedPoints.length / 2)];
    const uEnd = mappedPoints[mappedPoints.length - 1];

    const pStart = standardPoints[0];
    const pMid = standardPoints[Math.floor(standardPoints.length / 2)];
    const pEnd = standardPoints[standardPoints.length - 1];

    const dist = (p1: { x: number; y: number }, p2: { x: number; y: number }) => {
      const dx = p1.x - p2.x;
      const dy = p1.y - p2.y;
      return Math.sqrt(dx * dx + dy * dy);
    };

    const dStart = dist(uStart, pStart);
    const dMid = dist(uMid, pMid);
    const dEnd = dist(uEnd, pEnd);

    // Hitung juga jarak jika ditarik terbalik
    const dRevStart = dist(uStart, pEnd);
    const dRevEnd = dist(uEnd, pStart);

    const DIST_THRESHOLD = 28;

    const isReverse = dRevStart <= DIST_THRESHOLD && dRevEnd <= DIST_THRESHOLD;
    const isCorrect = dStart <= DIST_THRESHOLD && dMid <= (DIST_THRESHOLD * 1.25) && dEnd <= DIST_THRESHOLD;

    // Validate stroke. Compare user points to standard path points. Check distance and direction.
    if (isCorrect) {
      // 1. Sukses: Tambahkan ke goresan yang benar
      correctStrokesRef.current.push([...currentStrokePointsRef.current]);
      sounds?.playSuccess();
      if ("vibrate" in navigator) navigator.vibrate([10, 30, 10]);

      const nextIndex = currentStrokeIndex + 1;
      setCurrentStrokeIndex(nextIndex);
      currentStrokePointsRef.current = [];

      // Periksa apakah seluruh kanji sudah selesai
      if (nextIndex >= standardPaths.length) {
        setIsCompleted(true);
        addXP(10);
        setShowXP(true);
        setTimeout(() => setShowXP(false), 2000);
        // Mainkan melodi kemenangan
        setTimeout(() => {
          sounds?.playSuccess();
          setTimeout(() => sounds?.playPop(), 80);
        }, 150);
      } else {
        redrawCanvas();
      }
    } else {
      // 2. Gagal: Visualisasikan neon merah
      setStrokeError(isReverse ? "reverse" : "wrong");
      setIsLocked(true);
      sounds?.playError();
      if ("vibrate" in navigator) navigator.vibrate([100]);

      redrawCanvas(currentStrokePointsRef.current, "#ef4444");

      // Flash merah selama 600ms, kemudian hapus goresan yang salah dan buka kunci
      setTimeout(() => {
        setStrokeError(null);
        setIsLocked(false);
        currentStrokePointsRef.current = [];
        redrawCanvas();
      }, 600);
    }
  }, [currentStrokeIndex, standardPaths, samplePathPoints, addXP, redrawCanvas]);

  const stopDrawing = useCallback(() => {
    if (!isDrawing) return;
    setIsDrawing(false);
    // Stop drawing. Trigger stroke validation.
    validateStroke();
  }, [isDrawing, validateStroke]);

  const clearCanvas = () => {
    // Reset canvas state. Clear paths.
    correctStrokesRef.current = [];
    currentStrokePointsRef.current = [];
    setCurrentStrokeIndex(0);
    setStrokeError(null);
    setIsLocked(false);
    setIsCompleted(false);
    setHasDrawn(false);

    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (ctx && canvas) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  };

  const handleReplay = () => {
    // Replay character. Reset state. Reload SVG.
    clearCanvas();
    setReplayKey((prev) => prev + 1);
  };

  // ==========================================
  // HASIL HOOK (RETURN VALUE)
  // ==========================================
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
    // Status Tambahan
    currentStrokeIndex,
    totalStrokes: standardPaths.length,
    strokeError,
    isCompleted,
    isLocked,
  };
}