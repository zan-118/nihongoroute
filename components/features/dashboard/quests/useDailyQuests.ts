import { useState, useEffect } from "react";

import { toast } from "sonner";
import { Quest } from "./types";
import { getTodayDateString } from "@/lib/helpers";
import { useUserStore } from "@/store/useUserStore";
import { useSRSStore } from "@/store/useSRSStore";
import { useUIStore } from "@/store/useUIStore";

export function useDailyQuests() {
  const { updateProgress } = useSRSStore();
    const { name, xp, level, streak, todayReviewCount, lastStudyDate, studyDays, inventory } = useUserStore();
    const { srs } = useSRSStore();
    const { notifications, settings } = useUIStore();
    const progress = { name, xp, level, streak, todayReviewCount, lastStudyDate, studyDays, inventory, srs, notifications, settings };
  const [claimedQuests, setClaimedQuests] = useState<Record<string, boolean>>({});
  const [justClaimed, setJustClaimed] = useState<string | null>(null);

  useEffect(() => {
    const today = getTodayDateString();
    const saved = localStorage.getItem(`nihongo-quests-${today}`);
    if (saved) {
      try {
        setClaimedQuests(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse claimed quests", e);
      }
    }
  }, []);

  const saveClaimed = (newClaimed: Record<string, boolean>) => {
    const today = getTodayDateString();
    localStorage.setItem(`nihongo-quests-${today}`, JSON.stringify(newClaimed));
    setClaimedQuests(newClaimed);
  };

  const handleClaim = (quest: Quest) => {
    if (claimedQuests[quest.id]) return;

    updateProgress(progress.xp + quest.rewardXP, progress.srs);

    const newClaimed = { ...claimedQuests, [quest.id]: true };
    saveClaimed(newClaimed);

    toast.success("Misi Selesai!", {
      description: `Kamu mendapatkan +${quest.rewardXP} XP. Terus semangat belajarnya!`,
    });

    setJustClaimed(quest.id);
    setTimeout(() => setJustClaimed(null), 2000);
  };

  const getCurrentProgress = (type: Quest["type"]) => {
    switch (type) {
      case "review":
        return progress.todayReviewCount || 0;
      case "xp":
        return progress.xp % 1000;
      case "streak":
        return progress.streak || 0;
      default:
        return 0;
    }
  };

  return {
    claimedQuests,
    justClaimed,
    handleClaim,
    getCurrentProgress,
  };
}
