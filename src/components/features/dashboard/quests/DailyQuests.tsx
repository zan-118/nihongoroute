"use client";

/**
 * @file DailyQuests.tsx
 * @description Komponen kontainer Misi Harian (Daily Quests) pada dashboard NihongoRoute.
 * Mengintegrasikan komponen QuestHeader, QuestItem, dan QuestCompleted,
 * serta menggunakan hook useDailyQuests untuk orkestrasi status penyelesaian misi dan klaim hadiah XP.
 *
 * @package components/features/dashboard/quests
 * @project NihongoRoute
 */

// ==========================================
// IMPOR
// ==========================================
import { Card } from "@/components/ui/card";
import { useDailyQuests } from "./useDailyQuests";
import { DAILY_QUESTS } from "./constants";
import { QuestHeader } from "./QuestHeader";
import { QuestCompleted } from "./QuestCompleted";
import { QuestItem } from "./QuestItem";

// ==========================================
// KOMPONEN UTAMA
// ==========================================
export default function DailyQuests() {
  const { claimedQuests, justClaimed, handleClaim, getCurrentProgress } = useDailyQuests();

  const isAllClaimed = Object.keys(claimedQuests).length === DAILY_QUESTS.length;

  return (
    <Card className="bg-card p-6 md:p-8 lg:p-10 rounded-[2.5rem] md:rounded-[3rem] border-border h-full relative overflow-hidden neo-card shadow-none flex flex-col">
      {/* Pola Kisi Latar Belakang */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(var(--primary-rgb),0.02)_1px,transparent_1px)] bg-[size:100%_4px] opacity-40 pointer-events-none" />

      <QuestHeader />

      {/* Kontainer Daftar Misi Harian */}
      <div className="gap-y-4 md:gap-y-6 relative z-10 flex-1 flex flex-col justify-center">
        {isAllClaimed ? (
          <QuestCompleted />
        ) : (
          DAILY_QUESTS.map((quest) => (
            <QuestItem
              key={quest.id}
              quest={quest}
              current={getCurrentProgress(quest.type)}
              isClaimed={!!claimedQuests[quest.id]}
              justClaimed={justClaimed === quest.id}
              onClaim={handleClaim}
            />
          ))
        )}
      </div>
    </Card>
  );
}

