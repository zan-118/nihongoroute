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
 { id: "N5", label: "N5", color: "bg-[hsl(var(--primary)/0.1)] text-primary border-[hsl(var(--primary)/0.2)]" },
 { id: "N4", label: "N4", color: "bg-[hsl(var(--success)/0.1)] text-success border-[hsl(var(--success)/0.2)]" },
 { id: "N3", label: "N3", color: "bg-[hsl(var(--warning)/0.1)] text-warning border-[hsl(var(--warning)/0.2)]" },
 { id: "N2", label: "N2", color: "bg-[hsl(var(--secondary)/0.1)] text-secondary border-[hsl(var(--secondary)/0.2)]" },
 { id: "N1", label: "N1", color: "bg-[hsl(var(--destructive)/0.1)] text-destructive border-[hsl(var(--destructive)/0.2)]" }
];

export const AMOUNTS: number[] = [10, 20, 50, 100];
