/**
 * @file splitFurigana.ts
 * @description Engine utilitas terpadu untuk memisahkan Kanji dan Hiragana/Katakana 
 * sehingga Furigana (annotasi ruby) terpetakan dengan presisi di atas Kanji terkait.
 */

import { isKanji, toHiragana } from "wanakana";

export interface FuriganaChunk {
 text: string;
 furi?: string;
}

/** Cache memoization untuk hasil splitFurigana */
const furiganaCache = new Map<string, FuriganaChunk[]>();
const MAX_CACHE_SIZE = 1000;

/**
 * Memisah teks bahasa Jepang menjadi bagian Kanji dan Kana beserta pasangan Furigana.
 * 
 * @param word - Teks asli dalam Kanji/Kana
 * @param reading - Bacaan Furigana lengkap
 * @returns Array dari FuriganaChunk ({ text, furi? })
 */
export function splitFurigana(word: string, reading: string): FuriganaChunk[] {
 if (!word) return [];
 if (!reading || word === reading) return [{ text: word }];

 const cacheKey = `${word}|${reading}`;
 if (furiganaCache.has(cacheKey)) {
 return furiganaCache.get(cacheKey)!;
 }

 const chunks: FuriganaChunk[] = [];
 let wIdx = 0;
 let rIdx = 0;

 while (wIdx < word.length) {
 const char = word[wIdx];
 const isKanjiChar = isKanji(char) || char === "々";

 if (!isKanjiChar) {
 // Segmen Non-Kanji
 let segment = "";
 while (wIdx < word.length && !isKanji(word[wIdx]) && word[wIdx] !== "々") {
 const wChar = word[wIdx];
 segment += wChar;

 if (rIdx < reading.length) {
 const rChar = reading[rIdx];
 const wHira = toHiragana(wChar);
 const rHira = toHiragana(rChar);
 
        if (wHira === rHira || wChar === rChar) {
          rIdx++;
          // Jika ini adalah karakter non-kanji terakhir di segmen ini dan karakter berikutnya di word adalah Kanji,
          // konsumsi karakter reading identik yang berurutan (misal: 'い' ekstra pada 'かわいい' untuk '可愛い')
          // agar tidak tumpah dan memicu furigana salah pada Kanji setelahnya (seperti '猫').
          const isNextWordCharKanji = wIdx + 1 < word.length && (isKanji(word[wIdx + 1]) || word[wIdx + 1] === "々");
          if (isNextWordCharKanji) {
            while (
              rIdx < reading.length &&
              toHiragana(reading[rIdx]) === wHira
            ) {
              rIdx++;
            }
          }
        } else if (/\s/.test(rChar)) {
 rIdx++;
 continue;
 }
 }
 wIdx++;
 }
 chunks.push({ text: segment });
 } else {
 // Segmen Kanji
 const kanjiStart = wIdx;
 while (wIdx < word.length && (isKanji(word[wIdx]) || word[wIdx] === "々")) {
 wIdx++;
 }
 const kanjiSegment = word.substring(kanjiStart, wIdx);

 let nextAnchor = "";
 if (wIdx < word.length) {
 nextAnchor = word[wIdx];
 }

 let rEnd = rIdx;
 if (nextAnchor) {
 const anchorHira = toHiragana(nextAnchor);
 let bestREnd = rIdx + 1;
 let highestScore = -1000;
 let found = false;

 const maxSearch = Math.min(reading.length, rIdx + Math.max(10, kanjiSegment.length * 5));

 for (let searchIdx = rIdx + 1; searchIdx < maxSearch; searchIdx++) {
 if (toHiragana(reading[searchIdx]) === anchorHira) {
 found = true;
 let score = 0;
 for (let j = 1; j <= 3; j++) {
 const nextW = word[wIdx + j];
 const nextR = reading[searchIdx + j];
 
 if (!nextW) {
 score += (nextR ? 5 : 30);
 break;
 }
 
 if (nextR && toHiragana(nextW) === toHiragana(nextR)) {
 score += 15;
 } else if (nextR && (isKanji(nextW) || nextW === "々")) {
 score += 8;
 }
 }

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

 // Pengelolaan memori cache LRU sederhana
 if (furiganaCache.size >= MAX_CACHE_SIZE) {
 const firstKey = furiganaCache.keys().next().value;
 if (firstKey !== undefined) {
 furiganaCache.delete(firstKey);
 }
 }
 furiganaCache.set(cacheKey, chunks);

 return chunks;
}
