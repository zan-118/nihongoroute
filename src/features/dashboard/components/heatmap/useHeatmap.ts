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
 * Format Date object to YYYY-MM-DD local string.
 * @param date Date object to format.
 * @returns Formatted date string.
 */
function formatLocalDate(date: Date): string {
  const year = date.getFullYear();
  // Pad single digits with leading zero for standard ISO format
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * Generate array of date strings for last N days.
 * @param n Number of days to generate.
 * @returns Array of YYYY-MM-DD date strings.
 */
function generateLastNDays(n: number): string[] {
  const days: string[] = [];
  const today = new Date();

  // Loop backwards to get dates from oldest to today
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
 * Get Tailwind CSS classes based on word count intensity.
 * @param value Number of words learned.
 * @returns Tailwind CSS class string.
 */
export function getBoxStyle(value: number): string {
  // Zero words: empty state
  if (!value)
    return "bg-background/40 border-border neo-inset shadow-none opacity-30";
  // Low intensity: < 10 words
  if (value < 10)
    return "bg-primary/20 border-primary/30 shadow-[0_0_10px_rgb(var(--primary-rgb)/0.1)] neo-card shadow-none";
  // Medium intensity: < 30 words
  if (value < 30)
    return "bg-primary/50 border-primary/60 shadow-[0_0_20px_rgb(var(--primary-rgb)/0.3)] neo-card shadow-none";
  // High intensity: >= 30 words
  return "bg-primary border-border shadow-[0_0_25px_rgb(var(--primary-rgb)/0.7)] neo-card shadow-none";
}

/**
 * Hook to get memoized list of last 35 days.
 * @returns Object containing days array.
 */
export function useHeatmap() {
  // Cache 35-day range to prevent recalculation on re-render
  const days = useMemo(() => generateLastNDays(35), []);
  return { days };
}