import { Card, CardContent } from "@/components/ui/card";

export const PostCardSkeleton = () => {
  return (
    <Card className="overflow-hidden bg-white border border-gray-200 rounded-lg aspect-square flex flex-col animate-pulse">
      {/* Skeleton para la imagen */}
      <div className="relative bg-gray-200 h-48 w-full">
        {/* Skeleton para el botón de eliminar */}
        <div className="absolute top-2 right-2 w-6 h-6 bg-gray-300 rounded-full"></div>
      </div>

      <CardContent className="flex-shrink-0 p-1 pb-1.5 flex flex-col space-y-2">
        {/* Skeleton para información del influencer */}
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
          <div className="flex-1">
            <div className="h-3 bg-gray-200 rounded w-3/4 mb-1"></div>
            <div className="h-2 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>

        {/* Skeleton para el título */}
        <div className="space-y-1">
          <div className="h-3 bg-gray-200 rounded w-full"></div>
          <div className="h-3 bg-gray-200 rounded w-2/3"></div>
        </div>

        {/* Skeleton para métricas */}
        <div className="flex justify-between items-center">
          <div className="flex space-x-3">
            <div className="text-center">
              <div className="h-3 bg-gray-200 rounded w-8 mb-1"></div>
              <div className="h-2 bg-gray-200 rounded w-6"></div>
            </div>
            <div className="text-center">
              <div className="h-3 bg-gray-200 rounded w-8 mb-1"></div>
              <div className="h-2 bg-gray-200 rounded w-6"></div>
            </div>
            <div className="text-center">
              <div className="h-3 bg-gray-200 rounded w-8 mb-1"></div>
              <div className="h-2 bg-gray-200 rounded w-6"></div>
            </div>
          </div>
        </div>

        {/* Skeleton para acciones */}
        <div className="flex justify-between items-center">
          <div className="h-6 bg-gray-200 rounded w-16"></div>
          <div className="h-8 bg-gray-200 rounded w-20"></div>
        </div>
      </CardContent>
    </Card>
  );
}; 