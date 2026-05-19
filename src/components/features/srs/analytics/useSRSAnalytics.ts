import { useUserStore } from "@/store/useUserStore";
import { useSRSStore } from "@/store/useSRSStore";
import { useUIStore } from "@/store/useUIStore";

export function useSRSAnalytics() {
  const name = useUserStore((state) => state.name);
  const xp = useUserStore((state) => state.xp);
  const level = useUserStore((state) => state.level);
  const streak = useUserStore((state) => state.streak);
  const todayReviewCount = useUserStore((state) => state.todayReviewCount);
  const lastStudyDate = useUserStore((state) => state.lastStudyDate);
  const studyDays = useUserStore((state) => state.studyDays);
  const inventory = useUserStore((state) => state.inventory);
  const srs = useSRSStore((state) => state.srs);
  const notifications = useUIStore((state) => state.notifications);
  const settings = useUIStore((state) => state.settings);
    const progress = { name, xp, level, streak, todayReviewCount, lastStudyDate, studyDays, inventory, srs, notifications, settings };
  const srsEntries = Object.values(progress.srs || {});
  const total = srsEntries.length;

  const categories = {
    critical: srsEntries.filter((s) => s.easeFactor < 1.7).length,
    fragile: srsEntries.filter((s) => s.easeFactor >= 1.7 && s.easeFactor < 2.2).length,
    stable: srsEntries.filter((s) => s.easeFactor >= 2.2 && s.easeFactor < 2.7).length,
    master: srsEntries.filter((s) => s.easeFactor >= 2.7).length,
  };

  const rawData = [
    { label: "Kritis", count: categories.critical, color: "#ef4444", desc: "Butuh Review Intensif" },
    { label: "Rentan", count: categories.fragile, color: "#f59e0b", desc: "Memori Kurang Stabil" },
    { label: "Stabil", count: categories.stable, color: "#3b82f6", desc: "Penyimpanan Optimal" },
    { label: "Mahir", count: categories.master, color: "#10b981", desc: "Retensi Permanen" },
  ];

  const maxCount = Math.max(...rawData.map((d) => d.count)) || 1;

  return { total, rawData, maxCount };
}
