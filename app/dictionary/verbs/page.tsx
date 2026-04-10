import { client } from "@/sanity/lib/client"; // Sesuaikan dengan path client Sanity kamu
import { allVerbsQuery } from "@/lib/queries";
import VerbListClient from "./VerbListClient";

export default async function VerbDictionaryPage() {
  // Fetch data langsung di Server Component
  const verbs = await client.fetch(allVerbsQuery);

  return (
    <div className="max-w-6xl mx-auto p-6">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Kamus Konjugasi Kata Kerja
        </h1>
        <p className="text-gray-600">
          Cari dan pelajari perubahan bentuk kata kerja Golongan I, II, dan III.
        </p>
      </header>

      {/* Kirim data ke komponen Client untuk fitur pencarian interaktif */}
      <VerbListClient initialVerbs={verbs} />
    </div>
  );
}
