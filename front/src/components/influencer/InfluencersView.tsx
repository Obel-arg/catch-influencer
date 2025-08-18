"use client";

import { useState, useMemo, useEffect } from "react";
import { Users, Search, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useInfluencers } from "@/hooks/influencer/useInfluencers";
import InfluencerTable from "./InfluencerTable";
import { AddCreatorModal } from "./AddCreatorModal";
import { useRoleCache } from "@/hooks/auth/useRoleCache";

export function InfluencersView() {
  const { influencers = [], loading, getInfluencers } = useInfluencers();
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddCreatorModal, setShowAddCreatorModal] = useState(false);
  const { isViewer, loading: roleLoading, isRoleCached } = useRoleCache();

  // Cargar influencers al montar el componente
  useEffect(() => {
    const loadInfluencers = async () => {
      const result = await getInfluencers(); // Sin parámetros, usar paginación por defecto
    };
    loadInfluencers();
  }, []); // Solo se ejecuta una vez al montar

  // Filtrar influencers
  const filteredInfluencers = useMemo(() => {
    if (!searchQuery.trim()) {
      return influencers;
    }

    const query = searchQuery.toLowerCase();
    return influencers.filter(
      (influencer) =>
        influencer.name?.toLowerCase().includes(query) ||
        influencer.country?.toLowerCase().includes(query)
    );
  }, [influencers, searchQuery]);

  return (
    <div className="space-y-6">
      {/* Header con contenedor blanco */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
        <div className="px-6 py-4">
          {/* Header con título y contador */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
            <div>
              <h1 className="text-lg font-semibold text-gray-900">
                Influencers
              </h1>
              <p className="text-gray-500 text-sm">
                {!roleLoading && isRoleCached() && isViewer()
                  ? "Visualiza todos los influencers de la organización"
                  : "Gestiona y analiza tus influencers"}
              </p>
            </div>
            {/* Solo mostrar botón "Agregar creador" si NO es viewer */}
            {!roleLoading && isRoleCached() && !isViewer() && (
              <div className="ml-auto">
                <Button
                  variant="default"
                  onClick={() => setShowAddCreatorModal(true)}
                  className="flex items-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Agregar creador
                </Button>
              </div>
            )}
          </div>

          {/* Búsqueda */}
          <div className="flex items-center gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Buscar influencers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-9 text-sm bg-gray-50 border-gray-200 focus:bg-white focus:border-blue-300 focus:ring-2 focus:ring-blue-100 transition-all duration-200"
              />
            </div>
            <div className="flex items-center gap-3 ml-auto">
              {filteredInfluencers.length > 0 && (
                <span className="text-sm text-gray-500">
                  {filteredInfluencers.length} influencer
                  {filteredInfluencers.length !== 1 ? "s" : ""}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Tabla de influencers con contenedor blanco */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
        <div className="p-6">
          <InfluencerTable
            influencers={filteredInfluencers}
            loading={loading}
            searchQuery={searchQuery}
          />
        </div>
      </div>

      {/* Modal Agregar Creador */}
      <AddCreatorModal
        isOpen={showAddCreatorModal}
        onClose={() => setShowAddCreatorModal(false)}
      />
    </div>
  );
}
