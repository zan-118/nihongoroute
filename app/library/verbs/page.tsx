import { client } from "@/sanity/lib/client";
import { allVerbsQuery } from "@/lib/queries";
import VerbListClient from "./VerbListClient";

export default async function VerbDictionaryPage() {
  const verbs = await client.fetch(allVerbsQuery);

  return (
    <div className="min-h-screen bg-[#1f242d] p-4 md:p-8 py-24">
      <div className="max-w-7xl mx-auto">
        <header className="mb-12 px-4 text-center md:text-left">
          <div className="flex flex-col md:flex-row items-center gap-4 mb-4">
            <div className="h-10 w-2 bg-[#0ef] rounded-full shadow-[0_0_15px_#0ef] hidden md:block" />
            <h1 className="text-4xl md:text-5xl font-black text-white tracking-tighter uppercase italic">
              Verbs <span className="text-[#0ef]">Archive</span>
            </h1>
          </div>
          <p className="text-[#c4cfde]/40 font-medium md:ml-6 max-w-2xl text-sm italic">
            Eksplorasi perubahan bentuk 120+ kata kerja N5 Golongan I, II, dan
            III secara otomatis dengan mesin konjugasi.
          </p>
        </header>

        <VerbListClient initialVerbs={verbs} />
      </div>
    </div>
  );
}
