"use client";

import React from "react";
import { ArrowRight, LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface ReviewModeCardProps {
  onClick: () => void;
  isEnabled: boolean;
  icon: LucideIcon;
  count?: number;
  badgeLabel?: string;
  title: string;
  description: string;
  actionLabel: string;
  disabledLabel: string;
  accentColor: "primary" | "amber";
}

/**
 * Komponen kartu pilihan mode review.
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
  const isPrimary = accentColor === "primary";

  const activeStyles = isPrimary
    ? "border-primary/20 bg-card/50 hover:border-primary/50 hover:shadow-2xl hover:shadow-primary/5"
    : "border-warning/20 bg-card/50 hover:border-warning/50 hover:shadow-2xl hover:shadow-amber-500/5";

  const iconContainerStyles = isEnabled
    ? isPrimary
      ? "bg-primary/10 border border-primary/20"
      : "bg-warning/10 border border-warning/20"
    : "bg-muted border border-border";

  const iconColorStyles = isEnabled
    ? isPrimary ? "text-primary" : "text-warning"
    : "text-muted-foreground";

  const textColorStyles = isPrimary ? "text-primary" : "text-warning";

  return (
    <Card
      onClick={() => isEnabled && onClick()}
      className={`group relative p-8 rounded-[2rem] border transition-all duration-500 overflow-hidden cursor-pointer ${
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
