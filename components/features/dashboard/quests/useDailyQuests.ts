import { useState, useMemo } from "react";
import { toast } from "sonner";
import { Quest } from "./types";
import { getTodayDateString } from "@/lib/helpers";
import { useUserStore } from "@/store/useUserStore";

export function useDailyQuests() {
  const { xp, streak, todayReviewCount, inventory, claimQuest } = useUserStore();
  const [justClaimed, setJustClaimed] = useState<string | null>(null);

  const today = getTodayDateString();
  
  const claimedQuests = useMemo(() => {
    if (inventory.claimedQuests?.date === today) {
      const record: Record<string, boolean> = {};
      inventory.claimedQuests.quests.forEach(q => record[q] = true);
      return record;
    }
    return {};
  }, [inventory.claimedQuests, today]);

  const handleClaim = (quest: Quest) => {
    if (claimedQuests[quest.id]) return;

    claimQuest(quest.id, today, quest.rewardXP);

    toast.success("Misi Selesai!", {
      description: `Kamu mendapatkan +${quest.rewardXP} XP. Terus semangat belajarnya!`,
    });

    setJustClaimed(quest.id);
    setTimeout(() => setJustClaimed(null), 2000);
  };

  const getCurrentProgress = (type: Quest["type"]) => {
    switch (type) {
      case "review":
        return todayReviewCount || 0;
      case "xp":
        return xp % 1000;
      case "streak":
        return streak || 0;
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
