import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Campaign } from "@/types/campaign";
import { campaignService } from "@/lib/services/campaign";
import { Loader2, Trash2, X, AlertTriangle } from "lucide-react";

interface DeleteCampaignModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  campaign: Campaign | null;
  onDeleted: () => void;
}

export const DeleteCampaignModal = ({ 
  open, 
  onOpenChange, 
  campaign, 
  onDeleted 
}: DeleteCampaignModalProps) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Solo mostrar estos estados
  const allowedStates = ['draft', 'planned', 'active'];
  const getDisplayStatus = (status: string) => {
    if (allowedStates.includes(status)) {
      if (status === 'draft') return 'Borrador';
      if (status === 'planned') return 'Planificada';
      if (status === 'active') return 'Activa';
    }
    return 'Otro';
  };

  const handleDelete = async () => {
    if (!campaign) return;
    
    setLoading(true); // Mostrar loader inmediatamente
    try {
      setError(null);
      await campaignService.deleteCampaign(campaign.id);
      onDeleted();
      onOpenChange(false);
    } catch (err) {
      console.error('Error deleting campaign:', err);
      setError('Error al eliminar la campaña. Por favor, intenta de nuevo.');
      setLoading(false); // Permitir reintentar
    }
  };

  const handleClose = () => {
    setError(null);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px] bg-white">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            Eliminar Campaña
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-3">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="text-sm font-medium text-yellow-800">
                  ¿Estás seguro de que quieres eliminar esta campaña?
                </h3>
                <p className="text-sm text-yellow-700 mt-1">
                  Esta acción no se puede deshacer. Se eliminará permanentemente:
                </p>
                <ul className="text-sm text-yellow-700 mt-2 list-disc list-inside space-y-1">
                  <li>La campaña <strong>"{campaign?.name}"</strong></li>
                  <li>Todos los influencers asociados</li>
                  <li>Todos los posts y métricas</li>
                  <li>Todo el historial de la campaña</li>
                </ul>
              </div>
            </div>
          </div>

          {campaign && (
            <div className="bg-gray-50 rounded-md p-4">
              <h4 className="text-sm font-medium text-gray-900 mb-2">
                Detalles de la campaña a eliminar:
              </h4>
              <div className="space-y-1 text-sm text-gray-600">
                <p><strong>Nombre:</strong> {campaign.name}</p>
                <p><strong>Estado:</strong> {getDisplayStatus(campaign.status)}</p>
                <p><strong>Presupuesto:</strong> ${campaign.budget.toLocaleString()} {campaign.currency}</p>
                <p><strong>Periodo:</strong> {campaign.start_date} - {campaign.end_date}</p>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={loading}
          >
            <X className="h-4 w-4 mr-2" />
            Cancelar
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleDelete}
            disabled={loading}
            className="bg-red-600 hover:bg-red-700"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Trash2 className="h-4 w-4 mr-2" />
            )}
            {loading ? 'Eliminando...' : 'Eliminar Campaña'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}; 