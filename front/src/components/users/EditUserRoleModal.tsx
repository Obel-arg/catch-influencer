"use client"

import { useState, useEffect } from 'react';
import { Crown, User, Eye, Check, AlertTriangle, Edit3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
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
import {
  Alert,
  AlertDescription,
} from '@/components/ui/alert';
import { OrganizationMember, UserRole } from '@/types/users';
import { cn } from '@/lib/utils';

interface EditUserRoleModalProps {
  member: OrganizationMember | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (userId: string, role: UserRole) => Promise<void>;
  onUpdateName?: (userId: string, fullName: string) => Promise<void>;
  loading?: boolean;
}

const roleOptions = [
  {
    value: 'admin' as UserRole,
    label: 'Administrador',
    icon: Crown,
    color: 'bg-purple-100 text-purple-800 border-purple-200',
    description: 'Acceso total a la plataforma'
  },
  {
    value: 'member' as UserRole,
    label: 'Miembro',
    icon: User,
    color: 'bg-blue-100 text-blue-800 border-blue-200',
    description: 'Acceso estándar para trabajo colaborativo'
  },
  {
    value: 'viewer' as UserRole,
    label: 'Visualizador',
    icon: Eye,
    color: 'bg-gray-100 text-gray-800 border-gray-200',
    description: 'Solo lectura, ideal para stakeholders'
  }
];

export function EditUserRoleModal({
  member,
  isOpen,
  onClose,
  onSave,
  onUpdateName,
  loading = false
}: EditUserRoleModalProps) {
  const [selectedRole, setSelectedRole] = useState<UserRole>('member');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fullName, setFullName] = useState('');
  const [isEditingName, setIsEditingName] = useState(false);
  const [nameError, setNameError] = useState('');

  // Actualizar rol seleccionado y nombre cuando cambia el miembro
  useEffect(() => {
    if (member) {
      setSelectedRole(member.org_role);
      setFullName(member.full_name || '');
      setIsEditingName(false);
      setNameError('');
    }
  }, [member]);

  const getInitials = (name: string | null, email: string) => {
    if (name) {
      return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    }
    return email.slice(0, 2).toUpperCase();
  };

  const selectedRoleInfo = roleOptions.find(role => role.value === selectedRole);
  const currentRoleInfo = roleOptions.find(role => role.value === member?.org_role);
  const isRoleChanged = selectedRole !== member?.org_role;
  const isNameChanged = fullName !== (member?.full_name || '');

  const validateName = (name: string) => {
    if (!name.trim()) {
      return 'El nombre es requerido';
    }
    if (name.trim().length < 2) {
      return 'El nombre debe tener al menos 2 caracteres';
    }
    if (name.trim().length > 100) {
      return 'El nombre no puede exceder 100 caracteres';
    }
    return '';
  };

  const handleSaveRole = async () => {
    if (!member || !isRoleChanged) return;

    setIsSubmitting(true);
    try {
      await onSave(member.user_id, selectedRole);
      onClose();
    } catch (error) {
      console.error('Error al actualizar rol:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveName = async () => {
    if (!member || !onUpdateName) return;

    const error = validateName(fullName);
    if (error) {
      setNameError(error);
      return;
    }

    setIsSubmitting(true);
    try {
      await onUpdateName(member.user_id, fullName.trim());
      setIsEditingName(false);
      setNameError('');
    } catch (error) {
      console.error('Error al actualizar nombre:', error);
      setNameError('Error al actualizar el nombre');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancelNameEdit = () => {
    setFullName(member?.full_name || '');
    setIsEditingName(false);
    setNameError('');
  };

  const handleClose = () => {
    if (!isSubmitting) {
      onClose();
    }
  };

  if (!member) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px] bg-white border border-gray-200 shadow-xl rounded-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="pb-4">
          <DialogTitle className="text-xl font-semibold text-gray-900">
            Editar usuario
          </DialogTitle>
          <DialogDescription className="text-gray-600">
            Cambia el nombre y el nivel de acceso para este miembro de la organización.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Información del usuario */}
          <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg border border-gray-100">
            <Avatar className="h-12 w-12 ring-2 ring-gray-200">
              <AvatarImage 
                src={member.avatar_url || undefined} 
                alt={member.full_name || member.email}
              />
              <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white font-semibold">
                {getInitials(member.full_name, member.email)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              {isEditingName ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Input
                      value={fullName}
                      onChange={(e) => {
                        setFullName(e.target.value);
                        if (nameError) setNameError('');
                      }}
                      placeholder="Nombre completo"
                      className={cn(
                        "h-8 text-sm",
                        nameError && "border-red-300 focus:border-red-500 focus:ring-red-200"
                      )}
                      disabled={isSubmitting}
                    />
                    <Button
                      size="sm"
                      onClick={handleSaveName}
                      disabled={isSubmitting || !isNameChanged}
                      className="h-8 px-3 bg-green-600 hover:bg-green-700"
                    >
                      {isSubmitting ? 'Guardando...' : 'Guardar'}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleCancelNameEdit}
                      disabled={isSubmitting}
                      className="h-8 px-3"
                    >
                      Cancelar
                    </Button>
                  </div>
                  {nameError && (
                    <p className="text-xs text-red-600">{nameError}</p>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-gray-900">
                    {member.full_name || 'Sin nombre'}
                  </h3>
                  {onUpdateName && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setIsEditingName(true)}
                      className="h-6 w-6 p-0 hover:bg-gray-200"
                      title="Editar nombre"
                    >
                      <Edit3 className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              )}
              <p className="text-sm text-gray-600">{member.email}</p>
              {currentRoleInfo && (
                <Badge className={cn("mt-2 gap-1", currentRoleInfo.color)}>
                  <currentRoleInfo.icon className="h-3 w-3" />
                  {currentRoleInfo.label}
                </Badge>
              )}
            </div>
          </div>

          {/* Selector de roles */}
          <div className="space-y-4">
            <Label className="text-sm font-medium">
              Seleccionar nuevo rol
            </Label>
            
            <RadioGroup 
              value={selectedRole} 
              onValueChange={(value) => setSelectedRole(value as UserRole)}
              className="space-y-3"
            >
              {roleOptions.map((role) => {
                const Icon = role.icon;
                const isSelected = selectedRole === role.value;
                const isCurrent = member.org_role === role.value;
                
                return (
                  <div key={role.value} className="relative">
                    <label 
                      htmlFor={role.value}
                      className={cn(
                        "flex items-start gap-4 p-4 border-2 rounded-xl cursor-pointer transition-all",
                        "hover:bg-gray-50 hover:border-gray-300",
                        isSelected 
                          ? "border-blue-500 bg-blue-50/50 shadow-sm" 
                          : "border-gray-200",
                        isCurrent && "bg-amber-50/50 border-amber-200"
                      )}
                    >
                      <RadioGroupItem 
                        value={role.value} 
                        id={role.value}
                        className="mt-1 border-gray-300"
                      />
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge 
                            className={cn("gap-1.5 border-0", role.color)}
                          >
                            <Icon className="h-3 w-3" />
                            {role.label}
                          </Badge>
                          
                          {isCurrent && (
                            <Badge variant="outline" className="text-xs bg-amber-100 text-amber-800 border-amber-200">
                              Actual
                            </Badge>
                          )}
                          
                          {isSelected && (
                            <Check className="h-4 w-4 text-blue-600" />
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

          {/* Advertencia para cambios importantes */}
          {isRoleChanged && (selectedRole === 'admin' || member.org_role === 'admin') && (
            <Alert className="border-amber-200 bg-amber-50/50">
              <AlertTriangle className="h-4 w-4 text-amber-600" />
              <AlertDescription className="text-sm text-amber-800">
                {selectedRole === 'admin' 
                  ? "Otorgar permisos de administrador dará acceso total a la organización, incluyendo gestión de usuarios y facturación."
                  : "Remover permisos de administrador limitará significativamente el acceso del usuario."
                }
              </AlertDescription>
            </Alert>
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
            onClick={handleSaveRole}
            disabled={!isRoleChanged || isSubmitting}
            className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
          >
            {isSubmitting ? 'Actualizando...' : 'Guardar cambios'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 