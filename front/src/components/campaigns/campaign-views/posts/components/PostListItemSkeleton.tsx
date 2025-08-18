import { Card, CardContent } from "@/components/ui/card";

export const PostListItemSkeleton = () => {
  return (
    <Card className="bg-white border border-gray-200 rounded-lg animate-pulse">
      <CardContent className="p-4">
        <div className="flex items-center space-x-4">
          {/* Skeleton para la imagen */}
          <div className="w-16 h-16 bg-gray-200 rounded-lg flex-shrink-0"></div>
          
          {/* Skeleton para el contenido principal */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-2">
              {/* Skeleton para información del influencer */}
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 bg-gray-200 rounded-full"></div>
                <div className="h-4 bg-gray-200 rounded w-24"></div>
              </div>
              
              {/* Skeleton para fecha */}
              <div className="h-3 bg-gray-200 rounded w-16"></div>
            </div>
            
            {/* Skeleton para el título */}
            <div className="space-y-1 mb-3">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </div>
            
            {/* Skeleton para métricas */}
            <div className="flex items-center justify-between">
              <div className="flex space-x-4">
                <div className="text-center">
                  <div className="h-3 bg-gray-200 rounded w-12 mb-1"></div>
                  <div className="h-2 bg-gray-200 rounded w-8"></div>
                </div>
                <div className="text-center">
                  <div className="h-3 bg-gray-200 rounded w-12 mb-1"></div>
                  <div className="h-2 bg-gray-200 rounded w-8"></div>
                </div>
                <div className="text-center">
                  <div className="h-3 bg-gray-200 rounded w-12 mb-1"></div>
                  <div className="h-2 bg-gray-200 rounded w-8"></div>
                </div>
              </div>
              
              {/* Skeleton para botones de acción */}
              <div className="flex space-x-2">
                <div className="h-8 bg-gray-200 rounded w-16"></div>
                <div className="h-8 bg-gray-200 rounded w-20"></div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}; 