/**
 * @file src/lib/constants/library.tsx
 * @description Konstanta statis dan pembangun metadata kategori pustaka belajar.
 */

import React from "react";
import { BookOpen, Headphone, LayoutGrid, Book, Zap } from "@/components/ui/icons";
import { LibraryCounts } from "@/actions/library-counts.actions";

export interface LibraryCategoryItem {
 href: string;
 title: string;
 desc: string;
 icon: React.ReactNode;
 label: string;
 count?: number;
 accent: string;
 isFeatured?: boolean;
}

export interface LibraryStatItem {
 label: string;
 value: number;
 accent: string;
}

export function buildLibraryCategories(counts: LibraryCounts): LibraryCategoryItem[] {
 return [
 {
 href: "/library/vocab",
 title: "Pustaka Kata",
 desc: "Kuasai ribuan kosakata bahasa Jepang dengan panduan audio native, cara baca hiragana/romaji, dan contoh kalimat praktis.",
 icon: <LayoutGrid size={28} />,
 label: "Kosakata Core",
 count: counts.vocab,
 accent: "accent-blue",
 isFeatured: false,
 },
 {
 href: "/library/kanji",
 title: "Kamus Kanji",
 desc: "Pelajari karakter Kanji JLPT N5-N1 lengkap dengan cara baca Onyomi/Kunyomi, radikal pembentuk, dan urutan guratan visual.",
 icon: <LayoutGrid size={28} />,
 label: "Kanji Vault",
 count: counts.kanji,
 accent: "accent-rose",
 isFeatured: false,
 },
 {
 href: "/library/grammar",
 title: "Tata Bahasa",
 desc: "Bahas pola kalimat jadi lebih rinci dengan formula struktur, contoh audio, dan catatan penggunaan kontekstual.",
 icon: <BookOpen size={28} />,
 label: "Pola Kalimat",
 count: counts.grammar,
 accent: "accent-emerald",
 },
 {
 href: "/library/reading",
 title: "Graded Reading",
 desc: "Asah kemahiran membaca melalui artikel teks interaktif berjenjang yang dikategorikan sesuai standar kelulusan JLPT.",
 icon: <Book size={28} />,
 label: "Bacaan Berjenjang",
 count: counts.reading,
 accent: "accent-violet",
 },
 {
 href: "/library/listening",
 title: "Latihan Menyimak",
 desc: "Tingkatkan kepekaan pendengaran melalui modul audio interaktif, latihan soal pemahaman, dan dukungan transkrip.",
 icon: <Headphone size={28} />,
 label: "Listening Lab",
 count: counts.listening,
 accent: "accent-cyan",
 },
 {
 href: "/library/cheatsheet",
 title: "Catatan Cepat",
 desc: "Referensi ringkas untuk sistem angka, partikel dasar, konjugasi kata kerja, dan formula penunjang belajar harian.",
 icon: <Zap size={28} />,
 label: "Panduan Cepat",
 accent: "accent-amber",
 isFeatured: true,
 }
 ];
}

export function buildLibraryStats(counts: LibraryCounts): LibraryStatItem[] {
 return [
 { label: "Total Kosakata", value: counts.vocab, accent: "accent-blue" },
 { label: "Total Kanji", value: counts.kanji, accent: "accent-rose" },
 { label: "Total Tata Bahasa", value: counts.grammar, accent: "accent-emerald" },
 ];
}

