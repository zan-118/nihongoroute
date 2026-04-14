import { client } from "@/sanity/lib/client";
import { notFound } from "next/navigation";
import MockExamEngine from "@/components/MockExamEngine";
import Link from "next/link";

interface PageProps {
  params: Promise<{ level: string; id: string }>;
}

export const revalidate = 60;

export default async function ExamSessionPage({ params }: PageProps) {
  const { level, id } = await params;

  const query = `*[_type == "mockExam" && _id == $id][0] {
    _id, title, timeLimit, passingScore,
    questions[] {
      _key, section, questionText,
      "imageUrl": image.asset->url,
      "audioUrl": audio.asset->url,
      options, correctAnswer
    }
  }`;

  const examData = await client.fetch(query, { id });

  if (!examData) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center bg-cyber-bg px-4 text-center">
        <div className="bg-cyber-surface p-8 md:p-10 rounded-[2rem] md:rounded-[3rem] border border-red-500/20 shadow-2xl">
          <span className="text-5xl md:text-6xl mb-4 md:mb-6 block">🚫</span>
          <h1 className="text-2xl md:text-3xl font-black text-white uppercase italic tracking-tighter mb-3 md:mb-4">
            Ujian Tidak Ditemukan
          </h1>
          <p className="text-white/50 mb-6 md:mb-8 text-xs md:text-sm max-w-sm mx-auto">
            Data ujian ini tidak ditemukan atau mungkin sudah dihapus dari
            sistem.
          </p>
          <Link
            href={`/courses/${level}`}
            className="inline-block bg-white/5 hover:bg-white/10 border border-white/10 text-white font-black uppercase tracking-widest py-3 px-6 md:px-8 rounded-xl transition-all text-xs md:text-sm"
          >
            ← Kembali ke Materi
          </Link>
        </div>
      </main>
    );
  }

  if (!examData.questions || examData.questions.length === 0) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center bg-cyber-bg px-4 text-center">
        <div className="bg-cyber-surface p-8 md:p-10 rounded-[2rem] md:rounded-[3rem] border border-amber-500/20 shadow-2xl">
          <span className="text-5xl md:text-6xl mb-4 md:mb-6 block">🚧</span>
          <h1 className="text-2xl md:text-3xl font-black text-white uppercase italic tracking-tighter mb-3 md:mb-4">
            Sedang Dalam Pembuatan
          </h1>
          <p className="text-white/50 mb-6 md:mb-8 text-xs md:text-sm max-w-sm mx-auto">
            Paket ujian <strong>{examData.title}</strong> belum memiliki soal.
            Admin akan segera menambahkannya!
          </p>
          <Link
            href={`/courses/${level}`}
            className="inline-block bg-amber-500/10 border border-amber-500/30 text-amber-500 hover:bg-amber-500/20 font-black uppercase tracking-widest py-3 px-6 md:px-8 rounded-xl transition-all text-xs md:text-sm"
          >
            ← Kembali
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-cyber-bg pt-20 pb-16 px-4 relative overflow-hidden flex flex-col items-center justify-center">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-900/10 via-cyber-bg to-cyber-bg pointer-events-none" />
      <div className="w-full max-w-4xl relative z-10 flex-1 flex flex-col justify-center">
        <MockExamEngine exam={examData} />
      </div>
    </main>
  );
}
