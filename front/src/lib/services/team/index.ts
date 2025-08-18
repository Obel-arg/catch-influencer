import { httpClient } from "../../http";
import { Team, TeamMember, TeamRole, TeamInvitation, CreateTeamDto, CreateTeamMemberDto, CreateTeamRoleDto, CreateTeamInvitationDto } from "@/types/team";
import { AxiosHeaders } from "axios";
import { PaginationParams } from "@/types/common";

export class TeamService {
  private static instance: TeamService;
  private baseUrl = "/teams";

  private constructor() {}

  public static getInstance(): TeamService {
    if (!TeamService.instance) {
      TeamService.instance = new TeamService();
    }
    return TeamService.instance;
  }

  async getTeams(params?: PaginationParams): Promise<Team[]> {
    const response = await httpClient.get<Team[]>(this.baseUrl, {
      params,
      headers: new AxiosHeaders({
        "Content-Type": "application/json"
      })
    });
    return response.data;
  }

  async getTeamById(id: string): Promise<Team> {
    const response = await httpClient.get<Team>(`${this.baseUrl}/${id}`, {
      headers: new AxiosHeaders({
        "Content-Type": "application/json"
      })
    });
    return response.data;
  }

  async createTeam(team: CreateTeamDto): Promise<Team> {
    const response = await httpClient.post<Team>(this.baseUrl, team, {
      headers: new AxiosHeaders({
        "Content-Type": "application/json"
      })
    });
    return response.data;
  }

  async updateTeam(id: string, team: Partial<Team>): Promise<Team> {
    const response = await httpClient.put<Team>(`${this.baseUrl}/${id}`, team, {
      headers: new AxiosHeaders({
        "Content-Type": "application/json"
      })
    });
    return response.data;
  }

  async deleteTeam(id: string): Promise<void> {
    await httpClient.delete(`${this.baseUrl}/${id}`, {
      headers: new AxiosHeaders({
        "Content-Type": "application/json"
      })
    });
  }

  async getTeamMembers(teamId: string, params?: PaginationParams): Promise<TeamMember[]> {
    const response = await httpClient.get<TeamMember[]>(`${this.baseUrl}/${teamId}/members`, {
      params,
      headers: new AxiosHeaders({
        "Content-Type": "application/json"
      })
    });
    return response.data;
  }

  async getTeamMemberById(teamId: string, memberId: string): Promise<TeamMember> {
    const response = await httpClient.get<TeamMember>(`${this.baseUrl}/${teamId}/members/${memberId}`, {
      headers: new AxiosHeaders({
        "Content-Type": "application/json"
      })
    });
    return response.data;
  }

  async addTeamMember(teamId: string, member: CreateTeamMemberDto): Promise<TeamMember> {
    const response = await httpClient.post<TeamMember>(`${this.baseUrl}/${teamId}/members`, member, {
      headers: new AxiosHeaders({
        "Content-Type": "application/json"
      })
    });
    return response.data;
  }

  async updateTeamMember(teamId: string, memberId: string, member: Partial<TeamMember>): Promise<TeamMember> {
    const response = await httpClient.put<TeamMember>(`${this.baseUrl}/${teamId}/members/${memberId}`, member, {
      headers: new AxiosHeaders({
        "Content-Type": "application/json"
      })
    });
    return response.data;
  }

  async removeTeamMember(teamId: string, memberId: string): Promise<void> {
    await httpClient.delete(`${this.baseUrl}/${teamId}/members/${memberId}`, {
      headers: new AxiosHeaders({
        "Content-Type": "application/json"
      })
    });
  }

  async getTeamRoles(teamId: string): Promise<TeamRole[]> {
    const response = await httpClient.get<TeamRole[]>(`${this.baseUrl}/${teamId}/roles`, {
      headers: new AxiosHeaders({
        "Content-Type": "application/json"
      })
    });
    return response.data;
  }

  async getTeamRoleById(teamId: string, roleId: string): Promise<TeamRole> {
    const response = await httpClient.get<TeamRole>(`${this.baseUrl}/${teamId}/roles/${roleId}`, {
      headers: new AxiosHeaders({
        "Content-Type": "application/json"
      })
    });
    return response.data;
  }

  async createTeamRole(teamId: string, role: CreateTeamRoleDto): Promise<TeamRole> {
    const response = await httpClient.post<TeamRole>(`${this.baseUrl}/${teamId}/roles`, role, {
      headers: new AxiosHeaders({
        "Content-Type": "application/json"
      })
    });
    return response.data;
  }

  async updateTeamRole(teamId: string, roleId: string, role: Partial<TeamRole>): Promise<TeamRole> {
    const response = await httpClient.put<TeamRole>(`${this.baseUrl}/${teamId}/roles/${roleId}`, role, {
      headers: new AxiosHeaders({
        "Content-Type": "application/json"
      })
    });
    return response.data;
  }

  async deleteTeamRole(teamId: string, roleId: string): Promise<void> {
    await httpClient.delete(`${this.baseUrl}/${teamId}/roles/${roleId}`, {
      headers: new AxiosHeaders({
        "Content-Type": "application/json"
      })
    });
  }

  async getTeamInvitations(teamId: string, params?: PaginationParams): Promise<TeamInvitation[]> {
    const response = await httpClient.get<TeamInvitation[]>(`${this.baseUrl}/${teamId}/invitations`, {
      params,
      headers: new AxiosHeaders({
        "Content-Type": "application/json"
      })
    });
    return response.data;
  }

  async createTeamInvitation(teamId: string, invitation: CreateTeamInvitationDto): Promise<TeamInvitation> {
    const response = await httpClient.post<TeamInvitation>(`${this.baseUrl}/${teamId}/invitations`, invitation, {
      headers: new AxiosHeaders({
        "Content-Type": "application/json"
      })
    });
    return response.data;
  }

  async cancelTeamInvitation(teamId: string, invitationId: string): Promise<void> {
    await httpClient.delete(`${this.baseUrl}/${teamId}/invitations/${invitationId}`, {
      headers: new AxiosHeaders({
        "Content-Type": "application/json"
      })
    });
  }
}

export const teamService = TeamService.getInstance(); 