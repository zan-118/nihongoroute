/**
 * @file types.ts
 * @description Definisi tipe data antarmuka (TypeScript interfaces) untuk modul Misi Harian (Daily Quests).
 *
 * @package components/features/dashboard/quests
 * @project NihongoRoute
 */

// ==========================================
// ANTARMUKA DATA (INTERFACES)
// ==========================================
export interface Quest {
  id: string;
  title: string;
  type: "review" | "xp" | "streak";
  target: number;
  rewardXP: number;
  icon: React.ReactNode;
}

