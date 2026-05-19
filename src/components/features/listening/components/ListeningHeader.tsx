"use client";

import { Headphones, CheckCircle2 } from "lucide-react";
import AudioController from "@/components/features/reading/components/AudioController";
import { cn } from "@/lib/utils";

interface ListeningHeaderProps {
  title: string;
  description?: string;
  audioUrl: string;
  textToSpeak: string;
  activeTab: "transcript" | "quiz";
  onTabChange: (tab: "transcript" | "quiz") => void;
  isCompleted: boolean;
  onTimeUpdate: (time: number) => void;
  externalSeek: number;
}

export function ListeningHeader({
  title,
  description,
  audioUrl,
  textToSpeak,
  activeTab,
  onTabChange,
  isCompleted,
  onTimeUpdate,
  externalSeek,
}: ListeningHeaderProps) {
  return (
    <div className="relative w-full border-b border-border bg-card overflow-hidden">
      <div className="absolute top-0 right-0 w-1/3 h-full bg-primary/5 blur-[120px] rounded-full -translate-y-1/2" />
      
      <div className="max-w-7xl mx-auto px-6 py-12 lg:py-16">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 relative z-10">
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-primary/10 border border-primary/20 text-primary">
                <Headphones size={20} />
              </div>
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-primary/60">
                Listening Comprehension
              </span>
            </div>
            <h1 className="text-4xl lg:text-5xl font-black text-foreground tracking-tighter leading-tight uppercase drop-shadow-sm">
              {title}
            </h1>
            {description && (
              <p className="text-muted-foreground text-sm max-w-2xl leading-relaxed font-medium">
                {description}
              </p>
            )}
          </div>

          <div className="flex flex-col md:flex-row items-center gap-4">
            <AudioController 
              audioUrl={audioUrl}
              textToSpeak={textToSpeak}
              onTimeUpdate={onTimeUpdate}
              externalSeek={externalSeek}
              compact={true}
            />

            <div className="flex p-1 bg-muted/30 border border-border rounded-2xl backdrop-blur-md">
              <button
                onClick={() => onTabChange("transcript")}
                className={cn(
                  "px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all",
                  activeTab === "transcript" ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" : "text-muted-foreground hover:text-foreground"
                )}
              >
                Transcript
              </button>
              <button
                onClick={() => onTabChange("quiz")}
                className={cn(
                  "px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2",
                  activeTab === "quiz" ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" : "text-muted-foreground hover:text-foreground"
                )}
              >
                Take Quiz
                {isCompleted && <CheckCircle2 size={12} />}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
