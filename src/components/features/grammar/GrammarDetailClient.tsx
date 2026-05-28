"use client";

/**
 * @file GrammarDetailClient.tsx
 * @description Komponen Client-side interaktif untuk Halaman Detail Tata Bahasa (Grammar Detail).
 * Menyajikan visualisasi premium siber-glass neon, badge level JLPT bersinar dinamis,
 * bento grid untuk Struktur & Catatan, serta text-to-speech (TTS) offline untuk contoh kalimat.
 * @module GrammarDetailClient
 */

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { 
  ChevronLeft, 
  BookText, 
  Lightbulb, 
  Volume2, 
  VolumeX, 
  Sparkles,
  ArrowRight,
  Share2,
  CheckCircle2
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SmartJapanese } from "@/components/ui/SmartJapanese";
import { LibraryItem } from "@/actions/library.actions";

interface GrammarDetailClientProps {
  article: LibraryItem;
}

/**
 * Komponen GrammarDetailClient: Mengendalikan logika interaktif client-side detail grammar.
 * 
 * @param {GrammarDetailClientProps} props - Properti komponen.
 * @returns {JSX.Element} Komponen detail grammar yang interaktif dan premium.
 */
export default function GrammarDetailClient({ article }: GrammarDetailClientProps) {
  const [playingIndex, setPlayingIndex] = useState<number | null>(null);
  const [synth, setSynth] = useState<SpeechSynthesis | null>(null);
  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSynth(window.speechSynthesis);
    }
  }, []);

  /**
   * Mengucapkan contoh kalimat Jepang menggunakan Web Speech API ja-JP secara offline.
   * 
   * @param {string} text - Teks bahasa Jepang yang akan diucapkan.
   * @param {number} index - Indeks contoh kalimat untuk efek visual aktif.
   */
  const speakJapanese = (text: string, index: number) => {
    if (!synth) return;

    // Jika sedang memutar kalimat yang sama, hentikan
    if (playingIndex === index) {
      synth.cancel();
      setPlayingIndex(null);
      return;
    }

    // Hentikan suara yang sedang aktif
    synth.cancel();

    // Buat utterance baru
    // Hapus furigana atau karakter kurung jika ada agar pengucapan lancar
    const cleanText = text.replace(/[\u3040-\u309F\u30A0-\u30FF]+\s*\|/g, "").trim();
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = "ja-JP";
    utterance.rate = 0.85; // Sedikit diperlambat agar lebih jelas bagi pembelajar

    utterance.onend = () => {
      setPlayingIndex(null);
    };

    utterance.onerror = () => {
      setPlayingIndex(null);
    };

    setPlayingIndex(index);
    synth.speak(utterance);
  };

  /**
   * Menyalin tautan halaman detail grammar aktif ke clipboard.
   */
  const handleShare = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  // Bersihkan ucapan jika komponen unmount
  useEffect(() => {
    return () => {
      if (synth) {
        synth.cancel();
      }
    };
  }, [synth]);

  const jlptLevel = article.jlpt_level || article.jlptLevel || "N/A";

  /**
   * Mendapatkan kelas style spesifik siber-neon untuk setiap level JLPT.
   * 
   * @param {string} level - Level JLPT (N1 - N5).
   */
  const getJLPTBadgeStyle = (level: string) => {
    const lvl = level.toUpperCase();
    if (lvl.includes("N1")) {
      return "border-destructive/30 text-destructive bg-destructive/5 shadow-[0_0_15px_rgba(var(--destructive-rgb),0.15)]";
    }
    if (lvl.includes("N2")) {
      return "border-purple-500/30 text-purple-400 bg-purple-500/5 shadow-[0_0_15px_rgba(168,85,247,0.15)]";
    }
    if (lvl.includes("N3")) {
      return "border-cyan-500/30 text-cyan-400 bg-cyan-500/5 shadow-[0_0_15px_rgba(6,182,212,0.15)]";
    }
    if (lvl.includes("N4")) {
      return "border-amber-500/30 text-amber-400 bg-amber-500/5 shadow-[0_0_15px_rgba(245,158,11,0.15)]";
    }
    return "border-success/30 text-success bg-success/5 shadow-[0_0_15px_rgba(var(--success-rgb),0.15)]";
  };

  return (
    <div className="w-full relative z-10">
      {/* Dynamic Header Section */}
      <div className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <span className={`px-4 py-1.5 rounded-full border text-xs font-black uppercase tracking-[0.2em] transition-all duration-300 ${getJLPTBadgeStyle(jlptLevel)}`}>
              JLPT {jlptLevel}
            </span>
            <div className="flex items-center gap-2 text-muted-foreground/60 text-xs tracking-wider">
              <Sparkles size={12} className="text-primary animate-pulse" />
              <span>Modul Tata Bahasa Resmi</span>
            </div>
          </div>
          <h1 className="text-3xl md:text-5xl lg:text-6xl font-black text-foreground tracking-tight drop-shadow-[0_0_30px_rgba(var(--foreground-rgb),0.05)] font-japanese">
            {article.title}
          </h1>
          {article.meaning && (
            <p className="mt-4 text-lg md:text-xl font-bold text-primary leading-relaxed drop-shadow-[0_0_15px_rgba(var(--primary-rgb),0.1)]">
              {article.meaning}
            </p>
          )}
        </div>

        {/* Share/Actions Button Group */}
        <div className="flex items-center gap-3">
          <Button 
            onClick={handleShare}
            variant="ghost" 
            className="rounded-2xl border border-border bg-card/10 backdrop-blur-md hover:bg-card/20 hover:border-primary/30 transition-all py-6 gap-2"
            aria-label="Bagikan materi tata bahasa ini"
          >
            {isCopied ? (
              <>
                <CheckCircle2 size={16} className="text-success animate-premium-bounce" />
                <span className="text-xs font-black uppercase tracking-wider text-success">Disalin!</span>
              </>
            ) : (
              <>
                <Share2 size={16} className="text-muted-foreground group-hover:text-primary transition-colors" />
                <span className="text-xs font-black uppercase tracking-wider">Bagikan</span>
              </>
            )}
          </Button>
        </div>
      </div>

      <div className="w-full h-px bg-gradient-to-r from-border/50 via-border to-border/50 mb-12 shadow-[0_0_20px_rgba(var(--primary-rgb),0.1)]" />

      {/* Bento Grid: Formation & Notes */}
      {(article.formation || article.notes) && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {/* Formation Bento (2 Columns wide on medium screens) */}
          {article.formation && (
            <Card className="md:col-span-2 p-8 md:p-10 bg-gradient-to-br from-card/40 to-card/10 backdrop-blur-xl border border-border rounded-[2rem] relative overflow-hidden group hover:border-primary/40 shadow-[0_0_30px_rgba(var(--primary-rgb),0.02)] transition-all duration-500 select-none">
              <div className="absolute -top-12 -right-12 p-8 opacity-[0.02] group-hover:opacity-[0.05] group-hover:scale-110 transition-all duration-700 pointer-events-none text-primary">
                <BookText size={180} />
              </div>
              <div className="absolute top-0 left-0 w-1.5 h-full bg-primary/30 group-hover:bg-primary transition-all duration-300" />
              
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary block mb-6 opacity-80 flex items-center gap-2">
                <Sparkles size={12} className="animate-spin-slow" /> Struktur Kalimat (Formation)
              </span>
              
              <div className="text-2xl md:text-3xl font-black text-foreground font-japanese leading-relaxed tracking-tight select-text selection:bg-primary/20">
                {article.formation.split(" + ").map((part, index, arr) => (
                  <React.Fragment key={`formation-${index}`}>
                    <span className={part.includes("kata") || part.includes("bentuk") ? "text-muted-foreground/90 font-medium text-xl md:text-2xl font-sans" : "text-primary drop-shadow-[0_0_12px_rgba(var(--primary-rgb),0.1)] font-bold font-japanese"}>
                      {part}
                    </span>
                    {index < arr.length - 1 && <span className="text-muted-foreground/30 px-2 font-light font-sans">+</span>}
                  </React.Fragment>
                ))}
              </div>
            </Card>
          )}

          {/* Notes Bento (1 Column wide) */}
          {article.notes && (
            <Card className="p-8 md:p-10 bg-gradient-to-br from-card/30 to-card/5 backdrop-blur-xl border border-border rounded-[2rem] relative overflow-hidden group hover:border-border transition-all duration-500 shadow-sm select-none">
              <div className="absolute -top-12 -right-12 p-8 opacity-[0.02] group-hover:opacity-[0.05] group-hover:scale-110 transition-all duration-700 pointer-events-none text-muted-foreground">
                <Lightbulb size={180} />
              </div>
              
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/80 block mb-6 opacity-80 flex items-center gap-2">
                <Lightbulb size={12} /> Catatan Tambahan
              </span>
              
              <p className="text-sm md:text-base font-semibold text-muted-foreground leading-relaxed tracking-wide select-text selection:bg-primary/10">
                {article.notes}
              </p>
            </Card>
          )}
        </div>
      )}

      {/* Examples Section */}
      {article.examples && article.examples.length > 0 && (
        <section className="mb-20">
          <div className="flex items-center gap-3 mb-8">
            <span className="w-1.5 h-6 rounded-full bg-primary" />
            <h2 className="text-xl md:text-2xl font-black tracking-tight text-foreground uppercase tracking-widest text-[13px] md:text-sm">
              Contoh Kalimat (例文)
            </h2>
          </div>

          <div className="space-y-6">
            {(article.examples as Array<{ jp: string; furigana?: string; id: string }>).map((ex, i: number) => {
              const isActive = playingIndex === i;
              return (
                <div 
                  key={ex.id}
                  className="border border-border rounded-[1.8rem] p-6 md:p-8 bg-card/5 backdrop-blur-lg hover:border-primary/40 transition-all duration-300 shadow-sm relative overflow-hidden group flex items-start gap-4 md:gap-6"
                >
                  {/* Left Cyber Aksen & Numbering */}
                  <div className="absolute top-0 left-0 w-1.5 h-full bg-primary/10 group-hover:bg-primary transition-all duration-300" />
                  
                  <div className="hidden sm:flex flex-col items-center justify-center font-mono text-sm md:text-base font-black text-muted-foreground/30 group-hover:text-primary/40 transition-colors size-10 rounded-full border border-border/50 bg-card/10 select-none">
                    {String(i + 1).padStart(2, "0")}
                  </div>

                  {/* Main sentence content */}
                  <div className="flex-1 min-w-0">
                    <SmartJapanese 
                      word={ex.jp} 
                      furigana={ex.furigana} 
                      className="text-xl md:text-2xl font-japanese font-bold text-foreground leading-relaxed block tracking-wide select-text" 
                    />
                    
                    <div className="mt-4 pl-4 border-l-2 border-primary/30 text-sm md:text-base text-muted-foreground/80 font-medium leading-relaxed select-text">
                      {ex.id}
                    </div>
                  </div>

                  {/* Audio Synthesiser Trigger Button */}
                  <div className="flex-shrink-0 select-none">
                    <button type="button" 
                      onClick={() => speakJapanese(ex.jp, i)}
                      className={`h-12 w-12 rounded-[1.2rem] border flex items-center justify-center transition-all duration-300 relative group/btn ${
                        isActive 
                          ? "border-primary bg-primary/10 text-primary shadow-[0_0_20px_rgba(var(--primary-rgb),0.35)] animate-pulse" 
                          : "border-border bg-card/20 text-muted-foreground hover:border-primary/40 hover:text-primary hover:bg-primary/5 hover:shadow-[0_0_15px_rgba(var(--primary-rgb),0.1)]"
                      }`}
                      aria-label={isActive ? "Hentikan pengucapan kalimat" : "Dengarkan pengucapan kalimat"}
                    >
                      {isActive ? (
                        <VolumeX size={20} className="scale-110" />
                      ) : (
                        <Volume2 size={20} className="group-hover/btn:scale-110 transition-transform" />
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Navigation Footer */}
      <footer className="pt-12 border-t border-border/60 flex flex-col md:flex-row items-center justify-between gap-6 select-none">
        <Link href="/library/grammar" className="w-full md:w-auto">
          <Button 
            variant="ghost" 
            className="w-full px-8 py-6 h-auto text-[11px] md:text-xs font-black uppercase tracking-[0.2em] rounded-2xl bg-card/5 border border-border hover:bg-card/15 hover:border-primary/30 transition-all gap-3 group active:scale-[0.98]"
            aria-label="Kembali ke Daftar Tata Bahasa"
          >
            <ChevronLeft size={16} className="group-hover:-translate-x-1.5 transition-transform" /> Kembali ke Daftar
          </Button>
        </Link>

        <Link href="/library/grammar" className="w-full md:w-auto">
          <Button 
            className="w-full md:w-auto px-10 py-6 h-auto text-[11px] md:text-xs font-black uppercase tracking-[0.2em] rounded-2xl bg-primary text-primary-foreground hover:bg-primary/95 transition-all shadow-[0_0_25px_rgba(var(--primary-rgb),0.25)] hover:shadow-[0_0_40px_rgba(var(--primary-rgb),0.4)] active:scale-95 flex items-center gap-2 group"
            aria-label="Tandai materi ini selesai dan kembali"
          >
            Selesai & Lanjut <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </Button>
        </Link>
      </footer>
    </div>
  );
}
