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
 { id: "N5", label: "N5", color: "bg-primary/10 text-primary border-primary/20" },
 { id: "N4", label: "N4", color: "bg-success/10 text-success border-success/20" },
 { id: "N3", label: "N3", color: "bg-warning/10 text-warning border-warning/20" },
 { id: "N2", label: "N2", color: "bg-secondary/10 text-secondary border-secondary/20" },
 { id: "N1", label: "N1", color: "bg-destructive/10 text-destructive border-destructive/20" }
];

export const AMOUNTS: number[] = [10, 20, 50, 100];
