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
 * Hook useMemoryStats
 * Menghitung status penguasaan memori dari data SRS yang tersimpan di Zustand store.
 *
 * @returns Kumpulan entri SRS aktif, statistik per kategori, dan total entri
 */
export function useMemoryStats() {
  const srs = useSRSStore(s => s.srs);
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

  const total = summary.active || 1;

  return { activeCount: summary.active, stats, total };
}
