"use client";

/**
 * @file GrammarDetailClient.tsx
 * @description Komponen Client-side interaktif untuk Halaman Detail Tata Bahasa (Grammar Detail).
 * Menyajikan visualisasi premium siber-glass neon, lencana level JLPT bersinar dinamis,
 * bento grid untuk Struktur & Catatan, serta text-to-speech (TTS) offline untuk contoh kalimat.
 * @module GrammarDetailClient
 */

// ==========================================
// IMPOR UTAMA
// ==========================================
import React, { useState, useEffect, useRef, useCallback } from "react";
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
  CheckCircle2,
  ListChecks
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SmartJapanese } from "@/components/ui/SmartJapanese";
import { LibraryItem } from "@/actions/library.actions";
import { fetchTTSAudio, speakWithWebSpeech, TTS_VOICES, type TtsVoice } from "@/lib/tts";
import PdfGenerator from "@/components/features/pdf/PdfGenerator";
import type { SentenceRow } from "@/actions/sentences.actions";

// ==========================================
// ANTARMUKA & TIPE DATA
// ==========================================
interface GrammarDetailClientProps {
  article: LibraryItem;
  dynamicSentences?: SentenceRow[];
}

// ==========================================
// PENDUKUNG DESAIN & MARKDOWN PARSER
// ==========================================
/**
 * Mem-parsing gaya inline markdown sederhana seperti bold (**), italic (*), dan inline code (`) menjadi JSX.
 * 
 * @param {string} text - Teks mentah dengan tag markdown.
 * @returns {React.ReactNode[]} Array berisi elemen JSX hasil parsing.
 */
function parseInlineStyles(text: string): React.ReactNode[] {
  const parts = text.split(/(\*\*.*?\*\*|`.*?`|\*.*?\*)/g);
  return parts.map((part, index) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={index} className="text-foreground font-black">
          {part.slice(2, -2)}
        </strong>
      );
    }
    if (part.startsWith("`") && part.endsWith("`")) {
      return (
        <code key={index} className="px-1.5 py-0.5 rounded bg-primary/5 border border-primary/10 text-primary font-mono text-xs md:text-sm font-bold mx-0.5">
          {part.slice(1, -1)}
        </code>
      );
    }
    if (part.startsWith("*") && part.endsWith("*")) {
      return (
        <em key={index} className="italic text-muted-foreground/90 font-medium">
          {part.slice(1, -1)}
        </em>
      );
    }
    return part;
  });
}

/**
 * Mem-parsing seluruh isi catatan tata bahasa (grammar notes) menjadi struktur JSX yang tertata rapi.
 * Mengelompokkan item daftar berurutan/tidak berurutan yang berturut-turut ke dalam satu tag kontainer tunggal.
 * Juga mengelompokkan baris tabel Markdown (|...|...|) menjadi tabel HTML yang dinamis dan ber-style premium.
 * 
 * @param {string} notes - Catatan teks mentah dari database.
 * @returns {React.ReactNode} Elemen JSX terstruktur.
 */
function parseNotesToJSX(notes: string): React.ReactNode {
  const lines = notes.split("\n");
  const elements: React.ReactNode[] = [];
  let currentList: { type: "ul" | "ol"; items: string[] } | null = null;
  let currentTable: string[] | null = null;

  const flushList = (key: string) => {
    if (!currentList) return;
    const ListTag = currentList.type;
    elements.push(
      <ListTag 
        key={key} 
        className={
          currentList.type === "ul" 
            ? "list-disc pl-6 my-4 space-y-2 select-text" 
            : "list-decimal pl-6 my-4 space-y-2 select-text"
        }
      >
        {currentList.items.map((item, idx) => (
          <li key={idx} className="text-muted-foreground/80 font-medium leading-relaxed">
            {parseInlineStyles(item)}
          </li>
        ))}
      </ListTag>
    );
    currentList = null;
  };

  const flushTable = (key: string) => {
    if (!currentTable || currentTable.length < 2) return;
    
    // Parse header and rows
    const headerLine = currentTable[0];
    const headerCols = headerLine.split("|").slice(1, -1).map(c => c.trim());
    
    const rowLines = currentTable.slice(2); // Skip header line and alignment separator line
    const rows = rowLines.map(line => line.split("|").slice(1, -1).map(c => c.trim()));

    elements.push(
      <div key={key} className="my-6 overflow-x-auto rounded-2xl border border-border bg-card/5 backdrop-blur-md shadow-[0_0_20px_rgb(var(--primary-rgb)/0.02)] select-text">
        <table className="w-full text-left border-collapse text-xs md:text-sm">
          <thead>
            <tr className="border-b border-border bg-primary/5">
              {headerCols.map((col, idx) => (
                <th key={`th-${idx}`} className="px-4 py-3 font-black text-primary uppercase tracking-wider select-none">
                  {parseInlineStyles(col)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border/40">
            {rows.map((row, rowIdx) => (
              <tr key={`tr-${rowIdx}`} className="hover:bg-card/10 transition-colors">
                {row.map((col, colIdx) => (
                  <td key={`td-${colIdx}`} className="px-4 py-3.5 font-semibold text-muted-foreground leading-relaxed">
                    {parseInlineStyles(col)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
    currentTable = null;
  };

  const flushAll = (key: string) => {
    flushList(`${key}-list`);
    flushTable(`${key}-table`);
  };

  lines.forEach((line, index) => {
    const trimmed = line.trim();
    if (!trimmed) {
      flushAll(`flush-${index}`);
      return;
    }

    // Pendeteksian Tabel Markdown
    if (trimmed.startsWith("|")) {
      flushList(`table-interrupt-list-${index}`);
      if (!currentTable) {
        currentTable = [trimmed];
      } else {
        currentTable.push(trimmed);
      }
      return;
    }

    // Jika bukan baris tabel, flush tabel aktif yang ada
    flushTable(`table-interrupt-other-${index}`);

    // Item daftar tidak berurutan (hanya jika dimulai dengan single * atau -)
    if ((trimmed.startsWith("*") && !trimmed.startsWith("**")) || trimmed.startsWith("-")) {
      const itemText = trimmed.substring(1).trim();
      if (!currentList || currentList.type !== "ul") {
        flushList(`list-interrupt-other-${index}`);
        currentList = { type: "ul", items: [itemText] };
      } else {
        currentList.items.push(itemText);
      }
      return;
    }

    // Item daftar berurutan
    const matchOrdered = trimmed.match(/^(\d+)\.\s(.*)/);
    if (matchOrdered) {
      const itemText = matchOrdered[2].trim();
      if (!currentList || currentList.type !== "ol") {
        flushList(`list-interrupt-other-${index}`);
        currentList = { type: "ol", items: [itemText] };
      } else {
        currentList.items.push(itemText);
      }
      return;
    }

    // Jika bukan item daftar, bersihkan daftar aktif yang tersimpan
    flushList(`list-flush-${index}`);

    // Box peringatan bahaya/perangkap
    if (trimmed.startsWith("⚠️")) {
      elements.push(
        <div 
          key={`warning-${index}`} 
          className="p-4 md:p-5 rounded-[1.2rem] border border-destructive/20 bg-[rgb(var(--destructive-rgb)/0.05)] text-foreground/90 font-semibold my-5 text-xs md:text-sm flex gap-3 items-start shadow-[0_0_20px_rgb(var(--destructive-rgb)/0.05)] select-text"
        >
          <span className="text-destructive text-base mt-0.5 select-none">⚠️</span>
          <div className="flex-1 leading-relaxed">
            {parseInlineStyles(trimmed.substring(2).trim())}
          </div>
        </div>
      );
      return;
    }

    // Paragraf biasa
    elements.push(
      <p key={`para-${index}`} className="font-semibold text-muted-foreground/85 leading-relaxed">
        {parseInlineStyles(trimmed)}
      </p>
    );
  });

  flushAll("final");
  return <div className="space-y-4">{elements}</div>;
}

// ==========================================
// KOMPONEN UTAMA: GrammarDetailClient
// ==========================================
/**
 * Komponen GrammarDetailClient: Mengendalikan logika interaktif client-side detail grammar.
 * 
 * @param {GrammarDetailClientProps} props Properti komponen detail tata bahasa.
 * @returns {JSX.Element} Komponen detail grammar yang interaktif dan premium.
 */
export default function GrammarDetailClient({ article, dynamicSentences = [] }: GrammarDetailClientProps) {
  const [playingIndex, setPlayingIndex] = useState<number | null>(null);
  const [isCopied, setIsCopied] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const objectUrlRef = useRef<string | null>(null);

  const cleanupObjectUrl = useCallback(() => {
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
    }
  }, []);

  // Hitung voice deterministik dari teks — selaras dengan generate_example_sentences.js
  const VOICES_ROTATION: TtsVoice[] = [
    TTS_VOICES.LARA, TTS_VOICES.INDAH, TTS_VOICES.SITI, TTS_VOICES.DEWI,
    TTS_VOICES.HAYASHI, TTS_VOICES.SATO, TTS_VOICES.AYU, TTS_VOICES.ZUNDAMON,
    TTS_VOICES.RITSU, TTS_VOICES.DITO, TTS_VOICES.BUDI, TTS_VOICES.SUZUKI,
    TTS_VOICES.TANAKA, TTS_VOICES.KIMURA, TTS_VOICES.ANDI, TTS_VOICES.FAISAL,
    TTS_VOICES.TAKAHASHI, TTS_VOICES.KOBAYASHI, TTS_VOICES.NAMONASHI,
  ];
  const getDeterministicVoice = (text: string): TtsVoice => {
    let hash = 0;
    for (let i = 0; i < text.length; i++) hash = text.charCodeAt(i) + ((hash << 5) - hash);
    return VOICES_ROTATION[Math.abs(hash) % VOICES_ROTATION.length];
  };

  /**
   * Mengucapkan contoh kalimat Jepang menggunakan cache DB (VoiceVox) dengan fallback Web Speech API.
   */
  const speakJapanese = async (text: string, index: number) => {
    // Toggle stop jika kalimat yang sama diklik lagi
    if (playingIndex === index) {
      audioRef.current?.pause();
      cleanupObjectUrl();
      if (typeof window !== "undefined") window.speechSynthesis.cancel();
      setPlayingIndex(null);
      return;
    }

    // Hentikan yang sedang berjalan
    audioRef.current?.pause();
    cleanupObjectUrl();
    if (typeof window !== "undefined") window.speechSynthesis.cancel();

    const cleanText = text.trim();
    if (!cleanText) return;

    setPlayingIndex(index);
    const voice = getDeterministicVoice(cleanText);

    try {
      const audioUrl = await fetchTTSAudio(cleanText, voice);
      if (audioUrl) {
        if (!audioRef.current) audioRef.current = new Audio();
        const audio = audioRef.current;
        cleanupObjectUrl();
        if (audioUrl.startsWith("blob:")) objectUrlRef.current = audioUrl;
        audio.src = audioUrl;
        audio.onended = () => { setPlayingIndex(null); cleanupObjectUrl(); };
        audio.onerror = () => {
          cleanupObjectUrl();
          speakWithWebSpeech(cleanText, voice, 1, () => setPlayingIndex(null), () => setPlayingIndex(null));
        };
        audio.play().catch(() => {
          speakWithWebSpeech(cleanText, voice, 1, () => setPlayingIndex(null), () => setPlayingIndex(null));
        });
      } else {
        // Fallback Web Speech API
        speakWithWebSpeech(cleanText, voice, 1, () => setPlayingIndex(null), () => setPlayingIndex(null));
      }
    } catch {
      speakWithWebSpeech(cleanText, voice, 1, () => setPlayingIndex(null), () => setPlayingIndex(null));
    }
  };

  // Bersihkan audio saat unmount
  useEffect(() => {
    return () => {
      audioRef.current?.pause();
      cleanupObjectUrl();
      if (typeof window !== "undefined") window.speechSynthesis.cancel();
    };
  }, [cleanupObjectUrl]);

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

  const jlptLevel = article.jlpt_level || article.jlptLevel || "N/A";

  /**
   * Mendapatkan kelas style spesifik siber-neon untuk setiap level JLPT.
   * Menggunakan variabel CSS semantik dinamis seutuhnya sesuai pedoman desain proyek.
   * 
   * @param {string} level - Level JLPT (N1 - N5).
   */
  const getJLPTBadgeStyle = (level: string) => {
    const lvl = level.toUpperCase();
    if (lvl.includes("N1")) {
      return "border-[rgb(var(--destructive-rgb)/0.3)] text-destructive bg-[rgb(var(--destructive-rgb)/0.05)] shadow-[0_0_15px_rgb(var(--destructive-rgb)/0.15)]";
    }
    if (lvl.includes("N2")) {
      return "border-[rgb(var(--warning-rgb)/0.3)] text-warning bg-[rgb(var(--warning-rgb)/0.05)] shadow-[0_0_15px_rgb(var(--warning-rgb)/0.15)]";
    }
    if (lvl.includes("N3")) {
      return "border-[rgb(var(--secondary-rgb)/0.3)] text-secondary bg-[rgb(var(--secondary-rgb)/0.05)] shadow-[0_0_15px_rgb(var(--secondary-rgb)/0.15)]";
    }
    if (lvl.includes("N4")) {
      return "border-[rgb(var(--primary-rgb)/0.3)] text-primary bg-[rgb(var(--primary-rgb)/0.05)] shadow-[0_0_15px_rgb(var(--primary-rgb)/0.15)]";
    }
    return "border-[rgb(var(--success-rgb)/0.3)] text-success bg-[rgb(var(--success-rgb)/0.05)] shadow-[0_0_15px_rgb(var(--success-rgb)/0.15)]";
  };

  return (
    <div className="w-full relative z-10 font-sans">
      {/* Bagian Header Dinamis */}
      <div className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <span className={`px-4 py-1.5 rounded-full border text-xs font-black uppercase tracking-[0.2em] transition-all duration-300 ${getJLPTBadgeStyle(jlptLevel)}`}>
              JLPT {jlptLevel}
            </span>
            <div className="flex items-center gap-2 text-muted-foreground/60 text-xs tracking-wider font-semibold">
              <Sparkles size={12} className="text-primary animate-pulse" />
              <span>Modul Tata Bahasa Resmi</span>
            </div>
          </div>
          <h1 className="text-3xl md:text-5xl lg:text-6xl font-black text-foreground tracking-tight drop-shadow-[0_0_30px_rgb(var(--foreground-rgb)/0.05)] font-japanese">
            {article.title}
          </h1>
          {article.meaning && (
            <p className="mt-4 text-lg md:text-xl font-black text-primary leading-relaxed drop-shadow-[0_0_15px_rgb(var(--primary-rgb)/0.1)]">
              {article.meaning}
            </p>
          )}
        </div>

        {/* Grup Tombol Bagikan/Aksi */}
        <div className="flex flex-wrap items-center gap-3">
          <Button asChild variant="outline" className="rounded-2xl py-6 gap-2">
            <Link href={`/tools/jlpt-drill?level=${encodeURIComponent(jlptLevel)}&kind=grammar&source=grammar&slug=${encodeURIComponent(String(article.slug || article.id || article._id || ""))}`}>
              <ListChecks size={16} aria-hidden="true" />
              <span className="text-xs font-black uppercase tracking-wider">Latih</span>
            </Link>
          </Button>
          <PdfGenerator 
            type="grammar" 
            data={article} 
            title={article.title || undefined} 
            level={jlptLevel} 
          />
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

      <div className="w-full h-px bg-gradient-to-r from-border/50 via-border to-border/50 mb-12 shadow-[0_0_20px_rgb(var(--primary-rgb)/0.1)]" />

      {/* Tata Letak Konten Responsif: Tumpukan Vertikal Kolom Tunggal */}
      <div className="space-y-12">
        {/* Bento Struktur */}
        {article.formation && (
          <Card className="p-8 md:p-10 bg-gradient-to-br from-card/40 to-card/10 backdrop-blur-xl border border-border rounded-[2rem] relative overflow-hidden group hover:border-primary/40 shadow-[0_0_30px_rgb(var(--primary-rgb)/0.02)] transition-all duration-500 select-none">
            <div className="absolute -top-12 -right-12 p-8 opacity-[0.02] group-hover:opacity-[0.05] group-hover:scale-110 transition-all duration-700 pointer-events-none text-primary">
              <BookText size={180} />
            </div>
            <div className="absolute top-0 left-0 w-1.5 h-full bg-primary/30 group-hover:bg-primary transition-all duration-300" />
            
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary mb-6 opacity-80 flex items-center gap-2">
              <Sparkles size={12} className="animate-spin-slow" /> Struktur Kalimat (Formation)
            </span>
            
            <div className="text-2xl md:text-3xl font-black text-foreground font-japanese leading-relaxed tracking-tight select-text selection:bg-primary/20 flex flex-wrap items-center gap-y-3">
              {article.formation.split(" + ").map((part, index, arr) => {
                const isBracketed = part.startsWith("[") && part.endsWith("]");
                const cleanPart = isBracketed ? part.slice(1, -1) : part;
                return (
                  <React.Fragment key={`formation-${index}`}>
                    {isBracketed ? (
                      <span className="inline-block px-3.5 py-1 text-sm md:text-base font-black rounded-xl bg-primary/10 border border-primary/20 text-primary font-sans mx-1 shadow-[0_0_15px_rgb(var(--primary-rgb)/0.08)] backdrop-blur-md">
                        {cleanPart}
                      </span>
                    ) : (
                      <span className={part.includes("kata") || part.includes("bentuk") ? "text-muted-foreground/90 font-medium text-xl md:text-2xl font-sans" : "text-primary drop-shadow-[0_0_12px_rgb(var(--primary-rgb)/0.1)] font-bold font-japanese"}>
                        {part}
                      </span>
                    )}
                    {index < arr.length - 1 && <span className="text-muted-foreground/30 px-2 font-light font-sans">+</span>}
                  </React.Fragment>
                );
              })}
            </div>
          </Card>
        )}

        {/* Bento Catatan Tambahan (Spacious Full Width) */}
        {article.notes && (
          <Card className="p-8 md:p-10 bg-gradient-to-br from-card/30 to-card/5 backdrop-blur-xl border border-border rounded-[2rem] relative overflow-hidden group hover:border-border transition-all duration-500 shadow-sm select-none">
            <div className="absolute -top-12 -right-12 p-8 opacity-[0.02] group-hover:opacity-[0.05] group-hover:scale-110 transition-all duration-700 pointer-events-none text-muted-foreground">
              <Lightbulb size={180} />
            </div>
            
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/80 mb-6 opacity-80 flex items-center gap-2">
              <Lightbulb size={12} /> Catatan Tambahan & Tabel Penjelasan
            </span>
            
            <div className="text-sm md:text-base font-semibold text-muted-foreground leading-relaxed tracking-wide select-text selection:bg-primary/10">
              {parseNotesToJSX(article.notes)}
            </div>
          </Card>
        )}

        {/* Bagian Contoh Kalimat */}
        {article.examples && article.examples.length > 0 && (
          <section className="mb-8">
            <div className="flex items-center gap-3 mb-8">
              <span className="w-1.5 h-6 rounded-full bg-primary" />
              <h2 className="text-xs font-black uppercase tracking-[0.2em] text-foreground select-none">
                Contoh Kalimat (例文)
              </h2>
            </div>

            <div className="space-y-6">
              {(article.examples as Array<{ jp: string; furigana?: string; romaji?: string; id: string }>).map((ex, i: number) => {
                const isActive = playingIndex === i;
                return (
                  <div 
                    key={ex.id}
                    className="border border-border rounded-[1.8rem] p-6 md:p-8 bg-card/5 backdrop-blur-lg hover:border-primary/40 transition-all duration-300 shadow-sm relative overflow-hidden group flex items-start gap-4 md:gap-6"
                  >
                    {/* Aksen Siber Kiri & Penomoran */}
                    <div className="absolute top-0 left-0 w-1.5 h-full bg-primary/10 group-hover:bg-primary transition-all duration-300" />
                    
                    <div className="hidden sm:flex flex-col items-center justify-center font-mono text-sm md:text-base font-black text-muted-foreground/30 group-hover:text-primary/40 transition-colors size-10 rounded-full border border-border/50 bg-card/10 select-none">
                      {String(i + 1).padStart(2, "0")}
                    </div>

                    {/* Konten Kalimat Utama Jepang & Terjemahan */}
                    <div className="flex-1 min-w-0">
                      <SmartJapanese 
                        word={ex.jp} 
                        furigana={ex.furigana} 
                        className="text-xl md:text-2xl font-japanese font-bold text-foreground leading-relaxed block tracking-wide select-text" 
                      />

                      {ex.romaji && (
                        <div className="mt-2 text-xs md:text-sm text-muted-foreground/50 font-mono tracking-wider select-text italic">
                          {ex.romaji}
                        </div>
                      )}
                      
                      <div className="mt-4 pl-4 border-l-2 border-primary/30 text-sm md:text-base text-muted-foreground/80 font-semibold leading-relaxed select-text">
                        {ex.id}
                      </div>
                    </div>

                    {/* Tombol Pemicu Pengucapan Suara (TTS) */}
                    <div className="flex-shrink-0 select-none">
                      <button type="button" 
                        onClick={() => speakJapanese(ex.jp, i)}
                        className={`h-12 w-12 rounded-[1.2rem] border flex items-center justify-center transition-all duration-300 relative group/btn ${
                          isActive 
                            ? "border-primary bg-primary/10 text-primary shadow-[0_0_20px_rgb(var(--primary-rgb)/0.35)] animate-pulse" 
                            : "border-border bg-card/20 text-muted-foreground hover:border-primary/40 hover:text-primary hover:bg-primary/5 hover:shadow-[0_0_15px_rgb(var(--primary-rgb)/0.1)]"
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

        {/* Kalimat Contoh Dinamis dari Database Sentences */}
        {dynamicSentences.length > 0 && (
          <section className="mb-8">
            <div className="flex items-center gap-3 mb-8">
              <span className="w-1.5 h-6 rounded-full bg-success" />
              <h2 className="text-xs font-black uppercase tracking-[0.2em] text-foreground select-none">
                Contoh dalam Konteks (文脈例)
              </h2>
            </div>

            <div className="space-y-4">
              {dynamicSentences.map((sentence, i) => (
                <div
                  key={sentence.id}
                  className="border border-border rounded-[1.8rem] p-5 md:p-6 bg-card/5 backdrop-blur-lg hover:border-success/40 transition-all duration-300 shadow-sm relative overflow-hidden group flex items-start gap-4 md:gap-5"
                >
                  <div className="absolute top-0 left-0 w-1.5 h-full bg-success/10 group-hover:bg-success transition-all duration-300" />

                  <div className="hidden sm:flex flex-col items-center justify-center font-mono text-sm font-black text-muted-foreground/30 group-hover:text-success/40 transition-colors size-10 rounded-full border border-border/50 bg-card/10 select-none">
                    {String(i + 1).padStart(2, "0")}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-lg md:text-xl font-japanese font-bold text-foreground leading-relaxed tracking-wide select-text">
                      {sentence.japanese}
                    </p>
                    {(sentence.indonesia || sentence.english) && (
                      <div className="mt-3 pl-4 border-l-2 border-success/30 text-sm md:text-base text-muted-foreground/80 font-semibold leading-relaxed select-text">
                        {sentence.indonesia || sentence.english}
                      </div>
                    )}
                  </div>

                  <div className="flex-shrink-0 select-none">
                    <button
                      type="button"
                      onClick={() => speakJapanese(sentence.japanese, 1000 + i)}
                      className={`h-12 w-12 rounded-[1.2rem] border flex items-center justify-center transition-all duration-300 relative ${
                        playingIndex === 1000 + i
                          ? "border-success bg-success/10 text-success shadow-[0_0_20px_rgb(var(--success-rgb)/0.35)] animate-pulse"
                          : "border-border bg-card/20 text-muted-foreground hover:border-success/40 hover:text-success hover:bg-success/5"
                      }`}
                      aria-label={playingIndex === 1000 + i ? "Hentikan pengucapan" : "Dengarkan pengucapan"}
                    >
                      {playingIndex === 1000 + i ? (
                        <VolumeX size={20} className="scale-110" />
                      ) : (
                        <Volume2 size={20} />
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Kelompok Tata Bahasa (Grammar Family) */}
        {Array.isArray(article.familyGrammarList) && article.familyGrammarList.length > 0 && (
          <section className="mt-8">
            <div className="flex items-center gap-3 mb-6">
              <span className="w-1.5 h-6 rounded-full bg-primary" />
              <h2 className="text-xs font-black uppercase tracking-[0.2em] text-foreground select-none">
                Kelompok Tata Bahasa (Keluarga {article.grammar_family})
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {(article.familyGrammarList as Array<{ id: string; slug: string; title: string; jlpt_level: string; meaning: string }> || []).map((item) => (
                <Link key={item.id} href={`/library/grammar/${item.slug}`} className="block group">
                  <Card className="p-5 bg-card/5 backdrop-blur-md border border-border group-hover:border-primary/40 rounded-[1.2rem] transition-all duration-300 shadow-[0_0_15px_rgba(var(--primary-rgb),0.02)] group-hover:shadow-[0_0_20px_rgba(var(--primary-rgb),0.05)]">
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="font-bold text-foreground group-hover:text-primary transition-colors font-japanese">
                        {item.title}
                      </h3>
                      <span className="text-[10px] font-black px-2 py-0.5 rounded border border-muted/30 text-muted-foreground uppercase tracking-wider">
                        {item.jlpt_level}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground font-semibold line-clamp-2 leading-relaxed">
                      {item.meaning}
                    </p>
                  </Card>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Tata Bahasa Terkait (Related Grammar) */}
        {Array.isArray(article.relatedGrammarList) && article.relatedGrammarList.length > 0 && (
          <section className="mt-8">
            <div className="flex items-center gap-3 mb-6">
              <span className="w-1.5 h-6 rounded-full bg-secondary" />
              <h2 className="text-xs font-black uppercase tracking-[0.2em] text-foreground select-none">
                Tata Bahasa Terkait (Related Grammar)
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {(article.relatedGrammarList as Array<{ id: string; slug: string; title: string; jlpt_level: string; meaning: string }> || []).map((item) => (
                <Link key={item.id} href={`/library/grammar/${item.slug}`} className="block group">
                  <Card className="p-5 bg-card/5 backdrop-blur-md border border-border group-hover:border-secondary/40 rounded-[1.2rem] transition-all duration-300 shadow-[0_0_15px_rgba(var(--secondary-rgb),0.02)] group-hover:shadow-[0_0_20px_rgba(var(--secondary-rgb),0.05)]">
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="font-bold text-foreground group-hover:text-secondary transition-colors font-japanese">
                        {item.title}
                      </h3>
                      <span className="text-[10px] font-black px-2 py-0.5 rounded border border-muted/30 text-muted-foreground uppercase tracking-wider">
                        {item.jlpt_level}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground font-semibold line-clamp-2 leading-relaxed">
                      {item.meaning}
                    </p>
                  </Card>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>



      {/* Footer Navigasi Modul */}
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
            className="w-full md:w-auto px-10 py-6 h-auto text-[11px] md:text-xs font-black uppercase tracking-[0.2em] rounded-2xl bg-primary text-primary-foreground hover:bg-primary/95 transition-all shadow-[0_0_25px_rgb(var(--primary-rgb)/0.25)] hover:shadow-[0_0_40px_rgb(var(--primary-rgb)/0.4)] active:scale-95 flex items-center gap-2 group"
            aria-label="Tandai materi ini selesai dan kembali"
          >
            Selesai & Lanjut <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </Button>
        </Link>
      </footer>
    </div>
  );
}
