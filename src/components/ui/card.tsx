/**
 * @file card.tsx
 * @description Komponen Kartu (Card) atomik dengan estetika Bento / Cyber-glass (neo-card).
 */

// ======================
// IMPOR
// ======================
import * as React from "react"
import { cn } from "@/lib/utils"

// ======================
// EKSEKUSI UTAMA
// ======================
/**
 * Root card container. Apply neo-card styling.
 */
const Card = React.forwardRef<
 HTMLDivElement,
 React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
 <div
 ref={ref}
 className={cn(
 "rounded-[14px] border border-border bg-card text-card-foreground",
 className
 )}
 {...props}
 />
))
Card.displayName = "Card"

/**
 * Header container for card. Stack children vertically.
 */
const CardHeader = React.forwardRef<
 HTMLDivElement,
 React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
 <div
 ref={ref}
 className={cn("flex flex-col space-y-2 p-6", className)}
 {...props}
 />
))
CardHeader.displayName = "CardHeader"

/**
 * Card title. Bold, uppercase, tight tracking.
 */
const CardTitle = React.forwardRef<
 HTMLDivElement,
 React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
 <div
 ref={ref}
 className={cn(
 "text-[18px] font-semibold leading-[1.4] tracking-normal",
 className
 )}
 {...props}
 />
))
CardTitle.displayName = "CardTitle"

/**
 * Card description. Muted text color.
 */
const CardDescription = React.forwardRef<
 HTMLDivElement,
 React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
 <div
 ref={ref}
 className={cn("text-sm font-medium leading-relaxed text-muted-foreground", className)}
 {...props}
 />
))
CardDescription.displayName = "CardDescription"

/**
 * Main content area. Padding top zeroed.
 */
const CardContent = React.forwardRef<
 HTMLDivElement,
 React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
 <div 
 ref={ref} 
 // pt-0 prevent double padding when header present
 className={cn("p-6 pt-0", className)} 
 {...props} 
 />
))
CardContent.displayName = "CardContent"

/**
 * Footer container. Align items center.
 */
const CardFooter = React.forwardRef<
 HTMLDivElement,
 React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
 <div
 ref={ref}
 // pt-0 prevent double padding when content present
 className={cn("flex items-center p-6 pt-0", className)}
 {...props}
 />
))
CardFooter.displayName = "CardFooter"

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent }