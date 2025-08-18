"use client";

import { Brand } from '@/types/brands';
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Edit, Trash2, ExternalLink, Building2, Mail, Phone, Globe, Target, Users, TrendingUp } from "lucide-react";
import Link from 'next/link';
import { brandService } from '@/lib/services/brands';
import { useRoleCache } from '@/hooks/auth/useRoleCache';

interface BrandCardProps {
  brand: Brand;
  onEdit: (brand: Brand) => void;
  onDelete: (brand: Brand) => void;
}

export const BrandCard = ({ brand, onEdit, onDelete }: BrandCardProps) => {
  const { isViewer, loading: roleLoading, isRoleCached } = useRoleCache();

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800 border-green-200 text-xs px-2 py-0.5 font-semibold">Activa</Badge>;
      case 'inactive':
        return <Badge className="bg-red-100 text-red-800 border-red-200 text-xs px-2 py-0.5 font-semibold">Inactiva</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200 text-xs px-2 py-0.5 font-semibold">Pendiente</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800 border-gray-200 text-xs px-2 py-0.5 font-semibold">{status}</Badge>;
    }
  };

  const getSizeBadge = (size: string) => {
    switch (size) {
      case 'startup':
        return <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200 text-xs px-2 py-0.5">Startup</Badge>;
      case 'small':
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 text-xs px-2 py-0.5">Pequeña</Badge>;
      case 'medium':
        return <Badge variant="outline" className="bg-indigo-50 text-indigo-700 border-indigo-200 text-xs px-2 py-0.5">Mediana</Badge>;
      case 'large':
        return <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200 text-xs px-2 py-0.5">Grande</Badge>;
      case 'enterprise':
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 text-xs px-2 py-0.5">Corporativa</Badge>;
      default:
        return <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200 text-xs px-2 py-0.5">{size}</Badge>;
    }
  };

  const formatBudget = (budget: number, currency: string = 'USD') => {
    const formatter = new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    });
    return formatter.format(budget);
  };

  // Función para obtener la URL del logo usando el proxy
  const getLogoUrl = (logoUrl: string | undefined | null) => {
    if (!logoUrl) return null;
    return brandService.getProxiedImageUrl(logoUrl);
  };

  return (
    <Card className="group relative overflow-hidden transition-all duration-200 hover:shadow-lg border-gray-200 shadow-sm hover:border-gray-300">
      <CardContent className="p-6 pt-8">
        <div className="flex items-start gap-4 mb-4">
          {/* Logo de la marca */}
          <div className="flex-shrink-0">
            <Avatar className="w-12 h-12 rounded-lg shadow-sm">
              <AvatarImage 
                src={brand.logo_url} 
                alt={`Logo de ${brand.name}`}
                className="object-contain w-full h-full rounded-lg p-1" 
              />
              <AvatarFallback className="rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 text-white font-bold text-lg w-full h-full flex items-center justify-center">
                {brand.name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-sm text-gray-900 group-hover:text-blue-600 transition-colors truncate">
              {brand.name}
            </h3>
            <div className="flex items-center gap-1 mt-1">
              {getStatusBadge(brand.status)}
              {brand.size && getSizeBadge(brand.size)}
            </div>
          </div>
          {/* Solo mostrar botones de editar y eliminar si NO es viewer */}
          {(!roleLoading && isRoleCached() && !isViewer()) && (
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onEdit(brand)}
                className="h-6 w-6 text-gray-400 hover:text-blue-600 hover:bg-blue-50"
              >
                <Edit className="h-3 w-3" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onDelete(brand)}
                className="h-6 w-6 text-gray-400 hover:text-red-600 hover:bg-red-50"
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          )}
        </div>
      </CardContent>
      
      <CardContent className="pt-0 space-y-3 px-6 pb-6">
        {brand.description && (
          <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed">{brand.description}</p>
        )}
        
        {/* Información clave */}
        <div className="grid grid-cols-2 gap-2">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center">
              <Target className="h-2.5 w-2.5 text-blue-600" />
            </div>
            <div>
              <div className="text-xs text-gray-500">Campañas</div>
              <div className="text-xs font-semibold">{brand.total_campaigns}</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-full bg-purple-100 flex items-center justify-center">
              <Users className="h-2.5 w-2.5 text-purple-600" />
            </div>
            <div>
              <div className="text-xs text-gray-500">Influencers</div>
              <div className="text-xs font-semibold">{brand.total_influencers}</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center">
              <TrendingUp className="h-2.5 w-2.5 text-emerald-600" />
            </div>
            <div>
              <div className="text-xs text-gray-500">Presupuesto</div>
              <div className="text-xs font-semibold">
                {formatBudget(brand.total_budget, brand.currency)}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-full bg-amber-100 flex items-center justify-center">
              <Building2 className="h-2.5 w-2.5 text-amber-600" />
            </div>
            <div>
              <div className="text-xs text-gray-500">Industria</div>
              <div className="text-xs font-semibold truncate">{brand.industry || 'N/A'}</div>
            </div>
          </div>
        </div>

        {/* Información de contacto compacta */}
        <div className="border-t pt-2 space-y-1">
          {brand.contact_email && (
            <div className="flex items-center gap-1 text-xs text-gray-600">
              <Mail className="h-2.5 w-2.5 text-gray-400" />
              <span className="truncate">{brand.contact_email}</span>
            </div>
          )}
          
          {brand.website_url && (
            <div className="flex items-center gap-1 text-xs text-gray-600">
              <Globe className="h-2.5 w-2.5 text-gray-400" />
              <a 
                href={brand.website_url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline truncate"
              >
                {brand.website_url.replace(/^https?:\/\//, '')}
              </a>
            </div>
          )}
          
          {brand.country && (
            <div className="flex items-center gap-1 text-xs text-gray-600">
              <div className="w-2.5 h-2.5 rounded-full bg-gray-300"></div>
              <span>{brand.country}</span>
            </div>
          )}
        </div>

        {/* Botón de acción principal - mismo estilo que Explorer */}
        <div className="pt-1">
          <Button
            asChild
            className="w-full h-7 text-xs bg-gradient-to-r from-blue-600 to-blue-700 text-white font-medium shadow-sm hover:from-blue-700 hover:to-blue-800 hover:shadow-md transition-all duration-200"
          >
            <Link href={`/brands/${brand.id}`}>
              <ExternalLink className="h-3 w-3 mr-1" />
              Ver detalles
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}; 