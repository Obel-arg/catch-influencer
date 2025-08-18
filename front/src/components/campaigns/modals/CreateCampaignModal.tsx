"use client";

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
import { toast } from "sonner";
import { authService } from "@/lib/services/auth";


interface CreateCampaignModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: () => void;
  createCampaign: (data: any) => Promise<any>;
}

export function CreateCampaignModal({
  open,
  onOpenChange,
  onCreated,
  createCampaign,
}: CreateCampaignModalProps) {
  const [loading, setLoading] = useState(false);
  const [userInfo, setUserInfo] = useState<{
    userId: string;
    organizationId: string;
  } | null>(null);
  const [userInfoLoading, setUserInfoLoading] = useState(false);
  const [userInfoError, setUserInfoError] = useState<string | null>(null);

  const [form, setForm] = useState({
    name: "",
    description: "",
    startDate: "",
    endDate: "",
    budget: "",
    currency: "USD",
    status: "draft"
  });

  // Obtener información del usuario logueado
  useEffect(() => {
    const getUserInfo = async () => {
      try {
        setUserInfoLoading(true);
        setUserInfoError(null);

        // Obtener el usuario actual usando authService
        const userData = await authService.getCurrentUser();

        // Verificar si userData tiene la estructura esperada
        if (
          !userData ||
          !userData.organizations ||
          !Array.isArray(userData.organizations) ||
          userData.organizations.length === 0
        ) {
          console.error("Estructura de userData inválida:", userData);
          throw new Error("No se encontraron organizaciones para el usuario");
        }

        // Usar el user_id que está en organizations (que coincide con auth.uid())
        // El user_id real está en el campo user_id, no en member.id
        const userId = userData.organizations[0].user_id;
        const organizationId = userData.organizations[0].organization_id;

        if (!userId) {
          throw new Error("No se pudo obtener el ID del usuario");
        }

        if (!organizationId) {
          throw new Error("No se encontró organización para el usuario");
        }

        setUserInfo({ userId, organizationId });

        // Limpiar error si todo salió bien
        setUserInfoError(null);
      } catch (error) {
        console.error("Error obteniendo información del usuario:", error);
        setUserInfoError(
          `Error al obtener información del usuario: ${
            error instanceof Error ? error.message : "Error desconocido"
          }`
        );
      } finally {
        setUserInfoLoading(false);
      }
    };

    if (open) {
      getUserInfo();
    }
  }, [open]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleStatusChange = (value: string) => {
    setForm({ ...form, status: value });
  };

  // 🎯 VALIDAR SI TODOS LOS CAMPOS OBLIGATORIOS ESTÁN COMPLETOS
  const isFormComplete = () => {
    return (
      form.name.trim() !== "" &&
      form.startDate !== "" &&
      form.endDate !== "" &&
      form.budget !== "" &&
      Number(form.budget) > 0
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 🎯 VALIDACIÓN COMPLETA CON MENSAJE DE ERROR
    if (!isFormComplete()) {
      toast.error("Por favor completa todos los campos obligatorios", {
        style: {
          background: '#fee2e2',
          border: '1px solid #ef4444',
          color: '#dc2626'
        }
      });
      return;
    }

    if (!userInfo) {
      console.error("No se pudo obtener la información del usuario");
      return;
    }

    const campaignData = {
      name: form.name,
      description: form.description,
      budget: Number(form.budget),
      currency: form.currency,
      start_date: new Date(form.startDate).toISOString(),
      end_date: new Date(form.endDate).toISOString(),
      status: form.status,
      organization_id: userInfo.organizationId,
      created_by: userInfo.userId,
      goals: [],
      target_audience: {},
      kpis: [],
      campaign_type: "general",
      channels: [],
      tags: [],
      settings: {},
      metadata: {},
    };

    setLoading(true);
    try {
      console.log("🚀 [CreateCampaignModal] Iniciando creación de campaña...", campaignData);
      const result = await createCampaign(campaignData);
      console.log("✅ [CreateCampaignModal] Campaña creada exitosamente:", result);
      
      toast.success("Campaña creada exitosamente");
      setForm({
        name: "",
        description: "",
        startDate: "",
        endDate: "",
        budget: "",
        currency: "USD",
        status: "draft"
      });
      
      console.log("🔄 [CreateCampaignModal] Llamando onCreated callback...");
      onCreated();
      onOpenChange(false);
    } catch (error) {
      toast.error("Error al crear la campaña");
      console.error("❌ [CreateCampaignModal] Error al crear campaña:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    onOpenChange(false);
    // Limpiar formulario al cancelar
    setForm({
      name: "",
      description: "",
      startDate: "",
      endDate: "",
      budget: "",
      currency: "USD",
      status: "draft"
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh] bg-white border-0 shadow-xl rounded-xl flex flex-col">
        <DialogHeader className="pb-4">
          <DialogTitle className="text-xl font-semibold text-gray-900 bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent">
            Crear Nueva Campaña
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto pr-2 max-h-[60vh]">
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Nombre */}
              <div className="space-y-2">
                <Label
                  htmlFor="name"
                  className="text-sm font-medium text-gray-700"
                >
                  Nombre de la campaña *
                </Label>
                <Input
                  id="name"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Ej: Campaña de verano 2024"
                  required
                  className="border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 bg-gray-50/50 hover:bg-gray-50 transition-colors"
                />
              </div>

              {/* Status */}
              <div className="space-y-2">
                <Label
                  htmlFor="status"
                  className="text-sm font-medium text-gray-700"
                >
                  Estado
                </Label>
                <Select value={form.status} onValueChange={handleStatusChange}>
                  <SelectTrigger className="border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 bg-gray-50/50 hover:bg-gray-50 transition-colors text-left justify-start">
                    <SelectValue placeholder="Selecciona un estado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Borrador</SelectItem>
                    <SelectItem value="planned">Planificada</SelectItem>
                    <SelectItem value="active">Activa</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Fecha de inicio */}
              <div className="space-y-2">
                <Label
                  htmlFor="startDate"
                  className="text-sm font-medium text-gray-700"
                >
                  Fecha de inicio *
                </Label>
                <Input
                  id="startDate"
                  type="date"
                  name="startDate"
                  value={form.startDate}
                  onChange={handleChange}
                  required
                  className="border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 bg-gray-50/50 hover:bg-gray-50 transition-colors"
                />
              </div>

              {/* Fecha de fin */}
              <div className="space-y-2">
                <Label
                  htmlFor="endDate"
                  className="text-sm font-medium text-gray-700"
                >
                  Fecha de fin *
                </Label>
                <Input
                  id="endDate"
                  type="date"
                  name="endDate"
                  value={form.endDate}
                  onChange={handleChange}
                  required
                  className="border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 bg-gray-50/50 hover:bg-gray-50 transition-colors"
                />
              </div>

              {/* Presupuesto */}
              <div className="space-y-2">
                <Label
                  htmlFor="budget"
                  className="text-sm font-medium text-gray-700"
                >
                  Presupuesto *
                </Label>
                <Input
                  id="budget"
                  type="number"
                  name="budget"
                  value={form.budget}
                  onChange={handleChange}
                  placeholder="0"
                  required
                  min={0}
                  step="0.01"
                  className="border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 bg-gray-50/50 hover:bg-gray-50 transition-colors"
                />
              </div>

              {/* Moneda */}
              <div className="space-y-2">
                <Label
                  htmlFor="currency"
                  className="text-sm font-medium text-gray-700"
                >
                  Moneda
                </Label>
                <Select
                  value={form.currency}
                  onValueChange={(value) =>
                    setForm({ ...form, currency: value })
                  }
                >
                  <SelectTrigger className="border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 bg-gray-50/50 hover:bg-gray-50 transition-colors text-left justify-start">
                    <SelectValue placeholder="Seleccionar moneda" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USD">USD</SelectItem>
                    <SelectItem value="EUR">EUR</SelectItem>
                    <SelectItem value="MXN">MXN</SelectItem>
                    <SelectItem value="ARS">ARS</SelectItem>
                    <SelectItem value="CLP">CLP</SelectItem>
                    <SelectItem value="COP">COP</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Descripción */}
            <div className="space-y-2">
              <Label
                htmlFor="description"
                className="text-sm font-medium text-gray-700"
              >
                Descripción de la campaña
              </Label>
              <Textarea
                id="description"
                name="description"
                value={form.description}
                onChange={handleChange}
                placeholder="Describe la campaña, objetivos, público objetivo, etc."
                rows={3}
                className="border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 bg-gray-50/50 hover:bg-gray-50 transition-colors resize-none"
              />
            </div>
          </div>
        </div>

        <DialogFooter className="pt-4 border-t border-gray-100 flex-shrink-0">
            <div className="flex items-center justify-between w-full">
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                disabled={loading}
                className="border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-colors"
              >
                Cancelar
              </Button>

              <form onSubmit={handleSubmit} className="inline">
                <Button
                  type="submit"
                  disabled={
                    loading || 
                    userInfoLoading || 
                    (!userInfo && !!userInfoError) ||
                    !isFormComplete()
                  }
                  className="bg-gray-900 text-white font-medium shadow-sm hover:bg-gray-800 hover:shadow-md transition-all duration-200 px-6 disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  {loading
                    ? "Creando..."
                    : userInfoLoading
                    ? "Cargando..."
                    : "Crear Campaña"}
                </Button>
              </form>
            </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
