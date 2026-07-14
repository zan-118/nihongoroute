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
/**
 * Hook manage Furigana generation. Cache API response in memory.
 * @returns Object contain getFurigana function.
 */
export function useFurigana() {
  // Cache store Kanji-to-Hiragana mapping. Avoid duplicate API call.
  const cacheRef = useRef<Record<string, string>>({});

  /**
   * Fetch Hiragana representation for Kanji text.
   * @param text Kanji input string.
   * @returns Hiragana string. Empty if error.
   */
  const getFurigana = useCallback(async (text: string): Promise<string> => {
    // Return empty if input blank.
    if (!text.trim()) return "";

    // Kembalikan dari cache jika tersedia
    if (cacheRef.current[text]) return cacheRef.current[text];

    try {
      // Request Furigana from API endpoint.
      const res = await fetch("/api/furigana", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      // Return empty if API fail.
      if (!res.ok) return "";
      const data = await res.json();
      const result = data.hiragana || "";
      // Save result to cache.
      cacheRef.current[text] = result;
      return result;
    } catch {
      // Return empty on network error.
      return "";
    }
  }, []);

  return { getFurigana };
}