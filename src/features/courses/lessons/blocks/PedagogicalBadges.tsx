"use client";

import React from "react";
import { AlertTriangle, BookOpen, Globe, Info, BarChart, Hourglass } from "@/components/ui/icons";
import { ContentBlock } from "@/types/database";

/**
 * Renders pedagogical metadata badges (role, stage, reading time) for a content block.
 */
export function PedagogicalBadges({ block }: { block: ContentBlock }) {
 const { pedagogical_role, difficulty_stage, estimated_reading_time } = block;

 if (!pedagogical_role && !difficulty_stage && !estimated_reading_time) return null;

 const roleMeta = {
 core_explanation: {
 label: "Penjelasan Utama",
 icon: BookOpen,
 className: "text-primary",
 style: { backgroundColor: "hsl(var(--primary)/0.1)", borderColor: "hsl(var(--primary)/0.2)", borderWidth: "1px" },
 },
 practical_scenario: {
 label: "Skenario Praktis",
 icon: Globe,
 className: "text-success",
 style: { backgroundColor: "hsl(var(--success)/0.1)", borderColor: "hsl(var(--success)/0.2)", borderWidth: "1px" },
 },
 pitfall_alert: {
 label: "Tips & Perangkap",
 icon: AlertTriangle,
 className: "text-destructive",
 style: { backgroundColor: "hsl(var(--destructive)/0.1)", borderColor: "hsl(var(--destructive)/0.2)", borderWidth: "1px" },
 },
 cultural_note: {
 label: "Catatan Budaya",
 icon: Info,
 className: "text-warning",
 style: { backgroundColor: "hsl(var(--warning)/0.1)", borderColor: "hsl(var(--warning)/0.2)", borderWidth: "1px" },
 },
 };

 const stageMeta = {
 introducing: {
 label: "Tahap: Pengenalan",
 className: "text-muted-foreground border border-border bg-muted/50",
 style: {},
 },
 guided: {
 label: "Tahap: Terbimbing",
 className: "text-secondary",
 style: { backgroundColor: "hsl(var(--secondary)/0.15)", borderColor: "hsl(var(--secondary)/0.2)", borderWidth: "1px" },
 },
 autonomous: {
 label: "Tahap: Mandiri",
 className: "text-success",
 style: { backgroundColor: "hsl(var(--success)/0.15)", borderColor: "hsl(var(--success)/0.2)", borderWidth: "1px" },
 },
 };

 const role = pedagogical_role ? roleMeta[pedagogical_role] : null;
 const stage = difficulty_stage ? stageMeta[difficulty_stage] : null;

 return (
 <div className="flex flex-wrap gap-2 mb-3.5 items-center">
 {role && (
 <span 
 className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wider ${role.className}`}
 style={role.style}
 >
 <role.icon className="size-3.5" />
 {role.label}
 </span>
 )}
 {stage && (
 <span 
 className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${stage.className}`}
 style={stage.style}
 >
 <BarChart className="size-3 mr-1" />
 {stage.label}
 </span>
 )}
 {estimated_reading_time && (
 <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-muted/50 text-muted-foreground border border-border/60">
 <Hourglass className="size-3 mr-1 text-muted-foreground/75" />
 {estimated_reading_time} menit baca
 </span>
 )}
 </div>
 );
}
