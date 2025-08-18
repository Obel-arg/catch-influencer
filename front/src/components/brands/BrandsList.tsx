"use client";

import { useState, useCallback, memo, useEffect, useRef, useMemo } from "react";
import { Brand, BrandStatus, BrandSize } from "@/types/brands";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Plus, Globe, TrendingUp } from "lucide-react";
import { BrandCard } from "./BrandCard";
import { BrandCardSkeleton } from "./BrandCardSkeleton";
import { CreateBrandModal } from "./CreateBrandModal";
import { EditBrandModal } from "./EditBrandModal";
import { DeleteBrandModal } from "./DeleteBrandModal";
import { useRoleCache } from "@/hooks/auth/useRoleCache";

interface BrandsListProps {
  brands: Brand[];
  loading: boolean;
  onBrandUpdated?: () => void;
  onCreateBrand?: () => void;
}

// Header unificado con filtros - todo en una sola sección
const BrandsHeaderWithFilters = memo(
  ({
    brands,
    onFilteredBrandsChange,
    onCreateBrand,
  }: {
    brands: Brand[];
    onFilteredBrandsChange: (filteredBrands: Brand[]) => void;
    onCreateBrand?: () => void;
  }) => {
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState<string>("all");
    const [countryFilter, setCountryFilter] = useState<string>("all");
    const [sizeFilter, setSizeFilter] = useState<string>("all");
    const { isViewer, loading: roleLoading, isRoleCached } = useRoleCache();

    // Generar opciones únicas basadas en datos reales
    const uniqueStatuses = useMemo(() => {
      const statuses = [...new Set(brands.map((brand) => brand.status))];
      return statuses.sort();
    }, [brands]);

    const uniqueCountries = useMemo(() => {
      const countries = [
        ...new Set(
          brands
            .map((brand) => brand.country)
            .filter((country): country is string => Boolean(country))
        ),
      ];
      return countries.sort();
    }, [brands]);

    const uniqueSizes = useMemo(() => {
      const sizes = [
        ...new Set(
          brands
            .map((brand) => brand.size)
            .filter((size): size is BrandSize => Boolean(size))
        ),
      ];
      const sizeOrder: BrandSize[] = [
        "startup",
        "small",
        "medium",
        "large",
        "enterprise",
      ];
      return sizes.sort((a, b) => {
        const aIndex = sizeOrder.indexOf(a);
        const bIndex = sizeOrder.indexOf(b);
        if (aIndex === -1) return 1;
        if (bIndex === -1) return -1;
        return aIndex - bIndex;
      });
    }, [brands]);

    // Filtrar marcas - TODO LOCAL Y SIMPLE
    const filteredBrands = useMemo(() => {
      let result = [...brands];

      // Filtro de búsqueda
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        result = result.filter(
          (brand) =>
            brand.name.toLowerCase().includes(query) ||
            brand.description?.toLowerCase().includes(query) ||
            brand.industry?.toLowerCase().includes(query) ||
            brand.country?.toLowerCase().includes(query)
        );
      }

      // Filtros por propiedades
      if (statusFilter && statusFilter !== "all") {
        result = result.filter((brand) => brand.status === statusFilter);
      }

      if (countryFilter && countryFilter !== "all") {
        result = result.filter((brand) => brand.country === countryFilter);
      }

      if (sizeFilter && sizeFilter !== "all") {
        result = result.filter((brand) => brand.size === sizeFilter);
      }

      return result;
    }, [brands, searchQuery, statusFilter, countryFilter, sizeFilter]);

    // Notificar cambios al padre
    useEffect(() => {
      onFilteredBrandsChange(filteredBrands);
    }, [filteredBrands, onFilteredBrandsChange]);

    // Funciones para traducir valores
    const getStatusLabel = (status: BrandStatus) => {
      switch (status) {
        case "active":
          return "Activo";
        case "inactive":
          return "Inactivo";
        case "pending":
          return "Pendiente";
        default:
          return status;
      }
    };

    const getSizeLabel = (size: BrandSize) => {
      switch (size) {
        case "startup":
          return "Startup";
        case "small":
          return "Pequeña";
        case "medium":
          return "Mediana";
        case "large":
          return "Grande";
        case "enterprise":
          return "Empresa";
        default:
          return size;
      }
    };

    const getStatusColor = (status: BrandStatus) => {
      switch (status) {
        case "active":
          return "bg-green-500";
        case "inactive":
          return "bg-red-500";
        case "pending":
          return "bg-yellow-500";
        default:
          return "bg-gray-500";
      }
    };

    return (
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden mb-6">
        <div className="px-6 py-4">
          {/* Header con título y botón */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
            <div>
              <h1 className="text-lg font-semibold text-gray-900">Marcas</h1>
              <p className="text-gray-500 text-sm">
                {!roleLoading && isRoleCached() && isViewer()
                  ? "Visualiza todas las marcas de la organización"
                  : "Gestiona y supervisa todas tus marcas"}
              </p>
            </div>
            {/* Solo mostrar botón "Nueva Marca" si NO es viewer */}
            {!roleLoading && isRoleCached() && !isViewer() && (
              <div className="flex items-center gap-3">
                <Button
                  onClick={onCreateBrand}
                  className="bg-gradient-to-r from-blue-600 to-blue-700 text-white font-medium shadow-sm hover:from-blue-700 hover:to-blue-800 hover:shadow-md transition-all duration-200 text-sm"
                >
                  <Plus className="h-3.5 w-3.5 mr-1.5" />
                  Nueva Marca
                </Button>
              </div>
            )}
          </div>

          {/* Filtros integrados - SIN separación visual */}
          <div className="flex flex-col lg:flex-row items-center gap-3">
            {/* Búsqueda */}
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Buscar marcas..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-9 text-sm bg-gray-50 border-gray-200 focus:bg-white focus:border-blue-300 focus:ring-2 focus:ring-blue-100 transition-all duration-200"
              />
            </div>

            {/* Filtros */}
            <div className="flex items-center gap-4">
              {/* Estado */}
              {uniqueStatuses.length > 0 && (
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[220px] h-9 text-sm bg-gray-50 border-gray-200 focus:bg-white focus:border-blue-300 text-left">
                    <SelectValue placeholder="Por estado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos los estados</SelectItem>
                    {uniqueStatuses.map((status) => (
                      <SelectItem key={status} value={status}>
                        <div className="flex items-center gap-2">
                          <div
                            className={`w-2 h-2 rounded-full ${getStatusColor(
                              status
                            )}`}
                          ></div>
                          {getStatusLabel(status)}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}

              {/* País */}
              {uniqueCountries.length > 0 && (
                <Select value={countryFilter} onValueChange={setCountryFilter}>
                  <SelectTrigger className="w-[220px] h-9 text-sm bg-gray-50 border-gray-200 focus:bg-white focus:border-blue-300 text-left">
                    <SelectValue placeholder="Por país" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos los países</SelectItem>
                    {uniqueCountries.map((country) => (
                      <SelectItem key={country} value={country}>
                        <div className="flex items-center gap-2">
                          <Globe className="h-4 w-4 text-gray-600" />
                          {country}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}

              {/* Tamaño */}
              {uniqueSizes.length > 0 && (
                <Select value={sizeFilter} onValueChange={setSizeFilter}>
                  <SelectTrigger className="w-[220px] h-9 text-sm bg-gray-50 border-gray-200 focus:bg-white focus:border-blue-300 text-left">
                    <SelectValue placeholder="Por tamaño" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos los tamaños</SelectItem>
                    {uniqueSizes.map((size) => (
                      <SelectItem key={size} value={size}>
                        <div className="flex items-center gap-2">
                          <TrendingUp className="h-4 w-4 text-gray-600" />
                          {getSizeLabel(size)}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }
);

BrandsHeaderWithFilters.displayName = "BrandsHeaderWithFilters";

// Grid de marcas - solo muestra los resultados filtrados
const BrandsGrid = memo(
  ({
    brands,
    loading,
    onEdit,
    onDelete,
    onCreateBrand,
  }: {
    brands: Brand[];
    loading: boolean;
    onEdit: (brand: Brand) => void;
    onDelete: (brand: Brand) => void;
    onCreateBrand: () => void;
  }) => {
    if (loading) {
      return (
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {Array.from({ length: 4 }).map((_, index) => (
                <BrandCardSkeleton key={index} />
              ))}
            </div>
          </div>
        </div>
      );
    }

    if (!brands.length) {
      return (
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
          <div className="flex flex-col items-center justify-center pt-24 pb-16">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 mx-auto bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-200 rounded-full flex items-center justify-center">
                <svg
                  className="w-8 h-8 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                  />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  No hay marcas disponibles
                </h3>
                <p className="text-gray-500 mt-1">
                  No se encontraron marcas que coincidan con los filtros
                  seleccionados
                </p>
              </div>
              <Button
                onClick={onCreateBrand}
                className="bg-gradient-to-r from-blue-600 to-blue-700 text-white font-medium shadow-sm hover:from-blue-700 hover:to-blue-800 hover:shadow-md transition-all duration-200"
              >
                <Plus className="h-4 w-4 mr-2" />
                Crear Nueva Marca
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {brands.map((brand) => (
              <BrandCard
                key={brand.id}
                brand={brand}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            ))}
          </div>
        </div>
      </div>
    );
  }
);

BrandsGrid.displayName = "BrandsGrid";

const BrandsListComponent = ({
  brands,
  loading,
  onBrandUpdated,
  onCreateBrand,
}: BrandsListProps) => {
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedBrand, setSelectedBrand] = useState<Brand | null>(null);
  const [filteredBrands, setFilteredBrands] = useState<Brand[]>(brands);

  // Actualizar marcas filtradas cuando cambien las marcas originales
  useEffect(() => {
    setFilteredBrands(brands);
  }, [brands]);

  const handleCreateBrand = useCallback(() => {
    setCreateModalOpen(true);
  }, []);

  const handleEditBrand = useCallback((brand: Brand) => {
    setSelectedBrand(brand);
    setEditModalOpen(true);
  }, []);

  const handleDeleteBrand = useCallback((brand: Brand) => {
    setSelectedBrand(brand);
    setDeleteModalOpen(true);
  }, []);

  const handleBrandUpdated = useCallback(() => {
    if (onBrandUpdated) {
      onBrandUpdated();
    }
  }, [onBrandUpdated]);

  const handleBrandCreated = useCallback(() => {
    if (onCreateBrand) {
      onCreateBrand();
    }
    if (onBrandUpdated) {
      onBrandUpdated();
    }
  }, [onCreateBrand, onBrandUpdated]);

  const handleFilteredBrandsChange = useCallback(
    (newFilteredBrands: Brand[]) => {
      setFilteredBrands(newFilteredBrands);
    },
    []
  );

  return (
    <div className="space-y-6">
      {/* Header unificado con filtros - TODO EN UNA SOLA SECCIÓN */}
      <BrandsHeaderWithFilters
        brands={brands}
        onFilteredBrandsChange={handleFilteredBrandsChange}
        onCreateBrand={handleCreateBrand}
      />

      {/* Grid - muestra solo resultados filtrados */}
      <BrandsGrid
        brands={filteredBrands}
        loading={loading}
        onEdit={handleEditBrand}
        onDelete={handleDeleteBrand}
        onCreateBrand={handleCreateBrand}
      />

      {/* Modals */}
      <CreateBrandModal
        open={createModalOpen}
        onOpenChange={setCreateModalOpen}
        onCreated={handleBrandCreated}
      />

      {selectedBrand && (
        <>
          <EditBrandModal
            open={editModalOpen}
            onOpenChange={setEditModalOpen}
            brand={selectedBrand}
            onUpdated={handleBrandUpdated}
          />

          <DeleteBrandModal
            open={deleteModalOpen}
            onOpenChange={setDeleteModalOpen}
            brand={selectedBrand}
            onDeleted={handleBrandUpdated}
          />
        </>
      )}
    </div>
  );
};

export const BrandsList = memo(BrandsListComponent);
