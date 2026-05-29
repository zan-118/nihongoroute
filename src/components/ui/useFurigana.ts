/**
 * @file useFurigana.ts
 * @description Hook kustom (useFurigana) untuk mengotomatisasi pembuatan Furigana dari teks Kanji Jepang menggunakan API eksternal dengan caching memori.
 */

"use client";

// ======================
// IMPOR
// ======================
import { useCallback, useRef } from "react";

// ======================
// EKSEKUSI UTAMA
// ======================
export function useFurigana() {
  const cacheRef = useRef<Record<string, string>>({});

  const getFurigana = useCallback(async (text: string): Promise<string> => {
    if (!text.trim()) return "";

    // Kembalikan dari cache jika tersedia
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
