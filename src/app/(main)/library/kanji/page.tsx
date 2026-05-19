import { getPaginatedKanji } from "@/actions/library.actions";
import KanjiListClient from "@/app/(main)/library/kanji/KanjiListClient";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pustaka Kanji | NihongoRoute",
  description: "Kuasai ribuan kanji dengan visualisasi stroke order yang interaktif dan mudah diingat.",
};

export default async function KanjiListPage() {
  const initialData = await getPaginatedKanji(1, 24, "", "");

  return (
    <div className="w-full min-h-screen bg-background relative overflow-hidden pt-12 pb-24 px-4 md:px-8">
      {/* Background Effects */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-[1000px] h-[500px] bg-primary/10 blur-[120px] rounded-[100%] pointer-events-none opacity-50" />
      <div className="neural-grid" />

      <div className="max-w-6xl mx-auto relative z-10">
        <KanjiListClient initialData={initialData} />
      </div>
    </div>
  );
}
