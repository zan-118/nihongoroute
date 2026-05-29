/**
 * @file SmartText.tsx
 * @description Perkakas (utility) global untuk mendeteksi kata kunci tata bahasa atau istilah bahasa Jepang dalam teks mentah, lalu membungkus kata kunci tersebut dengan tautan cerdas (Smart Links) interaktif dan tooltip deskriptif.
 */

// ==========================================
// IMPORT & DEPENDENSI
// ==========================================
import React from "react";
import Link from "next/link";

// ==========================================
// ANTARMUKA & KATA KUNCI
// ==========================================
interface KeywordLink {
  keyword: string;
  href: string;
  description?: string;
}

const COMMON_KEYWORDS: KeywordLink[] = [
  { keyword: "Partikel", href: "/library/cheatsheet#particles", description: "Kata bantu yang menunjukkan hubungan gramatikal." },
  { keyword: "Kata Kerja", href: "/library/vocab", description: "Dōshi - Kata yang menunjukkan tindakan atau keadaan." },
  { keyword: "Kata Sifat", href: "/library/vocab", description: "Keiyōshi - Kata yang mendeskripsikan benda." },

  { keyword: "JLPT", href: "/exams", description: "Japanese Language Proficiency Test." },
  { keyword: "Kanji", href: "/library/kanji", description: "Karakter logografis yang digunakan dalam penulisan Jepang." },
  { keyword: "Hiragana", href: "/tools/kana#hiragana", description: "Suku kata dasar dalam penulisan bahasa Jepang." },
  { keyword: "Katakana", href: "/tools/kana#katakana", description: "Suku kata untuk kata serapan asing." },
];

// ==========================================
// FUNGSI UTAMA UTILITY
// ==========================================
/**
 * Memindai string teks mentah dan membungkus kata kunci tata bahasa secara dinamis menggunakan komponen Link Next.js dan tooltip penjelasan.
 * 
 * @param {string} text - Teks mentah bahasa Indonesia / Jepang yang akan dipindai
 * @returns {React.ReactNode[] | null} Elemen teks yang sudah diformat dengan tautan cerdas
 */
export function renderSmartText(text: string) {
  if (!text) return null;

  let parts: (string | React.ReactNode)[] = [text];

  COMMON_KEYWORDS.forEach(({ keyword, href, description }) => {
    const newParts: (string | React.ReactNode)[] = [];
    
    parts.forEach((part) => {
      if (typeof part !== "string") {
        newParts.push(part);
        return;
      }

      const regex = new RegExp(`(${keyword})`, "gi");
      const split = part.split(regex);
      
      split.forEach((subPart, i) => {
        if (subPart.toLowerCase() === keyword.toLowerCase()) {
          newParts.push(
            <Link 
              key={`${keyword}-link-${i}`}
              href={href}
              title={description}
              className="text-primary font-bold hover:underline decoration-primary/30 underline-offset-4 cursor-help"
            >
              {subPart}
            </Link>
          );
        } else if (subPart !== "") {
          newParts.push(subPart);
        }
      });
    });
    
    parts = newParts;
  });

  return parts;
}
