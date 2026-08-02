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
 "inline-flex items-center rounded-[4px] border px-2 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
 {
 variants: {
 variant: {
 default: "border-transparent bg-muted text-foreground hover:bg-muted/80",
 secondary: "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
 destructive: "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
 outline: "text-foreground",
 success: "border-transparent bg-success text-success-foreground hover:bg-success/80",
 warning: "border-transparent bg-warning text-warning-foreground hover:bg-warning/80",
 ghost: "border-transparent bg-transparent text-muted-foreground hover:bg-muted/50 hover:text-foreground",
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