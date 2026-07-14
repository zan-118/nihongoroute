/**
 * @file badge.tsx
 * @description Komponen lencana atomik dengan gaya glass/cyan-first yang konsisten.
 */

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

/**
 * Style variants for Badge component.
 * Use CVA to manage Tailwind classes.
 */
const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-black uppercase tracking-[0.14em] transition-all focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "badge-premium",
        secondary: "border-secondary/25 bg-secondary/10 text-secondary hover:bg-secondary/15",
        destructive: "border-destructive/25 bg-destructive/10 text-destructive hover:bg-destructive/15",
        outline: "border-border/70 bg-card/45 text-foreground hover:border-primary/30 hover:text-primary",
        ghost: "border-transparent bg-transparent text-muted-foreground hover:text-primary hover:bg-primary/10",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

/**
 * Props for Badge component.
 * Combine HTML div attributes with CVA variant props.
 */
export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

/**
 * Badge component.
 * Render styled inline-flex container.
 */
function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div 
      // Merge CVA classes with user-provided className
      className={cn(badgeVariants({ variant }), className)} 
      {...props} 
    />
  )
}

export { Badge, badgeVariants }