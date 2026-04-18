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
    // PERBAIKAN: pt-24 md:pt-28 agar pas di bawah Navbar, dan flex-col agar isi tidak melebar vertikal tak wajar
    <main className="w-full  bg-cyber-bg  px-4 md:px-8 relative overflow-hidden flex flex-col justify-start">
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none z-0" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-cyan-900/10 via-cyber-bg to-cyber-bg pointer-events-none z-0" />

      <div className="max-w-5xl mx-auto w-full relative z-10 flex flex-col">
        <VerbListClient initialVerbs={verbs} />
      </div>
    </main>
  );
}
