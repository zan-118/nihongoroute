/**
 * @file FuriganaInput.tsx
 * @description Komponen input teks bahasa Jepang yang dilengkapi tombol pintasan pembuatan Furigana otomatis via API.
 */

"use client";

// ======================
// IMPOR
// ======================
import React, { useState } from "react";
import { Loader2, Wand2 } from "lucide-react";
import { useFurigana } from "@/hooks/useFurigana";

// ======================
// ANTARMUKA / TIPE DATA
// ======================
/**
 * Properties for FuriganaInput component.
 */
interface FuriganaInputProps {
  /** Nilai furigana saat ini */
  value: string;
  /** Callback triggered when input value changes */
  onChange: (value: string) => void;
  /** Teks sumber (kanji/kalimat) untuk di-generate furigananya */
  sourceText?: string;
  /** Placeholder text for input field */
  placeholder?: string;
  /** Additional CSS classes for input styling */
  className?: string;
  /** Label text displayed above input */
  label?: string;
}

// ======================
// EKSEKUSI UTAMA
// ======================
/**
 * Input component for Japanese furigana.
 * Provides manual text field and button to auto-generate furigana from source text.
 */
export function FuriganaInput({
  value,
  onChange,
  sourceText = "",
  placeholder = "ふりがな",
  className = "",
  label,
}: FuriganaInputProps) {
  // Track API loading state
  const [isLoading, setIsLoading] = useState(false);
  // Hook to fetch furigana from API
  const { getFurigana } = useFurigana();

  /**
   * Fetch furigana from source text and update value.
   */
  const handleAutoFill = async () => {
    // Stop if source text empty
    if (!sourceText.trim()) return;
    setIsLoading(true);
    try {
      // Request furigana representation
      const result = await getFurigana(sourceText);
      // Update parent state if successful
      if (result) onChange(result);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-1.5">
      {label && (
        <label className="block text-xs font-medium text-muted-foreground">{label}</label>
      )}
      <div className="flex items-center gap-1.5">
        <input aria-label="Input"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={`control-surface flex-1 px-3 py-2 rounded-lg text-sm outline-none transition-all ${className}`}
        />
        <button
          type="button"
          onClick={handleAutoFill}
          disabled={isLoading || !sourceText.trim()}
          title="Buat furigana otomatis"
          className="flex-shrink-0 p-2 rounded-lg border border-border bg-muted hover:bg-secondary transition-all disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <Loader2 className="size-3.5 animate-spin text-muted-foreground" />
          ) : (
            <Wand2 className="size-3.5 text-muted-foreground" />
          )}
        </button>
      </div>
    </div>
  );
}