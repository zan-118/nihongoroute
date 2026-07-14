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
/**
 * State and setters for reading preferences.
 */
interface ReadingContextType {
  /** Current reading display mode. */
  mode: ReadingMode;
  /** Set reading display mode. */
  setMode: (mode: ReadingMode) => void;
  /** Toggle translation visibility. */
  showTranslation: boolean;
  /** Set translation visibility. */
  setShowTranslation: (show: boolean) => void;
}

// ==========================================
// INISIALISASI CONTEXT
// ==========================================
/**
 * Context holding reading preferences state.
 */
const ReadingContext = createContext<ReadingContextType | undefined>(undefined);

// ==========================================
// CONTEXT PROVIDER (KOMPONEN)
// ==========================================
/**
 * Provider component. Wraps app to supply reading preferences.
 * @param props - Component props.
 * @param props.children - Child nodes.
 */
export function ReadingProvider({ children }: { children: React.ReactNode }) {
  // Default mode is furigana.
  const [mode, setMode] = useState<ReadingMode>("furigana");
  // Default translation visibility is hidden.
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
 * Hook to access reading context.
 * Throws error if used outside ReadingProvider.
 * @returns Reading context state and setters.
 */
export function useReading() {
  // React use hook retrieves context value.
  const context = use(ReadingContext);
  if (context === undefined) {
    // Guard clause prevents usage outside provider.
    throw new Error("useReading must be used within a ReadingProvider");
  }
  return context;
}