import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Campaign, CampaignStatus } from "@/types/campaign";
import { campaignService } from "@/lib/services/campaign";
import { Loader2, Save, X } from "lucide-react";
import { CAMPAIGN_STATUS_LABELS, CAMPAIGN_GOALS, CAMPAIGN_GOAL_UNITS } from "@/constants/campaign";
import { formatStatus } from "@/utils/campaign";
import { useToast } from "@/components/ui/use-toast";
import { CampaignGoal } from "@/types/campaign";

interface EditCampaignModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  campaign: Campaign | null;
  onUpdated: () => void;
}

export const EditCampaignModal = ({ 
  open, 
  onOpenChange, 
  campaign, 
  onUpdated 
}: EditCampaignModalProps) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    budget: 0,
    startDate: '',
    endDate: '',
    status: 'draft' as CampaignStatus,
    currency: 'USD',
    goals: [] as CampaignGoal[]
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  
  // Estado separado para manejar los valores de input temporales
  const [goalInputValues, setGoalInputValues] = useState<Record<string, string>>({});

  const parseCampaignGoals = (goals: any): CampaignGoal[] => {
    if (!goals) return [];

    // Si es un string JSON, parsear todo el array
    if (typeof goals === 'string') {
      try {
        const parsed = JSON.parse(goals);
        return parseCampaignGoals(parsed);
      } catch {
        return [];
      }
    }

    // Si es un array de strings JSON, parsear cada uno
    if (Array.isArray(goals)) {
      return goals.map((goal: any) => {
        if (typeof goal === 'string') {
          try {
            return JSON.parse(goal);
          } catch {
            return null;
          }
        }
        return goal;
      }).filter((g): g is CampaignGoal => g && typeof g.type === 'string' && typeof g.value !== 'undefined');
    }

    // Si es un solo objeto
    if (typeof goals === 'object' && goals !== null && typeof goals.type === 'string') {
      return [goals];
    }

    return [];
  };

  // 🚀 Al abrir el modal, siempre hace un fetch fresco al backend
  useEffect(() => {
    if (open && campaign?.id) {
      setLoading(true);
      campaignService.getCampaignById(campaign.id)
        .then((freshCampaign) => {
          // eslint-disable-next-line no-console
          // eslint-disable-next-line no-console
          const parsedGoals = parseCampaignGoals(freshCampaign.goals);
          setFormData({
            name: freshCampaign.name || '',
            description: freshCampaign.description || '',
            budget: freshCampaign.budget || 0,
            startDate: freshCampaign.start_date ? freshCampaign.start_date.split('T')[0] : '',
            endDate: freshCampaign.end_date ? freshCampaign.end_date.split('T')[0] : '',
            status: freshCampaign.status || 'draft',
            currency: freshCampaign.currency || 'USD',
            goals: parsedGoals
          });
          // Inicializar valores de input con los valores existentes
          const inputValues: Record<string, string> = {};
          parsedGoals.forEach(goal => {
            if(goal && goal.value !== undefined) {
              inputValues[goal.type] = goal.value.toString();
            }
          });
          setGoalInputValues(inputValues);
        })
        .catch((err) => {
          setError('Error al cargar la campaña actualizada');
          // eslint-disable-next-line no-console
          console.error('[EditCampaignModal] Error fetching fresh campaign:', err);
        })
        .finally(() => setLoading(false));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, campaign?.id]);

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    setError(null);
  };

  const handleGoalChange = (goalType: string, checked: boolean) => {
    if (checked) {
      const newGoal: CampaignGoal = {
        type: goalType,
        value: 0,
        unit: getDefaultUnit(goalType)
      };
      setFormData(prev => ({ ...prev, goals: [...prev.goals, newGoal] }));
      setGoalInputValues({ ...goalInputValues, [goalType]: '' });
    } else {
      setFormData(prev => ({ ...prev, goals: prev.goals.filter(g => g.type !== goalType) }));
      const newInputValues = { ...goalInputValues };
      delete newInputValues[goalType];
      setGoalInputValues(newInputValues);
    }
    setError(null);
  };

  const handleGoalValueChange = (goalType: string, inputValue: string) => {
    // Actualizar el valor del input inmediatamente
    setGoalInputValues({ ...goalInputValues, [goalType]: inputValue });
    
    // Solo actualizar el valor numérico si es un número válido
    const numericValue = parseFloat(inputValue);
    if (!isNaN(numericValue) && numericValue >= 0) {
      setFormData(prev => ({
        ...prev,
        goals: prev.goals.map(goal =>
          goal.type === goalType ? { ...goal, value: numericValue } : goal
        )
      }));
    }
    setError(null);
  };

  const getDefaultUnit = (goalType: string): string => {
    return CAMPAIGN_GOAL_UNITS[goalType as keyof typeof CAMPAIGN_GOAL_UNITS] || '';
  };

  const availableGoals = CAMPAIGN_GOALS;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!campaign) return;
    
    if (!formData.name.trim()) {
      setError('El nombre de la campaña es requerido');
      return;
    }

    if (formData.budget <= 0) {
      setError('El presupuesto debe ser mayor a 0');
      return;
    }

    if (!formData.startDate || !formData.endDate) {
      setError('Las fechas de inicio y fin son requeridas');
      return;
    }

    if (new Date(formData.startDate) >= new Date(formData.endDate)) {
      setError('La fecha de fin debe ser posterior a la fecha de inicio');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      await campaignService.updateCampaign(campaign.id, {
        name: formData.name.trim(),
        description: formData.description.trim() || undefined,
        budget: formData.budget,
        start_date: new Date(formData.startDate),
        end_date: new Date(formData.endDate),
        status: formData.status,
        goals: formData.goals
      });
      
      // Mostrar notificación de éxito
      toast({
        title: "¡Campaña actualizada!",
        description: "Los cambios se han guardado correctamente.",
        variant: "default",
      });
      
      // Llamar al callback para actualizar la lista
      onUpdated();
      
      // Cerrar el modal después de un pequeño retraso para asegurar la actualización
      setTimeout(() => {
        onOpenChange(false);
      }, 100);
    } catch (err: any) {
      console.error('❌ Error updating campaign:', err);
      
      // Manejo más específico de errores
      if (err.response) {
        // El servidor respondió con un error
        const status = err.response.status;
        const message = err.response.data?.message || err.response.statusText;
        
        console.error('Server error details:', {
          status,
          message,
          data: err.response.data
        });
        
        if (status === 400) {
          setError(`Error de validación: ${message}`);
        } else if (status === 401) {
          setError('No autorizado. Por favor, inicia sesión nuevamente.');
        } else if (status === 403) {
          setError('No tienes permisos para actualizar esta campaña.');
        } else if (status === 404) {
          setError('Campaña no encontrada.');
        } else if (status >= 500) {
          setError('Error del servidor. Por favor, intenta más tarde.');
        } else {
          setError(`Error del servidor: ${message}`);
        }
      } else if (err.request) {
        // La petición se hizo pero no hubo respuesta
        console.error('Network error - no response received');
        setError('Error de conexión. Verifica tu conexión a internet y que el servidor esté funcionando.');
      } else {
        // Error en la configuración de la petición
        console.error('Request setup error:', err.message);
        setError('Error en la configuración de la petición.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setError(null);
    onOpenChange(false);
  };

  const getStatusColor = (status: CampaignStatus): string => {
    const statusColors: Record<CampaignStatus, string> = {
      draft: 'text-orange-600',
      active: 'text-green-600',
      paused: 'text-yellow-600',
      completed: 'text-blue-600',
      planned: 'text-blue-600'
    };
    return statusColors[status] || 'text-gray-600';
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-3xl bg-white">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Save className="h-5 w-5 text-blue-600" />
            Editar Campaña
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-6 max-h-[70vh] overflow-y-auto pr-4 -mr-2">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-md p-3">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
              {/* Nombre */}
              <div className="md:col-span-2">
                <Label htmlFor="name">Nombre de la campaña *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Ej: Campaña Verano 2024"
                  className="mt-1"
                  disabled={loading}
                />
              </div>

              {/* Descripción */}
              <div className="md:col-span-2">
                <Label htmlFor="description">Descripción</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Describe los objetivos y detalles de la campaña..."
                  className="mt-1"
                  rows={3}
                  disabled={loading}
                />
              </div>
              
              {/* Presupuesto */}
              <div>
                <Label htmlFor="budget">Presupuesto *</Label>
                <div className="mt-1 relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                    $
                  </span>
                  <Input
                    id="budget"
                    type="number"
                    value={formData.budget}
                    onChange={(e) => handleInputChange('budget', parseFloat(e.target.value) || 0)}
                    className="pl-8"
                    min="0"
                    step="0.01"
                    disabled={loading}
                  />
                </div>
              </div>

              {/* Estado */}
              <div>
                <Label htmlFor="status">Estado</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value: CampaignStatus) => handleInputChange('status', value)}
                  disabled={loading}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue>
                      <span className={getStatusColor(formData.status)}>
                        {formatStatus(formData.status)}
                      </span>
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {(['draft', 'active', 'planned', 'paused', 'completed'] as CampaignStatus[]).map((status) => (
                      <SelectItem key={status} value={status}>
                        <span className={getStatusColor(status)}>
                          {formatStatus(status)}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Fecha de inicio */}
              <div>
                <Label htmlFor="startDate">Fecha de inicio *</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => handleInputChange('startDate', e.target.value)}
                  className="mt-1"
                  disabled={loading}
                />
              </div>

              {/* Fecha de fin */}
              <div>
                <Label htmlFor="endDate">Fecha de fin *</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => handleInputChange('endDate', e.target.value)}
                  className="mt-1"
                  disabled={loading}
                />
              </div>
            </div>
          </div>

          <DialogFooter className="flex gap-2 pt-4">
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
              type="submit"
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              {loading ? 'Guardando...' : 'Guardar Cambios'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}; 