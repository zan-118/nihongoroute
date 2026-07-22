/**
 * @file src/lib/constants/library.tsx
 * @description Konstanta statis dan pembangun metadata kategori pustaka belajar.
 */

import React from "react";
import { BookOpen, Headphones, Type, Languages, BookText, Zap } from "@/components/ui/icons";
import { LibraryCounts } from "@/actions/library-counts.actions";

export interface LibraryCategoryItem {
  href: string;
  title: string;
  desc: string;
  icon: React.ReactNode;
  label: string;
  count?: number;
  accentRgb: string;
  isFeatured?: boolean;
}

export interface LibraryStatItem {
  label: string;
  value: number;
  accentRgb: string;
}

export function buildLibraryCategories(counts: LibraryCounts): LibraryCategoryItem[] {
  return [
    {
      href: "/library/vocab",
      title: "Pustaka Kata",
      desc: "Kuasai ribuan kosakata bahasa Jepang dengan panduan audio native, cara baca hiragana/romaji, dan contoh kalimat praktis.",
      icon: <Languages size={28} />,
      label: "Kosakata Core",
      count: counts.vocab,
      accentRgb: "59 130 246",
      isFeatured: false,
    },
    {
      href: "/library/kanji",
      title: "Kamus Kanji",
      desc: "Pelajari karakter Kanji JLPT N5-N1 lengkap dengan cara baca Onyomi/Kunyomi, radikal pembentuk, dan urutan guratan visual.",
      icon: <Type size={28} />,
      label: "Kanji Vault",
      count: counts.kanji,
      accentRgb: "239 68 68",
      isFeatured: false,
    },
    {
      href: "/library/grammar",
      title: "Tata Bahasa",
      desc: "Bahas pola kalimat jadi lebih rinci dengan formula struktur, contoh audio, dan catatan penggunaan kontekstual.",
      icon: <BookOpen size={28} />,
      label: "Pola Kalimat",
      count: counts.grammar,
      accentRgb: "34 197 94",
    },
    {
      href: "/library/reading",
      title: "Graded Reading",
      desc: "Asah kemahiran membaca melalui artikel teks interaktif berjenjang yang dikategorikan sesuai standar kelulusan JLPT.",
      icon: <BookText size={28} />,
      label: "Bacaan Berjenjang",
      count: counts.reading,
      accentRgb: "168 85 247",
    },
    {
      href: "/library/listening",
      title: "Latihan Menyimak",
      desc: "Tingkatkan kepekaan pendengaran melalui modul audio interaktif, latihan soal pemahaman, dan dukungan transkrip.",
      icon: <Headphones size={28} />,
      label: "Listening Lab",
      count: counts.listening,
      accentRgb: "6 182 212",
    },
    {
      href: "/library/cheatsheet",
      title: "Catatan Cepat",
      desc: "Referensi ringkas untuk sistem angka, partikel dasar, konjugasi kata kerja, dan formula penunjang belajar harian.",
      icon: <Zap size={28} />,
      label: "Panduan Cepat",
      accentRgb: "245 158 11",
      isFeatured: true,
    }
  ];
}

export function buildLibraryStats(counts: LibraryCounts): LibraryStatItem[] {
  return [
    { label: "Total Kosakata", value: counts.vocab, accentRgb: "59 130 246" },
    { label: "Total Kanji", value: counts.kanji, accentRgb: "239 68 68" },
    { label: "Total Tata Bahasa", value: counts.grammar, accentRgb: "34 197 94" },
  ];
}

