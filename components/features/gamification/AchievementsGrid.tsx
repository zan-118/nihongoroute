"use client";

import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Trophy, Star, Zap, Flame, BookOpen, Crown, Target } from "lucide-react";
import { useProgressStore, UserProgress } from "@/store/useProgressStore";
import { useShallow } from "zustand/react/shallow";

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  condition: (progress: UserProgress) => number; // Returns progress percentage 0-100
  threshold: number;
}

const ACHIEVEMENTS: Achievement[] = [
  {
    id: "first_steps",
    title: "Langkah Pertama",
    description: "Pelajari 5 kosakata pertama Anda",
    icon: Star,
    condition: (p) => (Object.keys(p.srs).length / 5) * 100,
    threshold: 5
  },
  {
    id: "vocab_collector",
    title: "Kolektor Kata",
    description: "Pelajari 50 kosakata",
    icon: BookOpen,
    condition: (p) => (Object.keys(p.srs).length / 50) * 100,
    threshold: 50
  },
  {
    id: "streak_warrior",
    title: "Pejuang Streak",
    description: "Pertahankan streak selama 7 hari",
    icon: Flame,
    condition: (p) => (p.streak / 7) * 100,
    threshold: 7
  },
  {
    id: "level_10",
    title: "Elit Nihongo",
    description: "Capai Level 10",
    icon: Crown,
    condition: (p) => (p.level / 10) * 100,
    threshold: 10
  },
  {
    id: "xp_master",
    title: "Pakar XP",
    description: "Kumpulkan total 5.000 XP",
    icon: Zap,
    condition: (p) => (p.xp / 5000) * 100,
    threshold: 5000
  },
  {
    id: "perfect_review",
    title: "Fokus Maksimal",
    description: "Selesaikan 100 review hari ini",
    icon: Target,
    condition: (p) => (p.todayReviewCount / 100) * 100,
    threshold: 100
  }
];

export default function AchievementsGrid() {
  const { progress } = useProgressStore(
    useShallow((state) => ({ progress: state.progress }))
  );

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {ACHIEVEMENTS.map((ach) => {
        const rawProgress = ach.condition(progress);
        const percent = Math.min(100, Math.max(0, rawProgress));
        const isUnlocked = percent >= 100;

        return (
          <Card 
            key={ach.id}
            className={`p-6 rounded-2xl border transition-all duration-500 relative overflow-hidden group ${
              isUnlocked 
                ? 'bg-primary/5 border-primary/30 shadow-[0_0_20px_rgba(0,238,255,0.05)]' 
                : 'bg-muted/30 border-border/50 grayscale opacity-70'
            }`}
          >
            <div className="flex items-start gap-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-500 ${
                isUnlocked ? 'bg-primary text-white dark:text-black shadow-lg scale-110' : 'bg-muted text-muted-foreground'
              }`}>
                <ach.icon size={24} />
              </div>
              <div className="flex-1">
                <h4 className={`text-sm font-black uppercase tracking-wider mb-1 ${isUnlocked ? 'text-foreground' : 'text-muted-foreground'}`}>
                  {ach.title}
                </h4>
                <p className="text-[10px] text-muted-foreground font-medium mb-3">
                  {ach.description}
                </p>
                
                <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden border border-border/50">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${percent}%` }}
                    className={`h-full transition-all duration-1000 ${isUnlocked ? 'bg-primary' : 'bg-muted-foreground/30'}`}
                  />
                </div>
                <div className="flex justify-between items-center mt-2">
                  <span className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest">
                    {isUnlocked ? "Selesai" : `${Math.floor(percent)}% Progres`}
                  </span>
                  {isUnlocked && (
                    <Trophy size={12} className="text-primary animate-bounce" />
                  )}
                </div>
              </div>
            </div>
            
            {/* Background Decoration for unlocked */}
            {isUnlocked && (
              <div className="absolute -bottom-4 -right-4 text-primary/10 rotate-12 pointer-events-none group-hover:scale-125 transition-transform duration-700">
                <ach.icon size={80} />
              </div>
            )}
          </Card>
        );
      })}
    </div>
  );
}
