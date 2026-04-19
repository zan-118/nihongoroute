/**
 * @file app/(main)/library/cheatsheet/page.tsx
 * @description Halaman rute referensi kilat (Cheatsheets). Mendefinisikan permintaan data secara dinamis (Dynamic Rendering) dari Sanity CMS tanpa melakukan mekanisme caching karena referensi ini sering diperbarui.
 * @module Server Component
 */

import { client } from "@/sanity/lib/client";
import CheatsheetClient from "./CheatsheetClient";

// Konfigurasi Server: Selalu merender data terbaru pada setiap kunjungan ulang halaman
export const dynamic = "force-dynamic";
export const revalidate = 0;

/**
 * Komponen Induk Layar Referensi Kilat.
 * Mengeksekusi penarikan data GROQ (beserta relasi 'linkedVocab' ke dokumen kosakata) dari sisi peladen (server), 
 * lalu mem-pass data tersebut ke komponen antarmuka antrean klien.
 * 
 * @returns {JSX.Element} Merender komponen antrean CheatsheetClient beserta data array.
 */
export default async function CheatsheetPage() {
  const sheets = await client.fetch(
    `*[_type == "cheatsheet"] | order(category asc, title asc) {
      _id, title, category, items,
      linkedVocab[]->{ "jp": word, "label": meaning, romaji }
    }`,
  );

  return (
    <main className="w-full bg-cyber-bg px-6 md:px-12 relative overflow-hidden flex flex-col justify-start min-h-screen">
      {/* Background Neural Overlays */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:60px_60px] pointer-events-none z-0" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(239,68,68,0.05)_0%,transparent_70%)] pointer-events-none z-0" />

      <div className="max-w-7xl mx-auto w-full relative z-10 flex flex-col pt-10">
        <CheatsheetClient initialSheets={sheets} />
      </div>
    </main>
  );
}
