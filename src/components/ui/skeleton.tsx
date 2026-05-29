/**
 * @file skeleton.tsx
 * @description Komponen Pemuat Sementara (Skeleton Loader) atomik untuk efek loading ambient.
 */

// ======================
// IMPOR
// ======================
import { cn } from "@/lib/utils";

// ======================
// EKSEKUSI UTAMA
// ======================
function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-background/5", className)}
      {...props}
    />
  );
}

export { Skeleton };
