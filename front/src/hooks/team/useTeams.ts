import { useState, useCallback } from 'react';
import { teamService } from '@/lib/services/team';
import { Team, TeamMember, TeamInvitation, TeamRole, CreateTeamDto, CreateTeamMemberDto, CreateTeamRoleDto, CreateTeamInvitationDto } from '@/types/team';
import { PaginationParams } from '@/types/common';
import { useToast } from '../common/useToast';

export const useTeams = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { showToast } = useToast();

  const getTeams = useCallback(async (params?: PaginationParams): Promise<Team[]> => {
    try {
      setLoading(true);
      setError(null);
      const data = await teamService.getTeams(params);
      return data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al obtener equipos';
      setError(message);
      showToast({
        title: 'Error',
        description: message,
        status: 'error'
      });
      return [];
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  const getTeamById = useCallback(async (id: string): Promise<Team | null> => {
    try {
      setLoading(true);
      setError(null);
      const data = await teamService.getTeamById(id);
      return data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al obtener equipo';
      setError(message);
      showToast({
        title: 'Error',
        description: message,
        status: 'error'
      });
      return null;
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  const createTeam = useCallback(async (team: CreateTeamDto): Promise<Team | null> => {
    try {
      setLoading(true);
      setError(null);
      const data = await teamService.createTeam(team);
      showToast({
        title: 'Éxito',
        description: 'Equipo creado correctamente',
        status: 'success'
      });
      return data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al crear equipo';
      setError(message);
      showToast({
        title: 'Error',
        description: message,
        status: 'error'
      });
      return null;
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  const updateTeam = useCallback(async (id: string, team: Partial<Team>): Promise<Team | null> => {
    try {
      setLoading(true);
      setError(null);
      const data = await teamService.updateTeam(id, team);
      showToast({
        title: 'Éxito',
        description: 'Equipo actualizado correctamente',
        status: 'success'
      });
      return data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al actualizar equipo';
      setError(message);
      showToast({
        title: 'Error',
        description: message,
        status: 'error'
      });
      return null;
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  const deleteTeam = useCallback(async (id: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      await teamService.deleteTeam(id);
      showToast({
        title: 'Éxito',
        description: 'Equipo eliminado correctamente',
        status: 'success'
      });
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al eliminar equipo';
      setError(message);
      showToast({
        title: 'Error',
        description: message,
        status: 'error'
      });
      return false;
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  const getTeamMembers = useCallback(async (teamId: string, params?: PaginationParams): Promise<TeamMember[]> => {
    try {
      setLoading(true);
      setError(null);
      const data = await teamService.getTeamMembers(teamId, params);
      return data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al obtener miembros del equipo';
      setError(message);
      showToast({
        title: 'Error',
        description: message,
        status: 'error'
      });
      return [];
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  const addTeamMember = useCallback(async (teamId: string, member: CreateTeamMemberDto): Promise<TeamMember | null> => {
    try {
      setLoading(true);
      setError(null);
      const data = await teamService.addTeamMember(teamId, member);
      showToast({
        title: 'Éxito',
        description: 'Miembro agregado correctamente',
        status: 'success'
      });
      return data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al agregar miembro al equipo';
      setError(message);
      showToast({
        title: 'Error',
        description: message,
        status: 'error'
      });
      return null;
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  const updateTeamMember = useCallback(async (teamId: string, memberId: string, member: Partial<TeamMember>): Promise<TeamMember | null> => {
    try {
      setLoading(true);
      setError(null);
      const data = await teamService.updateTeamMember(teamId, memberId, member);
      showToast({
        title: 'Éxito',
        description: 'Miembro actualizado correctamente',
        status: 'success'
      });
      return data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al actualizar miembro del equipo';
      setError(message);
      showToast({
        title: 'Error',
        description: message,
        status: 'error'
      });
      return null;
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  const removeTeamMember = useCallback(async (teamId: string, memberId: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      await teamService.removeTeamMember(teamId, memberId);
      showToast({
        title: 'Éxito',
        description: 'Miembro eliminado correctamente',
        status: 'success'
      });
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al eliminar miembro del equipo';
      setError(message);
      showToast({
        title: 'Error',
        description: message,
        status: 'error'
      });
      return false;
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  const getTeamRoles = useCallback(async (teamId: string): Promise<TeamRole[]> => {
    try {
      setLoading(true);
      setError(null);
      const data = await teamService.getTeamRoles(teamId);
      return data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al obtener roles de equipo';
      setError(message);
      showToast({
        title: 'Error',
        description: message,
        status: 'error'
      });
      return [];
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  const createTeamRole = useCallback(async (teamId: string, role: CreateTeamRoleDto): Promise<TeamRole | null> => {
    try {
      setLoading(true);
      setError(null);
      const data = await teamService.createTeamRole(teamId, role);
      showToast({
        title: 'Éxito',
        description: 'Rol creado correctamente',
        status: 'success'
      });
      return data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al crear rol';
      setError(message);
      showToast({
        title: 'Error',
        description: message,
        status: 'error'
      });
      return null;
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  const updateTeamRole = useCallback(async (teamId: string, roleId: string, role: Partial<TeamRole>): Promise<TeamRole | null> => {
    try {
      setLoading(true);
      setError(null);
      const data = await teamService.updateTeamRole(teamId, roleId, role);
      showToast({
        title: 'Éxito',
        description: 'Rol actualizado correctamente',
        status: 'success'
      });
      return data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al actualizar rol';
      setError(message);
      showToast({
        title: 'Error',
        description: message,
        status: 'error'
      });
      return null;
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  const deleteTeamRole = useCallback(async (teamId: string, roleId: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      await teamService.deleteTeamRole(teamId, roleId);
      showToast({
        title: 'Éxito',
        description: 'Rol eliminado correctamente',
        status: 'success'
      });
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al eliminar rol';
      setError(message);
      showToast({
        title: 'Error',
        description: message,
        status: 'error'
      });
      return false;
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  const getTeamInvitations = useCallback(async (teamId: string, params?: PaginationParams): Promise<TeamInvitation[]> => {
    try {
      setLoading(true);
      setError(null);
      const data = await teamService.getTeamInvitations(teamId, params);
      return data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al obtener invitaciones del equipo';
      setError(message);
      showToast({
        title: 'Error',
        description: message,
        status: 'error'
      });
      return [];
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  const createTeamInvitation = useCallback(async (teamId: string, invitation: CreateTeamInvitationDto): Promise<TeamInvitation | null> => {
    try {
      setLoading(true);
      setError(null);
      const data = await teamService.createTeamInvitation(teamId, invitation);
      showToast({
        title: 'Éxito',
        description: 'Invitación creada correctamente',
        status: 'success'
      });
      return data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al crear invitación al equipo';
      setError(message);
      showToast({
        title: 'Error',
        description: message,
        status: 'error'
      });
      return null;
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  const cancelTeamInvitation = useCallback(async (teamId: string, invitationId: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      await teamService.cancelTeamInvitation(teamId, invitationId);
      showToast({
        title: 'Éxito',
        description: 'Invitación cancelada correctamente',
        status: 'success'
      });
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al cancelar invitación al equipo';
      setError(message);
      showToast({
        title: 'Error',
        description: message,
        status: 'error'
      });
      return false;
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  return {
    loading,
    error,
    getTeams,
    getTeamById,
    createTeam,
    updateTeam,
    deleteTeam,
    getTeamMembers,
    addTeamMember,
    updateTeamMember,
    removeTeamMember,
    getTeamRoles,
    createTeamRole,
    updateTeamRole,
    deleteTeamRole,
    getTeamInvitations,
    createTeamInvitation,
    cancelTeamInvitation
  };
}; 