import { getPaginatedListening } from "@/actions/library.actions";
import ListeningListClient from "@/app/(main)/library/listening/ListeningListClient";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Latihan Menyimak | NihongoRoute",
  description: "Pertajam pendengaranmu dengan latihan audio interaktif dan transkrip real-time.",
};

export default async function ListeningListPage() {
  const initialData = await getPaginatedListening(1, 10, "");

  return (
    <div className="w-full min-h-screen bg-background relative overflow-hidden pt-12 pb-24 px-4 md:px-8">
      {/* Background Effects */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-[1000px] h-[500px] bg-primary/10 blur-[120px] rounded-[100%] pointer-events-none opacity-50" />
      <div className="neural-grid" />

      <div className="max-w-5xl mx-auto relative z-10">
        <ListeningListClient initialData={initialData} />
      </div>
    </div>
  );
}
