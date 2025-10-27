"use client";

import { useState, useEffect } from "react";
import { UserPlus, Search, X, CheckCircle, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { OrganizationMember } from "@/types/users";
import { Campaign } from "@/types/campaign";
import { campaignService } from "@/lib/services/campaign";
import { useToast } from "@/hooks/common/useToast";

// Función para invalidar el cache de campañas globalmente
const invalidateCampaignCache = () => {
  if (typeof window !== "undefined") {

    // Invalidar cache del hook useCampaigns
    if ((window as any).invalidateCampaignCache) {
      (window as any).invalidateCampaignCache();
    }

    // Invalidar cache del servicio de campañas
    if ((window as any).__campaignServicePendingRequests) {
      (window as any).__campaignServicePendingRequests.clear();
    }

    // Disparar evento para notificar a otros componentes
    window.dispatchEvent(new CustomEvent("campaign-cache-invalidated"));

    
  }
};

interface AssignCampaignModalProps {
  user: OrganizationMember | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function AssignCampaignModal({
  user,
  isOpen,
  onClose,
  onSuccess,
}: AssignCampaignModalProps) {
  const { toast } = useToast();

  // Estados para campañas
  const [allCampaigns, setAllCampaigns] = useState<Campaign[]>([]);
  const [assignedCampaigns, setAssignedCampaigns] = useState<Campaign[]>([]);
  const [loadingCampaigns, setLoadingCampaigns] = useState(false);
  const [loadingAssigned, setLoadingAssigned] = useState(false);
  const [campaignSearch, setCampaignSearch] = useState("");
  const [selectedCampaigns, setSelectedCampaigns] = useState<string[]>([]);

  // Estados para operaciones
  const [isAssigning, setIsAssigning] = useState(false);
  const [unassigningCampaignId, setUnassigningCampaignId] = useState<
    string | null
  >(null);
  const [assignError, setAssignError] = useState<string | null>(null);
  const [assignSuccess, setAssignSuccess] = useState(false);

  // Cargar campañas cuando se abre el modal
  useEffect(() => {
    if (isOpen && user) {
      loadAllCampaigns();
      loadAssignedCampaigns();
    }
  }, [isOpen, user]);

  const loadAllCampaigns = async () => {
    setLoadingCampaigns(true);
    try {
      const campaignsData = await campaignService.getCampaigns();
      setAllCampaigns(campaignsData);
    } catch (error: any) {
      console.error("Error loading campaigns:", error);
      toast({
        title: "Error",
        description: "No se pudieron cargar las campañas",
        variant: "destructive",
      });
    } finally {
      setLoadingCampaigns(false);
    }
  };

  const loadAssignedCampaigns = async () => {
    if (!user) return;

    setLoadingAssigned(true);
    try {
      // Obtener las campañas asignadas al usuario específico
      const assignedData = await campaignService.getUserCampaigns(user.user_id);
      

      // Extraer las campañas de la estructura anidada
      const campaigns = assignedData
        .map((item: any) => item.campaigns)
        .filter(Boolean);
      

      setAssignedCampaigns(campaigns);
    } catch (error: any) {
      console.error("Error loading assigned campaigns:", error);
      toast({
        title: "Error",
        description: "No se pudieron cargar las campañas asignadas",
        variant: "destructive",
      });
    } finally {
      setLoadingAssigned(false);
    }
  };

  // Manejar selección/deselección de campañas para asignar
  const handleCampaignToggle = (campaignId: string) => {
    setSelectedCampaigns((prev) =>
      prev.includes(campaignId)
        ? prev.filter((id) => id !== campaignId)
        : [...prev, campaignId]
    );
  };

  // Asignar campañas al usuario
  const handleAssignToCampaigns = async () => {
    if (!user || selectedCampaigns.length === 0) return;

    setIsAssigning(true);
    setAssignError(null);
    setAssignSuccess(false);

    try {
      // Asignar el usuario a cada campaña seleccionada
      await Promise.all(
        selectedCampaigns.map((campaignId) =>
          campaignService.assignUsersToCampaign(campaignId, [user.user_id])
        )
      );

      setAssignSuccess(true);
      toast({
        title: "Éxito",
        description: `Usuario asignado a ${selectedCampaigns.length} campaña${
          selectedCampaigns.length !== 1 ? "s" : ""
        }`,
        variant: "default",
      });

      // Invalidar cache de campañas para actualizar la vista principal
      setTimeout(() => {
        invalidateCampaignCache();
      }, 500); // Pequeño delay para asegurar que la operación se complete

      // Actualizar inmediatamente el estado local
      const newlyAssignedCampaigns = allCampaigns.filter((campaign) =>
        selectedCampaigns.includes(campaign.id)
      );
      
      setAssignedCampaigns((prev) => {
        const updated = [...prev, ...newlyAssignedCampaigns];
        
        return updated;
      });

      // Limpiar estado
      setSelectedCampaigns([]);
      setCampaignSearch("");
      setAssignSuccess(false);
      onSuccess?.();
    } catch (error: any) {
      console.error("Error assigning user to campaigns:", error);
      setAssignError(
        error.message || "Error al asignar usuario a las campañas"
      );
      toast({
        title: "Error",
        description: error.message || "Error al asignar usuario a las campañas",
        variant: "destructive",
      });
    } finally {
      setIsAssigning(false);
    }
  };

  // Desasignar una campaña específica del usuario
  const handleUnassignSingleCampaign = async (campaignId: string) => {
    if (!user) return;

    
    setUnassigningCampaignId(campaignId);
    setAssignError(null);

    try {
      // Desasignar el usuario de la campaña específica
      const result = await campaignService.removeUsersFromCampaign(campaignId, [
        user.user_id,
      ]);
      

      toast({
        title: "Éxito",
        description: "Usuario desasignado de la campaña",
        variant: "default",
      });

      // Invalidar cache de campañas para actualizar la vista principal
      setTimeout(() => {
        invalidateCampaignCache();
      }, 500); // Pequeño delay para asegurar que la operación se complete

      // Actualizar inmediatamente el estado local
      setAssignedCampaigns((prev) => {
        const updated = prev.filter((campaign) => campaign.id !== campaignId);
            
        return updated;
      });
      onSuccess?.();
    } catch (error: any) {
      console.error("Error unassigning user from campaign:", error);
      setAssignError(
        error.message || "Error al desasignar usuario de la campaña"
      );
      toast({
        title: "Error",
        description:
          error.message || "Error al desasignar usuario de la campaña",
        variant: "destructive",
      });
    } finally {
      setUnassigningCampaignId(null);
    }
  };

  // Limpiar estado al cerrar
  const handleClose = () => {
    setSelectedCampaigns([]);
    setCampaignSearch("");
    setAssignError(null);
    setAssignSuccess(false);
    setUnassigningCampaignId(null);
    onClose();
  };

  // Filtrar campañas disponibles (excluyendo las ya asignadas)
  const availableCampaigns = allCampaigns.filter(
    (campaign) =>
      !assignedCampaigns.some((assigned) => assigned.id === campaign.id)
  );

  // Filtrar campañas por búsqueda
  const filteredAvailableCampaigns = availableCampaigns.filter((campaign) =>
    (campaign.name || "").toLowerCase().includes(campaignSearch.toLowerCase())
  );

  const filteredAssignedCampaigns = assignedCampaigns.filter((campaign) =>
    (campaign.name || "").toLowerCase().includes(campaignSearch.toLowerCase())
  );

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-[90vw] lg:max-w-[1000px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Gestionar campañas de {user?.full_name || user?.email}
          </DialogTitle>
          <DialogDescription>
            Asigna o desasigna campañas para este usuario
          </DialogDescription>
        </DialogHeader>

        {/* 🎯 BUSCADOR DE CAMPAÑAS */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Buscar campañas..."
              value={campaignSearch}
              onChange={(e) => setCampaignSearch(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* 🎯 LAYOUT DE DOS COLUMNAS */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* 🎯 COLUMNA IZQUIERDA - CAMPAÑAS ASIGNADAS */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              Campañas asignadas ({assignedCampaigns.length})
            </h3>

            {loadingAssigned ? (
              <div className="text-center py-12">
                <div className="animate-spin h-8 w-8 border-2 border-green-600 border-t-transparent rounded-full mx-auto"></div>
                <p className="text-gray-500 text-sm mt-3">
                  Cargando campañas asignadas...
                </p>
              </div>
            ) : filteredAssignedCampaigns.length > 0 ? (
              <div className="space-y-3 max-h-96 overflow-y-auto border border-gray-200 rounded-lg p-4 bg-gray-50">
                {filteredAssignedCampaigns.map((campaign) => (
                  <div
                    key={campaign.id}
                    className="flex items-center justify-between p-4 border rounded-lg transition-colors bg-white border-green-200 shadow-sm"
                  >
                    <div className="flex-1">
                      <span className="font-medium text-gray-900">
                        {campaign.name || "Campaña sin nombre"}
                      </span>
                      {campaign.status && (
                        <span className="ml-2 text-xs text-gray-500">
                          ({campaign.status})
                        </span>
                      )}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleUnassignSingleCampaign(campaign.id)}
                      disabled={unassigningCampaignId === campaign.id}
                      className="bg-white border-red-300 text-red-700 hover:bg-red-50 hover:border-red-400"
                    >
                      {unassigningCampaignId === campaign.id
                        ? "..."
                        : "Desasignar"}
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 border border-dashed border-gray-300 rounded-lg bg-gray-50">
                <CheckCircle className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-500 text-sm">
                  {campaignSearch.trim()
                    ? "No se encontraron campañas asignadas"
                    : "No tiene campañas asignadas"}
                </p>
              </div>
            )}
          </div>

          {/* 🎯 COLUMNA DERECHA - CAMPAÑAS DISPONIBLES */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Plus className="h-5 w-5 text-blue-600" />
              Campañas disponibles ({availableCampaigns.length})
            </h3>

            {loadingCampaigns ? (
              <div className="text-center py-12">
                <div className="animate-spin h-8 w-8 border-2 border-blue-600 border-t-transparent rounded-full mx-auto"></div>
                <p className="text-gray-500 text-sm mt-3">
                  Cargando campañas disponibles...
                </p>
              </div>
            ) : filteredAvailableCampaigns.length > 0 ? (
              <div className="space-y-3 max-h-96 overflow-y-auto border border-gray-200 rounded-lg p-4 bg-gray-50">
                {filteredAvailableCampaigns.map((campaign) => (
                  <div
                    key={campaign.id}
                    className={`flex items-center justify-between p-4 border rounded-lg cursor-pointer transition-colors ${
                      selectedCampaigns.includes(campaign.id)
                        ? "bg-blue-50 border-blue-300 shadow-sm"
                        : "bg-white border-gray-200 hover:bg-gray-50 hover:border-gray-300"
                    }`}
                    onClick={() => handleCampaignToggle(campaign.id)}
                  >
                    <span className="font-medium text-gray-900">
                      {campaign.name}
                    </span>

                    {selectedCampaigns.includes(campaign.id) && (
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 border border-dashed border-gray-300 rounded-lg bg-gray-50">
                <Plus className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-500 text-sm">
                  {campaignSearch.trim()
                    ? "No se encontraron campañas disponibles"
                    : "No hay campañas disponibles para asignar"}
                </p>
              </div>
            )}
          </div>
        </div>

        {assignError && (
          <div className="text-red-600 text-sm bg-red-50 p-4 rounded-md border border-red-200 mt-6">
            {assignError}
          </div>
        )}

        {assignSuccess && (
          <div className="text-green-600 text-sm bg-green-50 p-4 rounded-md border border-green-200 mt-6">
            ¡Usuario asignado exitosamente!
          </div>
        )}

        <DialogFooter className="flex items-center justify-between mt-6">
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleClose}>
              Cancelar
            </Button>

            {/* Botón para asignar */}
            {selectedCampaigns.length > 0 && (
              <Button
                onClick={handleAssignToCampaigns}
                disabled={selectedCampaigns.length === 0 || isAssigning}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isAssigning
                  ? "Asignando..."
                  : `Asignar ${selectedCampaigns.length} campaña${
                      selectedCampaigns.length !== 1 ? "s" : ""
                    }`}
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
