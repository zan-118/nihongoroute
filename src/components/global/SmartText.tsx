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

/**
 * Keyword link mapping structure.
 */
interface KeywordLink {
 keyword: string;
 href: string;
 description?: string;
}

/**
 * List of common Japanese grammar and vocabulary keywords.
 */
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
// PENDUKUNG DESAIN & MARKDOWN PARSER
// ==========================================

/**
 * Parse markdown syntax for bold, italic, and code blocks.
 * @param text Raw text input.
 * @returns Array of React nodes with applied styles.
 */
function parseInlineStyles(text: string): React.ReactNode[] {
 // Split text by markdown delimiters: bold (**), code (`), italic (*)
 const parts = text.split(/(\*\*.*?\*\*|`.*?`|\*.*?\*)/g);
 return parts.map((part, index) => {
 // Match bold syntax
 if (part.startsWith("**") && part.endsWith("**")) {
 return (
 <strong key={index} className="text-foreground font-black">
 {part.slice(2, -2)}
 </strong>
 );
 }
 // Match inline code syntax
 if (part.startsWith("`") && part.endsWith("`")) {
 return (
 <code key={index} className="px-1.5 py-0.5 rounded bg-primary/5 border border-primary/10 text-primary font-mono text-xs md:text-sm font-bold mx-0.5">
 {part.slice(1, -1)}
 </code>
 );
 }
 // Match italic syntax
 if (part.startsWith("*") && part.endsWith("*")) {
 return (
 <em key={index} className="italic text-muted-foreground/90 font-medium">
 {part.slice(1, -1)}
 </em>
 );
 }
 return part;
 });
}

// ==========================================
// FUNGSI UTAMA UTILITY
// ==========================================
/**
 * Memindai string teks mentah dan membungkus kata kunci tata bahasa secara dinamis menggunakan komponen Link Next.js dan tooltip penjelasan.
 * Juga memproses gaya inline markdown seperti bold (**), italic (*), dan code (`) secara aman.
 * 
 * @param {string} text - Teks mentah bahasa Indonesia / Jepang yang akan dipindai
 * @returns {React.ReactNode[] | null} Elemen teks yang sudah diformat dengan tautan cerdas dan gaya markdown
 */
export function renderSmartText(text: string) {
 if (!text) return null;

 let parts: (string | React.ReactNode)[] = [text];

 // Iterate keywords to find and replace matches in text segments
 COMMON_KEYWORDS.forEach(({ keyword, href, description }) => {
 const newParts: (string | React.ReactNode)[] = [];
 
 parts.forEach((part) => {
 // Skip already processed React nodes
 if (typeof part !== "string") {
 newParts.push(part);
 return;
 }

 // Case-insensitive match for current keyword
 const regex = new RegExp(`(${keyword})`, "gi");
 const split = part.split(regex);
 
 split.forEach((subPart, i) => {
 // Wrap matching keyword in Link component
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

 const finalizedParts: React.ReactNode[] = [];
 // Apply inline markdown styles to remaining plain text parts
 parts.forEach((part) => {
 if (typeof part === "string") {
 finalizedParts.push(...parseInlineStyles(part));
 } else {
 finalizedParts.push(part);
 }
 });

 return finalizedParts;
}