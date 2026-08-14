"use client";

/**
 * @file GrammarDetailClient.tsx
 * @description Komponen Client-side interaktif untuk Halaman Detail Tata Bahasa (Grammar Detail).
 * Menyajikan visualisasi premium siber-glass neon, lencana level JLPT bersinar dinamis,
 * bento grid untuk Struktur & Catatan, serta text- (TTS) offline untuk contoh kalimat.
 * @module GrammarDetailClient
 */

// ==========================================
// IMPOR UTAMA
// ==========================================
import React, { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { 
 ChevronLeft, 
 Book, 
 Lightbulb, 
 VolumeUp, 
 VolumeMute,
 ArrowRight,
 Share,
 Check,
 ListCheck,
 Alert
} from "@/components/ui/icons";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SmartJapanese } from "@/components/ui/japanese";
import { parseNotesToJSX } from "@/lib/utils/markdown-parser";
import { LibraryItem } from "@/actions/library.actions";
import { TTS_VOICES, type TtsVoice } from "@/lib/tts";
import { useAudioPlayer } from "@/hooks/useAudioPlayer";
import dynamic from "next/dynamic";
const PdfGenerator = dynamic(() => import("@/features/pdf/PdfGenerator"), { ssr: false });

// ==========================================
// ANTARMUKA & TIPE DATA
// ==========================================

/**
 * Props for GrammarDetailClient component.
 */
interface GrammarDetailClientProps {
 /** Grammar article data from database */
 article: LibraryItem;
}

// ==========================================
// KOMPONEN UTAMA: GrammarDetailClient
// ==========================================
/**
 * Interactive client component for grammar detail page.
 * Handles TTS, sharing, and dynamic layout.
 * 
 * @param props Component props.
 * @returns Interactive grammar detail component.
 */
export default function GrammarDetailClient({ article }: GrammarDetailClientProps) {
 // Audio player hook
 const { playingIndex, playAudio } = useAudioPlayer();
 // Track clipboard copy state
 const [isCopied, setIsCopied] = useState(false);

 // Voice list for rotation
 const VOICES_ROTATION: TtsVoice[] = [
  TTS_VOICES.LALA, TTS_VOICES.INDAH, TTS_VOICES.SITI, TTS_VOICES.DEWI,
  TTS_VOICES.HAYASHI, TTS_VOICES.SATO, TTS_VOICES.AYU, TTS_VOICES.ZUNDAMON,
  TTS_VOICES.RITSU, TTS_VOICES.DITO, TTS_VOICES.BUDI, TTS_VOICES.SUZUKI,
  TTS_VOICES.TANAKA, TTS_VOICES.KIMURA, TTS_VOICES.ANDI, TTS_VOICES.FAISAL,
  TTS_VOICES.TAKAHASHI, TTS_VOICES.KOBAYASHI,
 ];

 /**
  * Get voice based on text hash.
  * Ensures same voice for same text.
  * 
  * @param text Input text.
  * @returns Selected voice.
  */
 const getDeterministicVoice = (text: string): TtsVoice => {
  let hash = 0;
  for (let i = 0; i < text.length; i++) hash = text.charCodeAt(i) + ((hash << 5) - hash);
  return VOICES_ROTATION[Math.abs(hash) % VOICES_ROTATION.length];
 };

 /**
  * Copy current URL to clipboard.
  */
 const handleShare = () => {
  if (typeof window !== "undefined") {
   navigator.clipboard.writeText(window.location.href);
   setIsCopied(true);
   setTimeout(() => setIsCopied(false), 2000);
  }
 };

 // Determine JLPT level
 const jlptLevel = article.jlpt_level || article.jlptLevel || "N/A";

 /**
  * Get CSS classes for JLPT level badge.
  * 
  * @param level JLPT level string.
  * @returns CSS class string.
  */
 const getJLPTBadgeStyle = (level: string) => {
  const lvl = level.toUpperCase();
  if (lvl.includes("N1")) {
   return "border-[hsl(var(--destructive)/0.3)] text-destructive bg-[hsl(var(--destructive)/0.05)] shadow-[0_0_15px_hsl(var(--destructive)/0.15)]";
  }
  if (lvl.includes("N2")) {
   return "border-[hsl(var(--warning)/0.3)] text-warning bg-[hsl(var(--warning)/0.05)] shadow-[0_0_15px_hsl(var(--warning)/0.15)]";
  }
  if (lvl.includes("N3")) {
   return "border-[hsl(var(--secondary)/0.3)] text-secondary bg-[hsl(var(--secondary)/0.05)] shadow-[0_0_15px_hsl(var(--secondary)/0.15)]";
  }
  if (lvl.includes("N4")) {
   return "border-[hsl(var(--primary)/0.3)] text-primary bg-[hsl(var(--primary)/0.05)] shadow-[0_0_15px_hsl(var(--primary)/0.15)]";
  }
  return "border-[hsl(var(--success)/0.3)] text-success bg-[hsl(var(--success)/0.05)] shadow-[0_0_15px_hsl(var(--success)/0.15)]";
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
       
       <span>Modul Tata Bahasa Resmi</span>
      </div>
     </div>
     <h1 className="text-3xl md:text-5xl lg:text-6xl text-foreground tracking-tight drop-shadow-[0_0_30px_hsl(var(--foreground)/0.05)] font-japanese">
      {article.title}
     </h1>
     {article.meaning && (
      <p className="mt-4 text-lg md:text-xl font-black text-primary leading-relaxed drop-shadow-[0_0_15px_hsl(var(--primary)/0.1)]">
       {article.meaning}
      </p>
     )}
    </div>

    {/* Grup Tombol Bagikan/Aksi */}
    <div className="flex flex-wrap items-center gap-3">
     <Button asChild variant="outline" className="rounded-lg py-6 gap-2">
      <Link href={`/tools/jlpt-drill?level=${encodeURIComponent(jlptLevel)}&kind=grammar&source=grammar&slug=${encodeURIComponent(String(article.slug || article.id || article._id || ""))}`}>
       <ListCheck size={16} aria-hidden="true" />
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
      className="rounded-lg border border-border bg-card/10 hover:bg-card/20 hover:border-primary/30 transition-all py-6 gap-2"
      aria-label="Bagikan materi tata bahasa ini"
     >
      {isCopied ? (
       <>
        <Check size={16} className="text-success animate-premium-bounce" />
        <span className="text-xs font-black uppercase tracking-wider text-success">Disalin!</span>
       </>
      ) : (
       <>
        <Share size={16} className="text-muted-foreground group-hover:text-primary transition-colors" />
        <span className="text-xs font-black uppercase tracking-wider">Bagikan</span>
       </>
      )}
     </Button>
    </div>
   </div>

   <div className="w-full h-px bg-primary/20 mb-12 shadow-[0_0_20px_hsl(var(--primary)/0.1)]" />

   {/* Tata Letak Konten Responsif: Tumpukan Vertikal Kolom Tunggal */}
   <div className="space-y-12">
    {/* Bento Struktur */}
    {article.formation && (
     <Card className="p-8 md:p-10 bg-card/60 border border-border rounded-2xl md:rounded-3xl relative overflow-hidden group hover:border-primary/40 shadow-[0_0_30px_hsl(var(--primary)/0.05)] transition-all duration-500 select-none glass">
      <div className="absolute -top-12 -right-12 p-8 opacity-[0.02] group-hover:opacity-[0.05] group-hover:scale-110 transition-all duration-700 pointer-events-none text-primary">
       <Book size={180} />
      </div>
      <div className="absolute top-0 left-0 w-1.5 h-full bg-primary/30 group-hover:bg-primary transition-all duration-300" />
      
      <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary mb-6 opacity-80 flex items-center gap-2">
       Struktur Kalimat (Formation)
      </span>
      
      <div className="text-2xl md:text-3xl font-black text-foreground font-japanese leading-relaxed tracking-tight select-text selection:bg-primary/20 flex flex-wrap items-center gap-y-3">
       {article.formation.split(" + ").map((part, index, arr) => {
        const isBracketed = part.startsWith("[") && part.endsWith("]");
        const cleanPart = isBracketed ? part.slice(1, -1) : part;
        return (
         <React.Fragment key={`formation-${index}`}>
          {isBracketed ? (
           <span className="inline-block px-3.5 py-1 text-sm md:text-base font-black rounded-xl bg-primary/10 border border-primary/20 text-primary font-sans mx-1 shadow-[0_0_15px_hsl(var(--primary)/0.08)] ">
            {cleanPart}
           </span>
          ) : (
           <span className={part.includes("kata") || part.includes("bentuk") ? "text-muted-foreground/90 font-medium text-xl md:text-2xl font-sans" : "text-primary drop-shadow-[0_0_12px_hsl(var(--primary)/0.1)] font-bold font-japanese"}>
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
     <Card className="p-8 md:p-10 bg-card/60 border border-border rounded-2xl md:rounded-3xl relative overflow-hidden group hover:border-border transition-all duration-500 shadow-[0_0_30px_hsl(var(--primary)/0.02)] select-none glass">
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
       <h2 className="text-xs uppercase tracking-[0.2em] text-foreground select-none">
        Contoh Kalimat (例文)
       </h2>
      </div>

      <div className="space-y-6">
       {(article.examples as Array<{ jp?: string; japanese?: string; furigana?: string; romaji?: string; id?: string; indonesian?: string }>).map((ex, i: number) => {
        const isActive = playingIndex === i;
        const sentenceText = ex.japanese || ex.jp || "";
        const translationText = ex.indonesian || ex.id || "";
        return (
         <div 
          key={ex.id || ex.indonesian || i}
          className="border border-border rounded-[1.8rem] p-6 md:p-8 bg-card/5 hover:border-primary/40 transition-all duration-300 shadow-[0_0_20px_hsl(var(--primary)/0.02)] relative overflow-hidden group flex items-start gap-4 md:gap-6 glass"
         >
          {/* Aksen Siber Kiri & Penomoran */}
          <div className="absolute top-0 left-0 w-1.5 h-full bg-primary/10 group-hover:bg-primary transition-all duration-300" />
          
          <div className="hidden sm:flex flex-col items-center justify-center font-mono text-sm md:text-base font-black text-muted-foreground/30 group-hover:text-primary/40 transition-colors size-10 rounded-full border border-border/50 bg-card/10 select-none">
           {String(i + 1).padStart(2, "0")}
          </div>

          {/* Konten Kalimat Utama Jepang & Terjemahan */}
          <div className="flex-1 min-w-0">
           <SmartJapanese 
            word={sentenceText} 
            furigana={ex.furigana} 
            className="text-xl md:text-2xl font-japanese font-bold text-foreground leading-relaxed block tracking-wide select-text" 
           />

           {ex.romaji && (
            <div className="mt-2 text-xs md:text-sm text-muted-foreground/50 font-mono tracking-wider select-text italic">
             {ex.romaji}
            </div>
           )}
           
           {translationText && (
            <div className="mt-4 pl-4 border-l-2 border-primary/30 text-sm md:text-base text-muted-foreground/80 font-semibold leading-relaxed select-text">
             {translationText}
            </div>
           )}
          </div>

          {/* Tombol Pemicu Pengucapan Suara (TTS) */}
          <div className="shrink-0 select-none">
           <button type="button" 
            onClick={() => playAudio(sentenceText, i, { voice: getDeterministicVoice(sentenceText) })}
            className={`h-12 w-12 rounded-[1.2rem] border flex items-center justify-center transition-all duration-300 relative group/btn ${
             isActive 
             ? "border-primary bg-primary/10 text-primary shadow-[0_0_20px_hsl(var(--primary)/0.35)] animate-pulse" 
             : "border-border bg-card/20 text-muted-foreground hover:border-primary/40 hover:text-primary hover:bg-primary/5 hover:shadow-[0_0_15px_hsl(var(--primary)/0.1)]"
            }`}
            aria-label={isActive ? "Hentikan pengucapan kalimat" : "Dengarkan pengucapan kalimat"}
           >
            {isActive ? (
             <VolumeMute size={20} className="scale-110" />
            ) : (
             <VolumeUp size={20} className="group-hover/btn:scale-110 transition-transform" />
            )}
           </button>
          </div>
         </div>
        );
       })}
      </div>
     </section>
    )}



    {/* Kelompok Tata Bahasa (Grammar Family) */}
    {Array.isArray(article.familyGrammarList) && article.familyGrammarList.length > 0 && (
     <section className="mt-8">
      <div className="flex items-center gap-3 mb-6">
       <span className="w-1.5 h-6 rounded-full bg-primary" />
       <h2 className="text-xs uppercase tracking-[0.2em] text-foreground select-none">
        Kelompok Tata Bahasa (Keluarga {article.grammar_family})
       </h2>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
       {(article.familyGrammarList as Array<{ id: string; slug: string; title: string; jlpt_level: string; meaning: string }> || []).map((item) => (
        <Link key={item.id} href={`/library/grammar/${item.slug}`} className="block group">
         <Card className="p-5 bg-card/5 border border-border group-hover:border-primary/40 rounded-[1.2rem] transition-all duration-300 shadow-[0_0_15px_hsl(var(--primary)/0.02)] group-hover:shadow-[0_0_20px_hsl(var(--primary)/0.05)]">
          <div className="flex justify-between items-center mb-2">
           <h3 className="text-foreground group-hover:text-primary transition-colors font-japanese">
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
       <h2 className="text-xs uppercase tracking-[0.2em] text-foreground select-none">
        Tata Bahasa Terkait (Related Grammar)
       </h2>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
       {(article.relatedGrammarList as Array<{ id: string; slug: string; title: string; jlpt_level: string; meaning: string }> || []).map((item) => (
        <Link key={item.id} href={`/library/grammar/${item.slug}`} className="block group">
         <Card className="p-5 bg-card/5 border border-border group-hover:border-primary/40 rounded-[1.2rem] transition-all duration-300 shadow-[0_0_15px_hsl(var(--secondary)/0.02)] group-hover:shadow-[0_0_20px_hsl(var(--primary)/0.05)]">
          <div className="flex justify-between items-center mb-2">
           <h3 className="text-foreground group-hover:text-primary transition-colors font-japanese">
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
    <Button 
      asChild
      variant="ghost" 
      className="w-full md:w-auto px-8 py-6 h-auto text-[11px] md:text-xs font-black uppercase tracking-[0.2em] rounded-lg bg-card/5 border border-border hover:bg-card/15 hover:border-primary/30 transition-all gap-3 group active:scale-[0.98]"
      aria-label="Kembali ke Daftar Tata Bahasa"
    >
      <Link href="/library/grammar">
        <ChevronLeft size={16} className="group-hover:-translate-x-1.5 transition-transform" /> Kembali ke Daftar
      </Link>
    </Button>

    <Button 
      asChild
      className="w-full md:w-auto px-10 py-6 h-auto text-[11px] md:text-xs font-black uppercase tracking-[0.2em] rounded-lg bg-primary text-primary-foreground hover:bg-primary/95 transition-all shadow-[0_0_25px_hsl(var(--primary)/0.25)] hover:shadow-[0_0_40px_hsl(var(--primary)/0.4)] active:scale-95 flex items-center gap-2 group"
      aria-label="Tandai materi ini selesai dan kembali"
    >
      <Link href="/library/grammar">
        Selesai & Lanjut <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
      </Link>
    </Button>
   </footer>
  </div>
 );
}
