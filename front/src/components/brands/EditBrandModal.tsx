"use client";

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { useBrands } from '@/hooks/brands';
import { Brand, UpdateBrandDto } from '@/types/brands';
import { brandService } from '@/lib/services/brands';

interface EditBrandModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  brand: Brand | null;
  onUpdated?: () => void;
}

export const EditBrandModal = ({ open, onOpenChange, brand, onUpdated }: EditBrandModalProps) => {
  const { updateBrand } = useBrands();
  const [isUpdating, setIsUpdating] = useState(false);
  const [formData, setFormData] = useState<UpdateBrandDto>({
    name: '',
    description: '',
    logo_url: '',
    website_url: '',
    industry: '',
    country: '',
    size: undefined,
    status: 'active',
    contact_email: '',
    contact_phone: '',
    contact_person: '',
    currency: 'USD',
    social_media: {},
    settings: {},
    metadata: {}
  });

  // Llenar formulario con datos de la marca cuando se abre el modal
  useEffect(() => {
    if (brand && open) {
      setFormData({
        name: brand.name || '',
        description: brand.description || '',
        logo_url: brand.logo_url || '',
        website_url: brand.website_url || '',
        industry: brand.industry || '',
        country: brand.country || '',
        size: brand.size || undefined,
        status: brand.status || 'active',
        contact_email: brand.contact_email || '',
        contact_phone: brand.contact_phone || '',
        contact_person: brand.contact_person || '',
        currency: brand.currency || 'USD',
        social_media: brand.social_media || {},
        settings: brand.settings || {},
        metadata: brand.metadata || {}
      });
    }
  }, [brand, open]);

  const handleInputChange = (field: keyof UpdateBrandDto, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!brand) return;

    if (!formData.name?.trim()) {
      toast.error('El nombre de la marca es requerido');
      return;
    }

    try {
      setIsUpdating(true);
      
      // Procesar el logo usando el proxy si es necesario
      let processedFormData = { ...formData };
      
      if (formData.logo_url && formData.logo_url.trim() && formData.logo_url !== brand.logo_url) {
        try {
          toast.info('Procesando logo...');
          const processedLogoUrl = await brandService.processLogoUrl(
            formData.logo_url, 
            formData.name || brand.name,
            brand.id
          );
          processedFormData.logo_url = processedLogoUrl;
          toast.success('Logo procesado exitosamente');
        } catch (error) {
          console.warn('Error al procesar logo, usando URL original:', error);
          // Continuar con la URL original si hay error
        }
      }
      
      const result = await updateBrand(brand.id, processedFormData);
      
      if (result) {
        toast.success('Marca actualizada exitosamente');
        onUpdated?.();
        onOpenChange(false);
      }
    } catch (error) {
      toast.error('Error al actualizar la marca');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  if (!brand) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto bg-white">
        <DialogHeader>
          <DialogTitle>Editar Marca: {brand.name}</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Nombre */}
            <div className="space-y-2">
              <Label htmlFor="name">Nombre de la marca *</Label>
              <Input
                id="name"
                placeholder="Ej: Nike, Coca-Cola..."
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                required
              />
            </div>

            {/* Estado */}
            <div className="space-y-2">
              <Label htmlFor="status">Estado</Label>
              <Select value={formData.status || "active"} onValueChange={(value) => handleInputChange('status', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Activo</SelectItem>
                  <SelectItem value="inactive">Inactivo</SelectItem>
                  <SelectItem value="pending">Pendiente</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Industria */}
            <div className="space-y-2">
              <Label htmlFor="industry">Industria</Label>
              <Input
                id="industry"
                placeholder="Ej: Tecnología, Moda, Deportes..."
                value={formData.industry}
                onChange={(e) => handleInputChange('industry', e.target.value)}
              />
            </div>

            {/* Tamaño */}
            <div className="space-y-2">
              <Label htmlFor="size">Tamaño de empresa</Label>
              <Select value={formData.size || undefined} onValueChange={(value) => handleInputChange('size', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar tamaño" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="startup">Startup</SelectItem>
                  <SelectItem value="small">Pequeña</SelectItem>
                  <SelectItem value="medium">Mediana</SelectItem>
                  <SelectItem value="large">Grande</SelectItem>
                  <SelectItem value="enterprise">Empresa</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* País */}
            <div className="space-y-2">
              <Label htmlFor="country">País</Label>
              <Input
                id="country"
                placeholder="Ej: España, México, Argentina..."
                value={formData.country}
                onChange={(e) => handleInputChange('country', e.target.value)}
              />
            </div>

            {/* Logo URL */}
            <div className="space-y-2">
              <Label htmlFor="logo_url">URL del logo</Label>
              <Input
                id="logo_url"
                placeholder="https://ejemplo.com/logo.png"
                value={formData.logo_url}
                onChange={(e) => handleInputChange('logo_url', e.target.value)}
              />
            </div>

            {/* Website URL */}
            <div className="space-y-2">
              <Label htmlFor="website_url">Sitio web</Label>
              <Input
                id="website_url"
                placeholder="https://ejemplo.com"
                value={formData.website_url}
                onChange={(e) => handleInputChange('website_url', e.target.value)}
              />
            </div>

            {/* Email de contacto */}
            <div className="space-y-2">
              <Label htmlFor="contact_email">Email de contacto</Label>
              <Input
                id="contact_email"
                type="email"
                placeholder="contacto@marca.com"
                value={formData.contact_email}
                onChange={(e) => handleInputChange('contact_email', e.target.value)}
              />
            </div>

            {/* Teléfono */}
            <div className="space-y-2">
              <Label htmlFor="contact_phone">Teléfono</Label>
              <Input
                id="contact_phone"
                placeholder="+34 600 000 000"
                value={formData.contact_phone}
                onChange={(e) => handleInputChange('contact_phone', e.target.value)}
              />
            </div>

            {/* Persona de contacto */}
            <div className="space-y-2">
              <Label htmlFor="contact_person">Persona de contacto</Label>
              <Input
                id="contact_person"
                placeholder="Juan Pérez"
                value={formData.contact_person}
                onChange={(e) => handleInputChange('contact_person', e.target.value)}
              />
            </div>

            {/* Moneda */}
            <div className="space-y-2">
              <Label htmlFor="currency">Moneda</Label>
              <Select value={formData.currency || "USD"} onValueChange={(value) => handleInputChange('currency', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar moneda" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USD">USD - Dólar Estadounidense</SelectItem>
                  <SelectItem value="EUR">EUR - Euro</SelectItem>
                  <SelectItem value="MXN">MXN - Peso Mexicano</SelectItem>
                  <SelectItem value="ARS">ARS - Peso Argentino</SelectItem>
                  <SelectItem value="CLP">CLP - Peso Chileno</SelectItem>
                  <SelectItem value="COP">COP - Peso Colombiano</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Descripción */}
          <div className="space-y-2">
            <Label htmlFor="description">Descripción</Label>
            <Textarea
              id="description"
              placeholder="Describe la marca, su misión, valores, etc."
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={isUpdating}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isUpdating}
              className="bg-gradient-to-r from-blue-600 to-blue-700 text-white font-medium shadow-sm hover:from-blue-700 hover:to-blue-800 hover:shadow-md transition-all duration-200"
            >
              {isUpdating ? 'Actualizando...' : 'Actualizar Marca'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}; 