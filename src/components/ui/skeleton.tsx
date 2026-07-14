/**
 * @file skeleton.tsx
 * @description Komponen pemuat sementara dengan animasi brand shimmer.
 */

import { cn } from "@/lib/utils";

/**
 * Placeholder preview component. Show loading state.
 * @param props - HTML div element attributes.
 */
function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      // Apply brand shimmer animation and rounded corners.
      className={cn("skeleton-brand rounded-xl", className)}
      {...props}
    />
  );
}

export { Skeleton };