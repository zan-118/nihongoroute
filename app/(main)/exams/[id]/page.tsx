/**
 * @file page.tsx
 * @description Halaman Sesi Ujian Dinamis (Standalone Exam Session). 
 * Bertanggung jawab meresolusi ID rute URL dan menarik struktur soal dari Sanity CMS.
 * @module StandaloneExamSessionPage
 */

// ======================
// IMPORTS
// ======================
import { client } from "@/sanity/lib/client";
import MockExamEngine from "@/components/features/exams/mock-engine/MockExamEngine";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

// ======================
// TYPES
// ======================
interface PageProps {
  params: Promise<{ id: string }>;
}

// ======================
// CONFIG / CONSTANTS
// ======================
export const revalidate = 60;

// ======================
// MAIN EXECUTION
// ======================

/**
 * Komponen StandaloneExamSessionPage: Melakukan pengecekan validitas ketersediaan data ujian.
 * 
 * @returns {JSX.Element} Merender layar Error/Kosong, atau mesin interaktif ujian JLPT.
 */
export default async function StandaloneExamSessionPage({ params }: PageProps) {
  const { id } = await params;

  // ======================
  // DATABASE OPERATIONS
  // ======================
  const query = `*[_type == "mockExam" && _id == $id][0] {
    _id, title, timeLimit, passingScore,
    "categorySlug": course_category->slug.current, 
    "levelCode": level,
    "choukaiAudioUrl": choukaiAudio.asset->url,
    questions[] {
      _key, section, questionText,
      "imageUrl": image.asset->url, "audioUrl": audio.asset->url,
      options, correctAnswer
    }
  }`;

  const examData = await client.fetch(query, { id });
  const backLink = examData?.categorySlug
    ? `/courses/${examData.categorySlug}`
    : "/courses";

  // ======================
  // RENDER (Error Handling & Engine)
  // ======================

  // 1. HANDLING: DATA TIDAK DITEMUKAN
  if (!examData) {
    return (
      <div className="w-full flex-1 flex flex-col items-center justify-center px-6 text-center relative overflow-hidden py-12">
        <div className="absolute top-0 right-1/4 w-[400px] h-[400px] bg-red-500/5 blur-[120px] rounded-full pointer-events-none" />
        <Card className="p-10 md:p-14 border-red-500/20 max-w-lg w-full relative z-10 my-auto neo-card rounded-[2rem] bg-cyber-surface">
          <div className="w-20 h-20 mx-auto neo-inset text-red-500 flex items-center justify-center rounded-full mb-8 shadow-inner bg-black/20">
            <span className="text-4xl block">🚫</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-white uppercase tracking-tight mb-4">
            Ujian Tidak Ditemukan
          </h1>
          <p className="text-slate-300 mb-10 text-sm leading-relaxed">
            Data ujian ini tidak ditemukan atau sudah dihapus dari sistem.
          </p>
          <Button
            asChild
            variant="ghost"
            className="bg-[#0a0c10] neo-inset border border-white/5 hover:border-white/20 text-slate-200 hover:text-white font-black uppercase tracking-widest h-auto py-4 px-8 rounded-xl text-[10px] transition-all"
          >
            <Link href={backLink}>
              ← Kembali ke Menu
            </Link>
          </Button>
        </Card>
      </div>
    );
  }

  // 2. HANDLING: SOAL MASIH KOSONG
  if (!examData.questions || examData.questions.length === 0) {
    return (
      <div className="w-full flex-1 flex flex-col items-center justify-center px-6 text-center relative overflow-hidden py-12">
        <div className="absolute top-0 left-1/4 w-[400px] h-[400px] bg-amber-500/5 blur-[120px] rounded-full pointer-events-none" />
        <Card className="p-10 md:p-14 border-amber-500/20 max-w-lg w-full relative z-10 my-auto neo-card rounded-[2rem] bg-cyber-surface">
          <div className="w-20 h-20 mx-auto neo-inset text-amber-500 flex items-center justify-center rounded-full mb-8 shadow-inner bg-black/20">
            <span className="text-4xl block">🚧</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-white uppercase tracking-tight mb-4">
            Sedang Dalam Pembuatan
          </h1>
          <p className="text-slate-300 mb-10 text-sm leading-relaxed">
            Paket ujian{" "}
            <strong className="text-amber-400">{examData.title}</strong> belum
            memiliki butir soal di database.
          </p>
          <Button
            asChild
            variant="ghost"
            className="bg-[#0a0c10] neo-inset border border-amber-500/20 hover:border-amber-500/50 text-amber-500 hover:text-amber-400 font-black uppercase tracking-widest h-auto py-4 px-8 rounded-xl text-[10px] transition-all"
          >
            <Link href={backLink}>
              ← Kembali ke Menu
            </Link>
          </Button>
        </Card>
      </div>
    );
  }

  // 3. MAIN RENDER
  return (
    <div className="w-full flex-1 px-4 md:px-8 relative overflow-hidden flex flex-col mt-4 md:mt-8">
      <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] bg-red-500/5 blur-[150px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[10%] left-[-5%] w-[500px] h-[500px] bg-amber-500/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="w-full max-w-5xl mx-auto relative z-10 flex-1 flex flex-col">
        <MockExamEngine exam={examData} />
      </div>
    </div>
  );
}
