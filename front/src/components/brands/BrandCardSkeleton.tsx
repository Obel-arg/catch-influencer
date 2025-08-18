import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export const BrandCardSkeleton = () => {
  return (
    <Card className="group relative overflow-hidden transition-all duration-200 hover:shadow-lg border-gray-200 shadow-sm hover:border-gray-300">
      <CardContent className="p-6 pt-8">
        <div className="flex items-start gap-4 mb-4">
          {/* Logo skeleton */}
          <div className="flex-shrink-0">
            <Skeleton className="w-12 h-12 rounded-lg" />
          </div>

          <div className="flex-1 min-w-0">
            {/* Brand name skeleton */}
            <Skeleton className="h-4 w-32 mb-2" />
            {/* Status badges skeleton */}
            <div className="flex items-center gap-1">
              <Skeleton className="h-5 w-16 rounded-full" />
              <Skeleton className="h-5 w-20 rounded-full" />
            </div>
          </div>

          {/* Action buttons skeleton */}
          <div className="flex items-center gap-1">
            <Skeleton className="h-6 w-6 rounded" />
            <Skeleton className="h-6 w-6 rounded" />
          </div>
        </div>
      </CardContent>

      <CardContent className="pt-0 space-y-3 px-6 pb-6">
        {/* Description skeleton */}
        <div className="space-y-1">
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-3/4" />
        </div>

        {/* Key information grid skeleton */}
        <div className="grid grid-cols-2 gap-2">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="flex items-center gap-2">
              <Skeleton className="w-5 h-5 rounded-full" />
              <div className="flex-1">
                <Skeleton className="h-3 w-12 mb-1" />
                <Skeleton className="h-3 w-8" />
              </div>
            </div>
          ))}
        </div>

        {/* Contact information skeleton */}
        <div className="border-t pt-2 space-y-1">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="flex items-center gap-1">
              <Skeleton className="h-2.5 w-2.5 rounded-full" />
              <Skeleton className="h-3 w-24" />
            </div>
          ))}
        </div>

        {/* Action button skeleton */}
        <div className="pt-1">
          <Skeleton className="h-7 w-full rounded" />
        </div>
      </CardContent>
    </Card>
  );
};
