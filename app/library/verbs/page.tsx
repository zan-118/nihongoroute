import { client } from "@/sanity/lib/client";
import VerbListClient from "./VerbListClient";

// Fitur Next.js: Data disimpan dalam cache selama 1 jam, halaman dimuat instan
export const revalidate = 3600;

export default async function VerbDictionaryPage() {
  const query = `*[_type == "verb_dictionary" && showInFlashcard != false] | order(jisho asc) {
    _id, group, jisho, meaning, masu, furigana, te, nai, ta, teiru, tai, nakereba, kanou, shieki, ukemi, katei, ikou, teshimau, meirei
  }`;

  const verbs = await client.fetch(query);

  return (
    <main className="min-h-screen bg-cyber-bg pt-24 pb-32 px-4 md:px-8 relative overflow-hidden">
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />
      <div className="max-w-5xl mx-auto relative z-10">
        <VerbListClient initialVerbs={verbs} />
      </div>
    </main>
  );
}
