"use client";

/**
 * @file ReviewModeCard.tsx
 * @description Komponen visual kartu pemilih mode ulasan (Review Mode Card).
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
export interface ReviewModeCardProps {
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
 <div
 onClick={() => isEnabled && onClick()}
 className={`relative group transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] ${
 isEnabled ? "cursor-pointer" : "opacity-50 pointer-events-none"
 }`}
 >
 <div className="absolute -top-1.5 -right-1.5 w-3.5 h-3.5 pointer-events-none z-20">
 <div 
 className="absolute top-0 right-0 w-3.5 h-px transition-colors duration-500" 
 style={{ backgroundColor: isEnabled ? (isPrimary ? "var(--primary)" : "var(--warning)") : "var(--muted)" }}
 />
 <div 
 className="absolute top-0 right-0 w-px h-3.5 transition-colors duration-500" 
 style={{ backgroundColor: isEnabled ? (isPrimary ? "var(--primary)" : "var(--warning)") : "var(--muted)" }}
 />
 </div>

 <Card
 className="h-full bg-card border border-border/50 dark:border-white/10 rounded-2xl p-8 transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] shadow-[0_4px_25px_rgba(0,0,0,0.015)] group-hover:border-primary/50"
 >
 <div className="relative z-10 flex flex-col gap-6">
 <div className="flex justify-between items-start">
 <div className={`w-14 h-14 rounded-lg flex items-center justify-center shadow-inner transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:scale-105 ${iconContainerStyles}`}>
 <Icon className={iconColorStyles} size={28} />
 </div>
 <Badge
 variant="outline"
 className={isEnabled && isPrimary ? "bg-primary/10 border-primary/30 text-primary rounded-[4px]" : "bg-muted text-muted-foreground rounded-[4px]"}
 >
 {count !== undefined ? `${count} ${badgeLabel}` : badgeLabel}
 </Badge>
 </div>
 <div>
 <h2 className="text-2xl font-bold text-foreground uppercase tracking-tight mb-2 duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:text-primary">{title}</h2>
 <p className="text-muted-foreground text-sm leading-relaxed font-semibold">
 {description}
 </p>
 </div>
 <div className={`flex items-center gap-2.5 pt-2 ${textColorStyles} font-black uppercase tracking-widest text-[10px]`}>
 {isEnabled ? actionLabel : disabledLabel} 
 <div className="w-6 h-6 rounded-full bg-foreground/5 flex items-center justify-center group-hover:translate-x-1 transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]">
 <ArrowRight size={12} />
 </div>
 </div>
 </div>
 </Card>
 </div>
 );
}

export default ReviewModeCard;
