import { Card, CardContent } from "@/components/ui/card";

interface InfluencerCardSkeletonProps {
  viewMode?: 'grid' | 'list';
}

export const InfluencerCardSkeleton = ({ viewMode = 'grid' }: InfluencerCardSkeletonProps) => {
  if (viewMode === 'list') {
    return (
      <Card className="overflow-hidden bg-white border-gray-200 border hover:shadow-md transition-all">
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            {/* Avatar skeleton */}
            <div className="relative flex-shrink-0">
              <div className="h-12 w-12 bg-gray-200 rounded-full animate-pulse"></div>
              <div className="absolute -top-1 -right-1 h-4 w-4 bg-gray-200 rounded-full animate-pulse"></div>
            </div>
            
            {/* Content skeleton */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-2">
                {/* Name skeleton */}
                <div className="h-5 w-32 bg-gray-200 rounded animate-pulse"></div>
                {/* Status badge skeleton */}
                <div className="h-5 w-16 bg-gray-200 rounded-full animate-pulse"></div>
              </div>
              
              <div className="flex items-center gap-4 mb-2">
                {/* Platform badges skeleton */}
                <div className="flex gap-2">
                  <div className="h-4 w-12 bg-gray-200 rounded-full animate-pulse"></div>
                  <div className="h-4 w-10 bg-gray-200 rounded-full animate-pulse"></div>
                </div>
                {/* Categories skeleton */}
                <div className="flex gap-1">
                  <div className="h-4 w-8 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-4 w-6 bg-gray-200 rounded animate-pulse"></div>
                </div>
              </div>
              
              {/* Metrics skeleton */}
              <div className="flex items-center gap-4">
                <div className="h-4 w-16 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-4 w-20 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-4 w-12 bg-gray-200 rounded animate-pulse"></div>
              </div>
            </div>
            
            {/* Actions skeleton */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <div className="h-8 w-20 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-8 w-16 bg-gray-200 rounded animate-pulse"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden bg-white border-gray-200 border hover:shadow-md transition-all flex flex-col h-full">
      <div className="relative">
        <div className="absolute top-2 right-2 z-10">
          <div className="h-5 w-16 bg-gray-200 rounded-full animate-pulse"></div>
        </div>
        <div className="absolute top-2 left-2 z-10">
          <div className="h-6 w-6 bg-gray-200 rounded-full animate-pulse"></div>
        </div>
        <div className="h-32 bg-gradient-to-r from-gray-200 to-gray-300 animate-pulse"></div>
      </div>

      <div className="px-4 -mt-16 relative">
        {/* Avatar skeleton - a la izquierda */}
        <div className="h-20 w-20 bg-gray-200 rounded-full border-4 border-white shadow-lg animate-pulse"></div>

        <div className="mt-4 text-center">
          {/* Name skeleton */}
          <div className="h-6 w-32 bg-gray-200 rounded animate-pulse mx-auto mb-2"></div>
          
          {/* Platform badges skeleton */}
          <div className="flex justify-center gap-2 mb-2">
            <div className="h-5 w-16 bg-gray-200 rounded-full animate-pulse"></div>
            <div className="h-5 w-14 bg-gray-200 rounded-full animate-pulse"></div>
          </div>
          
          {/* Categories skeleton */}
          <div className="flex justify-center gap-1">
            <div className="h-4 w-12 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-4 w-10 bg-gray-200 rounded animate-pulse"></div>
          </div>
        </div>
      </div>

      <CardContent className="p-4 pt-2 pb-2 flex flex-col flex-1">
        <div className="flex-1">
          {/* Metrics skeleton */}
          <div className="space-y-2 mb-4">
            <div className="h-4 w-20 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-4 w-16 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-4 w-24 bg-gray-200 rounded animate-pulse"></div>
          </div>

          {/* Performance bar skeleton */}
          <div className="space-y-2">
            <div className="h-3 w-full bg-gray-200 rounded-full animate-pulse"></div>
            <div className="h-3 w-12 bg-gray-200 rounded animate-pulse"></div>
          </div>
        </div>

        {/* Actions skeleton */}
        <div className="mt-auto pt-2">
          <div className="flex gap-2">
            <div className="h-8 flex-1 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-8 w-20 bg-gray-200 rounded animate-pulse"></div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}; 