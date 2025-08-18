import { httpApiClient } from '../../http';
import { Organization, OrganizationMember, OrganizationInvitation, OrganizationSettings } from "@/types/organization";
import { AxiosHeaders } from "axios";
import { PaginationParams } from "@/types/common";
import { CreateOrganizationDto } from '@/types/organization';

export class OrganizationService {
  private static instance: OrganizationService;
  private baseUrl = "/organizations";

  private constructor() {}

  public static getInstance(): OrganizationService {
    if (!OrganizationService.instance) {
      OrganizationService.instance = new OrganizationService();
    }
    return OrganizationService.instance;
  }

  async getOrganizations(params?: PaginationParams): Promise<Organization[]> {
    const response = await httpApiClient.get<Organization[]>(this.baseUrl, {
      params,
      headers: new AxiosHeaders({
        "Content-Type": "application/json"
      })
    });
    return response.data;
  }

  async getOrganizationById(id: string): Promise<Organization> {
    const response = await httpApiClient.get<Organization>(`${this.baseUrl}/${id}`, {
      headers: new AxiosHeaders({
        "Content-Type": "application/json"
      })
    });
    return response.data;
  }

  async createOrganization(organization: CreateOrganizationDto): Promise<Organization> {
    const response = await httpApiClient.post<Organization>(this.baseUrl, organization, {
      headers: new AxiosHeaders({
        "Content-Type": "application/json"
      })
    });
    return response.data;
  }

  async updateOrganization(id: string, organization: Partial<Organization>): Promise<Organization> {
    const response = await httpApiClient.put<Organization>(`${this.baseUrl}/${id}`, organization, {
      headers: new AxiosHeaders({
        "Content-Type": "application/json"
      })
    });
    return response.data;
  }

  async deleteOrganization(id: string): Promise<void> {
    await httpApiClient.delete(`${this.baseUrl}/${id}`, {
      headers: new AxiosHeaders({
        "Content-Type": "application/json"
      })
    });
  }

  async getMembers(organizationId: string, params?: PaginationParams): Promise<OrganizationMember[]> {
    const response = await httpApiClient.get<OrganizationMember[]>(`${this.baseUrl}/${organizationId}/members`, {
      params,
      headers: new AxiosHeaders({
        "Content-Type": "application/json"
      })
    });
    return response.data;
  }

  async getMemberById(organizationId: string, memberId: string): Promise<OrganizationMember> {
    const response = await httpApiClient.get<OrganizationMember>(`${this.baseUrl}/${organizationId}/members/${memberId}`, {
      headers: new AxiosHeaders({
        "Content-Type": "application/json"
      })
    });
    return response.data;
  }

  async addMember(organizationId: string, member: Omit<OrganizationMember, "id" | "organizationId" | "createdAt" | "updatedAt">): Promise<OrganizationMember> {
    const response = await httpApiClient.post<OrganizationMember>(`${this.baseUrl}/${organizationId}/members`, member, {
      headers: new AxiosHeaders({
        "Content-Type": "application/json"
      })
    });
    return response.data;
  }

  async updateMember(organizationId: string, memberId: string, member: Partial<OrganizationMember>): Promise<OrganizationMember> {
    const response = await httpApiClient.put<OrganizationMember>(`${this.baseUrl}/${organizationId}/members/${memberId}`, member, {
      headers: new AxiosHeaders({
        "Content-Type": "application/json"
      })
    });
    return response.data;
  }

  async removeMember(organizationId: string, memberId: string): Promise<void> {
    await httpApiClient.delete(`${this.baseUrl}/${organizationId}/members/${memberId}`, {
      headers: new AxiosHeaders({
        "Content-Type": "application/json"
      })
    });
  }

  async getInvitations(organizationId: string, params?: PaginationParams): Promise<OrganizationInvitation[]> {
    const response = await httpApiClient.get<OrganizationInvitation[]>(`${this.baseUrl}/${organizationId}/invitations`, {
      params,
      headers: new AxiosHeaders({
        "Content-Type": "application/json"
      })
    });
    return response.data;
  }

  async createInvitation(organizationId: string, invitation: Omit<OrganizationInvitation, "id" | "organizationId" | "createdAt" | "updatedAt">): Promise<OrganizationInvitation> {
    const response = await httpApiClient.post<OrganizationInvitation>(`${this.baseUrl}/${organizationId}/invitations`, invitation, {
      headers: new AxiosHeaders({
        "Content-Type": "application/json"
      })
    });
    return response.data;
  }

  async cancelInvitation(organizationId: string, invitationId: string): Promise<void> {
    await httpApiClient.delete(`${this.baseUrl}/${organizationId}/invitations/${invitationId}`, {
      headers: new AxiosHeaders({
        "Content-Type": "application/json"
      })
    });
  }

  async getSettings(organizationId: string): Promise<OrganizationSettings> {
    const response = await httpApiClient.get<OrganizationSettings>(`${this.baseUrl}/${organizationId}/settings`, {
      headers: new AxiosHeaders({
        "Content-Type": "application/json"
      })
    });
    return response.data;
  }

  async updateSettings(organizationId: string, settings: Partial<OrganizationSettings>): Promise<OrganizationSettings> {
    const response = await httpApiClient.put<OrganizationSettings>(`${this.baseUrl}/${organizationId}/settings`, settings, {
      headers: new AxiosHeaders({
        "Content-Type": "application/json"
      })
    });
    return response.data;
  }
}

export const organizationService = OrganizationService.getInstance(); 