import { Skeleton } from "@/components/ui/skeleton";

export default function GrammarLoading() {
  return (
    <main className="w-full bg-background px-4 md:px-8 lg:px-12 relative overflow-hidden flex flex-col justify-start min-h-screen pb-24 transition-colors duration-300">
      {/* Background Neural Overlays (Sama dengan aslinya untuk menjaga konsistensi visual) */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(var(--foreground-rgb),0.01)_1px,transparent_1px),linear-gradient(90deg,rgba(var(--foreground-rgb),0.01)_1px,transparent_1px)] bg-[size:60px_60px] pointer-events-none z-0" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(var(--primary-rgb),0.05)_0%,transparent_70%)] pointer-events-none z-0" />

      <div className="max-w-4xl mx-auto w-full relative z-10 pt-8 md:pt-10">
        {/* Nav Breadcrumbs Skeleton */}
        <nav className="mb-8 md:mb-12 flex flex-wrap items-center gap-2 md:gap-4">
          <Skeleton className="h-4 w-16" />
          <span className="text-border">/</span>
          <Skeleton className="h-4 w-20" />
          <span className="text-border">/</span>
          <Skeleton className="h-4 w-24" />
          <span className="text-border">/</span>
          <Skeleton className="h-4 w-32 md:w-48 bg-primary/20" />
        </nav>

        {/* Header Skeleton */}
        <header className="mb-16 md:mb-20">
          <div className="flex items-center gap-3 md:gap-4 mb-4 md:mb-6">
            <Skeleton className="h-4 w-4 md:h-5 md:w-5 rounded-full" />
            <Skeleton className="h-3 w-40 md:w-48" />
          </div>
          <div className="space-y-4">
            <Skeleton className="h-10 md:h-16 lg:h-20 w-3/4 rounded-xl" />
            <Skeleton className="h-10 md:h-16 lg:h-20 w-1/2 rounded-xl" />
          </div>
          <Skeleton className="h-1.5 md:h-2 w-24 md:w-32 bg-primary/40 mt-8 md:mt-10 rounded-full" />
        </header>

        {/* Grid Cards Skeleton (Formation & Notes) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
          <div className="p-6 md:p-8 bg-primary/5 border border-primary/20 rounded-[2rem] relative overflow-hidden">
            <Skeleton className="h-3 w-32 mb-5 bg-primary/30" />
            <Skeleton className="h-6 md:h-8 w-full mb-3" />
            <Skeleton className="h-6 md:h-8 w-2/3" />
          </div>
          <div className="p-6 md:p-8 bg-muted/30 border border-border rounded-[2rem] relative overflow-hidden">
            <Skeleton className="h-3 w-28 mb-5" />
            <Skeleton className="h-4 w-full mb-3" />
            <Skeleton className="h-4 w-5/6 mb-3" />
            <Skeleton className="h-4 w-4/5" />
          </div>
        </div>

        {/* Content Prose Skeleton */}
        <section className="max-w-none mb-16 md:mb-20 space-y-12">
          {/* Paragraph block 1 */}
          <div className="space-y-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-11/12" />
            <Skeleton className="h-4 w-4/5" />
          </div>

          {/* H2 Title Simulation */}
          <div className="flex items-center gap-3 md:gap-4 mt-12 md:mt-16 mb-6 md:mb-8">
            <Skeleton className="w-1.5 md:w-2 h-6 md:h-8 bg-primary/40 rounded-full" />
            <Skeleton className="h-6 md:h-8 w-48 rounded-lg" />
          </div>

          {/* Paragraph block 2 */}
          <div className="space-y-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-10/12" />
            <Skeleton className="h-4 w-full" />
          </div>

          {/* Example Sentence Card Skeleton */}
          <div className="my-8 p-6 md:p-10 bg-card border border-border/50 rounded-[2rem] md:rounded-[3rem] shadow-sm">
            <div className="space-y-4 mb-6">
              <Skeleton className="h-8 md:h-10 w-3/4 rounded-lg" />
              <Skeleton className="h-3 md:h-4 w-1/4" />
            </div>
            <div className="pt-6 border-t border-border/50 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-3 w-full">
                <Skeleton className="h-2 w-20 bg-primary/20" />
                <Skeleton className="h-4 md:h-5 w-5/6" />
                <Skeleton className="h-4 md:h-5 w-1/2" />
              </div>
              <Skeleton className="h-10 w-10 md:h-12 md:w-12 rounded-2xl shrink-0" />
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
