import React from "react";
import { ROUTES } from "@/lib/core/routes";
import {
  LayoutGrid,
  FileText,
  GraduationCap,
  Puzzle,
  GitCompare,
  ListChecks,
  Hash,
  Mic,
  Headphones,
  Brain,
  Flame,
  Target,
  Search,
  PenTool,
} from "@/components/ui/icons";

export interface ToolItem {
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string; size?: number }>;
  href: string;
  color: string;
  bgColor: string;
  border: string;
}

export const tools: ToolItem[] = [
  {
    title: "Kana Master",
    description: "Tabel interaktif Hiragana & Katakana lengkap dengan latihan menulis.",
    icon: LayoutGrid,
    href: ROUTES.TOOLS.KANA,
    color: "text-primary",
    bgColor: "bg-primary/10",
    border: "border-primary/20"
  },
  {
    title: "Text Analyzer",
    description: "Tempel teks Jepang untuk menemukan kosakata, kanji, dan pola grammar penting.",
    icon: FileText,
    href: ROUTES.TOOLS.TEXT_ANALYZER,
    color: "text-primary",
    bgColor: "bg-primary/10",
    border: "border-primary/20"
  },
  {
    title: "Verb Conjugation Trainer",
    description: "Latih perubahan verba ke bentuk masu, te, nai, ta, pasif, potensial, dan lainnya.",
    icon: GraduationCap,
    href: ROUTES.TOOLS.CONJUGATION,
    color: "text-success",
    bgColor: "bg-success/10",
    border: "border-success/20"
  },
  {
    title: "Particle Trainer",
    description: "Latihan memilih partikel は, が, を, に, で, と, から, dan lainnya dari kalimat rumpang.",
    icon: Puzzle,
    href: ROUTES.TOOLS.PARTICLES,
    color: "text-primary",
    bgColor: "bg-primary/10",
    border: "border-primary/20"
  },
  {
    title: "Kanji Similarity Tool",
    description: "Bandingkan kanji mirip seperti 未/末, 日/目, 土/士 dengan cue visual dan contoh vocab.",
    icon: GitCompare,
    href: ROUTES.TOOLS.KANJI_SIMILARITY,
    color: "text-warning",
    bgColor: "bg-warning/10",
    border: "border-warning/20"
  },
  {
    title: "Sentence Builder",
    description: "Susun token menjadi kalimat Jepang yang benar untuk melatih grammar pattern.",
    icon: LayoutGrid,
    href: ROUTES.TOOLS.SENTENCE_BUILDER,
    color: "text-success",
    bgColor: "bg-success/10",
    border: "border-success/20"
  },
  {
    title: "JLPT Mini Drill",
    description: "Generate sesi cepat vocab, kanji, dan grammar dari N5 sampai N1.",
    icon: ListChecks,
    href: ROUTES.TOOLS.JLPT_DRILL,
    color: "text-primary",
    bgColor: "bg-primary/10",
    border: "border-primary/20"
  },
  {
    title: "Counter Trainer",
    description: "Latih counter 人, 本, 枚, 匹, 台, 冊, 杯, 個, 階, dan 歳 dari konteks benda.",
    icon: Hash,
    href: ROUTES.TOOLS.COUNTER_TRAINER,
    color: "text-warning",
    bgColor: "bg-warning/10",
    border: "border-warning/20"
  },
  {
    title: "Shadowing Recorder",
    description: "Putar kalimat target, rekam suara sendiri, lalu bandingkan tempo playback.",
    icon: Mic,
    href: ROUTES.TOOLS.SHADOWING,
    color: "text-success",
    bgColor: "bg-success/10",
    border: "border-success/20"
  },
  {
    title: "Dikte Kalimat (Dictation)",
    description: "Dengarkan kalimat contoh audio asli lalu ketik ejaannya untuk melatih pendengaran.",
    icon: Headphones,
    href: ROUTES.TOOLS.DICTATION,
    color: "text-success",
    bgColor: "bg-success/10",
    border: "border-success/20"
  },
  {
    title: "Flashcards",
    description: "Latih hafalan kosakata dan verba dengan sistem kartu pintar.",
    icon: Brain,
    href: ROUTES.TOOLS.FLASHCARDS,
    color: "text-primary",
    bgColor: "bg-primary/10",
    border: "border-primary/20"
  },
  {
    title: "Mode Bertahan Hidup",
    description: "Kuis kilat berbatas waktu. Tebak arti kata sebelum kehabisan nyawa dan waktu!",
    icon: Flame,
    href: ROUTES.TOOLS.SURVIVAL,
    color: "text-destructive",
    bgColor: "bg-destructive/10",
    border: "border-destructive/20"
  },
  {
    title: "Weak Point Trainer",
    description: "Latihan terarah untuk kartu SRS yang paling rapuh, overdue, dan sering gagal.",
    icon: Target,
    href: ROUTES.TOOLS.WEAK_POINTS,
    color: "text-destructive",
    bgColor: "bg-destructive/10",
    border: "border-destructive/20"
  },
  {
    title: "Kamus Terpadu",
    description: "Cari cepat lintas kosakata, kanji, dan tata bahasa dalam satu kolom, langsung tambahkan ke SRS dari hasil pencarian — untuk baca detail lengkap, buka Pustaka.",
    icon: Search,
    href: ROUTES.TOOLS.DICTIONARY,
    color: "text-warning",
    bgColor: "bg-warning/10",
    border: "border-warning/20"
  },
  {
    title: "Latihan Menulis",
    description: "Kanvas digital kosong untuk melatih guratan kanji, kana, atau coretan belajar.",
    icon: PenTool,
    href: ROUTES.TOOLS.WRITING,
    color: "text-success",
    bgColor: "bg-success/10",
    border: "border-success/20"
  }
];
