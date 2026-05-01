import { useProgressStore } from "@/store/useProgressStore";

export function useSRSAnalytics() {
  const progress = useProgressStore((state) => state.progress);
  const srsEntries = Object.values(progress.srs || {});
  const total = srsEntries.length;

  const categories = {
    critical: srsEntries.filter((s) => s.easeFactor < 1.7).length,
    fragile: srsEntries.filter((s) => s.easeFactor >= 1.7 && s.easeFactor < 2.2).length,
    stable: srsEntries.filter((s) => s.easeFactor >= 2.2 && s.easeFactor < 2.7).length,
    master: srsEntries.filter((s) => s.easeFactor >= 2.7).length,
  };

  const rawData = [
    { label: "Critical", count: categories.critical, color: "#ef4444", desc: "Butuh Review Intensif" },
    { label: "Fragile", count: categories.fragile, color: "#f59e0b", desc: "Memori Kurang Stabil" },
    { label: "Stable", count: categories.stable, color: "#3b82f6", desc: "Penyimpanan Optimal" },
    { label: "Master", count: categories.master, color: "#10b981", desc: "Retensi Permanen" },
  ];

  const maxCount = Math.max(...rawData.map((d) => d.count)) || 1;

  return { total, rawData, maxCount };
}
