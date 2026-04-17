/**
 * LOKASI FILE: app/courses/[level]/exam/[id]/page.tsx
 * DESKRIPSI:
 * Halaman sesi ujian simulasi (Mock Exam). Berfungsi sebagai container yang
 * mengambil data soal dari Sanity CMS dan menyerahkannya ke komponen
 * 'MockExamEngine' untuk dijalankan.
 */

import { client } from "@/sanity/lib/client";
import MockExamEngine from "@/components/MockExamEngine";
import Link from "next/link";

interface PageProps {
  params: Promise<{ level: string; id: string }>;
}

/**
 * Konfigurasi Revalidasi:
 * Mengatur agar halaman ini diperbarui setiap 60 detik jika ada perubahan
 * data pada soal ujian di Sanity tanpa perlu build ulang.
 */
export const revalidate = 60;

/**
 * KOMPONEN UTAMA HALAMAN SESI UJIAN
 */
export default async function ExamSessionPage({ params }: PageProps) {
  // Destrukturisasi level (n5, n4, dll) dan ID dokumen ujian dari parameter URL
  const { level, id } = await params;

  /**
   * QUERY GROQ:
   * Mengambil detail ujian termasuk daftar pertanyaan, asset gambar,
   * dan asset audio untuk seksi Choukai (Listening).
   */
  const query = `*[_type == "mockExam" && _id == $id][0] {
    _id, 
    title, 
    timeLimit, 
    passingScore,
    questions[] {
      _key, 
      section, 
      questionText,
      "imageUrl": image.asset->url, // Transformasi asset gambar ke URL string
      "audioUrl": audio.asset->url, // Transformasi asset audio ke URL string
      options, 
      correctAnswer
    }
  }`;

  const examData = await client.fetch(query, { id });

  /**
   * HANDLING: DATA TIDAK DITEMUKAN
   * Menampilkan pesan error jika ID ujian tidak valid atau dokumen telah dihapus.
   */
  if (!examData) {
    return (
      <div className="w-full min-h-screen flex flex-col items-center justify-center bg-cyber-bg px-4 text-center pt-24 pb-32">
        <div className="bg-cyber-surface p-8 md:p-12 rounded-[2rem] md:rounded-[3rem] border border-red-500/20 shadow-[0_0_40px_rgba(239,68,68,0.1)] max-w-lg w-full">
          <span className="text-6xl md:text-7xl mb-6 block drop-shadow-lg">
            🚫
          </span>
          <h1 className="text-2xl md:text-3xl font-black text-white uppercase italic tracking-tighter mb-4 leading-tight">
            Ujian Tidak Ditemukan
          </h1>
          <p className="text-white/50 mb-8 text-sm leading-relaxed">
            Data ujian ini tidak ditemukan atau mungkin sudah dihapus dari
            sistem.
          </p>
          <Link
            href={`/courses/${level}`}
            className="inline-block bg-white/5 hover:bg-white/10 border border-white/10 text-white font-black uppercase tracking-widest py-3.5 px-8 rounded-xl transition-all text-xs active:scale-95"
          >
            ← Kembali ke Materi
          </Link>
        </div>
      </div>
    );
  }

  /**
   * HANDLING: SOAL MASIH KOSONG
   * Menampilkan status "Under Construction" jika dokumen ujian ada namun
   * admin belum menginput pertanyaan di Sanity Studio.
   */
  if (!examData.questions || examData.questions.length === 0) {
    return (
      <div className="w-full min-h-screen flex flex-col items-center justify-center bg-cyber-bg px-4 text-center pt-24 pb-32">
        <div className="bg-cyber-surface p-8 md:p-12 rounded-[2rem] md:rounded-[3rem] border border-amber-500/20 shadow-[0_0_40px_rgba(245,158,11,0.1)] max-w-lg w-full relative overflow-hidden">
          <div className="absolute inset-0 bg-amber-500/5 pointer-events-none" />
          <span className="text-6xl md:text-7xl mb-6 block relative z-10 drop-shadow-[0_0_15px_rgba(245,158,11,0.5)]">
            🚧
          </span>
          <h1 className="text-2xl md:text-3xl font-black text-white uppercase italic tracking-tighter mb-4 leading-tight relative z-10">
            Sedang Dalam Pembuatan
          </h1>
          <p className="text-white/60 mb-8 text-sm max-w-sm mx-auto leading-relaxed relative z-10">
            Paket ujian{" "}
            <strong className="text-amber-400">{examData.title}</strong> belum
            memiliki butir soal. Tim kami akan segera menambahkannya!
          </p>
          <Link
            href={`/courses/${level}`}
            className="inline-block bg-amber-500/10 border border-amber-500/30 text-amber-500 hover:bg-amber-500 hover:text-black font-black uppercase tracking-widest py-3.5 px-8 rounded-xl transition-all text-xs active:scale-95 relative z-10 shadow-[0_0_15px_rgba(245,158,11,0.2)]"
          >
            ← Kembali
          </Link>
        </div>
      </div>
    );
  }

  /**
   * RENDER UTAMA:
   * Jika data valid dan soal tersedia, kirim seluruh objek 'examData'
   * ke 'MockExamEngine' yang mengelola state interaktif ujian.
   */
  return (
    <div className="min-h-screen w-full bg-cyber-bg pt-24 md:pt-32 pb-32 px-4 md:px-8 relative overflow-hidden">
      {/* Background Decor: Efek pendaran amber (tema ujian) */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-900/10 via-cyber-bg to-cyber-bg pointer-events-none z-0" />

      <div className="w-full max-w-4xl mx-auto relative z-10">
        <MockExamEngine exam={examData} />
      </div>
    </div>
  );
}
