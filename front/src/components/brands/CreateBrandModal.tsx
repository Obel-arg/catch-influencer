"use client";

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { useBrands } from '@/hooks/brands';
import { CreateBrandDto } from '@/types/brands';
import { brandService } from '@/lib/services/brands';
import { ChevronLeft, ChevronRight } from "lucide-react";

interface CreateBrandModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated?: () => void;
}

export const CreateBrandModal = ({ open, onOpenChange, onCreated }: CreateBrandModalProps) => {
  const { createBrand } = useBrands();
  const [isCreating, setIsCreating] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<CreateBrandDto>({
    name: '',
    description: '',
    logo_url: '',
    website_url: '',
    industry: '',
    country: '',
    size: undefined,
    contact_email: '',
    contact_phone: '',
    contact_person: '',
    currency: 'USD',
    social_media: {},
    settings: {},
    metadata: {}
  });

  const handleInputChange = (field: keyof CreateBrandDto, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const nextStep = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (currentStep === 1 && !formData.name.trim()) {
      toast.error('El nombre de la marca es requerido');
      return;
    }
    setCurrentStep(2);
  };

  const prevStep = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentStep(1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast.error('El nombre de la marca es requerido');
      return;
    }

    try {
      setIsCreating(true);
      
      // Procesar el logo usando el proxy si es necesario
      let processedFormData = { ...formData };
      
      if (formData.logo_url && formData.logo_url.trim()) {
        try {
          toast.info('Procesando logo...');
          const processedLogoUrl = await brandService.processLogoUrl(
            formData.logo_url, 
            formData.name
          );
          processedFormData.logo_url = processedLogoUrl;
          toast.success('Logo procesado exitosamente');
        } catch (error) {
          console.warn('Error al procesar logo, usando URL original:', error);
          // Continuar con la URL original si hay error
        }
      }
      
      const result = await createBrand(processedFormData);
      
      if (result) {
        toast.success('Marca creada exitosamente');
        onCreated?.();
        onOpenChange(false);
        
        // Limpiar formulario y resetear paso
        setFormData({
          name: '',
          description: '',
          logo_url: '',
          website_url: '',
          industry: '',
          country: '',
          size: undefined,
          contact_email: '',
          contact_phone: '',
          contact_person: '',
          currency: 'USD',
          social_media: {},
          settings: {},
          metadata: {}
        });
        setCurrentStep(1);
      }
    } catch (error) {
      toast.error('Error al crear la marca');
    } finally {
      setIsCreating(false);
    }
  };

  const handleCancel = () => {
    onOpenChange(false);
    // Limpiar formulario al cancelar
    setFormData({
      name: '',
      description: '',
      logo_url: '',
      website_url: '',
      industry: '',
      country: '',
      size: undefined,
      contact_email: '',
      contact_phone: '',
      contact_person: '',
      currency: 'USD',
      social_media: {},
      settings: {},
      metadata: {}
    });
    setCurrentStep(1);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl bg-white border-0 shadow-xl rounded-xl">
        <form onSubmit={handleSubmit}>
          <DialogHeader className="pb-6">
            <DialogTitle className="text-xl font-semibold text-gray-900 bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent mb-4">
              Crear Nueva Marca
            </DialogTitle>

            {/* Indicador de pasos */}
            <div className="flex items-center justify-center space-x-4">
              <div className={`flex items-center space-x-2 ${currentStep >= 1 ? 'text-blue-600' : 'text-gray-400'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  currentStep >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'
                }`}>
                  1
                </div>
                <span className="text-sm font-medium">Información Básica</span>
              </div>

              <div className={`w-8 h-1 rounded-full ${currentStep >= 2 ? 'bg-blue-600' : 'bg-gray-200'}`}></div>

              <div className={`flex items-center space-x-2 ${currentStep >= 2 ? 'text-blue-600' : 'text-gray-400'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  currentStep >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'
                }`}>
                  2
                </div>
                <span className="text-sm font-medium">Detalles Adicionales</span>
              </div>
            </div>
          </DialogHeader>

          <div className="space-y-6">
          {/* Paso 1: Información básica */}
          {currentStep === 1 && (
            <div className="space-y-6 min-h-[280px]">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Nombre */}
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-sm font-medium text-gray-700">
                    Nombre de la marca *
                  </Label>
                  <Input
                    id="name"
                    placeholder="Ej: Nike, Coca-Cola..."
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    required
                    className="border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 bg-gray-50/50 hover:bg-gray-50 transition-colors"
                  />
                </div>

                {/* Industria */}
                <div className="space-y-2">
                  <Label htmlFor="industry" className="text-sm font-medium text-gray-700">
                    Industria
                  </Label>
                  <Input
                    id="industry"
                    placeholder="Ej: Tecnología, moda, etc"
                    value={formData.industry}
                    onChange={(e) => handleInputChange('industry', e.target.value)}
                    className="border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 bg-gray-50/50 hover:bg-gray-50 transition-colors"
                  />
                </div>

                {/* Tamaño */}
                <div className="space-y-2">
                  <Label htmlFor="size" className="text-sm font-medium text-gray-700">
                    Tamaño de empresa
                  </Label>
                  <Select value={formData.size || undefined} onValueChange={(value) => handleInputChange('size', value)}>
                    <SelectTrigger className="border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 bg-gray-50/50 hover:bg-gray-50 transition-colors text-left justify-start">
                      <SelectValue placeholder="Seleccionar tamaño" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="small">Pequeña</SelectItem>
                      <SelectItem value="medium">Mediana</SelectItem>
                      <SelectItem value="large">Grande</SelectItem>
                      <SelectItem value="enterprise">Empresa</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* País */}
                <div className="space-y-2">
                  <Label htmlFor="country" className="text-sm font-medium text-gray-700">
                    País
                  </Label>
                  <Input
                    id="country"
                    placeholder="Ej: España, México"
                    value={formData.country}
                    onChange={(e) => handleInputChange('country', e.target.value)}
                    className="border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 bg-gray-50/50 hover:bg-gray-50 transition-colors"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Paso 2: Detalles adicionales */}
          {currentStep === 2 && (
            <div className="space-y-6 min-h-[280px]">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Email de contacto */}
                <div className="space-y-2">
                  <Label htmlFor="contact_email" className="text-sm font-medium text-gray-700">
                    Email de contacto
                  </Label>
                  <Input
                    id="contact_email"
                    type="email"
                    placeholder="contacto@marca.com"
                    value={formData.contact_email}
                    onChange={(e) => handleInputChange('contact_email', e.target.value)}
                    className="border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 bg-gray-50/50 hover:bg-gray-50 transition-colors"
                  />
                </div>

                {/* Teléfono */}
                <div className="space-y-2">
                  <Label htmlFor="contact_phone" className="text-sm font-medium text-gray-700">
                    Teléfono
                  </Label>
                  <Input
                    id="contact_phone"
                    placeholder="+34 600 000 000"
                    value={formData.contact_phone}
                    onChange={(e) => handleInputChange('contact_phone', e.target.value)}
                    className="border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 bg-gray-50/50 hover:bg-gray-50 transition-colors"
                  />
                </div>

                {/* Logo URL */}
                <div className="space-y-2">
                  <Label htmlFor="logo_url" className="text-sm font-medium text-gray-700">
                    URL del logo
                  </Label>
                  <Input
                    id="logo_url"
                    placeholder="https://ejemplo.com"
                    value={formData.logo_url}
                    onChange={(e) => handleInputChange('logo_url', e.target.value)}
                    className="border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 bg-gray-50/50 hover:bg-gray-50 transition-colors"
                  />
                </div>

                {/* Website URL */}
                <div className="space-y-2">
                  <Label htmlFor="website_url" className="text-sm font-medium text-gray-700">
                    Sitio web
                  </Label>
                  <Input
                    id="website_url"
                    placeholder="https://ejemplo.com"
                    value={formData.website_url}
                    onChange={(e) => handleInputChange('website_url', e.target.value)}
                    className="border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 bg-gray-50/50 hover:bg-gray-50 transition-colors"
                  />
                </div>

                {/* Moneda */}
                <div className="space-y-2">
                  <Label htmlFor="currency" className="text-sm font-medium text-gray-700">
                    Moneda
                  </Label>
                  <Select value={formData.currency || "USD"} onValueChange={(value) => handleInputChange('currency', value)}>
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

                {/* Persona de contacto */}
                <div className="space-y-2">
                  <Label htmlFor="contact_person" className="text-sm font-medium text-gray-700">
                    Persona de contacto
                  </Label>
                  <Input
                    id="contact_person"
                    placeholder="Juan Pérez"
                    value={formData.contact_person}
                    onChange={(e) => handleInputChange('contact_person', e.target.value)}
                    className="border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 bg-gray-50/50 hover:bg-gray-50 transition-colors"
                  />
                </div>
              </div>

              {/* Descripción */}
              <div className="space-y-2">
                <Label htmlFor="description" className="text-sm font-medium text-gray-700">
                  Descripción de la marca
                </Label>
                <Textarea
                  id="description"
                  placeholder="Describe la marca, su misión, valores, etc."
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  rows={3}
                  className="border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 bg-gray-50/50 hover:bg-gray-50 transition-colors resize-none"
                />
              </div>
            </div>
          )}

          <DialogFooter className="pt-6 border-t border-gray-100">
            <div className="flex items-center justify-between w-full">
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                disabled={isCreating}
                className="border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-colors"
              >
                Cancelar
              </Button>

              <div className="flex items-center space-x-2">
                {currentStep === 2 && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={prevStep}
                    disabled={isCreating}
                    className="border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-colors flex items-center space-x-1"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span>Anterior</span>
                  </Button>
                )}

                {currentStep === 1 ? (
                  <Button
                    type="button"
                    onClick={nextStep}
                    disabled={isCreating}
                    className="bg-gradient-to-r from-blue-600 to-blue-700 text-white font-medium shadow-sm hover:from-blue-700 hover:to-blue-800 hover:shadow-md transition-all duration-200 px-6 flex items-center space-x-1"
                  >
                    <span>Siguiente</span>
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    disabled={isCreating}
                    className="bg-gradient-to-r from-blue-600 to-blue-700 text-white font-medium shadow-sm hover:from-blue-700 hover:to-blue-800 hover:shadow-md transition-all duration-200 px-6"
                  >
                    {isCreating ? 'Creando...' : 'Crear Marca'}
                  </Button>
                )}
              </div>
            </div>
          </DialogFooter>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}; 