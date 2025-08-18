import { Card } from "@/components/ui/card";
import { BarChart2 } from "lucide-react";

export const PlatformSkeleton = () => (
  <div className="grid grid-cols-12 gap-6">
    <div className="col-span-8">
      <Card className="overflow-hidden border-gray-200 border bg-white shadow-sm">
        <div className="bg-blue-600 text-white pb-2 pt-3 px-4 rounded-t-lg">
          <div className="flex items-center gap-2">
            <BarChart2 className="h-4 w-4" />
            <h3 className="text-sm font-semibold">Rendimiento por Plataforma</h3>
          </div>
        </div>

        <div className="p-3.5">
          <div className="space-y-3.5">
            {[1, 2, 3].map((index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 bg-gray-200 rounded-full animate-pulse"></div>
                    <div className="h-4 bg-gray-200 rounded w-20 animate-pulse"></div>
                  </div>
                  <div className="h-5 bg-gray-200 rounded w-16 animate-pulse"></div>
                </div>

                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div>
                    <div className="text-gray-500">Alcance</div>
                    <div className="h-3 bg-gray-200 rounded w-12 animate-pulse mt-1"></div>
                  </div>
                  <div>
                    <div className="text-gray-500">Engagement</div>
                    <div className="h-3 bg-gray-200 rounded w-8 animate-pulse mt-1"></div>
                  </div>
                  <div>
                    <div className="text-gray-500">Likes</div>
                    <div className="h-3 bg-gray-200 rounded w-10 animate-pulse mt-1"></div>
                  </div>
                </div>

                <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className="bg-gray-200 h-2 rounded-full w-1/3 animate-pulse"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>
    </div>

    <div className="col-span-4">
      <Card className="overflow-hidden border-gray-200 border bg-white shadow-sm h-full flex flex-col">
        <div className="bg-purple-600 text-white pb-2 pt-3 px-4 rounded-t-lg">
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 bg-white rounded animate-pulse"></div>
            <h3 className="text-sm font-semibold">Tipos de Contenido</h3>
          </div>
        </div>

        <div className="p-3.5 flex-1 flex flex-col">
          <div className="h-[200px] w-full bg-gray-100 rounded animate-pulse"></div>

          <div className="grid grid-cols-2 gap-2 mt-4">
            {[1, 2, 3, 4].map((index) => (
              <div key={index} className="flex items-center gap-2">
                <div className="w-3 h-3 bg-gray-200 rounded-full animate-pulse"></div>
                <div className="text-xs">
                  <div className="h-3 bg-gray-200 rounded w-12 animate-pulse"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>
    </div>
  </div>
); 