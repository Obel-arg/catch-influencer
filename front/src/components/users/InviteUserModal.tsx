"use client"

import { useState, useEffect } from 'react';
import { Mail, Crown, User, Eye, Send, Plus, Tag, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  RadioGroup,
  RadioGroupItem,
} from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { UserRole } from '@/types/users';
import { Brand } from '@/types/brands';
import { cn } from '@/lib/utils';
import { brandService } from '@/lib/services/brands';

interface InviteUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInvite: (email: string, fullName: string, role: UserRole, brandIds?: string[]) => Promise<void>;
  loading?: boolean;
  organizationId?: string;
}

const roleOptions = [
  {
    value: 'member' as UserRole,
    label: 'Miembro',
    icon: User,
    color: 'bg-blue-100 text-blue-800',
    description: 'Acceso estándar para trabajo colaborativo',
    recommended: true,
  },
  {
    value: 'viewer' as UserRole,
    label: 'Visualizador',
    icon: Eye,
    color: 'bg-gray-100 text-gray-800',
    description: 'Solo lectura, ideal para stakeholders',
  },
  {
    value: 'admin' as UserRole,
    label: 'Administrador',
    icon: Crown,
    color: 'bg-purple-100 text-purple-800',
    description: 'Acceso total (usar con precaución)',
  },
];

const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export function InviteUserModal({
  isOpen,
  onClose,
  onInvite,
  loading = false,
  organizationId
}: InviteUserModalProps) {
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [selectedRole, setSelectedRole] = useState<UserRole>('member');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [brands, setBrands] = useState<Brand[]>([]);
  const [selectedBrandIds, setSelectedBrandIds] = useState<string[]>([]);
  const [loadingBrands, setLoadingBrands] = useState(false);
  const [brandError, setBrandError] = useState('');

  // Load brands when modal opens
  useEffect(() => {
    if (isOpen && organizationId) {
      loadBrands();
    }
  }, [isOpen, organizationId]);

  const loadBrands = async () => {
    setLoadingBrands(true);
    try {
      console.log('🔍 Loading brands for user invitation...');
      const brandsData = await brandService.getBrands({ status: 'active' });
      console.log('✅ Brands loaded:', brandsData);
      setBrands(brandsData);
    } catch (error) {
      console.error('❌ Error loading brands:', error);
    } finally {
      setLoadingBrands(false);
    }
  };

  const handleEmailChange = (value: string) => {
    setEmail(value);
    setEmailError('');
  };

  const handleBrandToggle = (brandId: string) => {
    setSelectedBrandIds(prev =>
      prev.includes(brandId)
        ? prev.filter(id => id !== brandId)
        : [...prev, brandId]
    );
    setBrandError('');
  };

  const handleRoleChange = (role: UserRole) => {
    setSelectedRole(role);
    // Clear brand selections when switching to admin
    if (role === 'admin') {
      setSelectedBrandIds([]);
      setBrandError('');
    }
  };

  const validateForm = (): boolean => {
    if (!email.trim()) {
      setEmailError('El email es requerido');
      return false;
    }

    if (!validateEmail(email.trim())) {
      setEmailError('Ingresa un email válido');
      return false;
    }

    if (!fullName.trim()) {
      setEmailError('El nombre completo es requerido');
      return false;
    }

    // Validate brand selection for non-admin users
    if (selectedRole !== 'admin' && selectedBrandIds.length === 0) {
      setBrandError('Debes seleccionar al menos una marca para miembros y visualizadores');
      return false;
    }

    return true;
  };

  const handleInvite = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      await onInvite(
        email.trim(),
        fullName.trim(),
        selectedRole,
        selectedRole !== 'admin' ? selectedBrandIds : []
      );
      handleClose();
    } catch (error) {
      console.error('Error al enviar invitación:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setEmail('');
      setFullName('');
      setSelectedRole('member');
      setEmailError('');
      setSelectedBrandIds([]);
      setBrandError('');
      onClose();
    }
  };

  const selectedRoleInfo = roleOptions.find(role => role.value === selectedRole);

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px] bg-white border border-gray-200 shadow-xl rounded-xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader className="pb-2">
          <DialogTitle className="flex items-center gap-2 text-xl font-semibold text-gray-900">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
              <Plus className="h-4 w-4 text-white" />
            </div>
            Invitar Usuario
          </DialogTitle>
          <DialogDescription className="text-gray-600">
            Invita a una nueva persona a unirse a tu organización. Se enviará un email automático con las instrucciones para crear su cuenta.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-2 overflow-y-auto flex-1">
          {/* Email del usuario */}
          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-semibold text-gray-700">
              Email del usuario *
            </Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                id="email"
                type="email"
                placeholder="usuario@empresa.com"
                value={email}
                onChange={(e) => handleEmailChange(e.target.value)}
                className={cn(
                  "pl-10 border-gray-200 focus:border-blue-300 focus:ring-2 focus:ring-blue-100 rounded-lg",
                  emailError && "border-red-500 focus:border-red-500 focus:ring-red-100"
                )}
              />
            </div>
            {emailError && (
              <p className="text-sm text-red-600 font-medium">{emailError}</p>
            )}
          </div>

          {/* Nombre completo del usuario */}
          <div className="space-y-2">
            <Label htmlFor="fullName" className="text-sm font-semibold text-gray-700">
              Nombre completo *
            </Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                id="fullName"
                type="text"
                placeholder="Juan Pérez"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="pl-10 border-gray-200 focus:border-blue-300 focus:ring-2 focus:ring-blue-100 rounded-lg"
              />
            </div>
            {fullName.length === 0 && email.length > 0 && (
              <p className="text-sm text-red-600 font-medium">El nombre completo es requerido</p>
            )}
          </div>

          {/* Selección de rol */}
          <div className="space-y-4">
            <Label className="text-sm font-semibold text-gray-700">
              Rol para el nuevo usuario *
            </Label>
            
            <RadioGroup
              value={selectedRole}
              onValueChange={(value) => handleRoleChange(value as UserRole)}
              className="space-y-3"
            >
              {roleOptions.map((role) => {
                const Icon = role.icon;
                const isSelected = selectedRole === role.value;
                
                return (
                  <div key={role.value} className="relative">
                    <label 
                      htmlFor={`role-${role.value}`}
                      className={cn(
                        "flex items-start gap-3 p-4 border-2 rounded-xl cursor-pointer transition-all",
                        "hover:bg-gray-50 hover:border-gray-300",
                        isSelected 
                          ? "border-blue-500 bg-blue-50/50 shadow-sm" 
                          : "border-gray-200"
                      )}
                    >
                      <RadioGroupItem 
                        value={role.value} 
                        id={`role-${role.value}`}
                        className="mt-0.5 border-gray-300"
                      />
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge 
                            className={cn("gap-1.5 border-0", role.color)}
                          >
                            <Icon className="h-3 w-3" />
                            {role.label}
                          </Badge>
                          
                          {role.recommended && (
                            <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                              Recomendado
                            </Badge>
                          )}
                        </div>
                        
                        <p className="text-sm text-gray-600">
                          {role.description}
                        </p>
                      </div>
                    </label>
                  </div>
                );
              })}
            </RadioGroup>
          </div>

          {/* Brand Selection (only for non-admin users) */}
          {selectedRole !== 'admin' && (
            <div className="space-y-3 border-4 border-red-500 p-4 bg-yellow-100">
              <div className="bg-red-600 text-white p-2 text-center font-bold">
                🔴 DEBUG: BRAND SELECTION SECTION - Selected Role: {selectedRole}
              </div>
              <Label className="text-sm font-semibold text-gray-700">
                Marcas asignadas *
              </Label>
              <p className="text-sm text-gray-600">
                Selecciona las marcas a las que este usuario tendrá acceso
              </p>
              <div className="bg-blue-600 text-white p-2 text-center">
                Loading: {loadingBrands ? 'YES' : 'NO'} | Brands: {brands.length} | OrgID: {organizationId || 'MISSING'}
              </div>

              {loadingBrands ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600" />
                </div>
              ) : brands.length === 0 ? (
                <div className="p-4 border border-yellow-200 bg-yellow-50 rounded-lg">
                  <p className="text-sm text-yellow-800">
                    No hay marcas activas disponibles. Crea una marca primero para poder asignarla a usuarios.
                  </p>
                </div>
              ) : (
                <div className="space-y-2 max-h-60 overflow-y-auto border border-gray-200 rounded-lg p-3">
                  {brands.map((brand) => (
                    <label
                      key={brand.id}
                      className={cn(
                        "flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-all",
                        "hover:bg-gray-50 hover:border-gray-300",
                        selectedBrandIds.includes(brand.id)
                          ? "border-blue-500 bg-blue-50/50"
                          : "border-gray-200"
                      )}
                    >
                      <Checkbox
                        checked={selectedBrandIds.includes(brand.id)}
                        onCheckedChange={() => handleBrandToggle(brand.id)}
                        className="border-gray-300"
                      />
                      <div className="flex items-center gap-2 flex-1">
                        {brand.logo_url && (
                          <img
                            src={brand.logo_url}
                            alt={brand.name}
                            className="w-6 h-6 rounded object-cover"
                          />
                        )}
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {brand.name}
                          </p>
                          {brand.industry && (
                            <p className="text-xs text-gray-500">
                              {brand.industry}
                            </p>
                          )}
                        </div>
                      </div>
                      {selectedBrandIds.includes(brand.id) && (
                        <Tag className="h-4 w-4 text-blue-600" />
                      )}
                    </label>
                  ))}
                </div>
              )}

              {selectedBrandIds.length > 0 && (
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs text-gray-600">
                    {selectedBrandIds.length} marca{selectedBrandIds.length !== 1 ? 's' : ''} seleccionada{selectedBrandIds.length !== 1 ? 's' : ''}
                  </span>
                </div>
              )}

              {brandError && (
                <p className="text-sm text-red-600 font-medium">{brandError}</p>
              )}
            </div>
          )}
        </div>

        <DialogFooter className="gap-2 pt-4 border-t border-gray-100 bg-gray-50/50">
          <Button 
            variant="outline" 
            onClick={handleClose}
            disabled={isSubmitting}
            className="border-gray-300 hover:bg-gray-50"
          >
            Cancelar
          </Button>
          <Button 
            onClick={handleInvite}
            disabled={isSubmitting || !email.trim() || !fullName.trim()}
            className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
          >
            {isSubmitting ? (
              <>
                <Send className="h-4 w-4 mr-2 animate-pulse" />
                Enviando...
              </>
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                Enviar invitación
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 