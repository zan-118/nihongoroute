"use client";

/**
 * @file Surface.tsx
 * @description Komponen atomik Surface polimorfik untuk membungkus elemen kartu dan kontainer permukaan.
 * Mengonsolidasikan gaya dekoratif permukaan sesuai token desain di docs/design-system.md.
 */

import * as React from "react";
import { cn } from "@/lib/utils";

export type SurfaceVariant = "default" | "interactive" | "metric" | "control" | "table";

export interface SurfaceProps extends React.HTMLAttributes<HTMLDivElement> {
 variant?: SurfaceVariant;
 className?: string;
 children?: React.ReactNode;
}

const variantStyles: Record<SurfaceVariant, string> = {
 default:
 "border border-border bg-card text-card-foreground",
 interactive:
 "border border-border bg-card text-card-foreground transition-colors duration-200 hover:border-primary/40 cursor-pointer",
 metric:
 "border border-border bg-card text-card-foreground",
 control:
 "border border-border bg-muted text-foreground p-4",
 table:
 "border border-border bg-card text-card-foreground overflow-hidden",
};

export const Surface = React.forwardRef<HTMLDivElement, SurfaceProps>(
 ({ variant = "default", className, children, ...props }, ref) => {
 return (
 <div
 ref={ref}
 style={{ borderRadius: "var(--radius)" }}
 className={cn(variantStyles[variant], className)}
 {...props}
 >
 {children}
 </div>
 );
 }
);

Surface.displayName = "Surface";
