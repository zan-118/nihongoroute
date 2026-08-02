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
 // Apply standard flat styling and focus ring.
 className={cn(
 "flex h-[48px] w-full rounded-[14px] border border-border bg-transparent px-4 py-2 text-[15px] placeholder:text-muted-foreground file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/30 disabled:cursor-not-allowed disabled:opacity-50 transition-colors",
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