/**
 * @file skeleton.tsx
 * @description Komponen pemuat sementara dengan animasi brand shimmer.
 */

import { cn } from "@/lib/utils";

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("skeleton-brand rounded-xl", className)}
      {...props}
    />
  );
}

export { Skeleton };
