"use client";

import { useState, useMemo } from "react";
import { Plus, Users as UsersIcon, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useUsers } from "@/hooks/users/useUsers";
import { UserTable } from "./UserTable";
import { EditUserRoleModal } from "./EditUserRoleModal";
import { InviteUserModal } from "./InviteUserModal";
import { OrganizationMember, UserRole } from "@/types/users";
import { useRoleContext } from "@/contexts/RoleContext";
import { useAuthContext } from "@/contexts/AuthContext";

export function UsersView() {
  // Por ahora usamos un ID hardcodeado de la organización "Catch"
  // En un futuro esto vendría del contexto de usuario/organización
  const organizationId = "5e931a4d-9103-4f5d-863a-724606b06567";

  const {
    members,
    filteredMembers: hookFilteredMembers,
    loading,
    selectedUsers,
    toggleUserSelection,
    selectAllUsers,
    clearSelection,
    inviteUser,
    updateUserRole,
    updateUserName,
    removeUser,
    setFilters,
    clearFilters,
  } = useUsers(organizationId);

  // Obtener el rol actual del usuario
  const { getCachedRole, isAdmin } = useRoleContext();
  const currentRole = getCachedRole();

  // 🎯 OBTENER USUARIO ACTUAL
  const { user: currentUser } = useAuthContext();

  const [editingUser, setEditingUser] = useState<OrganizationMember | null>(
    null
  );
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");

  const handleEditRole = (member: OrganizationMember) => {
    setEditingUser(member);
  };

  const handleSaveRole = async (
    userId: string,
    role: UserRole
  ) => {
    await updateUserRole({ userId, role });
    setEditingUser(null);
  };

  const handleUpdateName = async (
    userId: string,
    fullName: string
  ) => {
    await updateUserName(userId, fullName);
  };

  const handleInviteUser = async (
    email: string,
    fullName: string,
    role: UserRole
  ) => {
    await inviteUser({ email, full_name: fullName, role });
    setShowInviteModal(false);
  };

  // Manejar cambios en los filtros
  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    setFilters({ search: query });
  };

  const handleRoleFilterChange = (role: string) => {
    setRoleFilter(role);
    setFilters({ role: role as any });
  };

  // 🎯 ORDENAR MIEMBROS CON EL USUARIO ACTUAL PRIMERO
  const sortedMembers = useMemo(() => {
    if (!currentUser) return hookFilteredMembers;

    return [...hookFilteredMembers].sort((a, b) => {
      // El usuario actual siempre va primero
      if (a.user_id === currentUser.id) return -1;
      if (b.user_id === currentUser.id) return 1;
      
      // Para el resto, ordenar por nombre
      const nameA = a.full_name || a.email || '';
      const nameB = b.full_name || b.email || '';
      return nameA.localeCompare(nameB);
    });
  }, [hookFilteredMembers, currentUser]);

  // Usar los miembros ordenados
  const filteredMembers = sortedMembers;

  // Generar opciones únicas de roles
  const uniqueRoles = useMemo(() => {
    const roles = [
      ...new Set(members.map((member) => member.org_role).filter(Boolean)),
    ];
    return roles.sort();
  }, [members]);

  return (
    <div className="space-y-6">
      {/* Header con contenedor blanco */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
        <div className="px-6 py-4">
          {/* Header con título y botón */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
            <div>
              <h1 className="text-lg font-semibold text-gray-900">Usuarios</h1>
              <p className="text-gray-500 text-sm">
                Administra los miembros de tu organización
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button
                onClick={() => setShowInviteModal(true)}
                variant="default"
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Invitar Usuario
              </Button>
            </div>
          </div>

          {/* Filtros integrados */}
          <div className="flex items-center gap-3">
            {/* Búsqueda */}
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Buscar usuarios..."
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="pl-10 h-9 text-sm bg-gray-50 border-gray-200 focus:bg-white focus:border-blue-300 focus:ring-2 focus:ring-blue-100 transition-all duration-200"
              />
            </div>

            {/* Filtros */}
            <div className="flex items-center gap-4">
              {/* Rol */}
              <Select value={roleFilter} onValueChange={handleRoleFilterChange}>
                <SelectTrigger className="w-[220px] h-9 text-sm bg-gray-50 border-gray-200 focus:bg-white focus:border-blue-300 text-left">
                  <SelectValue placeholder="Por rol" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los roles</SelectItem>
                  {uniqueRoles.length > 0 ? (
                    uniqueRoles.map((role) => (
                      <SelectItem key={role} value={role}>
                        {role === "admin"
                          ? "Administrador"
                          : role === "member"
                          ? "Miembro"
                          : role === "viewer"
                          ? "Visualizador"
                          : role}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="no-roles" disabled>
                      No hay roles disponibles
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>

              {/* Botón para limpiar filtros */}
              {(searchQuery || roleFilter !== "all") && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSearchQuery("");
                    setRoleFilter("all");
                    clearFilters();
                  }}
                  className="h-9 text-sm"
                >
                  Limpiar filtros
                </Button>
              )}
            </div>

            {/* Contador de usuarios */}
            <div className="flex items-center gap-3 ml-auto">
              {filteredMembers.length > 0 && (
                <span className="text-sm text-gray-500">
                  {filteredMembers.length} usuario
                  {filteredMembers.length !== 1 ? "s" : ""}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Tabla de usuarios con contenedor blanco */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
        <div className="p-6">
          <UserTable
            members={filteredMembers}
            loading={loading}
            selectedUsers={selectedUsers}
            onUserSelect={toggleUserSelection}
            onSelectAll={selectAllUsers}
            onClearSelection={clearSelection}
            onEditRole={handleEditRole}
            onRemoveUser={removeUser}
            searchQuery={searchQuery}
            currentUserId={currentUser?.id}
          />
        </div>
      </div>

      {/* Modal de edición de rol */}
      <EditUserRoleModal
        member={editingUser}
        isOpen={!!editingUser}
        onClose={() => setEditingUser(null)}
        onSave={handleSaveRole}
        onUpdateName={handleUpdateName}
        loading={loading}
      />

      {/* Modal de invitación */}
      <InviteUserModal
        isOpen={showInviteModal}
        onClose={() => setShowInviteModal(false)}
        onInvite={handleInviteUser}
        loading={loading}
      />
    </div>
  );
}
