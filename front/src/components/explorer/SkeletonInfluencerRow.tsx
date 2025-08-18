/**
 * 🎯 SKELETON MEJORADO CON COLORES GRISES MÁS VISIBLES
 * Ahora los placeholders se ven claramente con fondo gris más intenso
 */

interface SkeletonInfluencerRowProps {
  selectMode?: boolean;
}

// Skeleton personalizado con color gris más intenso y animación más visible
const GraySkeleton = ({ className }: { className?: string }) => (
  <div className={`animate-pulse bg-gray-300 rounded ${className}`} style={{ 
    animationDuration: '1.5s',
    background: 'linear-gradient(90deg, #e5e7eb 25%, #f3f4f6 50%, #e5e7eb 75%)',
    backgroundSize: '200% 100%',
    animation: 'skeleton-loading 1.5s infinite'
  }} />
);

export const SkeletonInfluencerRow = ({ selectMode = false }: SkeletonInfluencerRowProps) => {
  return (
    <tr className="hover:bg-gray-50 border-b border-gray-100 bg-white">
      {selectMode && (
        <td className="py-4 px-3 text-center">
          <GraySkeleton className="h-5 w-5 mx-auto rounded-full" />
        </td>
      )}
      <td className="py-4 px-6">
        <div className="flex items-center gap-3">
          {/* 🎯 AVATAR SKELETON - GRIS CIRCULAR MÁS VISIBLE */}
          <GraySkeleton className="h-12 w-12 rounded-full" />
          <div className="space-y-2">
            {/* 🎯 NAME SKELETON - GRIS MÁS VISIBLE */}
            <GraySkeleton className="h-4 w-32" />
            {/* 🎯 BADGE SKELETON - GRIS MÁS VISIBLE */}
            <GraySkeleton className="h-3 w-16" />
          </div>
        </div>
      </td>
      <td className="py-4 px-6 text-center">
        <div className="flex justify-center gap-3">
          {/* 🎯 PLATFORM ICONS SKELETON - GRIS MÁS VISIBLES */}
          <GraySkeleton className="h-6 w-6 rounded" />
          <GraySkeleton className="h-6 w-6 rounded" />
        </div>
      </td>
      <td className="py-4 px-6 text-center">
        {/* 🎯 LANGUAGE SKELETON - GRIS MÁS VISIBLE */}
        <GraySkeleton className="h-4 w-16 mx-auto" />
      </td>
      <td className="py-4 px-6 text-center">
        {/* 🎯 COUNTRY SKELETON - GRIS MÁS VISIBLE */}
        <GraySkeleton className="h-4 w-20 mx-auto" />
      </td>
      <td className="py-4 px-6 text-center">
        {/* 🎯 FOLLOWERS SKELETON - GRIS MÁS VISIBLE */}
        <GraySkeleton className="h-4 w-12 mx-auto" />
      </td>
      <td className="py-4 px-6 text-center">
        {/* 🎯 ENGAGEMENT SKELETON - GRIS MÁS VISIBLE */}
        <GraySkeleton className="h-4 w-10 mx-auto" />
      </td>
      <td className="py-4 px-6">
        <div className="flex justify-center gap-2">
          {/* 🎯 ACTION BUTTONS SKELETON - GRIS MÁS VISIBLE */}
          <GraySkeleton className="h-8 w-8 rounded" />
          <GraySkeleton className="h-8 w-8 rounded" />
        </div>
      </td>
    </tr>
  );
};

export const SkeletonInfluencerTable = ({ 
  selectMode = false, 
  rows = 6 
}: { 
  selectMode?: boolean; 
  rows?: number; 
}) => {
  return (
    <>
      {/* Agregar estilos CSS inline para la animación */}
      <style>{`
        @keyframes skeleton-loading {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>
      {Array.from({ length: rows }).map((_, index) => (
        <SkeletonInfluencerRow key={`skeleton-${index}`} selectMode={selectMode} />
      ))}
    </>
  );
}; 