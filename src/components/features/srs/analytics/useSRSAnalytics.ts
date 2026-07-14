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

/**
 * Custom hook to calculate SRS ease factor analytics.
 * Group vocabulary items by memory retention levels.
 * 
 * @returns Analytics data including total active items, categorized counts, and max count.
 */
export function useSRSAnalytics() {
  // Fetch SRS state from store
  const srs = useSRSStore((state) => state.srs);
  
  // Aggregate SRS items by ease factor
  const summary = summarizeSrs(srs);
  const total = summary.active;

  // Map aggregated data to chart-friendly format
  const rawData = [
    { label: "Kritis", count: summary.easeCritical, color: "#ef4444", desc: "Butuh Review Intensif" },
    { label: "Rentan", count: summary.easeFragile, color: "#f59e0b", desc: "Memori Kurang Stabil" },
    { label: "Stabil", count: summary.easeStable, color: "#3b82f6", desc: "Penyimpanan Optimal" },
    { label: "Mahir", count: summary.easeMaster, color: "#10b981", desc: "Retensi Permanen" },
  ];

  // Find highest count. Fallback to 1 prevents division by zero in UI charts.
  const maxCount = Math.max(...rawData.map((d) => d.count)) || 1;

  return { total, rawData, maxCount };
}