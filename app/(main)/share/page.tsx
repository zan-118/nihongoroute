/**
 * @file page.tsx
 * @description Halaman penerima tautan sertifikat ujian. 
 * Men-decode parameter URL format Base64 menjadi struktur data statistik kelulusan.
 * @module SharePage
 */

"use client";

// ======================
// IMPORTS
// ======================
import { useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import { motion } from "framer-motion";
import {
  Trophy,
  Skull,
  XCircle,
  Share2,
  Home,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

// ======================
// TYPES
// ======================
interface SharedResult {
  guestId: string;
  examTitle: string;
  score: number;
  totalQuestions: number;
  passed: boolean;
  sectionScores: {
    vocabulary: number;
    grammar: number;
    reading: number;
    listening: number;
  };
  date: string;
}

// ======================
// COMPONENTS
// ======================

/**
 * Komponen ShareContent: Menangani pemrosesan logika dekripsi parameter URL.
 * 
 * @returns {JSX.Element} Antarmuka Sertifikat digital.
 */
function ShareContent() {
  const searchParams = useSearchParams();
  const [data, setData] = useState<SharedResult | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    // ======================
    // BUSINESS LOGIC
    // ======================
    
    // 1. Ekstrak data teks hasil Base64 encoding dari URL param (?data=...)
    const rawData = searchParams.get("data");
    if (rawData) {
      try {
        // 2. Dekode mundur (decodeURIComponent -> atob) dan parsing kembali ke bentuk Objek JSON
        const decodedData = JSON.parse(decodeURIComponent(atob(rawData)));
        setData(decodedData);
      } catch (err) {
        console.error("Gagal mendecode data share:", err);
        setError(true);
      }
    } else {
      setError(true);
    }
  }, [searchParams]);

  // ======================
  // RENDER (Content)
  // ======================

  if (error) {
    return (
      <div className="w-full  bg-[#080a0f] flex flex-col items-center justify-center p-6 text-center">
        <Card className="p-10 border-red-500/20">
          <XCircle size={60} className="text-red-500 mx-auto mb-6" />
          <h1 className="text-2xl font-black text-white uppercase italic mb-4">
            Link Tidak Valid
          </h1>
          <p className="text-slate-300 text-sm mb-8">
            Data hasil ujian rusak atau link tidak lengkap.
          </p>
          <Button asChild className="w-full">
            <Link href="/">Kembali ke Beranda</Link>
          </Button>
        </Card>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="w-full py-12 px-4 relative overflow-hidden flex flex-col items-center justify-center min-h-[70vh]">
      <div
        className={`absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[500px] blur-[150px] rounded-full pointer-events-none ${data.passed ? "bg-emerald-500/10" : "bg-red-500/10"}`}
      />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-2xl mx-auto relative z-10"
      >
        <Card className="p-8 md:p-12 text-center border-white/5 shadow-neumorphic">
          <div
            className={`w-24 h-24 mx-auto neo-inset flex items-center justify-center rounded-full mb-8 ${data.passed ? "text-emerald-400" : "text-red-500"}`}
          >
            {data.passed ? <Trophy size={48} /> : <Skull size={48} />}
          </div>

          <h4 className="text-cyan-400 font-mono text-[10px] uppercase tracking-[0.3em] mb-2">
            Sertifikat Hasil Ujian
          </h4>
          <h1
            className={`text-4xl md:text-5xl font-black uppercase italic tracking-tighter mb-6 ${data.passed ? "text-emerald-400" : "text-red-500"}`}
          >
            {data.passed ? "Lulus Ujian" : "Gagal Ujian"}
          </h1>

          <div className="neo-inset p-6 rounded-2xl mb-10 text-left">
            <div className="flex justify-between items-center border-b border-white/5 pb-4 mb-4">
              <span className="text-xs font-black uppercase text-slate-300">
                Peserta
              </span>
              <span className="font-mono font-bold text-white uppercase tracking-widest">
                {data.guestId}
              </span>
            </div>
            <div className="flex justify-between items-center border-b border-white/5 pb-4 mb-4">
              <span className="text-xs font-black uppercase text-slate-300">
                Materi
              </span>
              <span className="text-white font-bold italic">
                {data.examTitle}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs font-black uppercase text-slate-300">
                Skor Akhir
              </span>
              <span
                className={`text-3xl font-black font-mono ${data.passed ? "text-emerald-400" : "text-red-500"}`}
              >
                {data.score}{" "}
                <span className="text-sm text-slate-600">/ 180</span>
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-10">
            {Object.entries(data.sectionScores).map(([key, score]) => (
              <div
                key={key}
                className="bg-[#080a0f] border border-white/5 rounded-xl p-4 shadow-inner"
              >
                <p className="text-[9px] font-mono text-slate-300 uppercase font-bold tracking-widest mb-1">
                  {key}
                </p>
                <p className="text-xl font-black italic text-white">{score}%</p>
              </div>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <Button
              variant="outline"
              asChild
              className="flex-1 py-6 text-[10px] font-black tracking-widest"
            >
              <Link href="/">
                <Home size={16} className="mr-2" /> Coba Ujian Sendiri
              </Link>
            </Button>
            <Button
              onClick={() =>
                navigator.clipboard.writeText(window.location.href)
              }
              className="flex-1 py-6 text-[10px] font-black tracking-widest"
            >
              <Share2 size={16} className="mr-2" /> Salin Link Share
            </Button>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}

// ======================
// MAIN EXECUTION
// ======================

/**
 * Halaman Utama Sertifikat Ujian.
 * @returns {JSX.Element} Pembungkus Suspense yang membungkus sub-komponen pemroses URL.
 */
export default function SharePage() {
  return (
    <Suspense fallback={null}>
      <ShareContent />
    </Suspense>
  );
}
