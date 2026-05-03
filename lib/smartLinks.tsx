import React from "react";
import Link from "next/link";

interface KeywordLink {
  keyword: string;
  href: string;
  description?: string;
}

const COMMON_KEYWORDS: KeywordLink[] = [
  { keyword: "Partikel", href: "/library/cheatsheet#particles", description: "Kata bantu yang menunjukkan hubungan gramatikal." },
  { keyword: "Kata Kerja", href: "/library/verbs", description: "Dōshi - Kata yang menunjukkan tindakan atau keadaan." },
  { keyword: "Kata Sifat", href: "/library/cheatsheet#adjectives", description: "Keiyōshi - Kata yang mendeskripsikan benda." },
  { keyword: "JLPT", href: "/exams", description: "Japanese Language Proficiency Test." },
  { keyword: "Kanji", href: "/library/kanji", description: "Karakter logografis yang digunakan dalam penulisan Jepang." },
  { keyword: "Hiragana", href: "/courses/basics#hiragana", description: "Suku kata dasar dalam penulisan bahasa Jepang." },
  { keyword: "Katakana", href: "/courses/basics#katakana", description: "Suku kata untuk kata serapan asing." },
];

/**
 * SmartText Utility
 * Scans a string and wraps keywords with Links and optional tooltips.
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
              key={`${keyword}-${i}`}
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
