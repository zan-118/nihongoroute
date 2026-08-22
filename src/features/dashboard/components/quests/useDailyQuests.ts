/**
 * @file useDailyQuests.ts
 * @description Custom hook for monitoring daily quest progress and executing XP reward claims.
 * Connects user statistics from `useUserStore` with the offline-first quest system.
 * @module features/dashboard/components/quests
 */

// Import & Dependencies

import { useState, useMemo } from "react";
import { toast } from "sonner";
import { Quest } from "./types";
import { getTodayDateString } from "@/lib/utils";
import { useUserStore } from "@/store/useUserStore";
import { DAILY_QUESTS_POOL, getTodayQuests } from "@/lib/constants/gamification";

// Main Custom Hook

/**
 * Manage daily quest progress and reward claims.
 * Connects user stats to offline-first quest system.
 * 
 * @returns Quest state, claim handler, and progress calculator.
 */
export function useDailyQuests() {
 const xp = useUserStore(s => s.xp);
 const streak = useUserStore(s => s.streak);
 const todayReviewCount = useUserStore(s => s.todayReviewCount);
 const inventory = useUserStore(s => s.inventory);
 const claimQuest = useUserStore(s => s.claimQuest);
 const [justClaimed, setJustClaimed] = useState<string | null>(null);

 const today = getTodayDateString();

 // Seeded random selection ensures same quests for date.
 const todayQuests = useMemo(() => {
 return getTodayQuests(DAILY_QUESTS_POOL, today);
 }, [today]);
 
 // Map claimed quest IDs to boolean lookup table for fast checks.
 const claimedQuests = useMemo(() => {
 if (inventory.claimedQuests?.date === today) {
 const record: Record<string, boolean> = {};
 inventory.claimedQuests.quests.forEach(q => record[q] = true);
 return record;
 }
 return {};
 }, [inventory.claimedQuests, today]);

 /**
 * Claim quest reward and update user XP.
 * 
 * @param quest Quest to claim.
 */
 const handleClaim = (quest: Quest) => {
 // Prevent double claim.
 if (claimedQuests[quest.id]) return;

 // Persist claim state and award XP.
 claimQuest(quest.id, today, quest.rewardXP);

 toast.success("Misi Selesai!", {
 description: `Kamu mendapatkan +${quest.rewardXP} XP. Terus semangat belajarnya!`,
 });

 // Trigger animation state. Reset after duration.
 setJustClaimed(quest.id);
 setTimeout(() => setJustClaimed(null), 2000);
 };

 /**
 * Calculate progress based on quest metric type.
 * 
 * @param type Quest type identifier.
 * @returns Current progress value.
 */
 const getCurrentProgress = (type: Quest["type"]) => {
 switch (type) {
 case "review":
 return todayReviewCount || 0;
 case "xp":
 // Use modulo to track XP gained in current cycle.
 return xp % 1000;
 case "streak":
 return streak || 0;
 default:
 return 0;
 }
 };

 return {
 todayQuests,
 claimedQuests,
 justClaimed,
 handleClaim,
 getCurrentProgress,
 };
}