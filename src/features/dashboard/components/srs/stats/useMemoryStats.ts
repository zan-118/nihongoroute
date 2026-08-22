/**
 * @file useMemoryStats.ts
 * @description Custom hook for calculating Spaced Repetition System (SRS) memory retention statistics.
 * Groups active SRS items by mastery level (Master, Intermediate, Learning, New).
 * @module features/dashboard/components/srs/stats
 */

// Import & Dependencies

import { useSRSStore } from "@/store/useSRSStore";
import { summarizeSrs } from "@/lib/srs-summary";

// Main Custom Hook

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

 // Group SRS entries by interval days and repetition thresholds
 const stats = {
 // Master: interval >= 30 days
 master: summary.master,
 // Intermediate: interval 7..29 days and repetitions > 1
 intermediate: summary.intermediate,
 // Learning: interval < 7 days and repetitions > 1
 learning: summary.learning,
 // New: repetitions <= 1
 new: summary.new,
 };

 // Fallback to 1 to prevent division by zero in UI calculations
 const total = summary.active || 1;

 return { activeCount: summary.active, stats, total };
}