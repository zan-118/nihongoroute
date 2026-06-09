import type { Metadata } from "next";
import DictionaryPageClient from "@/components/features/tools/dictionary/DictionaryPageClient";

export const metadata: Metadata = {
  title: "Kamus Terpadu | NihongoRoute",
  description: "Cari kosakata, grammar, dan kanji dalam satu halaman kamus terpadu.",
};

export default function DictionaryPage() {
  return <DictionaryPageClient />;
}
