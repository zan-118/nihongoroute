"use client";

import { Info, Trophy } from "lucide-react";

interface ListeningSidebarProps {
  quizLength: number;
}

export function ListeningSidebar({ quizLength }: ListeningSidebarProps) {
  return (
    <aside className="lg:col-span-4 flex flex-col gap-6">
      <div className="p-6 rounded-3xl bg-background/[0.02] border border-border flex flex-col gap-6">
        <div className="flex items-center gap-3">
          <Info size={18} className="text-primary/50" />
          <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground">Study Notes</h4>
        </div>
        <ul className="flex flex-col gap-4">
          <li className="flex gap-4 items-start">
            <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
            <p className="text-xs text-muted-foreground leading-relaxed">
              Dengarkan audio secara menyeluruh sebelum mencoba menjawab kuis.
            </p>
          </li>
          <li className="flex gap-4 items-start">
            <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
            <p className="text-xs text-muted-foreground leading-relaxed">
              Klik pada baris transkrip untuk mengulangi bagian tertentu (Shadowing).
            </p>
          </li>
          <li className="flex gap-4 items-start">
            <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
            <p className="text-xs text-muted-foreground leading-relaxed">
              Gunakan tombol &quot;Translate&quot; jika kamu kesulitan memahami konteks kalimat.
            </p>
          </li>
        </ul>
      </div>

      <div className="p-6 rounded-3xl bg-gradient-to-br from-primary/10 to-transparent border border-primary/20 flex flex-col gap-4 relative overflow-hidden group">
        <Trophy size={40} className="absolute -bottom-2 -right-2 text-primary/10 group-hover:scale-110 transition-transform" />
        <div className="flex flex-col gap-1">
          <span className="text-[10px] font-black uppercase tracking-widest text-primary">Reward</span>
          <span className="text-xl font-black text-foreground">+{quizLength * 50} XP</span>
        </div>
        <p className="text-[10px] text-primary/60 font-medium leading-relaxed">
          Complete the quiz with 100% accuracy to earn maximum XP bonus.
        </p>
      </div>
    </aside>
  );
}
