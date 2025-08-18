"use client";

import { useEffect, useState, useCallback } from "react";
import { BrandsList } from "./BrandsList";
import { useBrands } from "@/hooks/brands";
import { toast } from "sonner";

export const BrandsView = () => {
  const { brands, loading, error, getBrands, refreshBrands } = useBrands();

  // Cargar marcas solo una vez al montar el componente
  useEffect(() => {
    getBrands();
  }, []); // Removido getBrands de las dependencias para evitar re-ejecuciones

  // Manejar actualización de marcas
  const handleBrandUpdated = useCallback(() => {
    refreshBrands();
  }, [refreshBrands]);

  // Manejar creación de marca
  const handleCreateBrand = useCallback(() => {
    refreshBrands();
  }, [refreshBrands]);

  // Mostrar error si hay alguno
  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  return (
    <div className="flex gap-3">
      {/* Contenido principal */}
      <div className="flex-1">
        <BrandsList
          brands={brands}
          loading={loading}
          onBrandUpdated={handleBrandUpdated}
          onCreateBrand={handleCreateBrand}
        />
      </div>
    </div>
  );
};
