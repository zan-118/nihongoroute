/**
 * @file SmartJapanese.tsx
 * @description Utilitas cerdas untuk memisahkan Kanji dan Hiragana agar Furigana hanya muncul di atas Kanji saja.
 */

// ======================
// IMPOR
// ======================
import React, { useMemo } from "react";
import * as wanakana from "wanakana";

// ======================
// CACHE PENYIMPANAN SEMENTARA (MEMOIZATION)
// ======================
/** 
 * Cache splitFurigana results. Prevent redundant parsing.
 */
const furiganaCache = new Map<string, { text: string; furi?: string }[]>();

// ======================
// FUNGSI PEMBANTU
// ======================
/**
 * Split Japanese word into Kanji and Kana chunks.
 * Match Kanji characters with corresponding Furigana reading.
 * 
 * @param word - Original Japanese text.
 * @param reading - Full Furigana reading.
 * @returns Array of text chunks with optional Furigana.
 */
export function splitFurigana(word: string, reading: string): { text: string; furi?: string }[] {
  if (!word) return [];
  if (!reading || word === reading) return [{ text: word }];

  // Generate cache key. Return cached result if exist.
  const cacheKey = `${word}|${reading}`;
  if (furiganaCache.has(cacheKey)) {
    return furiganaCache.get(cacheKey)!;
  }

  const chunks: { text: string; furi?: string }[] = [];
  let wIdx = 0;
  let rIdx = 0;

  // Loop through word characters.
  while (wIdx < word.length) {
    const char = word[wIdx];
    const isKanjiChar = wanakana.isKanji(char) || char === "々";

    if (!isKanjiChar) {
      // 1. Tangani Segmen Non-Kanji (Hiragana, Katakana, Simbol, Spasi)
      let segment = "";
      while (wIdx < word.length && !wanakana.isKanji(word[wIdx]) && word[wIdx] !== "々") {
        const wChar = word[wIdx];
        segment += wChar;

        // Sinkronisasi rIdx: Majukan rIdx hanya jika karakternya cocok
        if (rIdx < reading.length) {
          const rChar = reading[rIdx];
          const wHira = wanakana.toHiragana(wChar);
          const rHira = wanakana.toHiragana(rChar);
          
          if (wHira === rHira || wChar === rChar) {
            rIdx++;
          } else if (/\s/.test(rChar)) {
            // Jika ada spasi di reading tapi tidak di word, lewati rIdx saja
            rIdx++;
            // Coba lagi cocokkan wChar dengan rChar berikutnya
            continue;
          }
        }
        wIdx++;
      }
      chunks.push({ text: segment });
    } else {
      // 2. Tangani Segmen Kanji
      const kanjiStart = wIdx;
      while (wIdx < word.length && (wanakana.isKanji(word[wIdx]) || word[wIdx] === "々")) {
        wIdx++;
      }
      const kanjiSegment = word.substring(kanjiStart, wIdx);

      // Cari "Jangkar" berikutnya: karakter non-kanji pertama setelah blok Kanji ini
      let nextAnchor = "";
      let anchorOccurrencesInWord = 0;
      if (wIdx < word.length) {
        nextAnchor = word[wIdx];
        // Hitung berapa kali jangkar ini muncul berurutan (misal: 'いい' di '言いました')
        let tempIdx = wIdx;
        while (tempIdx < word.length && word[tempIdx] === nextAnchor) {
          anchorOccurrencesInWord++;
          tempIdx++;
        }
      }

      let rEnd = rIdx;
      if (nextAnchor) {
        const anchorHira = wanakana.toHiragana(nextAnchor);
        
        let bestREnd = rIdx + 1; 
        let highestScore = -1000; // Mulai dengan nilai sangat rendah
        let found = false;

        // BATAS PENCARIAN: 
        // Furigana untuk Kanji tidak mungkin lebih panjang dari 10-15 karakter.
        // Kita batasi area pencarian agar tidak melompat ke kalimat/paragraf lain.
        const maxSearch = Math.min(reading.length, rIdx + Math.max(10, kanjiSegment.length * 5));

        // Search reading for anchor. Score matches to find best fit.
        for (let searchIdx = rIdx + 1; searchIdx < maxSearch; searchIdx++) {
          if (wanakana.toHiragana(reading[searchIdx]) === anchorHira) {
            found = true;
            
            let score = 0;
            for (let j = 1; j <= 3; j++) {
              const nextW = word[wIdx + j];
              const nextR = reading[searchIdx + j];
              
              if (!nextW) {
                score += (nextR ? 5 : 30); 
                break;
              }
              
              if (nextR && wanakana.toHiragana(nextW) === wanakana.toHiragana(nextR)) {
                score += 15; 
              } else if (nextR && (wanakana.isKanji(nextW) || nextW === "々")) {
                score += 8; 
              }
            }

            // PENALTI JARAK: 
            // Semakin jauh jangkar ditemukan, semakin rendah skornya. 
            // Ini mencegah pemilihan jangkar yang sama di kalimat berikutnya.
            score -= (searchIdx - rIdx) * 2;

            if (score > highestScore) {
              highestScore = score;
              bestREnd = searchIdx;
            }
          }
        }

        if (found) {
          rEnd = bestREnd;
        } else {
          // Fallback: estimasi panjang moderat
          rEnd = Math.min(reading.length, rIdx + Math.min(6, kanjiSegment.length * 2));
        }
      } else {
        rEnd = reading.length;
      }

      const readingSegment = reading.substring(rIdx, rEnd);
      chunks.push({ text: kanjiSegment, furi: readingSegment });
      rIdx = rEnd;
    }
  }

  // Evict oldest cache entry if size exceeds limit. Prevent memory leak.
  if (furiganaCache.size > 1000) {
    const firstKey = furiganaCache.keys().next().value;
    if (firstKey !== undefined) {
      furiganaCache.delete(firstKey);
    }
  }
  furiganaCache.set(cacheKey, chunks);

  return chunks;
}

// ======================
// EKSEKUSI UTAMA
// ======================
/**
 * Render Japanese text with Furigana above Kanji.
 * Support multiple display modes.
 * 
 * @param props - Component properties.
 * @param props.word - Original Japanese text.
 * @param props.furigana - Full Furigana reading.
 * @param props.className - Optional CSS class name.
 * @param props.mode - Display mode (furigana, kanji, hiragana, romaji).
 * @returns React element.
 */
export function SmartJapanese({ 
  word, 
  furigana, 
  className = "",
  mode = "furigana"
}: { 
  word: string; 
  furigana?: string; 
  className?: string;
  mode?: "furigana" | "kanji" | "hiragana" | "romaji";
}) {
  // Parse word and furigana into chunks. Memoize result.
  const chunks = useMemo(() => {
    if (!word || !furigana) return [];
    return splitFurigana(word, furigana);
  }, [word, furigana]);

  if (!word) return <span className={className}>{furigana}</span>;
  
  if (mode === "romaji") {
    return <span className={className}>{wanakana.toRomaji(furigana || word)}</span>;
  }
 
  if (!furigana || word === furigana || mode === "kanji") {
    return <span className={className}>{word}</span>;
  }

  if (mode === "hiragana") {
    return <span className={className}>{furigana}</span>;
  }

  return (
    <span 
      className={className} 
      style={{ rubyPosition: 'over', rubyAlign: 'space-around' } as React.CSSProperties}
    >
      {chunks.map((chunk, pos) => (
        chunk.furi ? (
          <ruby key={`${chunk.text}-${pos}`} className="font-japanese">
            {chunk.text}
            <rt className="text-[0.55em] font-bold leading-none select-none opacity-90 tracking-normal text-muted-foreground">
              {chunk.furi}
            </rt>
          </ruby>
        ) : (
          <span key={`${chunk.text}-${pos}`}>{chunk.text}</span>
        )
      ))}
    </span>
  );
}