import { createClient } from '@supabase/supabase-js';
import { config } from '../../config/environment';
import { Team, TeamCreateDTO, TeamUpdateDTO, TeamMember, TeamMemberCreateDTO, TeamMemberUpdateDTO } from '../../models/team/team.model';

const supabase = createClient(
  config.supabase.url || '',
  config.supabase.anonKey || ''
);

export class TeamService {
  async createTeam(data: TeamCreateDTO, userId: string): Promise<Team> {
    const teamData = {
      ...data,
      created_by: userId,
      status: 'active',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const { data: team, error } = await supabase
      .from('teams')
      .insert([teamData])
      .select()
      .single();

    if (error) throw error;

    // Agregar al creador como admin del equipo
    await this.addMember({
      team_id: team.id,
      user_id: userId,
      role: 'admin'
    });

    return team;
  }

  async getTeamById(id: string): Promise<Team | null> {
    const { data, error } = await supabase
      .from('teams')
      .select()
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  }

  async getTeamsByOrganization(organizationId: string): Promise<Team[]> {
    const { data, error } = await supabase
      .from('teams')
      .select()
      .eq('organization_id', organizationId)
      .eq('status', 'active');

    if (error) throw error;
    return data || [];
  }

  async updateTeam(id: string, data: TeamUpdateDTO): Promise<Team> {
    const updateData = {
      ...data,
      updated_at: new Date().toISOString()
    };

    const { data: team, error } = await supabase
      .from('teams')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return team;
  }

  async deleteTeam(id: string): Promise<void> {
    const { error } = await supabase
      .from('teams')
      .update({ 
        status: 'archived',
        deleted_at: new Date().toISOString()
      })
      .eq('id', id);

    if (error) throw error;
  }

  async getTeamMembers(teamId: string): Promise<TeamMember[]> {
    const { data, error } = await supabase
      .from('team_members')
      .select(`
        *,
        user_profiles (
          id,
          email,
          full_name,
          avatar_url
        )
      `)
      .eq('team_id', teamId)
      .eq('status', 'active');

    if (error) throw error;
    return data || [];
  }

  async addMember(data: TeamMemberCreateDTO): Promise<TeamMember> {
    const memberData = {
      ...data,
      status: 'active',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const { data: member, error } = await supabase
      .from('team_members')
      .insert([memberData])
      .select()
      .single();

    if (error) throw error;
    return member;
  }

  async updateMember(teamId: string, userId: string, data: TeamMemberUpdateDTO): Promise<TeamMember> {
    const updateData = {
      ...data,
      updated_at: new Date().toISOString()
    };

    const { data: member, error } = await supabase
      .from('team_members')
      .update(updateData)
      .eq('team_id', teamId)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw error;
    return member;
  }

  async removeMember(teamId: string, userId: string): Promise<void> {
    const { error } = await supabase
      .from('team_members')
      .update({ 
        status: 'inactive',
        updated_at: new Date().toISOString()
      })
      .eq('team_id', teamId)
      .eq('user_id', userId);

    if (error) throw error;
  }

  async getTeamInfluencers(teamId: string): Promise<any[]> {
    const { data, error } = await supabase
      .from('team_influencers')
      .select(`
        *,
        influencers (
          id,
          name,
          username,
          platform,
          followers_count,
          engagement_rate
        )
      `)
      .eq('team_id', teamId)
      .eq('status', 'active');

    if (error) throw error;
    return data || [];
  }

  async getTeamCampaigns(teamId: string): Promise<any[]> {
    const { data, error } = await supabase
      .from('team_campaigns')
      .select(`
        *,
        campaigns (
          id,
          name,
          status,
          start_date,
          end_date
        )
      `)
      .eq('team_id', teamId)
      .eq('status', 'active');

    if (error) throw error;
    return data || [];
  }
} 