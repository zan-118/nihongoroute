/**
 * @file input.tsx
 * @description Komponen input teks atomik dengan gaya control-surface premium.
 */

import * as React from "react"
import { cn } from "@/lib/utils"

/**
 * Input component.
 * Custom styled HTML input element.
 */
const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        // Apply premium control-surface styling, focus ring, and transition effects.
        className={cn(
          "control-surface flex h-12 w-full px-4 py-2 text-base placeholder:text-muted-foreground/75 file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm transition-all",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }