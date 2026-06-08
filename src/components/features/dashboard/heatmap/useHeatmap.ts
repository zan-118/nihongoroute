/**
 * @file useHeatmap.ts
 * @description Hook kustom untuk menghasilkan urutan tanggal 35 hari terakhir secara lokal,
 * serta fungsi utilitas untuk menentukan style warna kotak heatmap berdasarkan intensitas kata yang dipelajari.
 *
 * @package components/features/dashboard/heatmap
 * @project NihongoRoute
 */

// ==========================================
// IMPOR
// ==========================================
import { useMemo } from "react";

// ==========================================
// FUNGSI UTILITAS LOKAL
// ==========================================
/**
 * Memformat objek Date ke dalam format string ISO lokal YYYY-MM-DD.
 * @param date Objek waktu yang akan diformat
 * @returns Tanggal dalam bentuk string
 */
function formatLocalDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * Menghasilkan daftar tanggal 35 hari terakhir hingga hari ini.
 * @param n Jumlah hari ke belakang
 * @returns Array berisi string tanggal YYYY-MM-DD
 */
function generateLastNDays(n: number): string[] {
  const days: string[] = [];
  const today = new Date();

  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    days.push(formatLocalDate(d));
  }
  return days;
}

// ==========================================
// EKSPOR UTAS (UTILITIES & HOOKS)
// ==========================================
/**
 * Menentukan kelas gaya visual CSS (warna & bayangan) kotak berdasarkan intensitas belajar.
 * @param value Jumlah kata yang dipelajari pada hari tersebut
 * @returns Daftar kelas gaya Tailwind CSS
 */
export function getBoxStyle(value: number): string {
  if (!value)
    return "bg-background/40 border-border neo-inset shadow-none opacity-30";
  if (value < 10)
    return "bg-primary/20 border-primary/30 shadow-[0_0_10px_rgb(var(--primary-rgb)/0.1)] neo-card shadow-none";
  if (value < 30)
    return "bg-primary/50 border-primary/60 shadow-[0_0_20px_rgb(var(--primary-rgb)/0.3)] neo-card shadow-none";
  return "bg-primary border-border shadow-[0_0_25px_rgb(var(--primary-rgb)/0.7)] neo-card shadow-none";
}

/**
 * Hook useHeatmap
 * Membungkus hasil generate tanggal agar stabil antar render (memoized).
 */
export function useHeatmap() {
  const days = useMemo(() => generateLastNDays(35), []);
  return { days };
}

