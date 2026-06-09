/**
 * @file useSRSAnalytics.ts
 * @description Hook kustom (Custom Hook) untuk kalkulasi performa ingatan (SRS Ease Factor Analytics).
 * Mengelompokkan item kosakata berdasarkan bobot kemudahan mengingat (Ease Factor: Kritis, Rentan, Stabil, Mahir).
 */

// ======================
// IMPOR
// ======================
import { useSRSStore } from "@/store/useSRSStore";
import { summarizeSrs } from "@/lib/srs-summary";

// ======================
// HOOK UTAMA
// ======================
export function useSRSAnalytics() {
  const srs = useSRSStore((state) => state.srs);
  const summary = summarizeSrs(srs);
  const total = summary.active;

  const rawData = [
    { label: "Kritis", count: summary.easeCritical, color: "#ef4444", desc: "Butuh Review Intensif" },
    { label: "Rentan", count: summary.easeFragile, color: "#f59e0b", desc: "Memori Kurang Stabil" },
    { label: "Stabil", count: summary.easeStable, color: "#3b82f6", desc: "Penyimpanan Optimal" },
    { label: "Mahir", count: summary.easeMaster, color: "#10b981", desc: "Retensi Permanen" },
  ];

  const maxCount = Math.max(...rawData.map((d) => d.count)) || 1;

  return { total, rawData, maxCount };
}
