"use client";

import { motion } from "framer-motion";
import { CheckCircle2, Zap, Target, BookOpen } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { UserProgress } from "@/store/useProgressStore";

interface Quest {
  id: string;
  title: string;
  target: number;
  current: number;
  icon: React.ReactNode;
  xpReward: number;
}

export default function DailyQuests({ progress }: { progress: UserProgress }) {
  // Logic sederhana: quests bisa dihitung dari progress.srs atau stat lainnya
  // Untuk demo, kita buat mock data yang terasa nyata
  const quests: Quest[] = [
    {
      id: "review",
      title: "Ulas 10 Kosakata",
      target: 10,
      current: Math.min(Object.values(progress.srs).length, 10), // Mock
      icon: <Target size={16} className="text-rose-500" />,
      xpReward: 50,
    },
    {
      id: "learn",
      title: "Pelajari 2 Kanji Baru",
      target: 2,
      current: 1, // Mock
      icon: <BookOpen size={16} className="text-primary" />,
      xpReward: 100,
    },
    {
      id: "streak",
      title: "Pertahankan Streak",
      target: 1,
      current: progress.streak > 0 ? 1 : 0,
      icon: <Zap size={16} className="text-amber-500" />,
      xpReward: 20,
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-col">
        <h2 className="text-muted-foreground font-bold uppercase tracking-widest text-[10px] mb-2 flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-primary" />
          Misi Harian
        </h2>
        <h3 className="text-lg font-black text-foreground uppercase tracking-tight mb-4">
          Quest <span className="text-primary">Hari Ini</span>
        </h3>
      </div>

      <div className="grid gap-3">
        {quests.map((quest, i) => (
          <motion.div
            key={quest.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Card className="p-4 bg-muted/30 border-border/50 rounded-2xl hover:bg-muted/50 transition-colors">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-background border border-border flex items-center justify-center shadow-inner">
                  {quest.current >= quest.target ? (
                    <CheckCircle2 size={20} className="text-emerald-500" />
                  ) : (
                    quest.icon
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-end mb-2">
                    <span className={`text-xs font-black uppercase tracking-wider truncate block ${quest.current >= quest.target ? 'text-muted-foreground/60 line-through' : 'text-foreground/90'}`}>
                      {quest.title}
                    </span>
                    <span className="text-[10px] font-bold text-muted-foreground/80 tabular-nums">
                      {quest.current}/{quest.target}
                    </span>
                  </div>
                  <Progress 
                    value={(quest.current / quest.target) * 100} 
                    className="h-1.5 bg-background shadow-inner"
                    indicatorClassName={quest.current >= quest.target ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.3)]' : 'bg-primary shadow-[0_0_10px_rgba(0,238,255,0.3)]'}
                  />
                </div>

                <div className="pl-4 flex flex-col items-end shrink-0 border-l border-border/50">
                   <span className="text-[10px] font-black text-primary drop-shadow-sm">+{quest.xpReward}</span>
                   <span className="text-[8px] font-bold text-muted-foreground/60 uppercase tracking-tighter">XP</span>
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
