/**
 * LOKASI FILE: components/AnimatedKanji.tsx
 * KONSEP: Cyber-Dark Neumorphic (Neural Kanji Tracer)
 */

"use client";

import React, { useEffect, useRef, useState } from "react";

interface AnimatedKanjiProps {
  character: string;
  triggerKey: number; // Digunakan untuk me-restart animasi
}

export default function AnimatedKanji({
  character,
  triggerKey,
}: AnimatedKanjiProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState(false);

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

        // Sesuaikan ukuran SVG agar pas dengan kanvas kita
        svg.setAttribute("width", "100%");
        svg.setAttribute("height", "100%");
        svg.style.width = "100%";
        svg.style.height = "100%";
        svg.style.overflow = "visible";

        // Ambil semua elemen path (garis coretan)
        const paths = svg.querySelectorAll("path");

        paths.forEach((path, index) => {
          // 1. Hitung panjang asli dari garis ini
          const length = path.getTotalLength();

          // 2. Sembunyikan garis dengan mendorong dash-offset sejauh panjangnya
          path.style.strokeDasharray = length.toString();
          path.style.strokeDashoffset = length.toString();

          // 3. Beri gaya Cyber-Neumorphic (Purple Glow)
          path.style.stroke = "#a855f7"; // Warna ungu (purple-500)
          path.style.strokeWidth = "3.5";
          path.style.strokeLinecap = "round";
          path.style.strokeLinejoin = "round";
          path.style.fill = "none";
          path.style.filter = "drop-shadow(0 0 4px rgba(168, 85, 247, 0.8))";

          // 4. Animasikan secara berurutan (0.8 detik per coretan)
          path.style.animation = `drawKanji 0.8s cubic-bezier(0.4, 0, 0.2, 1) ${index * 0.7}s forwards`;
        });

        // Sembunyikan teks angka urutan bawaan KanjiVG agar lebih rapi
        const texts = svg.querySelectorAll("text");
        texts.forEach((text) => (text.style.display = "none"));
      })
      .catch(() => {
        setError(true); // Jika karakter campuran (Yoon) atau data tidak ada
      });
  }, [character, triggerKey]);

  // Jika gagal memuat SVG, tampilkan teks statis biasa sebagai fallback
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
