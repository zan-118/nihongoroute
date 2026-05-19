"use client";

import React, { useState } from "react";
import { useSRSStore } from "@/store/useSRSStore";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import TTSReader from "@/components/features/tools/tts/TTSReader";
import { Badge } from "@/components/ui/badge";

interface VocabTriggerProps {
  text: string;
  vocabId?: string;
  children: React.ReactNode;
}

export default function VocabTrigger({ text, vocabId, children }: VocabTriggerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const srsData = useSRSStore((state) => state.srs);

  // Simple lookup if no vocabId is provided (Auto-Lookup)
  const lookupId = vocabId || text;
  const srsInfo = srsData[lookupId];


  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
          <span 
            className="cursor-help border-b-2 border-dashed border-primary/40 hover:border-primary transition-all duration-300 relative group"
          >
            {children}
            {/* Subtle Glow Underline */}
            <span className="absolute bottom-0 left-0 w-full h-[2px] bg-primary blur-[4px] opacity-0 group-hover:opacity-60 transition-opacity" />
          </span>
        </DialogTrigger>
        <DialogContent className="bg-[rgba(var(--card-rgb),0.6)] backdrop-blur-3xl border border-border shadow-[0_0_50px_rgba(var(--primary-rgb),0.15)] sm:max-w-[400px] overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 blur-[50px] rounded-full -mr-16 -mt-16" />
          
          <DialogHeader className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <Badge variant="outline" className="border-primary/30 text-primary bg-primary/5">
                Quick Dictionary
              </Badge>
              {srsInfo && (
                <div className="flex items-center gap-1.5">
                   <div className="w-2 h-2 rounded-full bg-success shadow-[0_0_8px_rgba(var(--success-rgb),0.5)]" />
                   <span className="text-[10px] font-black uppercase tracking-tighter text-success/80">In SRS</span>
                </div>
              )}
            </div>
            
            <DialogTitle className="text-3xl font-black tracking-tighter flex items-center gap-4">
              {text}
              <TTSReader text={text} minimal />
            </DialogTitle>
          </DialogHeader>

          <div className="mt-6 space-y-6 relative z-10">
            <div className="p-4 rounded-2xl bg-[rgba(var(--background-rgb),0.05)] border border-border space-y-2">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/60">Makna</span>
              <p className="text-lg font-medium text-foreground/90">
                {/* Fallback mock text if not in SRS */}
                {srsInfo ? "Detail kosakata dari progres belajar Anda." : "Klik 'Detail' untuk melihat arti selengkapnya di perpustakaan."}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
               <div className="p-4 rounded-2xl bg-[rgba(var(--background-rgb),0.05)] border border-border">
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/60 block mb-1">Status</span>
                  <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                    {srsInfo ? `Level ${srsInfo.repetition > 5 ? 'Master' : 'Learning'}` : "Not Tracked"}
                  </span>
               </div>
               <div className="p-4 rounded-2xl bg-[rgba(var(--background-rgb),0.05)] border border-border">
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/60 block mb-1">JLPT</span>
                  <span className="text-xs font-bold text-foreground">N5 - N4</span>
               </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
  );
}
