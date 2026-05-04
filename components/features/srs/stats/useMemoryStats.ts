import { useUserStore } from "@/store/useUserStore";
import { useSRSStore } from "@/store/useSRSStore";
import { useUIStore } from "@/store/useUIStore";

export function useMemoryStats() {
  const { name, xp, level, streak, todayReviewCount, lastStudyDate, studyDays, inventory } = useUserStore();
    const { srs } = useSRSStore();
    const { notifications, settings } = useUIStore();
    const progress = { name, xp, level, streak, todayReviewCount, lastStudyDate, studyDays, inventory, srs, notifications, settings };
  const srsEntries = Object.values(progress.srs || {});

  const stats = {
    master: srsEntries.filter((s) => s.interval >= 30).length,
    intermediate: srsEntries.filter(
      (s) => s.repetition > 1 && s.interval >= 7 && s.interval < 30
    ).length,
    learning: srsEntries.filter((s) => s.repetition > 1 && s.interval < 7).length,
    new: srsEntries.filter((s) => s.repetition <= 1).length,
  };

  const total = srsEntries.length || 1;

  return { srsEntries, stats, total };
}
