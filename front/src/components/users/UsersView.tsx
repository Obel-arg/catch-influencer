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
    role: UserRole,
    brandIds?: string[]
  ) => {
    await updateUserRole({ userId, role });

    // Update user brands if provided
    if (brandIds !== undefined) {
      try {
        const response = await fetch(
          `/api/user-brands/organizations/${organizationId}/users/${userId}/brands`,
          {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({ brand_ids: brandIds })
          }
        );

        if (!response.ok) {
          throw new Error('Failed to update user brands');
        }
      } catch (error) {
        console.error('Error updating user brands:', error);
      }
    }

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
    role: UserRole,
    brandIds?: string[]
  ) => {
    await inviteUser({ email, full_name: fullName, role, brand_ids: brandIds });
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

  // 🎯 ORDENAR MIEMBROS CON EL USUARIO ACTUAL PRIMERO Y ELIMINAR DUPLICADOS
  const sortedMembers = useMemo(() => {
    // Eliminar duplicados basados en user_id
    const uniqueMembers = Array.from(
      new Map(hookFilteredMembers.map(m => [m.user_id, m])).values()
    );

    if (!currentUser) return uniqueMembers;

    return uniqueMembers.sort((a, b) => {
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
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Usuarios</h1>
            <p className="text-gray-500 text-sm mt-1">
              Administra los miembros de tu organización
            </p>
          </div>
          <Button
            onClick={() => setShowInviteModal(true)}
            variant="default"
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Invitar Usuario
          </Button>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
          {/* Búsqueda */}
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Buscar por nombre, email..."
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pl-10 h-10 text-sm"
            />
          </div>

          {/* Rol Filter */}
          <Select value={roleFilter} onValueChange={handleRoleFilterChange}>
            <SelectTrigger className="w-full sm:w-48 h-10">
              <SelectValue placeholder="Filtrar por rol" />
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

          {/* Clear Filters Button */}
          {(searchQuery || roleFilter !== "all") && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSearchQuery("");
                setRoleFilter("all");
                clearFilters();
              }}
              className="h-10"
            >
              Limpiar filtros
            </Button>
          )}

          {/* User Counter */}
          {filteredMembers.length > 0 && (
            <span className="text-sm text-gray-500 ml-auto">
              {filteredMembers.length} usuario{filteredMembers.length !== 1 ? "s" : ""}
            </span>
          )}
        </div>
      </div>

      {/* Tabla de usuarios */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
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
          organizationId={organizationId}
        />
      </div>

      {/* Modal de edición de rol */}
      <EditUserRoleModal
        member={editingUser}
        isOpen={!!editingUser}
        onClose={() => setEditingUser(null)}
        onSave={handleSaveRole}
        onUpdateName={handleUpdateName}
        loading={loading}
        organizationId={organizationId}
      />

      {/* Modal de invitación */}
      <InviteUserModal
        isOpen={showInviteModal}
        onClose={() => setShowInviteModal(false)}
        onInvite={handleInviteUser}
        loading={loading}
        organizationId={organizationId}
      />
    </div>
  );
}
