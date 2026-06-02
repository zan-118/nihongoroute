/**
 * @file ListeningPageClient.tsx
 * @description Komponen klien interaktif untuk sesi latihan menyimak (Choukai Session).
 * Mengelola pemutar audio, kontrol pemutaran, transkrip, dan kuis pemahaman.
 */

"use client";

// ======================
// IMPOR
// ======================
import React, { useEffect } from "react";
import { ListeningTaskData } from "@/components/features/listening/types";
import ListeningKaraoke from "@/components/features/listening/components/ListeningKaraoke";
import ListeningQuiz from "@/components/features/listening/components/ListeningQuiz";
import { useListeningSync } from "@/components/features/listening/hooks/useListeningSync";
import { useUserStore } from "@/store/useUserStore";
import { useUIStore } from "@/store/useUIStore";
import AudioController from "@/components/features/reading/components/AudioController";

// Komponen Pendukung
import { ListeningHeader } from "@/components/features/listening/components/ListeningHeader";

// ======================
// TIPE DATA
// ======================
interface ListeningPageClientProps {
  data: ListeningTaskData;
}

// ======================
// EKSEKUSI UTAMA
// ======================

/**
 * Komponen ListeningPageClient: Menyediakan antarmuka interaktif pemutar audio choukai 
 * dengan sinkronisasi transkrip baris per baris (Karaoke) dan kuis pemahaman materi.
 * 
 * @param {ListeningPageClientProps} props Properti komponen klien latihan menyimak.
 * @returns {JSX.Element} Antarmuka player menyimak interaktif.
 */
export default function ListeningPageClient({ data }: ListeningPageClientProps) {
  const setListeningState = useUIStore(state => state.setListeningState);

  // Sinkronisasi data ke store global saat mounting untuk akses tombol melayang (FAB)
  useEffect(() => {
    const textToSpeak = data.transcript.map(t => {
      if (typeof t.text === "string") return t.text;
      if (Array.isArray(t.text)) {
        return (t.text as { children?: { text?: string }[] }[])
          .map(block => block.children?.map(child => child.text).join("") || "")
          .join(" ");
      }
      return "";
    }).join(" ");

    setListeningState({
      audioUrl: data.audioUrl,
      textToSpeak: textToSpeak,
    });
  }, [data, setListeningState]);

  const { 
    activeIndex, 
    handleTimeUpdate, 
    seekToLine, 
    externalSeek 
  } = useListeningSync(data.transcript);

  const completeLesson = useUserStore(state => state.completeLesson);
  const addXP = useUserStore(state => state.addXP);
  const listeningState = useUIStore(state => state.listeningState);

  const handleQuizComplete = (score: number) => {
    const reward = score * 50;
    addXP(reward);
    completeLesson(data._id || data.id || "");
  };

  const hasQuiz = (data.quiz?.length ?? 0) > 0;

  return (
    <div className="min-h-screen bg-background text-foreground pb-32 relative overflow-hidden">
      {/* Latar Belakang Ambient Premium */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-0 left-1/4 size-[500px] bg-primary/5 blur-[120px] rounded-full" />
        <div className="absolute top-1/2 -right-48 size-96 bg-primary/10 blur-[100px] rounded-full" />
      </div>

      <ListeningHeader
        title={data.title}
        description={data.description}
        jlptLevel={data.jlpt_level}
        difficulty={data.difficulty}
      />

      <main className="max-w-4xl mx-auto px-4 lg:px-6 mt-6 md:mt-12 relative z-10">
        <div className="flex flex-col gap-6 md:gap-10">
          <ListeningKaraoke 
            transcript={data.transcript} 
            activeIndex={activeIndex}
            seekToLine={seekToLine}
          />

          {hasQuiz && (
            <div className="px-4 lg:px-8" data-section="quiz">
              {/* Divider menuju kuis */}
              <div className="flex items-center gap-4 mb-8">
                <div className="flex-1 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/50 shrink-0">
                  Kuis Pemahaman
                </span>
                <div className="flex-1 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
              </div>
              <ListeningQuiz 
                questions={data.quiz!} 
                onComplete={handleQuizComplete} 
              />
            </div>
          )}
        </div>
      </main>

      {/* Floating Bottom Audio Player (Mobile-First Spotify Style) */}
      <AudioController
        audioUrl={data.audioUrl}
        textToSpeak={listeningState.textToSpeak || ""}
        onTimeUpdate={handleTimeUpdate}
        externalSeek={externalSeek || 0}
      />
    </div>
  );
}
