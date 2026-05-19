import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

export default function CourseDetailLoading() {
  return (
    <div className="w-full text-foreground px-4 md:px-8 relative overflow-hidden flex flex-col flex-1">
      {/* Background Ambient Decor Skeleton */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 blur-[150px] rounded-full pointer-events-none" />
      
      <article className="max-w-4xl mx-auto w-full relative z-10 flex-1">
        {/* Breadcrumb Skeleton */}
        <div className="flex items-center gap-2 mb-16 mt-4">
          <Skeleton className="h-4 w-20 rounded" />
          <Skeleton className="h-3 w-3 rounded-full" />
          <Skeleton className="h-4 w-16 rounded" />
          <Skeleton className="h-3 w-3 rounded-full" />
          <Skeleton className="h-4 w-32 rounded" />
        </div>

        <header className="mb-20">
          {/* Title Skeleton */}
          <div className="space-y-4 mb-8">
            <Skeleton className="h-16 md:h-20 lg:h-24 w-3/4 rounded-xl" />
            <Skeleton className="h-16 md:h-20 lg:h-24 w-1/2 rounded-xl" />
          </div>
          
          {/* Summary Box Skeleton */}
          <Skeleton className="h-32 w-full rounded-[2rem] neo-inset border-l-8 border-transparent" />
        </header>

        <div className="space-y-24 mb-24">
          {/* Target Kosakata Section Skeleton */}
          <section>
            <div className="flex items-center gap-4 mb-10">
              <Skeleton className="h-8 w-48 rounded-lg" />
              <div className="h-[1px] flex-1 bg-border" />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="neo-card p-6 flex flex-col justify-between items-start gap-6 h-48 rounded-2xl">
                  <div className="w-full space-y-4">
                    <div className="flex gap-2">
                       <Skeleton className="h-5 w-16 rounded" />
                       <Skeleton className="h-5 w-24 rounded" />
                    </div>
                    <Skeleton className="h-10 w-32 rounded-lg" />
                    <Skeleton className="h-4 w-full rounded" />
                    <Skeleton className="h-4 w-4/5 rounded" />
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Materi Inti Section Skeleton */}
          <section>
            <div className="flex items-center gap-4 mb-10">
              <Skeleton className="h-8 w-40 rounded-lg" />
              <div className="h-[1px] flex-1 bg-border" />
            </div>
            <div className="neo-card p-8 md:p-14 rounded-[2rem]">
              <div className="space-y-6">
                <Skeleton className="h-5 w-full rounded" />
                <Skeleton className="h-5 w-[90%] rounded" />
                <Skeleton className="h-5 w-[95%] rounded" />
                <div className="py-4" />
                <Skeleton className="h-5 w-[85%] rounded" />
                <Skeleton className="h-5 w-[80%] rounded" />
                <Skeleton className="h-5 w-[92%] rounded" />
              </div>
            </div>
          </section>
        </div>
      </article>
    </div>
  );
}
