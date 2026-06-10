/**
 * @file loading.tsx
 * @description Komponen pemuat ringan untuk grup rute utama.
 */

import { Skeleton } from "@/components/ui/skeleton";

/**
 * Komponen loading global untuk grup rute utama.
 * Menggunakan skeleton in-place supaya navigasi tidak terasa seperti aplikasi dimuat ulang.
 */
export default function MainLoading() {
  return (
    <div className="w-full flex-1 px-4 py-8 md:px-8 lg:px-12">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-8">
        <div className="space-y-4">
          <Skeleton className="h-5 w-36 rounded-full" />
          <Skeleton className="h-12 w-full max-w-xl rounded-2xl" />
          <Skeleton className="h-4 w-full max-w-2xl rounded-full" />
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Skeleton className="h-36 rounded-2xl" />
          <Skeleton className="h-36 rounded-2xl" />
          <Skeleton className="h-36 rounded-2xl" />
        </div>

        <div className="grid gap-4 lg:grid-cols-[1.4fr_0.8fr]">
          <div className="space-y-4">
            <Skeleton className="h-64 rounded-2xl" />
            <Skeleton className="h-40 rounded-2xl" />
          </div>
          <div className="space-y-4">
            <Skeleton className="h-32 rounded-2xl" />
            <Skeleton className="h-48 rounded-2xl" />
          </div>
        </div>
      </div>
    </div>
  );
}
