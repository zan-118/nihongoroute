/**
 * @file useAnimatedKanji.ts
 * @description Hook khusus untuk memuat SVG KanjiVG dan menganimasikan penulisan stroke order kanji menggunakan manipulasi DOM SVG secara luring-first.
 */

// ==========================================
// IMPORT & DEPENDENSI
// ==========================================
import { useEffect, useRef, useState } from "react";

// ==========================================
// HOOK UTAMA
// ==========================================
/**
 * Hook animates kanji SVG stroke order.
 * Fetches SVG from KanjiVG. Injects into DOM. Animates paths.
 * 
 * @param character Kanji character to animate.
 * @param triggerKey Key to reset animation.
 * @param color Stroke color.
 * @returns Container ref and error state.
 */
export function useAnimatedKanji(character: string, triggerKey: number, color: string) {
  // ==========================================
  // STATUS & STATE & REFS
  // ==========================================
  /** Ref for SVG container element. */
  const containerRef = useRef<HTMLDivElement>(null);
  /** Error state for fetch failure. */
  const [error, setError] = useState(false);

  // ==========================================
  // EFEK SAMPING & LOGIKA ANIMASI DOM (EFFECTS)
  // ==========================================
  useEffect(() => {
    if (!containerRef.current) return;
    setError(false);

    // Get first character. Avoid multi-character input errors.
    const baseChar = character.charAt(0);
    // Convert character to hex code. Match KanjiVG naming scheme.
    const code = baseChar.charCodeAt(0).toString(16).padStart(5, "0");
    // KanjiVG raw GitHub URL.
    const url = `https://raw.githubusercontent.com/KanjiVG/kanjivg/master/kanji/${code}.svg`;

    fetch(url)
      .then((res) => {
        if (!res.ok) throw new Error("Gagal memuat SVG");
        return res.text();
      })
      .then((svgText) => {
        if (!containerRef.current) return;

        // Inject SVG string into container.
        containerRef.current.innerHTML = svgText;
        const svg = containerRef.current.querySelector("svg");

        if (!svg) return;

        // Make SVG responsive. Fill container element.
        svg.setAttribute("width", "100%");
        svg.setAttribute("height", "100%");
        svg.style.width = "100%";
        svg.style.height = "100%";
        svg.style.overflow = "visible";

        const paths = svg.querySelectorAll("path");

        // Configure path stroke animation.
        paths.forEach((path, index) => {
          // Get path length. Hide stroke initially via offset.
          const length = path.getTotalLength();

          path.style.strokeDasharray = length.toString();
          path.style.strokeDashoffset = length.toString();

          path.style.stroke = color;
          path.style.strokeWidth = "3.5";
          path.style.strokeLinecap = "round";
          path.style.strokeLinejoin = "round";
          path.style.fill = "none";
          path.style.filter = `drop-shadow(0 0 4px ${color})`;

          // Apply CSS animation. Delay stroke start sequentially.
          path.style.animation = `drawKanji 0.8s cubic-bezier(0.4, 0, 0.2, 1) ${index * 0.7}s forwards`;
        });

        const texts = svg.querySelectorAll("text");
        // Hide stroke numbers. Keep visual clean.
        texts.forEach((text) => (text.style.display = "none"));
      })
      .catch(() => {
        setError(true); 
      });
  }, [character, triggerKey, color]);

  // ==========================================
  // HASIL HOOK (RETURN VALUE)
  // ==========================================
  return { containerRef, error };
}