/**
 * @file button.tsx
 * @description Komponen tombol atomik dengan sistem visual cyan-first yang konsisten di seluruh halaman.
 */

import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

/**
 * Tailwind class generator for button styles. Define variants and sizes.
 */
const buttonVariants = cva(
 "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-[14px] text-[15px] font-medium cursor-pointer transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-40 active:scale-[0.98] [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
 {
 variants: {
 variant: {
 default: "bg-primary text-primary-foreground hover:bg-primary/92",
 destructive: "bg-destructive text-background hover:bg-destructive/92",
 outline: "border border-border bg-background hover:bg-muted text-foreground",
 secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
 ghost: "hover:bg-muted text-foreground",
 link: "h-auto px-0 text-primary underline-offset-4 hover:underline",
 accent: "bg-accent text-accent-foreground hover:bg-accent/92",
 },
 size: {
 default: "h-[44px] px-[20px] py-[10px]",
 sm: "h-[36px] px-3",
 lg: "h-[48px] px-8",
 icon: "size-[44px] p-0",
 },
 },
 defaultVariants: {
 variant: "default",
 size: "default",
 },
 }
)

/**
 * Props for Button component. Combine HTML button attributes with style variants.
 */
export interface ButtonProps
 extends React.ButtonHTMLAttributes<HTMLButtonElement>,
 VariantProps<typeof buttonVariants> {
 /** Change element to child component. Keep styles. */
 asChild?: boolean
}

/**
 * Button component. Render interactive button or custom child element.
 */
const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
 ({ className, variant, size, asChild = false, ...props }, ref) => {
 // Use Radix Slot if asChild true. Allow custom element rendering.
 const Comp = asChild ? Slot : "button"
 return (
 <Comp
 className={cn(buttonVariants({ variant, size, className }))}
 ref={ref}
 {...props}
 />
 )
 }
)
Button.displayName = "Button"

export { Button, buttonVariants }