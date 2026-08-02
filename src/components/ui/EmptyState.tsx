/**
 * @file EmptyState.tsx
 * @description Komponen Tampilan Kosong (Empty State) premium teranimasi dengan dukungan ikon, tombol aksi, dan tema siber.
 */

"use client";

// ======================
// IMPOR
// ======================
import { m } from "framer-motion";
import { Coffee, IconType } from "@/components/ui/icons";
import { Button } from "@/components/ui/button";
import Link from "next/link";

// ======================
// ANTARMUKA / TIPE DATA
// ======================
/**
 * Props for EmptyState component.
 */
interface EmptyStateProps {
 /** Icon component. Default is Coffee. */
 icon?: IconType;
 /** Main heading text. */
 title: string;
 /** Subtext description. */
 description: string;
 /** Label for action button. */
 actionText?: string;
 /** Destination URL for link action. */
 actionHref?: string;
 /** Click handler for button action. */
 onClick?: () => void;
}

// ======================
// EKSEKUSI UTAMA
// ======================
/**
 * Render animated empty state UI. Show icon, text, optional action button.
 */
export default function EmptyState({
 icon: Icon = Coffee,
 title,
 description,
 actionText,
 actionHref,
 onClick,
}: EmptyStateProps) {
 return (
 <m.div 
 // Animate entry scale and opacity
 initial={{ opacity: 0, scale: 0.95 }}
 animate={{ opacity: 1, scale: 1 }}
 className="bg-card border border-border flex flex-col items-center justify-center p-8 md:p-12 text-center rounded-xl"
 >
 <div className="bg-primary/10 text-primary border border-primary/20 flex items-center justify-center size-24 rounded-lg mb-8">
 <Icon size={48} className="animate-premium-bounce" />
 </div>
 
 <h3 className="text-xl md:text-3xl text-foreground uppercase tracking-tight mb-3">
 {title}
 </h3>
 <p className="text-muted-foreground/80 text-sm md:text-base font-medium max-w-[280px] md:max-w-sm mb-10 leading-relaxed">
 {description}
 </p>

 {actionText && (
 // Render link button if href exists, else render button with click handler
 actionHref ? (
 <Button asChild className="h-14 px-10 bg-primary text-primary-foreground hover:bg-primary/92 rounded-lg">
 <Link href={actionHref}>{actionText}</Link>
 </Button>
 ) : (
 <Button onClick={onClick} className="h-14 px-10 bg-primary text-primary-foreground hover:bg-primary/92 rounded-lg">
 {actionText}
 </Button>
 )
 )}
 </m.div>
 );
}