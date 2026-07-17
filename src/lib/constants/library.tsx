/**
 * @file src/lib/constants/library.tsx
 * @description Konstanta statis dan pembangun metadata kategori pustaka belajar.
 */

import React from "react";
import { Database, Type, BookOpen, Headphones, Award, BarChart2 } from "lucide-react";
import { LibraryCounts } from "@/actions/library-counts.actions";

export interface LibraryCategoryItem {
  href: string;
  title: string;
  desc: string;
  icon: React.ReactNode;
  label: string;
  count?: number;
  isSanity?: boolean;
  accentRgb: string;
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
      title: "Daftar Kosakata",
      desc: "Ribuan kosakata, kata kerja, dan kata sifat N5-N1 lengkap dengan audio dan fitur SRS luring.",
      icon: <Database size={24} />,
      label: "Perbendaharaan Kata",
      count: counts.vocab,
      accentRgb: "59 130 246",
    },
    {
      href: "/library/kanji",
      title: "Pustaka Kanji",
      desc: "Dalami struktur ribuan kanji melalui visualisasi urutan goresan (stroke order) yang interaktif.",
      icon: <Type size={24} />,
      label: "Koleksi Kanji",
      count: counts.kanji,
      accentRgb: "239 68 68",
    },
    {
      href: "/library/grammar",
      title: "Panduan Tata Bahasa",
      desc: "Bahas pola kalimat jadi lebih mudah dengan contoh audio dan penjelasan praktis.",
      icon: <BookOpen size={24} />,
      label: "Pola Kalimat",
      count: counts.grammar,
      accentRgb: "34 197 94",
    },
    {
      href: "/library/reading",
      title: "Graded Reading",
      desc: "Asah kemahiran membaca melalui teks interaktif yang dikategorikan sesuai standar level JLPT.",
      icon: <BookOpen size={24} />,
      label: "Bacaan Berjenjang",
      count: counts.reading,
      isSanity: true,
      accentRgb: "168 85 247",
    },
    {
      href: "/library/listening",
      title: "Latihan Menyimak",
      desc: "Tingkatkan kepekaan pendengaran melalui modul audio interaktif dan dukungan transkrip.",
      icon: <Headphones size={24} />,
      label: "Listening Lab",
      count: counts.listening,
      isSanity: true,
      accentRgb: "6 182 212",
    },
    {
      href: "/exams",
      title: "Ujian & Sertifikasi",
      desc: "Uji kesiapanmu menghadapi ujian JLPT sesungguhnya dengan simulasi skor yang akurat.",
      icon: <Award size={24} />,
      label: "Latihan Ujian",
      count: counts.exams,
      isSanity: true,
      accentRgb: "249 115 22",
    },
    {
      href: "/library/cheatsheet",
      title: "Catatan Cepat",
      desc: "Referensi cepat untuk angka, partikel, dan materi dasar lainnya sebagai penunjang belajar harian.",
      icon: <BarChart2 size={24} />,
      label: "Panduan Cepat",
      accentRgb: "245 158 11",
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
