"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import { motion } from "framer-motion";
import {
  Trophy,
  Skull,
  CheckCircle,
  XCircle,
  Share2,
  Home,
} from "lucide-react";
import Link from "next/link";

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

function ShareContent() {
  const searchParams = useSearchParams();
  const [data, setData] = useState<SharedResult | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    const rawData = searchParams.get("data");
    if (rawData) {
      try {
        // Decode Base64 ke String, lalu parse ke JSON
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

  if (error) {
    return (
      <div className="min-h-screen bg-[#080a0f] flex flex-col items-center justify-center p-6 text-center">
        <div className="neo-card p-10 border-red-500/20">
          <XCircle size={60} className="text-red-500 mx-auto mb-6" />
          <h1 className="text-2xl font-black text-white uppercase italic mb-4">
            Link Tidak Valid
          </h1>
          <p className="text-slate-500 text-sm mb-8">
            Data hasil ujian rusak atau link tidak lengkap.
          </p>
          <Link href="/" className="btn-cyber block">
            Kembali ke Beranda
          </Link>
        </div>
      </div>
    );
  }

  if (!data) return null; // Loading state bisa ditambahkan di sini

  return (
    <main className="min-h-screen bg-[#080a0f] py-20 px-4 relative overflow-hidden">
      {/* Dekorasi Background agar mirip Dashboard */}
      <div
        className={`absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[500px] blur-[150px] rounded-full pointer-events-none ${data.passed ? "bg-emerald-500/10" : "bg-red-500/10"}`}
      />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl mx-auto relative z-10"
      >
        <div className="neo-card p-8 md:p-12 text-center border-white/5 shadow-neumorphic">
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
            {data.passed ? "Exam Cleared" : "Exam Failed"}
          </h1>

          <div className="neo-inset p-6 rounded-2xl mb-10 text-left">
            <div className="flex justify-between items-center border-b border-white/5 pb-4 mb-4">
              <span className="text-xs font-black uppercase text-slate-500">
                Peserta
              </span>
              <span className="font-mono font-bold text-white uppercase tracking-widest">
                {data.guestId}
              </span>
            </div>
            <div className="flex justify-between items-center border-b border-white/5 pb-4 mb-4">
              <span className="text-xs font-black uppercase text-slate-500">
                Materi
              </span>
              <span className="text-white font-bold italic">
                {data.examTitle}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs font-black uppercase text-slate-500">
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

          {/* Breakdown Per Bagian */}
          <div className="grid grid-cols-2 gap-4 mb-10">
            {Object.entries(data.sectionScores).map(([key, score]) => (
              <div
                key={key}
                className="bg-[#080a0f] border border-white/5 rounded-xl p-4"
              >
                <p className="text-[9px] font-mono text-slate-500 uppercase font-bold tracking-widest mb-1">
                  {key}
                </p>
                <p className="text-xl font-black italic text-white">{score}%</p>
              </div>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <Link
              href="/"
              className="neo-inset flex-1 py-4 flex items-center justify-center gap-2 text-slate-400 hover:text-white transition-colors uppercase text-[10px] font-black tracking-widest"
            >
              <Home size={16} /> Coba Ujian Sendiri
            </Link>
            <button
              onClick={() =>
                navigator.clipboard.writeText(window.location.href)
              }
              className="btn-cyber flex-1 flex items-center justify-center gap-2"
            >
              <Share2 size={16} /> Salin Link Share
            </button>
          </div>
        </div>
      </motion.div>
    </main>
  );
}

export default function SharePage() {
  return (
    <Suspense fallback={null}>
      <ShareContent />
    </Suspense>
  );
}
