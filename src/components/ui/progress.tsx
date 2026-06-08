/**
 * @file progress.tsx
 * @description Komponen progress bar atomik dengan gradient cyan-violet.
 */

"use client"

import * as React from "react"
import * as ProgressPrimitive from "@radix-ui/react-progress"
import { cn } from "@/lib/utils"

const Progress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root> & {
    indicatorClassName?: string
  }
>(({ className, value, indicatorClassName, ...props }, ref) => (
  <ProgressPrimitive.Root
    ref={ref}
    className={cn(
      "relative h-3.5 w-full overflow-hidden rounded-full border border-border/60 bg-muted/65 shadow-inner",
      className
    )}
    {...props}
  >
    <ProgressPrimitive.Indicator
      className={cn(
        "h-full w-full flex-1 bg-[linear-gradient(90deg,rgb(var(--brand-cyan-rgb)),rgb(var(--brand-blue-rgb)),rgb(var(--brand-violet-rgb)))] shadow-[0_0_18px_rgb(var(--brand-cyan-rgb)/0.35)] transition-transform duration-500 ease-out",
        indicatorClassName
      )}
      style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
    />
  </ProgressPrimitive.Root>
))
Progress.displayName = ProgressPrimitive.Root.displayName

export { Progress }
