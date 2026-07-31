/**
 * @file useMemoryStats.ts
 * @description Hook kustom untuk menghitung statistik ingatan Spaced Repetition System (SRS) pengguna.
 * Mengelompokkan item SRS aktif berdasarkan tingkat penguasaan (Master, Intermediate, Learning, New).
 *
 * @package components/features/srs/stats
 * @project NihongoRoute
 */

// ==========================================
// IMPOR
// ==========================================
import { useSRSStore } from "@/store/useSRSStore";
import { summarizeSrs } from "@/lib/srs-summary";

// ==========================================
// HOOK UTAMA
// ==========================================
/**
 * Custom hook to calculate SRS memory retention statistics.
 * Fetches SRS items from Zustand store and groups them by mastery level.
 *
 * @returns Object containing active count, grouped stats, and total count.
 */
export function useMemoryStats() {
  // Fetch SRS items from Zustand store
  const srs = useSRSStore(s => s.srs);
  
  // Summarize SRS items into mastery levels
  const summary = summarizeSrs(srs);

  // Mengelompokkan entri SRS berdasarkan kriteria interval hari dan repetisi
  const stats = {
    // Mahir (Master): interval >= 30 hari
    master: summary.master,
    // Menengah (Intermediate): interval 7 s.d 29 hari dan sudah diulang > 1 kali
    intermediate: summary.intermediate,
    // Sedang Dipelajari (Learning): interval < 7 hari dan sudah diulang > 1 kali
    learning: summary.learning,
    // Baru (New): baru diulang <= 1 kali
    new: summary.new,
  };

  // Fallback to 1 to prevent division by zero in UI calculations
  const total = summary.active || 1;

  return { activeCount: summary.active, stats, total };
}