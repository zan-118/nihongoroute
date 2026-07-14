/**
 * @file loading.tsx
 * @description Lightweight loading component for main route group.
 */

import { Skeleton } from "@/components/ui/skeleton";

/**
 * Main loading skeleton.
 * Prevents layout shift during route transitions.
 * 
 * @returns Loading UI skeleton.
 */
export default function MainLoading() {
  return (
    <div className="w-full flex-1 px-4 py-8 md:px-8 lg:px-12">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-8">
        {/* Header skeleton: category, title, description */}
        <div className="space-y-4">
          <Skeleton className="h-5 w-36 rounded-full" />
          <Skeleton className="h-12 w-full max-w-xl rounded-lg" />
          <Skeleton className="h-4 w-full max-w-2xl rounded-full" />
        </div>

        {/* Quick stats or card row skeleton */}
        <div className="flex flex-col md:flex-row flex-wrap gap-4">
          <Skeleton className="h-36 rounded-lg" />
          <Skeleton className="h-36 rounded-lg" />
          <Skeleton className="h-36 rounded-lg" />
        </div>

        {/* Two-column layout skeleton: main content left, sidebar right */}
        <div className="grid gap-4 lg:grid-cols-[1.4fr_0.8fr]">
          <div className="space-y-4">
            <Skeleton className="h-64 rounded-lg" />
            <Skeleton className="h-40 rounded-lg" />
          </div>
          <div className="space-y-4">
            <Skeleton className="h-32 rounded-lg" />
            <Skeleton className="h-48 rounded-lg" />
          </div>
        </div>
      </div>
    </div>
  );
}