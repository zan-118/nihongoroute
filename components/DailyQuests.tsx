"use client";

import { Card } from "@/components/ui/card";
import { useDailyQuests } from "./features/dashboard/quests/useDailyQuests";
import { DAILY_QUESTS } from "./features/dashboard/quests/constants";
import { QuestHeader } from "./features/dashboard/quests/QuestHeader";
import { QuestCompleted } from "./features/dashboard/quests/QuestCompleted";
import { QuestItem } from "./features/dashboard/quests/QuestItem";

export default function DailyQuests() {
  const { claimedQuests, justClaimed, handleClaim, getCurrentProgress } = useDailyQuests();

  const isAllClaimed = Object.keys(claimedQuests).length === DAILY_QUESTS.length;

  return (
    <Card className="bg-card p-6 md:p-8 lg:p-10 rounded-[2.5rem] md:rounded-[3rem] border-border h-full relative overflow-hidden neo-card shadow-none flex flex-col">
      <div className="absolute inset-0 bg-[linear-gradient(rgba(0,238,255,0.02)_1px,transparent_1px)] bg-[size:100%_4px] opacity-40 pointer-events-none" />

      <QuestHeader />

      <div className="space-y-4 md:space-y-6 relative z-10 flex-1 flex flex-col justify-center">
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
