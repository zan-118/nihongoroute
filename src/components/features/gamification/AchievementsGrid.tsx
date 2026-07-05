"use client";

/**
 * @file AchievementsGrid.tsx
 * @description Komponen penampil kisi pencapaian lencana (Achievements Grid) bagi pengguna.
 * Membaca data status dan riwayat belajar pengguna dari Zustand Store (`useUserStore` & `useSRSStore`)
 * untuk mengevaluasi syarat pembukaan lencana secara dinamis.
 */

// ======================
// IMPOR
// ======================
import { m } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Trophy } from "lucide-react";
import { UserProgress } from "@/store/types";
import { useUserStore } from "@/store/useUserStore";
import { useSRSStore } from "@/store/useSRSStore";
import { useUIStore } from "@/store/useUIStore";
import { ACHIEVEMENTS_LIST } from "@/lib/constants/gamification";

// ======================
// EKSEKUSI UTAMA
// ======================
export default function AchievementsGrid() {
  const name = useUserStore(s => s.name);
  const xp = useUserStore(s => s.xp);
  const level = useUserStore(s => s.level);
  const streak = useUserStore(s => s.streak);
  const todayReviewCount = useUserStore(s => s.todayReviewCount);
  const lastStudyDate = useUserStore(s => s.lastStudyDate);
  const studyDays = useUserStore(s => s.studyDays);
  const inventory = useUserStore(s => s.inventory);
  const id = useUserStore(s => s.id);
  const isGuest = useUserStore(s => s.isGuest);
  const completedLessons = useUserStore(s => s.completedLessons);
  
  const srs = useSRSStore(s => s.srs);
  const notifications = useUIStore(s => s.notifications);
  const settings = useUIStore(s => s.settings);

  const progress: UserProgress = { 
    id: id || "guest", 
    isGuest: !!isGuest, 
    name: name || "Pelajar", 
    xp: xp || 0, 
    level: level || 1, 
    streak: streak || 0, 
    todayReviewCount: todayReviewCount || 0, 
    lastStudyDate: lastStudyDate || null, 
    studyDays: studyDays || {}, 
    inventory: inventory || { streakFreeze: 0, claimedQuests: { date: "", quests: [] } }, 
    srs: srs || {}, 
    completedLessons: completedLessons || {},
    notifications: notifications || [], 
    settings: settings || { notificationsEnabled: true, showFurigana: true } 
  };

  return (
    <div className="flex flex-col sm:flex-row flex-wrap gap-4">
      {ACHIEVEMENTS_LIST.map((ach) => {
        const rawProgress = ach.condition(progress);
        const percent = Math.min(100, Math.max(0, rawProgress));
        const isUnlocked = percent >= 100;

        const IconComponent = ach.icon;

        return (
          <Card 
            key={ach.id}
            className={`p-6 rounded-lg border transition-all duration-500 relative overflow-hidden group ${
              isUnlocked 
                ? 'bg-primary/5 border-primary/30 shadow-[0_0_20px_rgb(var(--primary-rgb)/0.05)]' 
                : 'bg-muted/30 border-border grayscale opacity-70'
            }`}
          >
            <div className="flex items-start gap-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-500 ${
                isUnlocked ? 'bg-primary text-primary-foreground shadow-lg scale-110' : 'bg-muted text-muted-foreground'
              }`}>
                <IconComponent size={24} />
              </div>
              <div className="flex-1">
                <h4 className={`text-sm font-black uppercase tracking-wider mb-1 ${isUnlocked ? 'text-foreground' : 'text-muted-foreground'}`}>
                  {ach.title}
                </h4>
                <p className="text-xs text-muted-foreground font-medium mb-3">
                  {ach.description}
                </p>
                
                <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden border border-border">
                  <m.div 
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
                    <Trophy size={12} className="text-primary animate-premium-bounce" />
                  )}
                </div>
              </div>
            </div>
            
            {/* Dekorasi Latar Belakang untuk pencapaian yang telah terbuka */}
            {isUnlocked && (
              <div className="absolute -bottom-4 -right-4 text-primary/10 rotate-12 pointer-events-none group-hover:scale-125 transition-transform duration-700">
                <IconComponent size={80} />
              </div>
            )}
          </Card>
        );
      })}
    </div>
  );
}
