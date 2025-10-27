"use client";

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useBrands } from '@/hooks/brands';
import { Brand } from '@/types/brands';

interface DeleteBrandModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  brand: Brand | null;
  onDeleted?: () => void;
}

export const DeleteBrandModal = ({ open, onOpenChange, brand, onDeleted }: DeleteBrandModalProps) => {
  const { deleteBrand } = useBrands();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!brand) return;

    try {
      setIsDeleting(true);
      
      const success = await deleteBrand(brand.id);
      
      if (success) {
        toast.success('Marca eliminada exitosamente');
        onDeleted?.();
        onOpenChange(false);
      } else {
        console.error('🗑️ [DEBUG] deleteBrand retornó false');
        toast.error('No se pudo eliminar la marca');
      }
    } catch (error) {
      console.error('🗑️ [DEBUG] Error en handleDelete:', error);
      console.error('🗑️ [DEBUG] Error stack:', error instanceof Error ? error.stack : 'No stack');
      toast.error(`Error al eliminar la marca: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  if (!brand) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md bg-white">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0 w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
              <AlertTriangle className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <DialogTitle className="text-lg font-semibold text-gray-900">
                Eliminar Marca
              </DialogTitle>
              <DialogDescription className="text-sm text-gray-500 mt-1">
                Esta acción no se puede deshacer
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>
        
        <div className="space-y-4">
          <p className="text-gray-700">
            ¿Estás seguro de que quieres eliminar la marca <strong>"{brand.name}"</strong>?
          </p>

          <Alert className="border-red-200 bg-red-50">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              <strong>Advertencia:</strong> Al eliminar esta marca también se eliminarán:
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>{brand.total_campaigns} campaña{brand.total_campaigns !== 1 ? 's' : ''} asociada{brand.total_campaigns !== 1 ? 's' : ''}</li>
                <li>Toda la información de contacto y configuraciones</li>
                <li>Historial de actividad y métricas</li>
              </ul>
            </AlertDescription>
          </Alert>

          <div className="bg-white border border-gray-200 p-4 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-2">Resumen de la marca:</h4>
            <div className="space-y-1 text-sm text-gray-600">
              <div className="flex justify-between">
                <span>Nombre:</span>
                <span className="font-medium">{brand.name}</span>
              </div>
              {brand.industry && (
                <div className="flex justify-between">
                  <span>Industria:</span>
                  <span className="font-medium">{brand.industry}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Estado:</span>
                <span className={`font-medium ${
                  brand.status === 'active' ? 'text-green-600' : 
                  brand.status === 'inactive' ? 'text-red-600' : 
                  'text-yellow-600'
                }`}>
                  {brand.status}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Campañas:</span>
                <span className="font-medium">{brand.total_campaigns}</span>
              </div>
              <div className="flex justify-between">
                <span>Presupuesto total:</span>
                <span className="font-medium">
                  {new Intl.NumberFormat('es-ES', {
                    style: 'currency',
                    currency: brand.currency || 'USD'
                  }).format(brand.total_budget)}
                </span>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={handleCancel}
            disabled={isDeleting}
          >
            Cancelar
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={isDeleting}
            className="bg-red-600 hover:bg-red-700"
          >
            {isDeleting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Eliminando...
              </>
            ) : (
              <>
                <Trash2 className="h-4 w-4 mr-2" />
                Eliminar Marca
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}; 