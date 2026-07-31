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
import Link from "next/link";
import { Mic, ScanText } from "@/components/ui/icons";
import { ListeningTaskData } from "@/features/library/listening/types";
import ListeningWorkspace from "@/features/library/listening/components/ListeningWorkspace";
import { useListeningSync } from "@/features/library/listening/hooks/useListeningSync";
import { useUserStore } from "@/store/useUserStore";
import { useUIStore } from "@/store/useUIStore";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// ======================
// TIPE DATA
// ======================

/**
 * Props for the ListeningPageClient component.
 */
interface ListeningPageClientProps {
  /** The listening task data containing transcript, audio, and quiz details. */
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
  // Global UI store actions for managing listening state and analytics.
  const setListeningState = useUIStore(state => state.setListeningState);
  const recordLearningEvent = useUIStore(state => state.recordLearningEvent);

  // Serialize task data to query parameters for external tools (shadowing, analyzer).
  const toolParams = React.useMemo(() => {
    const p = new URLSearchParams();
    if (data.title) p.set("title", data.title);
    if (data.body) p.set("body", data.body);
    if (data.translation) p.set("translation", data.translation);
    return p.toString();
  }, [data.title, data.body, data.translation]);

  // Reset listening state in global UI store when active task changes.
  useEffect(() => {
    setListeningState({
      currentTime: 0,
      activeIndex: 0,
      isScrolling: false,
      activeTab: "transcript",
      textToSpeak: data.body || "",
    });
  }, [data.body, setListeningState]);

  // Sync audio playback time with transcript line indices.
  const { 
    activeIndex, 
    handleTimeUpdate, 
    seekToLine, 
    externalSeek 
  } = useListeningSync(data.transcript);

  // User store actions for progression and rewards.
  const completeLesson = useUserStore(state => state.completeLesson);
  const addXP = useUserStore(state => state.addXP);

  /**
   * Handles quiz completion, awards XP, marks lesson complete, and logs learning event.
   * 
   * @param {number} score - Number of correct answers.
   */
  const handleQuizComplete = (score: number) => {
    const reward = score * 50;
    addXP(reward);
    completeLesson(data._id || data.id || "");
    recordLearningEvent({
      type: "listening_completed",
      source: {
        type: "listening",
        id: data._id || data.id || data.slug,
        slug: data.slug || data._id || data.id,
        title: data.title,
        href: data.slug ? `/library/listening/${data.slug}` : undefined,
        level: data.jlpt_level || data.difficulty,
      },
      metrics: {
        correct: score,
        total: data.quiz?.length || 0,
        accuracy: data.quiz?.length ? Math.round((score / data.quiz.length) * 100) : undefined,
      },
    });
  };

  return (
    <div className="min-h-screen bg-transparent text-foreground pb-20 relative overflow-hidden">
      {/* Latar Belakang Ambient Premium */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-0 left-1/4 size-[500px] bg-primary/5 blur-[120px] rounded-full" />
        <div className="absolute top-1/2 -right-48 size-96 bg-primary/10 blur-[100px] rounded-full" />
      </div>

      <main className="max-w-none w-full px-4 lg:px-8 mt-6 md:mt-10 relative z-10">
        {/* Slim Header Row */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/40 pb-6 mb-6">
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[9px] font-black uppercase tracking-[0.2em] text-primary">
                Latihan Menyimak
              </span>
              {data.jlpt_level && (
                <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-[4px] bg-primary/10 text-primary border border-primary/20">
                  {data.jlpt_level}
                </span>
              )}
            </div>
            <h1 className="text-xl md:text-3xl text-foreground tracking-tight leading-tight uppercase">
              {data.title}
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <Button asChild variant="outline" size="sm" className="rounded-lg text-[10px] font-bold h-8">
              <Link href={`/tools/shadowing?${toolParams}`}>
                <Mic size={12} className="mr-1 text-primary" aria-hidden="true" />
                Shadowing
              </Link>
            </Button>
            <Button asChild variant="outline" size="sm" className="rounded-lg text-[10px] font-bold h-8">
              <Link href={`/tools/text-analyzer?${toolParams}`}>
                <ScanText size={12} className="mr-1 text-primary" aria-hidden="true" />
                Analyzer
              </Link>
            </Button>
          </div>
        </div>

        {/* Workspace Terintegrasi Baru */}
        <ListeningWorkspace
          transcript={data.transcript}
          activeIndex={activeIndex}
          seekToLine={seekToLine}
          audioUrl={data.audioUrl}
          onTimeUpdate={handleTimeUpdate}
          externalSeek={externalSeek}
          quiz={data.quiz}
          imageUrl={data.image_url && typeof data.image_url === "string" ? data.image_url : undefined}
          illustrations={data.illustrations}
          onQuizComplete={handleQuizComplete}
          toolParams={toolParams}
          title={data.title}
        />
      </main>
    </div>
  );
}