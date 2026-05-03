"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trophy, Skull, Share2 } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { toast } from "sonner";

interface SharedData {
  guestId: string;
  examTitle: string;
  score: number;
  totalQuestions: number;
  passed: boolean;
  sectionScores: Record<string, number>;
  date: string;
}

function ShareContent() {
  const searchParams = useSearchParams();
  const [data, setData] = useState<SharedData | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    const rawData = searchParams.get("data");
    if (rawData) {
      try {
        const decoded = JSON.parse(decodeURIComponent(atob(rawData)));
        setData(decoded);
      } catch (e) {
        console.error("Gagal memproses data share", e);
        setError(true);
      }
    } else {
      setError(true);
    }
  }, [searchParams]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 text-center">
        <Card className="p-12 max-w-md w-full neo-card rounded-[2.5rem] border-red-500/20 bg-card">
          <Skull size={60} className="text-red-500 mx-auto mb-6 opacity-20" />
          <h1 className="text-2xl font-black uppercase mb-4">Link Tidak Valid</h1>
          <p className="text-muted-foreground text-sm mb-8">Maaf, data pencapaian ini tidak dapat ditemukan atau format link salah.</p>
          <Button asChild className="w-full h-12 bg-primary rounded-xl font-black uppercase tracking-widest text-xs">
            <Link href="/">Ke Halaman Utama</Link>
          </Button>
        </Card>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 md:p-8 relative overflow-hidden">
      {/* Background Decor */}
      <div className={`absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] blur-[120px] rounded-full pointer-events-none opacity-10 ${data.passed ? 'bg-emerald-500' : 'bg-red-500'}`} />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-3xl relative z-10"
      >
        <Card className="p-8 md:p-16 text-center neo-card rounded-[3.5rem] border border-border bg-card/80 backdrop-blur-xl shadow-2xl relative overflow-hidden">
           {/* Achievement Header */}
           <div className="mb-12">
              <motion.div 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", damping: 12 }}
                className={`w-24 h-24 mx-auto neo-inset rounded-[2rem] flex items-center justify-center mb-8 border border-border ${data.passed ? 'text-emerald-500' : 'text-red-500'}`}
              >
                 {data.passed ? <Trophy size={48} /> : <Skull size={48} />}
              </motion.div>
              <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tighter mb-4 leading-tight">
                 {data.passed ? "Pencapaian Luar Biasa!" : "Hampir Saja!"}
              </h1>
              <p className="text-muted-foreground text-xs md:text-sm font-medium max-w-md mx-auto leading-relaxed">
                 Sertifikat digital milik <span className="text-foreground font-bold">{data.guestId}</span> untuk materi <span className="text-foreground font-bold">{data.examTitle}</span>.
              </p>
           </div>

           {/* Stats Grid */}
           <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-12">
              <div className="p-8 bg-muted/30 border border-border rounded-3xl neo-inset flex flex-col items-center">
                 <span className="text-xs font-black text-muted-foreground uppercase tracking-widest block mb-4">Skor Akhir</span>
                 <span className={`text-4xl font-black font-mono ${data.passed ? 'text-emerald-500' : 'text-red-500'}`}>
                    {data.score} <span className="text-xs text-muted-foreground">/ 180</span>
                 </span>
              </div>
              <div className="p-8 bg-muted/30 border border-border rounded-3xl neo-inset flex flex-col items-center">
                 <span className="text-xs font-black text-muted-foreground uppercase tracking-widest block mb-4">Akurasi</span>
                 <span className="text-4xl font-black font-mono text-foreground">
                    {Math.round((data.score / 180) * 100)}%
                 </span>
              </div>
           </div>

           {/* CTA Section */}
           <div className="pt-8 border-t border-border">
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-8">Ingin mencoba ujian ini juga?</p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                 <Button asChild className="h-14 px-10 bg-primary text-primary-foreground font-black uppercase tracking-widest text-xs rounded-2xl shadow-lg hover:shadow-primary/20 transition-all">
                    <Link href="/">Mulai Belajar Sekarang</Link>
                 </Button>
                 <Button 
                    onClick={() => {
                       navigator.clipboard.writeText(window.location.href);
                       toast.success("Link sertifikat disalin!");
                    }}
                    variant="ghost" 
                    className="h-14 px-10 border border-border bg-white/5 hover:bg-white/10 text-foreground font-black uppercase tracking-widest text-xs rounded-2xl transition-all"
                 >
                    <Share2 size={16} className="mr-2" /> Salin Link
                 </Button>
              </div>
           </div>

           {/* Branding Footer */}
           <div className="mt-12 flex items-center justify-center gap-3 opacity-40">
              <div className="relative w-6 h-6">
                 <Image src="/logo-branding.svg" alt="NihongoRoute" fill className="object-contain" />
              </div>
              <span className="text-xs font-black uppercase tracking-[0.4em]">NihongoRoute</span>
           </div>
        </Card>
      </motion.div>
    </div>
  );
}

export default function SharePage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-xs font-black uppercase tracking-widest text-muted-foreground animate-pulse">Memuat Sertifikat...</div>}>
      <ShareContent />
    </Suspense>
  );
}
