/**
 * @file AnimatedKanji.tsx
 * @description Komponen penampil animasi urutan goresan (stroke order) untuk karakter Kanji/Kana menggunakan data SVG dari KanjiVG.
 * @module AnimatedKanji
 */

"use client";

// ======================
// IMPORTS
// ======================
import React, { useEffect, useRef, useState } from "react";

// ======================
// TYPES
// ======================
interface AnimatedKanjiProps {
  character: string;
  triggerKey: number; // Digunakan untuk me-restart animasi
  color?: string; // Warna goresan (HEX atau CSS color)
}

// ======================
// MAIN EXECUTION
// ======================

/**
 * Komponen AnimatedKanji: Mengambil data SVG dan menganimasikan setiap path secara berurutan.
 * 
 * @param {AnimatedKanjiProps} props - Karakter dan kunci pemicu animasi.
 * @returns {JSX.Element} Visualisasi urutan goresan kanji.
 */
export default function AnimatedKanji({
  character,
  triggerKey,
  color = "#a855f7", // Default purple-500
}: AnimatedKanjiProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState(false);

  // ======================
  // EFFECTS
  // ======================

  useEffect(() => {
    if (!containerRef.current) return;
    setError(false);

    // KanjiVG hanya mendukung 1 karakter per file
    const baseChar = character.charAt(0);
    const code = baseChar.charCodeAt(0).toString(16).padStart(5, "0");
    const url = `https://raw.githubusercontent.com/KanjiVG/kanjivg/master/kanji/${code}.svg`;

    fetch(url)
      .then((res) => {
        if (!res.ok) throw new Error("Gagal memuat SVG");
        return res.text();
      })
      .then((svgText) => {
        if (!containerRef.current) return;

        // Suntikkan Raw SVG ke dalam DOM
        containerRef.current.innerHTML = svgText;
        const svg = containerRef.current.querySelector("svg");

        if (!svg) return;

        // Sesuaikan ukuran SVG
        svg.setAttribute("width", "100%");
        svg.setAttribute("height", "100%");
        svg.style.width = "100%";
        svg.style.height = "100%";
        svg.style.overflow = "visible";

        const paths = svg.querySelectorAll("path");

        paths.forEach((path, index) => {
          const length = path.getTotalLength();

          // Sembunyikan garis dengan mendorong dash-offset sejauh panjangnya
          path.style.strokeDasharray = length.toString();
          path.style.strokeDashoffset = length.toString();

          // Gaya Cyber-Neumorphic
          path.style.stroke = color;
          path.style.strokeWidth = "3.5";
          path.style.strokeLinecap = "round";
          path.style.strokeLinejoin = "round";
          path.style.fill = "none";
          path.style.filter = `drop-shadow(0 0 4px ${color})`;

          // Animasikan secara berurutan
          path.style.animation = `drawKanji 0.8s cubic-bezier(0.4, 0, 0.2, 1) ${index * 0.7}s forwards`;
        });

        // Sembunyikan label angka KanjiVG
        const texts = svg.querySelectorAll("text");
        texts.forEach((text) => (text.style.display = "none"));
      })
      .catch(() => {
        setError(true); 
      });
  }, [character, triggerKey]);

  // ======================
  // RENDER
  // ======================

  // Fallback jika SVG gagal dimuat
  if (error) {
    return (
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none">
        <span className="text-[12rem] font-japanese font-black text-white/5 opacity-30">
          {character}
        </span>
      </div>
    );
  }

  return (
    <>
      <style>{`
        @keyframes drawKanji {
          to { stroke-dashoffset: 0; }
        }
      `}</style>
      <div
        ref={containerRef}
        className="absolute inset-0 w-full h-full opacity-40 pointer-events-none"
      />
    </>
  );
}
