"use client";

/**
 * @file GrammarLevelNav.tsx
 * @description Komponen selektor navigasi level JLPT untuk tata bahasa (Grammar Level Navigation).
 * Menampilkan tab tingkat kesulitan JLPT dengan transisi pegas (spring) Framer Motion premium.
 */

// ==========================================
// IMPOR UTAMA
// ==========================================
import React from "react";
import { m } from "framer-motion";

// ==========================================
// ANTARMUKA & TIPE DATA
// ==========================================
interface GrammarLevelNavProps {
  levels: string[];
  selectedLevel: string;
  onLevelChange: (level: string) => void;
}

// ==========================================
// KOMPONEN UTAMA: GrammarLevelNav
// ==========================================
/**
 * Komponen navigasi level JLPT dengan transisi penyorotan aktif yang dinamis.
 * 
 * @param {GrammarLevelNavProps} props Properti untuk navigasi level tata bahasa.
 */
export function GrammarLevelNav({ levels, selectedLevel, onLevelChange }: GrammarLevelNavProps) {
  return (
    <nav className="inline-flex p-1.5 bg-[rgba(var(--muted-rgb),0.5)] dark:bg-[rgba(var(--background-rgb),0.4)] backdrop-blur-md rounded-2xl md:rounded-[2rem] border border-border shadow-2xl overflow-x-auto w-full xl:w-auto no-scrollbar relative font-sans">
      {levels.map((lvl) => (
        <button type="button"
          key={lvl}
          onClick={() => onLevelChange(lvl)}
          className={`relative flex-1 md:flex-none px-6 md:px-10 py-3 md:py-4 h-auto rounded-xl md:rounded-[1.5rem] text-[10px] md:text-xs font-black uppercase tracking-[0.2em] transition-all duration-500 z-10 ${
            selectedLevel === lvl
              ? "text-primary-foreground"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          {/* Latar Belakang Aktif Dinamis dengan Efek Pegas */}
          {selectedLevel === lvl && (
            <m.div
              layoutId="activeTab"
              className="absolute inset-0 bg-primary rounded-xl md:rounded-[1.5rem] shadow-[0_0_20px_rgba(var(--primary-rgb),0.4)] z-[-1]"
              transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
            />
          )}
          <span className="relative z-10">{lvl}</span>
        </button>
      ))}
    </nav>
  );
}

