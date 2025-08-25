"use client";

import { useState } from "react";
import {
  MoreVertical,
  Edit,
  Trash2,
  Crown,
  User,
  Eye,
  Calendar,
  Mail,
  Building2,
  Target,
  Search,
  Users,
  RefreshCw,
  UserPlus,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { OrganizationMember, UserRole } from "@/types/users";
import { cn } from "@/lib/utils";
import { AssignCampaignModal } from "./AssignCampaignModal";
import { OutlineButton } from "@/components/ui/robust-buttons";
import { SkeletonUserTableRows } from "./SkeletonUserTable";

interface UserTableProps {
  members: OrganizationMember[];
  loading: boolean;
  selectedUsers: string[];
  onUserSelect: (userId: string) => void;
  onSelectAll: () => void;
  onClearSelection: () => void;
  onEditRole: (member: OrganizationMember) => void;
  onRemoveUser: (userId: string) => void;
  className?: string;
  searchQuery?: string;
  currentUserId?: string;
}

const roleConfig = {
  admin: {
    label: "Administrador",
    icon: Crown,
    color: "bg-purple-100 text-purple-800",
    description: "Acceso total",
  },
  member: {
    label: "Miembro",
    icon: User,
    color: "bg-blue-100 text-blue-800",
    description: "Acceso estándar",
  },
  viewer: {
    label: "Visualizador",
    icon: Eye,
    color: "bg-gray-100 text-gray-800",
    description: "Solo lectura",
  },
};

export function UserTable({
  members,
  loading,
  selectedUsers,
  onUserSelect,
  onSelectAll,
  onClearSelection,
  onEditRole,
  onRemoveUser,
  className,
  searchQuery = "",
  currentUserId,
}: UserTableProps) {
  const [userToDelete, setUserToDelete] = useState<string | null>(null);
  const [userToAssignCampaigns, setUserToAssignCampaigns] =
    useState<OrganizationMember | null>(null);
  const [page, setPage] = useState(1);
  const pageSize = 6;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-ES", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getInitials = (name: string | null, email: string) => {
    if (name) {
      return name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
    }
    return email.slice(0, 2).toUpperCase();
  };

  const isAllSelected =
    members.length > 0 && selectedUsers.length === members.length;
  const isPartiallySelected =
    selectedUsers.length > 0 && selectedUsers.length < members.length;

  const handleDeleteConfirm = () => {
    if (userToDelete) {
      // 🎯 PREVENIR AUTODELETE
      if (userToDelete === currentUserId) {
        console.warn("⚠️ Intento de autodelete bloqueado");
        setUserToDelete(null);
        return;
      }
      
      onRemoveUser(userToDelete);
      setUserToDelete(null);
    }
  };

  // 🎯 FILTRADO SIMPLIFICADO (igual que influencers)
  const filtered = members.filter((member) => {
    if (!searchQuery.trim()) {
      return true;
    }
    const query = searchQuery.toLowerCase();
    return (
      (member.full_name || "").toLowerCase().includes(query) ||
      (member.email || "").toLowerCase().includes(query) ||
      (member.org_role || "").toLowerCase().includes(query) ||
      (member.position || "").toLowerCase().includes(query)
    );
  });

  // Paginación (igual que influencers)
  const totalPages = Math.ceil(filtered.length / pageSize);
  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);

  // 🎯 MOSTRAR "NO FOUND" SOLO SI NO HAY LOADING Y NO HAY DATOS
  const shouldShowNoResults = !loading && filtered.length === 0 && searchQuery;

  if (loading) {
    return (
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent border-b border-gray-200">
              <TableHead className="w-[250px] font-semibold text-gray-700 py-2 text-sm">
                Usuario
              </TableHead>
              <TableHead className="w-[120px] font-semibold text-gray-700 text-center py-2 text-sm">
                Rol
              </TableHead>
              <TableHead className="w-[140px] font-semibold text-gray-700 text-center py-2 text-sm">
                Email
              </TableHead>
              <TableHead className="w-[120px] font-semibold text-gray-700 text-center py-2 text-sm">
                Se unió
              </TableHead>
              <TableHead className="w-[120px] font-semibold text-gray-700 text-center py-2 text-sm">
                Acciones
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <SkeletonUserTableRows rows={6} />
          </TableBody>
        </Table>
      </div>
    );
  }

  return (
    <>
      {/* 🎯 NO RESULTS STATE */}
      {shouldShowNoResults && (
        <div className="p-8 text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-blue-100 mb-4">
            <Search className="h-6 w-6 text-blue-600" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-1">
            No se encontraron usuarios
          </h3>
          <p className="text-gray-500">
            Intenta ajustar la búsqueda para ver más resultados.
          </p>
        </div>
      )}

      {/* 🎯 TABLA CON SKELETON O DATOS */}
      {(paginated.length > 0 || loading) && (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent border-b border-gray-200">
                <TableHead className="w-[250px] font-semibold text-gray-700 py-2 text-sm">
                  Usuario
                </TableHead>
                <TableHead className="w-[120px] font-semibold text-gray-700 text-center py-2 text-sm">
                  Rol
                </TableHead>
                <TableHead className="w-[140px] font-semibold text-gray-700 text-center py-2 text-sm">
                  Email
                </TableHead>
                <TableHead className="w-[120px] font-semibold text-gray-700 text-center py-2 text-sm">
                  Se unió
                </TableHead>
                <TableHead className="w-[120px] font-semibold text-gray-700 text-center py-2 text-sm">
                  Acciones
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {/* Skeleton durante carga */}
              {loading && <SkeletonUserTableRows rows={6} />}
              
              {/* Datos reales (solo si no está cargando) */}
              {!loading && paginated.map((member) => {
                const roleInfo = roleConfig[member.org_role];
                const RoleIcon = roleInfo.icon;
                const isSelected = selectedUsers.includes(member.user_id);

                return (
                  <TableRow
                    key={member.user_id}
                    className={cn(
                      "hover:bg-gray-200 border-b border-gray-100 transition-colors duration-200",
                      isSelected && "bg-blue-50/50 hover:bg-blue-50"
                    )}
                  >
                    <TableCell>
                      <div className="flex items-center gap-3 min-w-[180px]">
                        <Avatar className="h-10 w-10 ring-2 ring-gray-100">
                          <AvatarImage
                            src={member.avatar_url || undefined}
                            alt={member.full_name || member.email}
                          />
                          <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white font-semibold text-sm">
                            {getInitials(member.full_name, member.email)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-base text-gray-900">
                              {member.full_name || "Sin nombre"}
                            </span>
                            {/* 🎯 INDICADOR DE USUARIO ACTUAL */}
                            {member.user_id === currentUserId && (
                              <Badge className="bg-blue-50 text-blue-700 text-xs px-2.5 py-0.5 rounded-full font-medium border border-blue-200">
                                Tú
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </TableCell>

                    <TableCell className="text-center">
                      <Badge
                        className={cn(
                          "gap-1.5 font-medium text-xs px-3 py-1 border-0 mx-auto",
                          roleInfo.color
                        )}
                      >
                        <RoleIcon className="h-3 w-3" />
                        {roleInfo.label}
                      </Badge>
                    </TableCell>

                    <TableCell className="text-center text-gray-600">
                      {member.email || "-"}
                    </TableCell>

                    <TableCell className="text-center text-gray-600">
                      {formatDate(member.joined_at)}
                    </TableCell>

                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-2">
                        {/* 🎯 ICONO PARA VER DETALLES */}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onEditRole(member)}
                          className="h-8 w-8 p-0 hover:bg-transparent hover:text-blue-600"
                          title="Editar rol"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>

                        {/* 🎯 DROPDOWN CON 3 PUNTITOS */}
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 hover:bg-transparent hover:text-gray-600"
                              title="Más opciones"
                            >
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent
                            align="end"
                            className="w-48 bg-white border border-gray-200 shadow-lg"
                          >
                            {/* 🎯 SOLO MOSTRAR "ASIGNAR CAMPAÑAS" PARA MEMBER/VIEWER */}
                            {(member.org_role === 'member' || member.org_role === 'viewer') && (
                              <DropdownMenuItem
                                onClick={() => setUserToAssignCampaigns(member)}
                                className="flex items-center gap-2 cursor-pointer"
                              >
                                <Target className="h-4 w-4" />
                                Asignar campañas
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem
                              onClick={() => setUserToDelete(member.user_id)}
                              className="flex items-center gap-2 cursor-pointer text-red-600 hover:text-red-700 hover:bg-red-50"
                              disabled={member.user_id === currentUserId}
                            >
                              <Trash2 className="h-4 w-4" />
                              {member.user_id === currentUserId ? "No puedes eliminarte" : "Eliminar"}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}

      {/* 🎯 ESTADO VACÍO CUANDO NO HAY DATOS */}
      {!loading && filtered.length === 0 && !searchQuery && (
        <div className="p-6 text-center">
          <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-gray-100 mb-3">
            <Users className="h-5 w-5 text-gray-400" />
          </div>
          <h3 className="text-base font-medium text-gray-900 mb-1">
            No hay usuarios
          </h3>
          <p className="text-gray-500 text-sm">
            Aún no has agregado ningún usuario a tu organización.
          </p>
        </div>
      )}

      {/* 🎯 PAGINACIÓN OPTIMIZADA */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center border-t border-gray-100 bg-white py-2">
          <div className="flex items-center gap-2">
            <OutlineButton
              onClick={() => setPage(prev => Math.max(1, prev - 1))}
              disabled={page === 1}
              className="px-2 py-1 text-sm"
            >
              Anterior
            </OutlineButton>
            
            <span className="text-xs text-gray-600 px-2">
              {page} / {totalPages}
            </span>
            
            <OutlineButton
              onClick={() => setPage(prev => Math.min(totalPages, prev + 1))}
              disabled={page === totalPages}
              className="px-2 py-1 text-sm"
            >
              Siguiente
            </OutlineButton>
          </div>
        </div>
      )}

      {/* Modal de confirmación para eliminar */}
      <AlertDialog
        open={!!userToDelete}
        onOpenChange={() => setUserToDelete(null)}
      >
        <AlertDialogContent className="bg-white border border-gray-200 shadow-xl rounded-xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-red-600">⚠️ Eliminación Completa de Usuario</AlertDialogTitle>
            <AlertDialogDescription className="space-y-3">
              <p className="font-medium text-gray-900">
                Esta acción eliminará <strong>completamente</strong> al usuario del sistema:
              </p>
              <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
                <li>❌ Eliminado de la organización</li>
                <li>❌ Eliminado de todas las campañas</li>
                <li>❌ Eliminado de todos los equipos</li>
                <li>❌ Eliminado del perfil de usuario</li>
                <li>❌ Eliminado de la autenticación (auth.users)</li>
              </ul>
              <p className="text-red-600 font-medium">
                ⚠️ Esta acción es <strong>irreversible</strong> y no se puede deshacer.
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              🗑️ Eliminar Completamente
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Modal para asignar campañas */}
      <AssignCampaignModal
        user={userToAssignCampaigns}
        isOpen={!!userToAssignCampaigns}
        onClose={() => setUserToAssignCampaigns(null)}
        onSuccess={() => {
          // Aquí podrías refrescar los datos si es necesario
          console.log("Usuario asignado exitosamente");
        }}
      />
    </>
  );
}
