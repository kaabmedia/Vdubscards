// app/products/loading.tsx
import { Skeleton } from "@/components/ui/skeleton";

export default function LoadingProducts() {
  return (
    <div className="space-y-6 pb-16">
      <div className="flex items-end justify-between">
        <div>
          <div className="h-8 w-40 bg-muted/50" />
          <div className="mt-2 h-4 w-64 bg-muted/40" />
        </div>
      </div>
      <div className="grid lg:grid-cols-5 gap-6">
        {/* Filters column skeleton */}
        <div className="lg:col-span-1 space-y-3">
          <Skeleton className="h-10 w-3/4" />
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-5/6" />
          <Skeleton className="h-8 w-2/3" />
        </div>
        {/* Products grid skeleton */}
        <div className="lg:col-span-4 px-2.5 pb-5">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="p-4">
                <Skeleton className="w-full aspect-square" />
                <div className="mt-2 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
