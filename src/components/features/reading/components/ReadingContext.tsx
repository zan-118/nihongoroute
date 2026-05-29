/**
 * @file ReadingContext.tsx
 * @description React Context Provider untuk mengelola preferensi membaca pengguna (seperti mode tampilan furigana/romaji/hiragana dan visibilitas terjemahan).
 */

// ==========================================
// IMPORT & DEPENDENSI
// ==========================================
import React, { createContext, use, useState } from "react";
import { ReadingMode } from "../types";

// ==========================================
// TIPE DATA / INTERFACE
// ==========================================
interface ReadingContextType {
  mode: ReadingMode;
  setMode: (mode: ReadingMode) => void;
  showTranslation: boolean;
  setShowTranslation: (show: boolean) => void;
}

// ==========================================
// INISIALISASI CONTEXT
// ==========================================
const ReadingContext = createContext<ReadingContextType | undefined>(undefined);

// ==========================================
// CONTEXT PROVIDER (KOMPONEN)
// ==========================================
/**
 * Provider untuk preferensi membaca.
 */
export function ReadingProvider({ children }: { children: React.ReactNode }) {
  const [mode, setMode] = useState<ReadingMode>("furigana");
  const [showTranslation, setShowTranslation] = useState(false);

  return (
    <ReadingContext.Provider value={{ mode, setMode, showTranslation, setShowTranslation }}>
      {children}
    </ReadingContext.Provider>
  );
}

// ==========================================
// CUSTOM HOOK
// ==========================================
/**
 * Hook khusus untuk mengakses preferensi membaca di dalam provider.
 */
export function useReading() {
  const context = use(ReadingContext);
  if (context === undefined) {
    throw new Error("useReading must be used within a ReadingProvider");
  }
  return context;
}
