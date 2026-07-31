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
    "border border-border/70 bg-card text-card-foreground shadow-sm",
  interactive:
    "border border-border/70 bg-card text-card-foreground shadow-sm transition-all duration-200 hover:border-primary/40 hover:shadow-md cursor-pointer",
  metric:
    "border border-primary/20 bg-gradient-to-br from-card to-primary/5 text-card-foreground shadow-sm",
  control:
    "border border-border/60 bg-muted/40 text-foreground p-4 shadow-inner",
  table:
    "border border-border/70 bg-card text-card-foreground shadow-sm overflow-hidden",
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
