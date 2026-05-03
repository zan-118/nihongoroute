import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardLoading() {
  return (
    <div className="w-full min-h-screen bg-background relative overflow-hidden pt-12 pb-24 px-4 md:px-8">
      <div className="max-w-7xl mx-auto pt-16 space-y-12">
        {/* Header Hero Skeleton */}
        <div className="flex flex-col lg:flex-row gap-12 items-center">
          <div className="flex-1 space-y-4 w-full">
            <Skeleton className="h-6 w-32 rounded-full" />
            <Skeleton className="h-16 w-3/4 md:w-96" />
            <Skeleton className="h-4 w-1/2 md:w-64" />
          </div>
          <Skeleton className="h-[280px] w-full lg:w-[400px] rounded-2xl" />
        </div>

        {/* Bento Grid Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          <div className="md:col-span-8">
            <Skeleton className="h-[250px] w-full rounded-2xl" />
          </div>
          <div className="md:col-span-4 space-y-6">
            <Skeleton className="h-[110px] w-full rounded-2xl" />
            <Skeleton className="h-[110px] w-full rounded-2xl" />
          </div>

          {/* Sub-components Skeletons */}
          <div className="md:col-span-4">
            <Skeleton className="h-[400px] w-full rounded-2xl" />
          </div>
          <div className="md:col-span-4">
            <Skeleton className="h-[400px] w-full rounded-2xl" />
          </div>
          <div className="md:col-span-4">
            <Skeleton className="h-[400px] w-full rounded-2xl" />
          </div>
          
          <div className="md:col-span-12">
            <Skeleton className="h-[220px] w-full rounded-2xl" />
          </div>
        </div>
      </div>
    </div>
  );
}
