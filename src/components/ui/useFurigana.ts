"use client";

import { useCallback, useRef } from "react";

/**
 * Hook untuk auto-generate furigana dari teks Jepang
 * menggunakan API /api/furigana yang sudah ada (Kuroshiro).
 */
export function useFurigana() {
  const cacheRef = useRef<Record<string, string>>({});

  const getFurigana = useCallback(async (text: string): Promise<string> => {
    if (!text.trim()) return "";

    // Return from cache if available
    if (cacheRef.current[text]) return cacheRef.current[text];

    try {
      const res = await fetch("/api/furigana", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      if (!res.ok) return "";
      const data = await res.json();
      const result = data.hiragana || "";
      cacheRef.current[text] = result;
      return result;
    } catch {
      return "";
    }
  }, []);

  return { getFurigana };
}
