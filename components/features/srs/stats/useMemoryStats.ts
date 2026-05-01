import { useProgressStore } from "@/store/useProgressStore";

export function useMemoryStats() {
  const progress = useProgressStore((state) => state.progress);
  const srsEntries = Object.values(progress.srs || {});

  const stats = {
    master: srsEntries.filter((s: any) => s.interval >= 30).length,
    intermediate: srsEntries.filter(
      (s: any) => s.repetition > 1 && s.interval >= 7 && s.interval < 30
    ).length,
    learning: srsEntries.filter((s: any) => s.repetition > 1 && s.interval < 7).length,
    new: srsEntries.filter((s: any) => s.repetition <= 1).length,
  };

  const total = srsEntries.length || 1;

  return { srsEntries, stats, total };
}
