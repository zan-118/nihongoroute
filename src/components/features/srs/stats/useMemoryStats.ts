import { useSRSStore } from "@/store/useSRSStore";

export function useMemoryStats() {
  const srs = useSRSStore(s => s.srs);
  const srsEntries = Object.values(srs || {});

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
