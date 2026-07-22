"use client";

/**
 * @file ReviewModeCard.tsx
 * @description Komponen visual kartu pemilih mode ulasan (Review Mode Card).
 * Menyediakan tampilan adaptif berdasarkan status ketersediaan kartu review (aktif/dinonaktifkan) dan skema warna semantik.
 */

// ======================
// IMPOR
// ======================
import React from "react";
import { ArrowRight, IconType } from "@/components/ui/icons";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

// ======================
// ANTARMUKA & TIPE
// ======================
/**
 * Props for ReviewModeCard component.
 */
interface ReviewModeCardProps {
  /** Callback function triggered on card click */
  onClick: () => void;
  /** Flag indicating if the card is active and clickable */
  isEnabled: boolean;
  /** Lucide icon component to display */
  icon: IconType;
  /** Optional count of items available for review */
  count?: number;
  /** Label text for the badge */
  badgeLabel?: string;
  /** Title of the review mode */
  title: string;
  /** Description of the review mode */
  description: string;
  /** Action text shown when card is enabled */
  actionLabel: string;
  /** Disabled text shown when card is disabled */
  disabledLabel: string;
  /** Accent color theme for the card */
  accentColor: "primary" | "amber";
}

// ======================
// EKSEKUSI UTAMA
// ======================
/**
 * Card component for selecting review modes.
 * Renders interactive card with dynamic styles based on state and accent color.
 */
export function ReviewModeCard({
  onClick,
  isEnabled,
  icon: Icon,
  count,
  badgeLabel,
  title,
  description,
  actionLabel,
  disabledLabel,
  accentColor,
}: ReviewModeCardProps) {
  // Check if primary accent color is used
  const isPrimary = accentColor === "primary";

  // Define styles for active state based on accent color
  const activeStyles = isPrimary
    ? "border-primary/20 bg-card/50 hover:border-primary/50 hover:shadow-2xl hover:shadow-primary/5"
    : "border-warning/20 bg-card/50 hover:border-warning/50 hover:shadow-2xl hover:shadow-amber-500/5";

  // Define container styles for icon based on state and accent
  const iconContainerStyles = isEnabled
    ? isPrimary
      ? "bg-primary/10 border border-primary/20"
      : "bg-warning/10 border border-warning/20"
    : "bg-muted border border-border";

  // Define icon color based on state and accent
  const iconColorStyles = isEnabled
    ? isPrimary ? "text-primary" : "text-warning"
    : "text-muted-foreground";

  // Define text color based on accent
  const textColorStyles = isPrimary ? "text-primary" : "text-warning";

  return (
    <Card
      // Trigger click handler only if card is enabled
      onClick={() => isEnabled && onClick()}
      className={`group relative p-8 rounded-2xl md:rounded-3xl border transition-all duration-500 overflow-hidden cursor-pointer ${
        isEnabled ? activeStyles : "border-border bg-muted/20 opacity-80"
      }`}
    >
      <div className="relative z-10 flex flex-col gap-6">
        <div className="flex justify-between items-start">
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-inner transition-transform duration-500 group-hover:scale-110 ${iconContainerStyles}`}>
            <Icon className={iconColorStyles} size={28} />
          </div>
          <Badge
            variant="outline"
            className={isEnabled && isPrimary ? "bg-primary/10 border-primary/30 text-primary" : "bg-muted text-muted-foreground"}
          >
            {count !== undefined ? `${count} ${badgeLabel}` : badgeLabel}
          </Badge>
        </div>
        <div>
          <h2 className="text-2xl font-black text-foreground uppercase tracking-tight mb-2">{title}</h2>
          <p className="text-muted-foreground text-sm leading-relaxed font-medium">
            {description}
          </p>
        </div>
        <div className={`flex items-center gap-2 pt-2 ${textColorStyles} font-black uppercase tracking-widest text-[10px]`}>
          {isEnabled ? actionLabel : disabledLabel} <ArrowRight size={14} />
        </div>
      </div>
    </Card>
  );
}