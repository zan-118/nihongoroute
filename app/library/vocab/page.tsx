import VocabClient from "./VocabClient";

export const metadata = {
  title: "Kamus Kosakata | Nihongopath",
  description: "Ribuan kosakata bahasa Jepang N5-N2",
};

export default function VocabLibraryPage() {
  return (
    <main className="w-full min-h-screen bg-cyber-bg pt-24 md:pt-28 pb-32 px-4 md:px-8 relative overflow-hidden flex flex-col justify-start">
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none z-0" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-rose-900/10 via-cyber-bg to-cyber-bg pointer-events-none z-0" />

      <div className="max-w-6xl mx-auto w-full relative z-10 flex flex-col">
        <VocabClient />
      </div>
    </main>
  );
}
