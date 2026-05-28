"use client";

import React, { useState } from "react";
import { Loader2, Wand2 } from "lucide-react";
import { useFurigana } from "@/components/ui/useFurigana";

interface FuriganaInputProps {
  /** Nilai furigana saat ini */
  value: string;
  onChange: (value: string) => void;
  /** Teks sumber (kanji/kalimat) untuk di-generate furigananya */
  sourceText?: string;
  placeholder?: string;
  className?: string;
  label?: string;
}

export function FuriganaInput({
  value,
  onChange,
  sourceText = "",
  placeholder = "ふりがな",
  className = "",
  label,
}: FuriganaInputProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { getFurigana } = useFurigana();

  const handleAutoFill = async () => {
    if (!sourceText.trim()) return;
    setIsLoading(true);
    try {
      const result = await getFurigana(sourceText);
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
          className={`flex-1 px-3 py-2 bg-background border border-border rounded-lg text-sm outline-none focus:border-primary transition-all ${className}`}
        />
        <button
          type="button"
          onClick={handleAutoFill}
          disabled={isLoading || !sourceText.trim()}
          title="Auto-generate furigana"
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
