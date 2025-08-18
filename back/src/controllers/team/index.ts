import { Request, Response } from 'express';
import { TeamService } from '../../services/team';
import { TeamCreateDTO, TeamUpdateDTO, TeamMemberCreateDTO, TeamMemberUpdateDTO } from '../../models/team/team.model';

export class TeamController {
  private teamService: TeamService;

  constructor() {
    this.teamService = new TeamService();
  }

  async createTeam(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'No autorizado' });
      }

      const teamData: TeamCreateDTO = req.body;
      const team = await this.teamService.createTeam(teamData, userId);
      res.status(201).json(team);
    } catch (error) {
      console.error('Error al crear equipo:', error);
      res.status(500).json({ error: 'Error al crear equipo' });
    }
  }

  async getTeamById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const team = await this.teamService.getTeamById(id);
      
      if (!team) {
        return res.status(404).json({ error: 'Equipo no encontrado' });
      }

      res.json(team);
    } catch (error) {
      console.error('Error al obtener equipo:', error);
      res.status(500).json({ error: 'Error al obtener equipo' });
    }
  }

  async getTeamsByOrganization(req: Request, res: Response) {
    try {
      const { organizationId } = req.params;
      const teams = await this.teamService.getTeamsByOrganization(organizationId);
      res.json(teams);
    } catch (error) {
      console.error('Error al obtener equipos:', error);
      res.status(500).json({ error: 'Error al obtener equipos' });
    }
  }

  async updateTeam(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const updateData: TeamUpdateDTO = req.body;
      const team = await this.teamService.updateTeam(id, updateData);
      res.json(team);
    } catch (error) {
      console.error('Error al actualizar equipo:', error);
      res.status(500).json({ error: 'Error al actualizar equipo' });
    }
  }

  async deleteTeam(req: Request, res: Response) {
    try {
      const { id } = req.params;
      await this.teamService.deleteTeam(id);
      res.status(204).send();
    } catch (error) {
      console.error('Error al eliminar equipo:', error);
      res.status(500).json({ error: 'Error al eliminar equipo' });
    }
  }

  async getTeamMembers(req: Request, res: Response) {
    try {
      const { teamId } = req.params;
      const members = await this.teamService.getTeamMembers(teamId);
      res.json(members);
    } catch (error) {
      console.error('Error al obtener miembros:', error);
      res.status(500).json({ error: 'Error al obtener miembros' });
    }
  }

  async addMember(req: Request, res: Response) {
    try {
      const { teamId } = req.params;
      const memberData: TeamMemberCreateDTO = {
        ...req.body,
        team_id: teamId
      };
      const member = await this.teamService.addMember(memberData);
      res.status(201).json(member);
    } catch (error) {
      console.error('Error al agregar miembro:', error);
      res.status(500).json({ error: 'Error al agregar miembro' });
    }
  }

  async updateMember(req: Request, res: Response) {
    try {
      const { teamId, userId } = req.params;
      const updateData: TeamMemberUpdateDTO = req.body;
      const member = await this.teamService.updateMember(teamId, userId, updateData);
      res.json(member);
    } catch (error) {
      console.error('Error al actualizar miembro:', error);
      res.status(500).json({ error: 'Error al actualizar miembro' });
    }
  }

  async removeMember(req: Request, res: Response) {
    try {
      const { teamId, userId } = req.params;
      await this.teamService.removeMember(teamId, userId);
      res.status(204).send();
    } catch (error) {
      console.error('Error al eliminar miembro:', error);
      res.status(500).json({ error: 'Error al eliminar miembro' });
    }
  }

  async getTeamInfluencers(req: Request, res: Response) {
    try {
      const { teamId } = req.params;
      const influencers = await this.teamService.getTeamInfluencers(teamId);
      res.json(influencers);
    } catch (error) {
      console.error('Error al obtener influencers:', error);
      res.status(500).json({ error: 'Error al obtener influencers' });
    }
  }

  async getTeamCampaigns(req: Request, res: Response) {
    try {
      const { teamId } = req.params;
      const campaigns = await this.teamService.getTeamCampaigns(teamId);
      res.json(campaigns);
    } catch (error) {
      console.error('Error al obtener campañas:', error);
      res.status(500).json({ error: 'Error al obtener campañas' });
    }
  }
} 