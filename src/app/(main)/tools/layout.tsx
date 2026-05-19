import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pusat Peralatan | NihongoRoute",
  description: "Kumpulan alat bantu belajar bahasa Jepang: Kana Master, Flashcards, latihan menulis, dan kamus.",
};

export default function ToolsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
