import { client } from "@/sanity/lib/client";
import CheatsheetClient from "./CheatsheetClient";

export default async function CheatsheetPage() {
  // Query untuk mengambil semua cheatsheet
  const sheets = await client.fetch(
    `*[_type == "cheatsheet"] | order(category asc, title asc)`,
  );

  return (
    <div className="min-h-screen bg-[#15171a] p-4 md:p-10">
      <div className="max-w-7xl mx-auto">
        <header className="mb-12 px-4">
          <div className="flex items-center gap-4 mb-3">
            <div className="h-10 w-2 bg-[#0ef] rounded-full shadow-[0_0_15px_#0ef]" />
            <h1 className="text-3xl md:text-5xl font-black text-white tracking-tighter uppercase">
              N5 Reference Hub
            </h1>
          </div>
          <p className="text-white/40 font-medium ml-6 max-w-xl text-sm md:text-base tracking-wide">
            Akses cepat ke tabel partikel, angka, waktu, dan kosakata tematik
            tanpa harus membuka kamus besar.
          </p>
        </header>

        <CheatsheetClient initialSheets={sheets} />
      </div>
    </div>
  );
}
