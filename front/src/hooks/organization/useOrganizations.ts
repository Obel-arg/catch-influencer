import { useState, useCallback } from 'react';
import { organizationService } from '@/lib/services/organization';
import { Organization, OrganizationMember, OrganizationInvitation, OrganizationSettings, CreateOrganizationDto, UpdateOrganizationDto } from '@/types/organization';
import { PaginationParams } from '@/types/common';
import { useToast } from '../common/useToast';

export const useOrganizations = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { showToast } = useToast();

  const getOrganizations = useCallback(async (params?: PaginationParams): Promise<Organization[]> => {
    try {
      setLoading(true);
      setError(null);
      const data = await organizationService.getOrganizations(params);
      return data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al obtener organizaciones';
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

  const getOrganizationById = useCallback(async (id: string): Promise<Organization | null> => {
    try {
      setLoading(true);
      setError(null);
      const data = await organizationService.getOrganizationById(id);
      return data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al obtener la organización';
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

  const createOrganization = useCallback(async (organization: CreateOrganizationDto): Promise<Organization | null> => {
    try {
      setLoading(true);
      setError(null);
      const newOrganization: Omit<Organization, "id" | "createdAt" | "updatedAt"> = {
        ...organization,
        description: organization.description || '',
        size: organization.size as "small" | "medium" | "large" | "enterprise" | undefined,
        status: "active",
        settings: {
          notifications: {
            email: true,
            push: true,
            sms: false
          },
          privacy: {
            publicProfile: false,
            showMetrics: true,
            showTeam: true
          },
          features: {}
        },
        subscription: {
          plan: "free",
          status: "active",
          startDate: new Date(),
          endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 días
          features: []
        }
      };
      const data = await organizationService.createOrganization(newOrganization);
      showToast({
        title: 'Éxito',
        description: 'Organización creada correctamente',
        status: 'success'
      });
      return data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al crear la organización';
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

  const updateOrganization = useCallback(async (id: string, organization: UpdateOrganizationDto): Promise<Organization | null> => {
    try {
      setLoading(true);
      setError(null);
      const updatedOrganization: Partial<Organization> = {
        ...organization,
        size: organization.size as "small" | "medium" | "large" | "enterprise" | undefined
      };
      const data = await organizationService.updateOrganization(id, updatedOrganization);
      showToast({
        title: 'Éxito',
        description: 'Organización actualizada correctamente',
        status: 'success'
      });
      return data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al actualizar la organización';
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

  const deleteOrganization = useCallback(async (id: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      await organizationService.deleteOrganization(id);
      showToast({
        title: 'Éxito',
        description: 'Organización eliminada correctamente',
        status: 'success'
      });
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al eliminar la organización';
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

  const getMembers = useCallback(async (organizationId: string, params?: PaginationParams): Promise<OrganizationMember[]> => {
    try {
      setLoading(true);
      setError(null);
      const data = await organizationService.getMembers(organizationId, params);
      return data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al obtener miembros';
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

  const getMemberById = useCallback(async (organizationId: string, memberId: string): Promise<OrganizationMember | null> => {
    try {
      setLoading(true);
      setError(null);
      const data = await organizationService.getMemberById(organizationId, memberId);
      return data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al obtener el miembro';
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

  const addMember = useCallback(async (organizationId: string, member: Omit<OrganizationMember, "id" | "organizationId" | "createdAt" | "updatedAt">): Promise<OrganizationMember | null> => {
    try {
      setLoading(true);
      setError(null);
      const data = await organizationService.addMember(organizationId, member);
      showToast({
        title: 'Éxito',
        description: 'Miembro agregado correctamente',
        status: 'success'
      });
      return data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al agregar miembro';
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

  const updateMember = useCallback(async (organizationId: string, memberId: string, member: Partial<OrganizationMember>): Promise<OrganizationMember | null> => {
    try {
      setLoading(true);
      setError(null);
      const data = await organizationService.updateMember(organizationId, memberId, member);
      showToast({
        title: 'Éxito',
        description: 'Miembro actualizado correctamente',
        status: 'success'
      });
      return data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al actualizar miembro';
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

  const removeMember = useCallback(async (organizationId: string, memberId: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      await organizationService.removeMember(organizationId, memberId);
      showToast({
        title: 'Éxito',
        description: 'Miembro eliminado correctamente',
        status: 'success'
      });
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al eliminar miembro';
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

  const getInvitations = useCallback(async (organizationId: string, params?: PaginationParams): Promise<OrganizationInvitation[]> => {
    try {
      setLoading(true);
      setError(null);
      const data = await organizationService.getInvitations(organizationId, params);
      return data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al obtener invitaciones';
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

  const createInvitation = useCallback(async (organizationId: string, invitation: Omit<OrganizationInvitation, "id" | "organizationId" | "createdAt" | "updatedAt">): Promise<OrganizationInvitation | null> => {
    try {
      setLoading(true);
      setError(null);
      const data = await organizationService.createInvitation(organizationId, invitation);
      showToast({
        title: 'Éxito',
        description: 'Invitación creada correctamente',
        status: 'success'
      });
      return data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al crear invitación';
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

  const cancelInvitation = useCallback(async (organizationId: string, invitationId: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      await organizationService.cancelInvitation(organizationId, invitationId);
      showToast({
        title: 'Éxito',
        description: 'Invitación cancelada correctamente',
        status: 'success'
      });
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al cancelar invitación';
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

  const getSettings = useCallback(async (organizationId: string): Promise<OrganizationSettings | null> => {
    try {
      setLoading(true);
      setError(null);
      const data = await organizationService.getSettings(organizationId);
      return data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al obtener configuración';
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

  const updateSettings = useCallback(async (organizationId: string, settings: Partial<OrganizationSettings>): Promise<OrganizationSettings | null> => {
    try {
      setLoading(true);
      setError(null);
      const data = await organizationService.updateSettings(organizationId, settings);
      showToast({
        title: 'Éxito',
        description: 'Configuración actualizada correctamente',
        status: 'success'
      });
      return data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al actualizar configuración';
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

  return {
    loading,
    error,
    getOrganizations,
    getOrganizationById,
    createOrganization,
    updateOrganization,
    deleteOrganization,
    getMembers,
    getMemberById,
    addMember,
    updateMember,
    removeMember,
    getInvitations,
    createInvitation,
    cancelInvitation,
    getSettings,
    updateSettings
  };
}; 