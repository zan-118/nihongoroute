"use client";

/**
 * @file useKanjiSvg.ts
 * @description Hook khusus untuk mengambil, mem-parse, dan menormalisasi data SVG Kanji dari database lokal (Supabase) atau fallback ke repositori GitHub KanjiVG secara luring-first.
 */

// ==========================================
// IMPORT & DEPENDENSI
// ==========================================
import { useState, useEffect } from "react";
import { KanjiSvgData, StrokeData } from "../types";

// ==========================================
// HOOK UTAMA
// ==========================================
/**
 * Custom hook to fetch, parse, and normalize Kanji SVG stroke data.
 * Attempts to use database SVG string first, falling back to KanjiVG GitHub repository.
 * 
 * @param character - The target Kanji character.
 * @param strokeOrderSvg - Optional raw SVG string from database.
 * @returns Object containing parsed SVG data, loading state, and error state.
 */
export function useKanjiSvg(character: string, strokeOrderSvg?: string) {
  // ==========================================
  // STATUS & STATE
  // ==========================================
  /** Parsed Kanji SVG data structure. */
  const [data, setData] = useState<KanjiSvgData | null>(null);
  /** Loading state indicator. */
  const [loading, setLoading] = useState(true);
  /** Error message state. */
  const [error, setError] = useState<string | null>(null);

  // ==========================================
  // LOGIKA PENGAMBILAN & PARSING DATA (EFFECT)
  // ==========================================
  useEffect(() => {
    if (!character) return;

    /**
     * Fetches and parses SVG data from database or external KanjiVG API.
     */
    const fetchSvg = async () => {
      setLoading(true);
      setError(null);

      try {
        let svgText = "";

        // 1. Ambil data SVG (dari DB atau GitHub)
        if (strokeOrderSvg) {
          svgText = strokeOrderSvg;
        } else {
          const KANJIVG_URL = "https://raw.githubusercontent.com/KanjiVG/kanjivg/master/kanji";
          // Convert character to 5-digit lowercase hex code point for KanjiVG URL
          const code = character.charCodeAt(0).toString(16).padStart(5, "0");
          const url = `${KANJIVG_URL}/${code}.svg`;
          
          const res = await fetch(url);
          if (!res.ok) throw new Error("Gagal mengambil data dari KanjiVG");
          svgText = await res.text();
        }

        // 2. Parsing SVG
        const parser = new DOMParser();
        let doc = parser.parseFromString(svgText, "image/svg+xml");
        let svg = doc.querySelector("svg");
        const parserError = doc.querySelector("parsererror");

        // 3. Fallback ke GitHub jika SVG dari database tidak valid
        if ((!svg || parserError) && strokeOrderSvg) {
          console.warn("SVG dari database tidak valid, mencoba fetch dari KanjiVG...");
          const KANJIVG_URL = "https://raw.githubusercontent.com/KanjiVG/kanjivg/master/kanji";
          // Convert character to 5-digit lowercase hex code point for KanjiVG URL
          const code = character.charCodeAt(0).toString(16).padStart(5, "0");
          const url = `${KANJIVG_URL}/${code}.svg`;
          
          const res = await fetch(url);
          if (res.ok) {
            svgText = await res.text();
            doc = parser.parseFromString(svgText, "image/svg+xml");
            svg = doc.querySelector("svg");
          }
        }

        if (!svg) throw new Error("Format SVG tidak valid");

        const strokes: StrokeData[] = [];
        const numbers: { x: string; y: string; value: string }[] = [];

        // Ambil paths (goresan)
        const paths = doc.querySelectorAll("path");
        paths.forEach((p, i) => {
          const d = p.getAttribute("d");
          if (d) {
            strokes.push({ path: d, index: i });
          }
        });

        // Ambil numbers (urutan)
        const texts = doc.querySelectorAll("text");
        texts.forEach((t) => {
          // Extract X and Y coordinates from SVG transform translate attribute
          const x = t.getAttribute("transform")?.match(/translate\(([\d.]+), ([\d.]+)\)/);
          if (x) {
            numbers.push({
              x: x[1],
              y: x[2],
              value: t.textContent || "",
            });
          } else {
             // Fallback jika tidak pakai translate
             numbers.push({
               x: t.getAttribute("x") || "0",
               y: t.getAttribute("y") || "0",
               value: t.textContent || "",
             });
          }
        });

        setData({
          character,
          strokes,
          numbers,
          viewBox: svg.getAttribute("viewBox") || "0 0 109 109",
        });
      } catch (err) {
        console.error("Kanji Parser Error:", err);
        setError(err instanceof Error ? err.message : "Terjadi kesalahan");
      } finally {
        setLoading(false);
      }
    };

    fetchSvg();
  }, [character, strokeOrderSvg]);

  // ==========================================
  // HASIL HOOK (RETURN VALUE)
  // ==========================================
  return { data, loading, error };
}