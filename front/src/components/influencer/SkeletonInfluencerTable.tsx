import { TableRow, TableCell } from "@/components/ui/table";

/**
 * 🎯 SKELETON ESPECÍFICO PARA INFLUENCER TABLE
 * Con colores grises y estructura adaptada a InfluencerTable
 */

// Skeleton personalizado con color gris garantizado
const GraySkeleton = ({ className }: { className?: string }) => (
  <div className={`animate-pulse bg-gray-200 rounded ${className}`} />
);

export const SkeletonInfluencerTableRow = () => {
  return (
    <TableRow>
      {/* Influencer Column */}
      <TableCell>
        <div className="flex items-center gap-3 min-w-[180px]">
          {/* 🎯 AVATAR SKELETON - GRIS CIRCULAR */}
          <GraySkeleton className="w-10 h-10 rounded-full" />
          {/* 🎯 NAME SKELETON - GRIS */}
          <GraySkeleton className="h-4 w-32" />
        </div>
      </TableCell>
      
      {/* País Column */}
      <TableCell>
        <GraySkeleton className="h-4 w-16 mx-auto" />
      </TableCell>
      
      {/* Plataforma Column */}
      <TableCell>
        <div className="flex gap-2 items-center justify-center">
          <GraySkeleton className="h-6 w-6 rounded" />
          <GraySkeleton className="h-6 w-6 rounded" />
        </div>
      </TableCell>
      
      {/* Seguidores Column */}
      <TableCell>
        <GraySkeleton className="h-4 w-12 mx-auto" />
      </TableCell>
      
      {/* Engagement Column */}
      <TableCell>
        <GraySkeleton className="h-4 w-12 mx-auto" />
      </TableCell>
      
      {/* Acciones Column */}
      <TableCell>
        <GraySkeleton className="h-8 w-20 mx-auto" />
      </TableCell>
    </TableRow>
  );
};

export const SkeletonInfluencerTableRows = ({ rows = 6 }: { rows?: number }) => {
  return (
    <>
      {Array.from({ length: rows }).map((_, index) => (
        <SkeletonInfluencerTableRow key={`skeleton-influencer-${index}`} />
      ))}
    </>
  );
}; 