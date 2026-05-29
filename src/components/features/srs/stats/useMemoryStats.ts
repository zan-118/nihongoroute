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
  const srsEntries = Object.values(srs || {}).filter((s) => !s.isDeleted);

  // Mengelompokkan entri SRS berdasarkan kriteria interval hari dan repetisi
  const stats = {
    // Mahir (Master): interval >= 30 hari
    master: srsEntries.filter((s) => s.interval >= 30).length,
    // Menengah (Intermediate): interval 7 s.d 29 hari dan sudah diulang > 1 kali
    intermediate: srsEntries.filter(
      (s) => s.repetition > 1 && s.interval >= 7 && s.interval < 30
    ).length,
    // Sedang Dipelajari (Learning): interval < 7 hari dan sudah diulang > 1 kali
    learning: srsEntries.filter((s) => s.repetition > 1 && s.interval < 7).length,
    // Baru (New): baru diulang <= 1 kali
    new: srsEntries.filter((s) => s.repetition <= 1).length,
  };

  const total = srsEntries.length || 1;

  return { srsEntries, stats, total };
}

