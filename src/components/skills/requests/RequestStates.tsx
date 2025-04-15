
import { Skeleton } from "@/components/ui/skeleton";

export const RequestLoadingSkeleton = () => (
  <div className="p-4 space-y-3">
    {[1, 2, 3].map(i => (
      <div key={i} className="flex items-center gap-2">
        <Skeleton className="h-10 w-10 rounded-full" />
        <div className="space-y-1 flex-1">
          <Skeleton className="h-5 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>
      </div>
    ))}
  </div>
);

export const RequestEmptyState = () => (
  <div className="py-8 px-4 text-center text-gray-500">
    <p>No skill requests available</p>
    <p className="text-xs mt-1">Be the first to request a skill</p>
  </div>
);
