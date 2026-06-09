import type { Metadata } from "next";
import DictionaryPageClient from "@/components/features/tools/dictionary/DictionaryPageClient";
import { createPageMetadata } from "@/lib/seo";

export const metadata: Metadata = {
  ...createPageMetadata({
    title: "Kamus Terpadu Jepang | NihongoRoute",
    description: "Cari kosakata, grammar, dan kanji dalam satu halaman kamus bahasa Jepang terpadu.",
    path: "/tools/dictionary",
    keywords: ["kamus Jepang", "kamus kanji", "kamus grammar Jepang", "kosakata Jepang"],
  }),
};

export default function DictionaryPage() {
  return <DictionaryPageClient />;
}
