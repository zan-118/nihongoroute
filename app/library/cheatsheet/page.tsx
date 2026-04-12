import { client } from "@/sanity/lib/client";
import CheatsheetClient from "./CheatsheetClient";

export const revalidate = 3600;

export default async function CheatsheetPage() {
  const sheets = await client.fetch(
    `*[_type == "cheatsheet"] | order(category asc, title asc)`,
  );

  return (
    <main className="min-h-screen bg-cyber-bg pt-24 pb-32 px-4 md:px-8 relative overflow-hidden">
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        <header className="mb-12 border-b border-white/5 pb-8">
          <div className="flex items-center gap-4 mb-4">
            <div className="h-10 w-2 bg-purple-500 rounded-full shadow-[0_0_15px_rgba(168,85,247,0.5)] hidden md:block" />
            <h1 className="text-4xl md:text-6xl font-black text-white tracking-tighter uppercase italic drop-shadow-lg">
              Data{" "}
              <span className="text-purple-400 drop-shadow-[0_0_15px_rgba(168,85,247,0.4)]">
                Sheets
              </span>
            </h1>
          </div>
          <p className="text-[#c4cfde]/60 font-medium md:ml-6 max-w-2xl text-sm leading-relaxed">
            Akses cepat ke tabel partikel, angka, waktu, dan kosakata tematik
            JLPT N5 tanpa harus membuka kamus besar.
          </p>
        </header>

        <CheatsheetClient initialSheets={sheets} />
      </div>
    </main>
  );
}
