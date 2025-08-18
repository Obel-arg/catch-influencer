"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { X, Filter, Building2, Globe, TrendingUp } from "lucide-react";
import { BrandFilters as BrandFiltersType } from '@/types/brands';

interface BrandFiltersProps {
  onFilter: (filters: BrandFiltersType) => void;
  onClose: () => void;
}

export const BrandFilters = ({ onFilter, onClose }: BrandFiltersProps) => {
  const [filters, setFilters] = useState<BrandFiltersType>({
    status: undefined,
    industry: undefined,
    country: undefined,
    size: undefined,
    search: undefined
  });

  const handleFilterChange = (key: keyof BrandFiltersType, value: string | undefined) => {
    setFilters(prev => ({
      ...prev,
      [key]: value || undefined
    }));
  };

  const handleApplyFilters = () => {
    onFilter(filters);
  };

  const handleClearFilters = () => {
    const clearedFilters = {
      status: undefined,
      industry: undefined,
      country: undefined,
      size: undefined,
      search: undefined
    };
    setFilters(clearedFilters);
    onFilter(clearedFilters);
  };

  const hasActiveFilters = Object.values(filters).some(value => value !== undefined && value !== '');

  return (
    <Card className="border border-gray-200 bg-white shadow-lg rounded-xl">
      <CardContent className="p-6">
        <div className="flex justify-end mb-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {/* Estado */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-700 flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              Estado
            </Label>
            <Select value={filters.status || "all"} onValueChange={(value) => handleFilterChange('status', value === 'all' ? undefined : value)}>
              <SelectTrigger className="h-10 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 rounded-lg">
                <SelectValue placeholder="Todos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="active">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    Activo
                  </div>
                </SelectItem>
                <SelectItem value="inactive">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                    Inactivo
                  </div>
                </SelectItem>
                <SelectItem value="pending">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                    Pendiente
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Tamaño */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-700 flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-blue-500" />
              Tamaño
            </Label>
            <Select value={filters.size || "all"} onValueChange={(value) => handleFilterChange('size', value === 'all' ? undefined : value)}>
              <SelectTrigger className="h-10 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 rounded-lg">
                <SelectValue placeholder="Todos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="startup">Startup</SelectItem>
                <SelectItem value="small">Pequeña</SelectItem>
                <SelectItem value="medium">Mediana</SelectItem>
                <SelectItem value="large">Grande</SelectItem>
                <SelectItem value="enterprise">Empresa</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Industria */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-700 flex items-center gap-2">
              <Building2 className="h-4 w-4 text-purple-500" />
              Industria
            </Label>
            <Input
              placeholder="ej: Tecnología, Moda..."
              value={filters.industry || ""}
              onChange={(e) => handleFilterChange('industry', e.target.value)}
              className="h-10 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 rounded-lg"
            />
          </div>

          {/* País */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-700 flex items-center gap-2">
              <Globe className="h-4 w-4 text-green-500" />
              País
            </Label>
            <Input
              placeholder="ej: España, México..."
              value={filters.country || ""}
              onChange={(e) => handleFilterChange('country', e.target.value)}
              className="h-10 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 rounded-lg"
            />
          </div>
        </div>

        {/* Indicador de filtros activos */}
        {hasActiveFilters && (
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center gap-2 text-blue-700">
              <Filter className="h-4 w-4" />
              <span className="text-sm font-medium">
                {Object.values(filters).filter(v => v !== undefined && v !== '').length} filtro(s) aplicado(s)
              </span>
            </div>
          </div>
        )}

        <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
          <Button 
            onClick={handleApplyFilters}
            className="bg-gradient-to-r from-blue-600 to-blue-700 text-white font-medium shadow-sm hover:from-blue-700 hover:to-blue-800 hover:shadow-md transition-all duration-200 rounded-lg"
          >
            <Filter className="h-4 w-4 mr-2" />
            Aplicar Filtros
          </Button>
          
          {hasActiveFilters && (
            <Button
              variant="outline"
              onClick={handleClearFilters}
              className="text-gray-600 hover:text-gray-800 border-gray-200 hover:bg-gray-50 rounded-lg"
            >
              Limpiar Filtros
            </Button>
          )}
          
          <div className="flex-1" />
          
          <Button
            variant="ghost"
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg"
          >
            Cerrar
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}; 