"use client";

import React from "react";
import { Alert, BookOpen, Global, Information, BarChart, Hourglass } from "@/components/ui/icons";
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
      className: "text-primary bg-primary/10 border border-primary/20",
    },
    practical_scenario: {
      label: "Skenario Praktis",
      icon: Global,
      className: "text-success bg-success/10 border border-success/20",
    },
    pitfall_alert: {
      label: "Tips & Perangkap",
      icon: Alert,
      className: "text-destructive bg-destructive/10 border border-destructive/20",
    },
    cultural_note: {
      label: "Catatan Budaya",
      icon: Information,
      className: "text-warning bg-warning/10 border border-warning/20",
    },
  };

  const stageMeta = {
    introducing: {
      label: "Tahap: Pengenalan",
      className: "text-muted-foreground border border-border bg-muted/50",
    },
    guided: {
      label: "Tahap: Terbimbing",
      className: "text-secondary bg-secondary/15 border border-secondary/20",
    },
    autonomous: {
      label: "Tahap: Mandiri",
      className: "text-success bg-success/15 border border-success/20",
    },
  };

 const role = pedagogical_role ? roleMeta[pedagogical_role] : null;
 const stage = difficulty_stage ? stageMeta[difficulty_stage] : null;

 return (
 <div className="flex flex-wrap gap-2 mb-3.5 items-center">
      {role && (
        <span 
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${role.className}`}
        >
          <role.icon className="size-3.5" />
          {role.label}
        </span>
      )}
      {stage && (
        <span 
          className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${stage.className}`}
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
