/**
 * @file useDailyQuests.ts
 * @description Hook kustom untuk memantau kemajuan serta menangani proses klaim hadiah misi harian pengguna.
 * Menghubungkan statistik pengguna dari useUserStore dengan sistem misi luring-first NihongoRoute.
 */

// ==========================================
// IMPOR UTAMA
// ==========================================
import { useState, useMemo } from "react";
import { toast } from "sonner";
import { Quest } from "./types";
import { getTodayDateString } from "@/lib/utils";
import { useUserStore } from "@/store/useUserStore";

// ==========================================
// HOOK UTAMA: useDailyQuests
// ==========================================
/**
 * Hook kustom untuk memantau kemajuan serta mengeksekusi klaim hadiah misi harian.
 * 
 * @returns {Object} State dan aksi interaksi misi harian pengguna:
 *  - `claimedQuests`: Rekaman misi harian yang sudah diklaim pada hari ini.
 *  - `justClaimed`: ID misi yang baru saja diklaim (berguna untuk efek visual/animasi).
 *  - `handleClaim`: Fungsi untuk mengeksekusi klaim imbalan misi harian.
 *  - `getCurrentProgress`: Fungsi untuk mendapatkan progres terkini berdasarkan tipe misi.
 * 
 * @stores Mengakses `useUserStore` secara atomik untuk mengambil data kemajuan dan aksi mutasi lokal.
 */
export function useDailyQuests() {
  const xp = useUserStore(s => s.xp);
  const streak = useUserStore(s => s.streak);
  const todayReviewCount = useUserStore(s => s.todayReviewCount);
  const inventory = useUserStore(s => s.inventory);
  const claimQuest = useUserStore(s => s.claimQuest);
  const [justClaimed, setJustClaimed] = useState<string | null>(null);

  const today = getTodayDateString();
  
  // Memetakan daftar misi harian yang sudah diklaim pengguna pada hari aktif ini
  const claimedQuests = useMemo(() => {
    if (inventory.claimedQuests?.date === today) {
      const record: Record<string, boolean> = {};
      inventory.claimedQuests.quests.forEach(q => record[q] = true);
      return record;
    }
    return {};
  }, [inventory.claimedQuests, today]);

  // Menangani proses klaim misi harian dan memberikan imbalan XP
  const handleClaim = (quest: Quest) => {
    if (claimedQuests[quest.id]) return;

    claimQuest(quest.id, today, quest.rewardXP);

    toast.success("Misi Selesai!", {
      description: `Kamu mendapatkan +${quest.rewardXP} XP. Terus semangat belajarnya!`,
    });

    setJustClaimed(quest.id);
    setTimeout(() => setJustClaimed(null), 2000);
  };

  // Mengambil progres aktual pengguna berdasarkan tipe metrik misi harian
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

