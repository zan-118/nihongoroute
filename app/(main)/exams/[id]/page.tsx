/**
 * LOKASI FILE: app/(main)/exams/[id]/page.tsx
 * KONSEP: Cyber-Dark Neumorphic (Server Wrapper & Error Handling)
 */

import { client } from "@/sanity/lib/client";
import MockExamEngine from "@/components/MockExamEngine";
import Link from "next/link";

interface PageProps {
  params: Promise<{ id: string }>;
}

export const revalidate = 60;

export default async function StandaloneExamSessionPage({ params }: PageProps) {
  const { id } = await params;

  const query = `*[_type == "mockExam" && _id == $id][0] {
    _id, 
    title, 
    timeLimit, 
    passingScore,
    "categorySlug": course_category->slug.current, 
    questions[] {
      _key, 
      section, 
      questionText,
      "imageUrl": image.asset->url,
      "audioUrl": audio.asset->url,
      options, 
      correctAnswer
    }
  }`;

  const examData = await client.fetch(query, { id });
  const backLink = examData?.categorySlug
    ? `/courses/${examData.categorySlug}`
    : "/courses";

  // 1. HANDLING: DATA TIDAK DITEMUKAN (Neumorphic Style)
  if (!examData) {
    return (
      <main className="w-full min-h-screen flex flex-col items-center justify-center bg-[#080a0f] px-6 text-center pt-24 pb-32 relative overflow-hidden">
        <div className="absolute top-0 right-1/4 w-[400px] h-[400px] bg-red-500/5 blur-[120px] rounded-full pointer-events-none" />

        <div className="neo-card p-10 md:p-14 border-red-500/20 max-w-lg w-full relative z-10">
          <div className="w-20 h-20 mx-auto neo-inset text-red-500 flex items-center justify-center rounded-full mb-8 shadow-inner">
            <span className="text-4xl block">🚫</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-white uppercase italic tracking-tighter mb-4">
            Ujian Tidak Ditemukan
          </h1>
          <p className="text-slate-500 mb-10 text-sm leading-relaxed">
            Data ujian ini tidak ditemukan atau sudah dihapus dari sistem.
          </p>
          <Link
            href={backLink}
            className="inline-block bg-[#0a0c10] border border-white/5 shadow-[inset_2px_2px_8px_#050608,inset_-2px_-2px_8px_rgba(255,255,255,0.02)] hover:border-white/20 text-slate-400 hover:text-white font-black uppercase tracking-widest py-4 px-8 rounded-xl text-[10px] transition-all"
          >
            ← Kembali ke Menu
          </Link>
        </div>
      </main>
    );
  }

  // 2. HANDLING: SOAL MASIH KOSONG (Neumorphic Style)
  if (!examData.questions || examData.questions.length === 0) {
    return (
      <main className="w-full min-h-screen flex flex-col items-center justify-center bg-[#080a0f] px-6 text-center pt-24 pb-32 relative overflow-hidden">
        <div className="absolute top-0 left-1/4 w-[400px] h-[400px] bg-amber-500/5 blur-[120px] rounded-full pointer-events-none" />

        <div className="neo-card p-10 md:p-14 border-amber-500/20 max-w-lg w-full relative z-10">
          <div className="w-20 h-20 mx-auto neo-inset text-amber-500 flex items-center justify-center rounded-full mb-8 shadow-inner">
            <span className="text-4xl block">🚧</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-white uppercase italic tracking-tighter mb-4">
            Sedang Dalam Pembuatan
          </h1>
          <p className="text-slate-500 mb-10 text-sm leading-relaxed">
            Paket ujian{" "}
            <strong className="text-amber-400">{examData.title}</strong> belum
            memiliki butir soal di database.
          </p>
          <Link
            href={backLink}
            className="inline-block bg-[#0a0c10] border border-amber-500/20 shadow-[inset_2px_2px_8px_#050608,inset_-2px_-2px_8px_rgba(255,255,255,0.02)] hover:border-amber-500/50 text-amber-500 hover:text-amber-400 font-black uppercase tracking-widest py-4 px-8 rounded-xl text-[10px] transition-all"
          >
            ← Kembali ke Menu
          </Link>
        </div>
      </main>
    );
  }

  // 3. RENDER MOCK EXAM ENGINE
  return (
    <main className="min-h-screen w-full bg-[#080a0f] pt-24 md:pt-32 pb-32 px-4 md:px-8 relative overflow-hidden">
      {/* Background Ambient Red untuk kesan "Ujian/Urgensi" */}
      <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] bg-red-500/5 blur-[150px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[10%] left-[-5%] w-[500px] h-[500px] bg-amber-500/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="w-full max-w-5xl mx-auto relative z-10">
        {/* Komponen Mesin Ujian Asli Anda */}
        <MockExamEngine exam={examData} />
      </div>
    </main>
  );
}
