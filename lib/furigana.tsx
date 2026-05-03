/**
 * @file furigana.tsx
 * @description Utilitas cerdas untuk memisahkan Kanji dan Hiragana agar Furigana 
 * hanya muncul di atas Kanji saja.
 */

import React from "react";

/**
 * Membedah kata menjadi potongan-potongan (chunks) yang memisahkan Kanji dan Hiragana.
 * Contoh: word="食べ物", reading="たべもの" 
 * Hasil: [{text: "食", furi: "た"}, {text: "べ"}, {text: "物", furi: "もの"}]
 */
export function splitFurigana(word: string, reading: string) {
  if (!reading || word === reading) return [{ text: word }];

  const chunks: { text: string; furi?: string }[] = [];
  let wIdx = word.length - 1;
  let rIdx = reading.length - 1;

  while (wIdx >= 0) {
    const wChar = word[wIdx];
    const rChar = reading[rIdx];

    if (wChar === rChar) {
      // Hiragana yang sama, tidak perlu furigana
      chunks.unshift({ text: wChar });
      wIdx--;
      rIdx--;
    } else {
      // Kanji ditemukan! Cari batas Hiragana berikutnya untuk tahu jangkauan furigana-nya
      let wStart = wIdx;
      while (wStart >= 0 && word[wStart] !== reading[rIdx]) {
        wStart--;
      }
      
      // Ambil bagian kanji dan bagian bacaannya
      const kanjiPart = word.substring(wStart + 1, wIdx + 1);
      const readingPart = reading.substring(rIdx - (wIdx - wStart - 1), rIdx + 1);
      
      // Jika wStart < 0, berarti sisa kata di depan adalah kanji
      if (wStart < 0) {
        chunks.unshift({ text: word.substring(0, wIdx + 1), furi: reading.substring(0, rIdx + 1) });
        break;
      } else {
        chunks.unshift({ text: kanjiPart, furi: readingPart });
        wIdx = wStart;
        rIdx = rIdx - readingPart.length;
      }
    }
  }

  return chunks;
}

/**
 * Komponen untuk merender teks Jepang dengan Furigana yang hanya muncul di atas Kanji.
 */
export function SmartJapanese({ word, furigana, className = "" }: { word: string; furigana?: string; className?: string }) {
  if (!furigana || word === furigana) {
    return <span className={className}>{word}</span>;
  }

  const chunks = splitFurigana(word, furigana);

  return (
    <span className={className}>
      {chunks.map((chunk, i) => (
        chunk.furi ? (
          <ruby key={i}>
            {chunk.text}
            <rt className="font-bold">{chunk.furi}</rt>
          </ruby>
        ) : (
          <span key={i}>{chunk.text}</span>
        )
      ))}
    </span>
  );
}
