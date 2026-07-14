/**
 * @file label.tsx
 * @description Komponen Label (Label) atomik dengan dukungan variasi gaya.
 */

"use client";

// ======================
// IMPOR
// ======================
import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

// ======================
// EKSEKUSI UTAMA
// ======================

/**
 * Style variants for Label component.
 * Define base classes for text size, weight, line height, and peer-disabled states.
 */
const labelVariants = cva(
  "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
);

/**
 * Label component.
 * Render HTML label element with styled variants. Forward ref to underlying DOM node.
 */
const Label = React.forwardRef<
  HTMLLabelElement,
  React.LabelHTMLAttributes<HTMLLabelElement> &
    VariantProps<typeof labelVariants>
>(({ className, ...props }, ref) => (
  <label
    ref={ref}
    // Merge default label styles with custom className.
    className={cn(labelVariants(), className)}
    {...props}
  />
));
Label.displayName = "Label";

export { Label };