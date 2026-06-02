"use client";

/**
 * @file ListeningSidebar.tsx
 * @description Komponen bilah samping (sidebar) untuk latihan menyimak.
 * Menampilkan metadata materi, catatan panduan belajar, dan estimasi perolehan XP.
 */

// ==========================================
// IMPOR UTAMA
// ==========================================
import { Info, Trophy, FileText, CircleHelp, Layers } from "lucide-react";

// ==========================================
// ANTARMUKA & TIPE DATA
// ==========================================
interface ListeningSidebarProps {
  quizLength: number;
  transcriptLength?: number;
  jlptLevel?: string;
  difficulty?: string;
}

// ==========================================
// KOMPONEN UTAMA: ListeningSidebar
// ==========================================
/**
 * Komponen bilah samping informatif latihan menyimak.
 *
 * @param {ListeningSidebarProps} props Properti untuk komponen bilah samping.
 */
export function ListeningSidebar({
  quizLength,
  transcriptLength = 0,
  jlptLevel,
  difficulty,
}: ListeningSidebarProps) {
  return (
    <aside className="lg:col-span-4 flex flex-col gap-6">
      {/* Metadata Materi */}
      {(jlptLevel || difficulty || transcriptLength > 0 || quizLength > 0) && (
        <div className="p-6 rounded-3xl bg-background/[0.02] border border-border flex flex-col gap-4">
          <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground flex items-center gap-2">
            <Layers size={14} className="text-primary/50" />
            Info Materi
          </h4>
          <dl className="flex flex-col gap-3">
            {jlptLevel && (
              <div className="flex justify-between items-center">
                <dt className="text-xs text-muted-foreground font-medium">Level JLPT</dt>
                <dd className="text-xs font-black text-primary tracking-wider">{jlptLevel}</dd>
              </div>
            )}
            {difficulty && (
              <div className="flex justify-between items-center">
                <dt className="text-xs text-muted-foreground font-medium">Kesulitan</dt>
                <dd className="text-xs font-bold text-foreground">{difficulty}</dd>
              </div>
            )}
            {transcriptLength > 0 && (
              <div className="flex justify-between items-center">
                <dt className="text-xs text-muted-foreground font-medium flex items-center gap-1.5">
                  <FileText size={11} />
                  Baris Transkrip
                </dt>
                <dd className="text-xs font-bold text-foreground">{transcriptLength} baris</dd>
              </div>
            )}
            {quizLength > 0 && (
              <div className="flex justify-between items-center">
                <dt className="text-xs text-muted-foreground font-medium flex items-center gap-1.5">
                  <CircleHelp size={11} />
                  Soal Kuis
                </dt>
                <dd className="text-xs font-bold text-foreground">{quizLength} soal</dd>
              </div>
            )}
          </dl>
        </div>
      )}

      {/* Seksi Catatan Panduan Belajar */}
      <div className="p-6 rounded-3xl bg-background/[0.02] border border-border flex flex-col gap-6">
        <div className="flex items-center gap-3">
          <Info size={18} className="text-primary/50" />
          <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground">
            Catatan Belajar
          </h4>
        </div>
        <ul className="flex flex-col gap-4 font-sans">
          <li className="flex gap-4 items-start">
            <div className="size-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
            <p className="text-xs text-muted-foreground leading-relaxed font-medium">
              Dengarkan audio secara menyeluruh sebelum mencoba menjawab kuis.
            </p>
          </li>
          <li className="flex gap-4 items-start">
            <div className="size-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
            <p className="text-xs text-muted-foreground leading-relaxed font-medium">
              Klik baris transkrip untuk melompat ke bagian tertentu. Gunakan tombol{" "}
              <span className="text-primary font-bold">⟳</span> di tiap baris untuk mode shadowing (loop).
            </p>
          </li>
          <li className="flex gap-4 items-start">
            <div className="size-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
            <p className="text-xs text-muted-foreground leading-relaxed font-medium">
              Gunakan tombol <span className="text-primary font-bold">Tampilkan Terjemahan</span> jika kamu kesulitan memahami konteks.
            </p>
          </li>
          <li className="flex gap-4 items-start">
            <div className="size-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
            <p className="text-xs text-muted-foreground leading-relaxed font-medium">
              Gunakan kontrol kecepatan <span className="text-primary font-bold">🎚</span> di audio player untuk memutar lebih lambat (0.75×) jika perlu.
            </p>
          </li>
        </ul>
      </div>

      {/* Seksi Perolehan XP Hadiah */}
      {quizLength > 0 && (
        <div className="p-6 rounded-3xl bg-gradient-to-br from-primary/10 to-transparent border border-primary/20 flex flex-col gap-4 relative overflow-hidden group">
          <Trophy size={40} className="absolute -bottom-2 -right-2 text-primary/10 group-hover:scale-110 transition-transform" />
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-black uppercase tracking-widest text-primary">Hadiah Kuis</span>
            <span className="text-xl font-black text-foreground">
              hingga +{quizLength * 50} XP
            </span>
          </div>
          <p className="text-[10px] text-primary/60 font-semibold leading-relaxed">
            XP dihitung berdasarkan jumlah jawaban benar. Selesaikan semua dengan akurat untuk mendapatkan maksimal.
          </p>
        </div>
      )}
    </aside>
  );
}
