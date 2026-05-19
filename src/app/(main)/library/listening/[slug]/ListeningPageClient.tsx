"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ListeningTaskData } from "@/components/features/listening/types";
import ListeningKaraoke from "@/components/features/listening/components/ListeningKaraoke";
import ListeningQuiz from "@/components/features/listening/components/ListeningQuiz";
import { useListeningSync } from "@/components/features/listening/hooks/useListeningSync";
import { useUserStore } from "@/store/useUserStore";
import { useUIStore } from "@/store/useUIStore";
import { cn } from "@/lib/utils";

// Modular Components
import { ListeningHeader } from "@/components/features/listening/components/ListeningHeader";
import { ListeningSidebar } from "@/components/features/listening/components/ListeningSidebar";

interface ListeningPageClientProps {
  data: ListeningTaskData;
}

export default function ListeningPageClient({ data }: ListeningPageClientProps) {
  const listeningState = useUIStore(state => state.listeningState);
  const setListeningState = useUIStore(state => state.setListeningState);
  const { activeTab } = listeningState;
  const [isCompleted, setIsCompleted] = useState(false);
  
  // Sync data to global store on mount for FAB access
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

  const handleQuizComplete = (score: number) => {
    setIsCompleted(true);
    const reward = score * 50;
    addXP(reward);
    completeLesson((data as any)._id || data.id);
  };

  return (
    <div className="min-h-screen bg-background text-foreground pb-32 relative overflow-hidden">
      {/* Premium Ambient Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-primary/5 blur-[120px] rounded-full" />
        <div className="absolute top-1/2 -right-48 w-96 h-96 bg-primary/10 blur-[100px] rounded-full" />
      </div>

      <ListeningHeader
        title={data.title}
        description={data.description}
        audioUrl={data.audioUrl}
        textToSpeak={listeningState.textToSpeak || ""}
        activeTab={activeTab as "transcript" | "quiz"}
        onTabChange={(tab) => setListeningState({ activeTab: tab })}
        isCompleted={isCompleted}
        onTimeUpdate={handleTimeUpdate}
        externalSeek={externalSeek || 0}
      />

      <main className="max-w-7xl mx-auto px-4 lg:px-6 mt-12 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Left Column: Interactive Area */}
          <div className="lg:col-span-8 relative min-h-[600px]">
            <div className={cn(
              "transition-all duration-700",
              activeTab === "quiz" ? "blur-md scale-[0.98] opacity-30 pointer-events-none" : "blur-0 scale-100 opacity-100"
            )}>
              <ListeningKaraoke 
                transcript={data.transcript} 
                activeIndex={activeIndex}
                seekToLine={seekToLine}
              />
            </div>

            <AnimatePresence>
              {activeTab === "quiz" && (
                <motion.div
                  initial={{ opacity: 0, backdropFilter: "blur(0px)" }}
                  animate={{ opacity: 1, backdropFilter: "blur(4px)" }}
                  exit={{ opacity: 0, backdropFilter: "blur(0px)" }}
                  className="absolute inset-0 z-50 flex items-center justify-center p-4"
                >
                  <motion.div
                    initial={{ scale: 0.9, y: 20, opacity: 0 }}
                    animate={{ scale: 1, y: 0, opacity: 1 }}
                    exit={{ scale: 0.9, y: 20, opacity: 0 }}
                    transition={{ type: "spring", damping: 25, stiffness: 200 }}
                    className="w-full max-w-2xl"
                  >
                    {data.quiz && data.quiz.length > 0 ? (
                      <ListeningQuiz 
                        questions={data.quiz} 
                        onComplete={handleQuizComplete} 
                      />
                    ) : (
                      <div className="p-12 text-center bg-background/80 backdrop-blur-2xl border border-border rounded-3xl">
                        <p className="text-muted-foreground">No quiz available for this task.</p>
                        <button 
                          onClick={() => setListeningState({ activeTab: "transcript" })}
                          className="mt-4 text-xs font-black uppercase text-primary tracking-widest hover:underline"
                        >
                          Back to Transcript
                        </button>
                      </div>
                    )}
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <ListeningSidebar quizLength={data.quiz?.length || 0} />
        </div>
      </main>
    </div>
  );
}
