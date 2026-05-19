"use client";

import React, { createContext, useContext, useState } from "react";
import { ReadingMode } from "../types";

interface ReadingContextType {
  mode: ReadingMode;
  setMode: (mode: ReadingMode) => void;
  showTranslation: boolean;
  setShowTranslation: (show: boolean) => void;
}

const ReadingContext = createContext<ReadingContextType | undefined>(undefined);

export function ReadingProvider({ children }: { children: React.ReactNode }) {
  const [mode, setMode] = useState<ReadingMode>("furigana");
  const [showTranslation, setShowTranslation] = useState(false);

  return (
    <ReadingContext.Provider value={{ mode, setMode, showTranslation, setShowTranslation }}>
      {children}
    </ReadingContext.Provider>
  );
}

export function useReading() {
  const context = useContext(ReadingContext);
  if (context === undefined) {
    throw new Error("useReading must be used within a ReadingProvider");
  }
  return context;
}
