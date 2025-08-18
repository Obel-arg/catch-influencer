"use client";

import React, { useState, useEffect } from 'react';
import { Calendar, DollarSign, Target, Users, Edit, Loader2, X } from 'lucide-react';
import { brandService } from '@/lib/services/brands';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { BrandCampaign } from '@/types/brands';
import { useToast } from '@/hooks/common/useToast';

interface EditBrandCampaignModalProps {
  brandCampaign: BrandCampaign;
  brandName: string;
  onCampaignUpdated?: () => void;
  onClose: () => void;
}

export const EditBrandCampaignModal: React.FC<EditBrandCampaignModalProps> = ({
  brandCampaign,
  brandName,
  onCampaignUpdated,
  onClose
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { showToast } = useToast();
  
  // Estados para los campos editables
  const [role, setRole] = useState(brandCampaign.role || 'sponsor');

  const handleSave = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const updateData = {
        role
      };

      await brandService.updateBrandCampaignById(brandCampaign.id, updateData);
      
      // Mostrar toast de éxito
      showToast({
        title: "¡Actualizado exitosamente!",
        description: "El rol de la marca ha sido actualizado correctamente.",
        status: "success",
      });
      
      // Cerrar modal inmediatamente
      onClose();
      
      if (onCampaignUpdated) {
        onCampaignUpdated();
      }
    } catch (error: any) {
      console.error('Error updating brand campaign:', error);
      setError('Error al actualizar la campaña. Inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200 text-xs px-2 py-0.5 font-semibold">Activa</Badge>;
      case "completed":
        return <Badge className="bg-blue-100 text-blue-800 border-blue-200 text-xs px-2 py-0.5 font-semibold">Completada</Badge>;
      case "draft":
        return <Badge className="bg-gray-100 text-gray-800 border-gray-200 text-xs px-2 py-0.5 font-semibold">Borrador</Badge>;
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200 text-xs px-2 py-0.5 font-semibold">Pendiente</Badge>;
      case "inactive":
        return <Badge className="bg-red-100 text-red-800 border-red-200 text-xs px-2 py-0.5 font-semibold">Inactiva</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800 border-gray-200 text-xs px-2 py-0.5 font-semibold">{status}</Badge>;
    }
  };

  return (
    <>
      {/* OVERLAY */}
      <div 
        className="fixed inset-0 bg-black/50 z-50" 
        onClick={onClose}
      />
    
      {/* MODAL CONTENT */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div 
          className="w-full max-w-md bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* HEADER */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Editar asignación a Campaña</h2>
              <p className="text-sm text-gray-600 mt-1">
                {brandCampaign.campaigns?.name} - {brandName}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
            >
              <X className="h-5 w-5 text-gray-500" />
            </button>
          </div>

          {/* CONTENT */}
          <div className="p-4 space-y-4">
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            {/* Campo editable */}
            <div className="space-y-2">
              <Label htmlFor="role" className="text-sm font-medium text-gray-700">Rol de la Marca</Label>
              <Select value={role} onValueChange={setRole}>
                <SelectTrigger className="w-full border-gray-200 bg-white hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors">
                  <SelectValue placeholder="Seleccionar rol" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sponsor">Sponsor</SelectItem>
                  <SelectItem value="partner">Partner</SelectItem>
                  <SelectItem value="collaborator">Colaborador</SelectItem>
                  <SelectItem value="client">Cliente</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* FOOTER */}
          <div className="flex items-center justify-end gap-3 p-4 border-t border-gray-200 bg-gray-50">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSave}
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Guardando...
                </>
              ) : (
                <>
                  <Edit className="h-4 w-4 mr-2" />
                  Guardar Cambios
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}; 