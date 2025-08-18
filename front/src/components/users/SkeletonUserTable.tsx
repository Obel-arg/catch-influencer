import { TableRow, TableCell } from "@/components/ui/table";

/**
 * 🎯 SKELETON ESPECÍFICO PARA USER TABLE
 * Con colores grises y estructura adaptada a UserTable
 */

// Skeleton personalizado con color gris garantizado
const GraySkeleton = ({ className }: { className?: string }) => (
  <div className={`animate-pulse bg-gray-200 rounded ${className}`} />
);

export const SkeletonUserTableRow = () => {
  return (
    <TableRow>
      {/* Usuario Column */}
      <TableCell>
        <div className="flex items-center gap-3 min-w-[180px]">
          {/* 🎯 AVATAR SKELETON - GRIS CIRCULAR */}
          <GraySkeleton className="w-10 h-10 rounded-full" />
          {/* 🎯 NAME SKELETON - GRIS */}
          <GraySkeleton className="h-4 w-32" />
        </div>
      </TableCell>
      
      {/* Rol Column */}
      <TableCell>
        <GraySkeleton className="h-6 w-20 mx-auto" />
      </TableCell>
      
      {/* Email Column */}
      <TableCell>
        <GraySkeleton className="h-4 w-24 mx-auto" />
      </TableCell>
      
      {/* Se unió Column */}
      <TableCell>
        <GraySkeleton className="h-4 w-16 mx-auto" />
      </TableCell>
      
      {/* Acciones Column */}
      <TableCell>
        <div className="flex items-center justify-center gap-2">
          <GraySkeleton className="h-8 w-8 rounded" />
          <GraySkeleton className="h-8 w-8 rounded" />
        </div>
      </TableCell>
    </TableRow>
  );
};

export const SkeletonUserTableRows = ({ rows = 6 }: { rows?: number }) => {
  return (
    <>
      {Array.from({ length: rows }).map((_, index) => (
        <SkeletonUserTableRow key={`skeleton-user-${index}`} />
      ))}
    </>
  );
}; 