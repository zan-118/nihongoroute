/**
 * @file dropdown-menu.tsx
 * @description Komponen Menu Dropdown (Dropdown Menu) atomik berbasis Radix UI dengan estetika Cyber-glass.
 */

"use client"

// ======================
// IMPOR
// ======================
import * as React from "react"
import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu"
import { Check, ChevronRight, Circle } from "@/components/ui/icons"
import { cn } from "@/lib/utils"

// ======================
// EKSEKUSI UTAMA
// ======================

/**
 * Root container. Manage state.
 */
const DropdownMenu = DropdownMenuPrimitive.Root

/**
 * Open menu. Receive click.
 */
const DropdownMenuTrigger = DropdownMenuPrimitive.Trigger

/**
 * Group items. Assist screen readers.
 */
const DropdownMenuGroup = DropdownMenuPrimitive.Group

/**
 * Render content outside DOM tree. Prevent overflow clip.
 */
const DropdownMenuPortal = DropdownMenuPrimitive.Portal

/**
 * Sub-menu container. Manage nested state.
 */
const DropdownMenuSub = DropdownMenuPrimitive.Sub

/**
 * Group radio items. Manage single selection.
 */
const DropdownMenuRadioGroup = DropdownMenuPrimitive.RadioGroup

/**
 * Trigger nested menu. Show arrow icon.
 */
const DropdownMenuSubTrigger = React.forwardRef<
 React.ElementRef<typeof DropdownMenuPrimitive.SubTrigger>,
 React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.SubTrigger> & {
 inset?: boolean
 }
>(({ className, inset, children, ...props }, ref) => (
 <DropdownMenuPrimitive.SubTrigger
 ref={ref}
 className={cn(
 "flex cursor-default select-none items-center rounded-xl px-3 py-2 text-sm font-medium outline-none transition-colors focus:bg-muted focus:text-foreground data-[state=open]:bg-muted data-[state=open]:text-foreground",
 inset && "pl-8", // Shift right if inset prop active
 className
 )}
 {...props}
 >
 {children}
 <ChevronRight className="ml-auto size-4" />
 </DropdownMenuPrimitive.SubTrigger>
))
DropdownMenuSubTrigger.displayName =
 DropdownMenuPrimitive.SubTrigger.displayName

/**
 * Container for nested items. Animate entry.
 */
const DropdownMenuSubContent = React.forwardRef<
 React.ElementRef<typeof DropdownMenuPrimitive.SubContent>,
 React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.SubContent>
>(({ className, ...props }, ref) => (
 <DropdownMenuPrimitive.SubContent
 ref={ref}
 className={cn(
 "bg-card border border-border z-50 min-w-[8rem] overflow-hidden rounded-[14px] p-1.5 text-card-foreground shadow-[0_8px_20px_rgba(0,0,0,0.1)] transform-gpu data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in- data-[side=left]:slide-in- data-[side=right]:slide-in- data-[side=top]:slide-in-",
 className
 )}
 {...props}
 />
))
DropdownMenuSubContent.displayName =
 DropdownMenuPrimitive.SubContent.displayName

/**
 * Main container. Position relative to trigger.
 */
const DropdownMenuContent = React.forwardRef<
 React.ElementRef<typeof DropdownMenuPrimitive.Content>,
 React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Content>
>(({ className, sideOffset = 4, ...props }, ref) => (
 <DropdownMenuPrimitive.Portal>
 <DropdownMenuPrimitive.Content
 ref={ref}
 sideOffset={sideOffset}
 className={cn(
 "bg-card border border-border z-50 min-w-[8rem] max-w-[calc(100vw-2rem)] overflow-hidden rounded-[14px] p-1.5 text-card-foreground shadow-[0_8px_20px_rgba(0,0,0,0.1)] transform-gpu data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in- data-[side=left]:slide-in- data-[side=right]:slide-in- data-[side=top]:slide-in-",
 className
 )}
 {...props}
 />
 </DropdownMenuPrimitive.Portal>
))
DropdownMenuContent.displayName = DropdownMenuPrimitive.Content.displayName

/**
 * Standard interactive item. Handle click.
 */
const DropdownMenuItem = React.forwardRef<
 React.ElementRef<typeof DropdownMenuPrimitive.Item>,
 React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Item> & {
 inset?: boolean
 }
>(({ className, inset, ...props }, ref) => (
 <DropdownMenuPrimitive.Item
 ref={ref}
 className={cn(
 "relative flex cursor-default select-none items-center rounded-xl px-3 py-2 text-sm font-medium outline-none transition-colors focus:bg-muted focus:text-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
 inset && "pl-8", // Shift right if inset prop active
 className
 )}
 {...props}
 />
))
DropdownMenuItem.displayName = DropdownMenuPrimitive.Item.displayName

/**
 * Toggleable item. Show checkmark when active.
 */
const DropdownMenuCheckboxItem = React.forwardRef<
 React.ElementRef<typeof DropdownMenuPrimitive.CheckboxItem>,
 React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.CheckboxItem>
>(({ className, children, checked, ...props }, ref) => (
 <DropdownMenuPrimitive.CheckboxItem
 ref={ref}
 className={cn(
 "relative flex cursor-default select-none items-center rounded-xl py-2 pl-8 pr-3 text-sm font-medium outline-none transition-colors focus:bg-muted focus:text-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
 className
 )}
 checked={checked}
 {...props}
 >
 <span className="absolute left-2 flex size-3.5 items-center justify-center">
 <DropdownMenuPrimitive.ItemIndicator>
 <Check className="size-4" />
 </DropdownMenuPrimitive.ItemIndicator>
 </span>
 {children}
 </DropdownMenuPrimitive.CheckboxItem>
))
DropdownMenuCheckboxItem.displayName =
 DropdownMenuPrimitive.CheckboxItem.displayName

/**
 * Single-select item. Show dot when active.
 */
const DropdownMenuRadioItem = React.forwardRef<
 React.ElementRef<typeof DropdownMenuPrimitive.RadioItem>,
 React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.RadioItem>
>(({ className, children, ...props }, ref) => (
 <DropdownMenuPrimitive.RadioItem
 ref={ref}
 className={cn(
 "relative flex cursor-default select-none items-center rounded-xl py-2 pl-8 pr-3 text-sm font-medium outline-none transition-colors focus:bg-muted focus:text-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
 className
 )}
 {...props}
 >
 <span className="absolute left-2 flex size-3.5 items-center justify-center">
 <DropdownMenuPrimitive.ItemIndicator>
 <Circle className="size-2 fill-current" />
 </DropdownMenuPrimitive.ItemIndicator>
 </span>
 {children}
 </DropdownMenuPrimitive.RadioItem>
))
DropdownMenuRadioItem.displayName = DropdownMenuPrimitive.RadioItem.displayName

/**
 * Section header. Non-interactive text.
 */
const DropdownMenuLabel = React.forwardRef<
 React.ElementRef<typeof DropdownMenuPrimitive.Label>,
 React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Label> & {
 inset?: boolean
 }
>(({ className, inset, ...props }, ref) => (
 <DropdownMenuPrimitive.Label
 ref={ref}
 className={cn(
 "px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground",
 inset && "pl-8", // Shift right if inset prop active
 className
 )}
 {...props}
 />
))
DropdownMenuLabel.displayName = DropdownMenuPrimitive.Label.displayName

/**
 * Divider line. Separate sections.
 */
const DropdownMenuSeparator = React.forwardRef<
 React.ElementRef<typeof DropdownMenuPrimitive.Separator>,
 React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Separator>
>(({ className, ...props }, ref) => (
 <DropdownMenuPrimitive.Separator
 ref={ref}
 className={cn("-mx-1 my-1 h-px bg-border", className)}
 {...props}
 />
))
DropdownMenuSeparator.displayName = DropdownMenuPrimitive.Separator.displayName

/**
 * Keyboard shortcut text. Align right.
 */
const DropdownMenuShortcut = ({
 className,
 ...props
}: React.HTMLAttributes<HTMLSpanElement>) => {
 return (
 <span
 className={cn("ml-auto text-xs tracking-widest opacity-60", className)}
 {...props}
 />
 )
}
DropdownMenuShortcut.displayName = "DropdownMenuShortcut"

export {
 DropdownMenu,
 DropdownMenuTrigger,
 DropdownMenuContent,
 DropdownMenuItem,
 DropdownMenuCheckboxItem,
 DropdownMenuRadioItem,
 DropdownMenuLabel,
 DropdownMenuSeparator,
 DropdownMenuShortcut,
 DropdownMenuGroup,
 DropdownMenuPortal,
 DropdownMenuSub,
 DropdownMenuSubContent,
 DropdownMenuSubTrigger,
 DropdownMenuRadioGroup,
}