"use client"

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useUsersContext } from '@/contexts/UsersContext';
import { 
  OrganizationMember, 
  UserRole, 
  InviteUserData, 
  UpdateUserRoleData,
  UserListFilters
} from '@/types/users';

interface UseUsersReturn {
  // Estado
  members: OrganizationMember[];
  loading: boolean;
  error: string | null;
  
  // Filtros y búsqueda
  filteredMembers: OrganizationMember[];
  selectedUsers: string[];
  setSelectedUsers: (users: string[]) => void;
  toggleUserSelection: (userId: string) => void;
  selectAllUsers: () => void;
  clearSelection: () => void;
  
  // Operaciones CRUD
  getMembers: (organizationId: string, force?: boolean) => Promise<OrganizationMember[]>;
  inviteUser: (userData: InviteUserData) => Promise<void>;
  updateUserRole: (userData: UpdateUserRoleData) => Promise<void>;
  updateUserName: (userId: string, fullName: string) => Promise<void>;
  removeUser: (userId: string) => Promise<void>;
  refreshMembers: () => Promise<void>;
  
  // Filtros
  setFilters: (filters: Partial<UserListFilters>) => void;
  clearFilters: () => void;
}

export function useUsers(organizationId: string): UseUsersReturn {
  const {
    members,
    loading,
    error,
    getMembers,
    inviteUser: contextInviteUser,
    updateUserRole: contextUpdateUserRole,
    updateUserName: contextUpdateUserName,
    removeUser: contextRemoveUser,
    refreshMembers,
  } = useUsersContext();

  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [filters, setFiltersState] = useState<UserListFilters>({
    search: '',
    role: 'all',
    status: 'all',
    team: 'all'
  });

  // Cargar miembros al montar el componente
  useEffect(() => {
    const loadMembers = async () => {
      await getMembers(organizationId);
    };
    loadMembers();
  }, [organizationId, getMembers]);

  // Filtrar miembros
  const filteredMembers = useMemo(() => {
    let result = members;

    // Aplicar filtros
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      result = result.filter(member => {
        return (
          member.full_name?.toLowerCase().includes(searchLower) ||
          member.email?.toLowerCase().includes(searchLower) ||
          member.org_role?.toLowerCase().includes(searchLower) ||
          member.position?.toLowerCase().includes(searchLower)
        );
      });
    }
    
    if (filters.role !== 'all' && filters.role) {
      result = result.filter(member => member.org_role === filters.role);
    }
    
    if (filters.status !== 'all') {
      // Por ahora todos los miembros se consideran activos
      if (filters.status === 'active') return result;
      if (filters.status === 'inactive') return [];
    }

    return result;
  }, [members, filters]);

  // Gestión de selección
  const toggleUserSelection = useCallback((userId: string) => {
    setSelectedUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  }, []);

  const selectAllUsers = useCallback(() => {
    setSelectedUsers(filteredMembers.map(member => member.user_id));
  }, [filteredMembers]);

  const clearSelection = useCallback(() => {
    setSelectedUsers([]);
  }, []);

  // Gestión de filtros
  const setFilters = useCallback((newFilters: Partial<UserListFilters>) => {
    setFiltersState(prev => ({ ...prev, ...newFilters }));
  }, []);

  const clearFilters = useCallback(() => {
    setFiltersState({
      search: '',
      role: 'all',
      status: 'all',
      team: 'all'
    });
  }, []);

  // Wrappers para las operaciones del contexto
  const inviteUser = useCallback(async (userData: InviteUserData) => {
    await contextInviteUser(userData);
  }, [contextInviteUser]);

  const updateUserRole = useCallback(async (userData: UpdateUserRoleData) => {
    await contextUpdateUserRole(userData);
  }, [contextUpdateUserRole]);

  const updateUserName = useCallback(async (userId: string, fullName: string) => {
    await contextUpdateUserName(userId, fullName);
  }, [contextUpdateUserName]);

  const removeUser = useCallback(async (userId: string) => {
    await contextRemoveUser(userId);
  }, [contextRemoveUser]);

  return {
    members,
    loading,
    error,
    filteredMembers,
    selectedUsers,
    setSelectedUsers,
    toggleUserSelection,
    selectAllUsers,
    clearSelection,
    getMembers,
    inviteUser,
    updateUserRole,
    updateUserName,
    removeUser,
    refreshMembers,
    setFilters,
    clearFilters,
  };
} 