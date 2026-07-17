/**
 * @file src/lib/constants/learning.ts
 * @description Konstanta statis penunjang game dan kurikulum belajar mandiri.
 */

export interface JlptLevelConfig {
  readonly id: string;
  readonly label: string;
  readonly color: string;
}

export const JLPT_LEVELS: JlptLevelConfig[] = [
  { id: "all", label: "Campur (Semua)", color: "bg-muted text-muted-foreground border-border" },
  { id: "N5", label: "N5", color: "bg-[rgb(var(--primary-rgb)/0.1)] text-primary border-[rgb(var(--primary-rgb)/0.2)]" },
  { id: "N4", label: "N4", color: "bg-[rgb(var(--success-rgb)/0.1)] text-success border-[rgb(var(--success-rgb)/0.2)]" },
  { id: "N3", label: "N3", color: "bg-[rgb(var(--warning-rgb)/0.1)] text-warning border-[rgb(var(--warning-rgb)/0.2)]" },
  { id: "N2", label: "N2", color: "bg-[rgb(var(--secondary-rgb)/0.1)] text-secondary border-[rgb(var(--secondary-rgb)/0.2)]" },
  { id: "N1", label: "N1", color: "bg-[rgb(var(--destructive-rgb)/0.1)] text-destructive border-[rgb(var(--destructive-rgb)/0.2)]" }
];

export const AMOUNTS: number[] = [10, 20, 50, 100];
