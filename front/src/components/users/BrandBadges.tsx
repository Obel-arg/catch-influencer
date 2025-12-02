"use client"

import { useState, useEffect } from 'react';
import { Tag, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Brand } from '@/types/brands';

interface BrandBadgesProps {
  userId: string;
  organizationId: string;
  maxVisible?: number;
  size?: 'sm' | 'md';
}

export function BrandBadges({
  userId,
  organizationId,
  maxVisible = 2,
  size = 'sm'
}: BrandBadgesProps) {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    loadUserBrands();
  }, [userId, organizationId]);

  const loadUserBrands = async () => {
    setLoading(true);
    setError(false);
    try {
      const response = await fetch(
        `/api/user-brands/organizations/${organizationId}/users/${userId}/brands`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );

      if (response.ok) {
        const data = await response.json();
        setBrands(data.brands || []);
      } else {
        setError(true);
      }
    } catch (err) {
      console.error('Error loading user brands:', err);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center gap-1">
        <Loader2 className="h-3 w-3 animate-spin text-gray-400" />
        <span className="text-xs text-gray-400">Cargando...</span>
      </div>
    );
  }

  if (error) {
    return (
      <span className="text-xs text-red-500">Error al cargar marcas</span>
    );
  }

  if (brands.length === 0) {
    return (
      <Badge variant="outline" className="gap-1 text-gray-500 border-gray-300">
        <Tag className="h-3 w-3" />
        Sin marcas
      </Badge>
    );
  }

  const visibleBrands = brands.slice(0, maxVisible);
  const remainingCount = brands.length - maxVisible;

  return (
    <TooltipProvider>
      <div className="flex items-center gap-1 flex-wrap">
        {visibleBrands.map((brand) => (
          <Tooltip key={brand.id}>
            <TooltipTrigger asChild>
              <Badge
                variant="outline"
                className={`
                  gap-1.5 bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100
                  ${size === 'sm' ? 'text-xs px-2 py-0.5' : 'text-sm px-2.5 py-1'}
                `}
              >
                {brand.logo_url && (
                  <img
                    src={brand.logo_url}
                    alt={brand.name}
                    className={`rounded ${size === 'sm' ? 'w-3 h-3' : 'w-4 h-4'}`}
                  />
                )}
                <span className="truncate max-w-[100px]">{brand.name}</span>
              </Badge>
            </TooltipTrigger>
            <TooltipContent>
              <div className="text-xs">
                <p className="font-semibold">{brand.name}</p>
                {brand.industry && (
                  <p className="text-gray-400">{brand.industry}</p>
                )}
              </div>
            </TooltipContent>
          </Tooltip>
        ))}

        {remainingCount > 0 && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Badge
                variant="outline"
                className={`
                  bg-gray-50 text-gray-600 border-gray-300
                  ${size === 'sm' ? 'text-xs px-2 py-0.5' : 'text-sm px-2.5 py-1'}
                `}
              >
                +{remainingCount}
              </Badge>
            </TooltipTrigger>
            <TooltipContent>
              <div className="text-xs space-y-1">
                <p className="font-semibold mb-1">Otras marcas:</p>
                {brands.slice(maxVisible).map((brand) => (
                  <p key={brand.id}>• {brand.name}</p>
                ))}
              </div>
            </TooltipContent>
          </Tooltip>
        )}
      </div>
    </TooltipProvider>
  );
}
