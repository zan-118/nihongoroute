import { client } from "@/sanity/lib/client";
import CheatsheetClient from "./CheatsheetClient";

// ✨ PERINTAH WAJIB: Mematikan semua cache agar data Sanity langsung muncul!
export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function CheatsheetPage() {
  const sheets = await client.fetch(
    `*[_type == "cheatsheet"] | order(category asc, title asc) {
      _id, title, category, items,
      linkedVocab[]->{ "jp": word, "label": meaning, romaji }
    }`,
  );

  return (
    <main className="min-h-screen bg-cyber-bg pt-24 pb-32 px-4 md:px-8 relative overflow-hidden">
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />
      <div className="max-w-7xl mx-auto relative z-10">
        <CheatsheetClient initialSheets={sheets} />
      </div>
    </main>
  );
}
