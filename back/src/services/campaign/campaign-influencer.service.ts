import supabase from '../../config/supabase';
import { createClient } from '@supabase/supabase-js';
import { CampaignInfluencer, CampaignInfluencerCreateDTO, CampaignInfluencerUpdateDTO } from '../../models/campaign/campaign-influencer.model';

export class CampaignInfluencerService {
  async createCampaignInfluencer(data: CampaignInfluencerCreateDTO): Promise<CampaignInfluencer> {
    const { data: campaignInfluencer, error } = await supabase
      .from('campaign_influencers')
      .insert([{
        ...data,
        created_at: new Date(),
        updated_at: new Date()
      }])
      .select()
      .single();

    if (error) throw error;
    return campaignInfluencer;
  }

  async getCampaignInfluencerById(id: string): Promise<CampaignInfluencer> {
    const { data: campaignInfluencer, error } = await supabase
      .from('campaign_influencers')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return campaignInfluencer;
  }

  async getCampaignInfluencersByCampaign(campaignId: string): Promise<CampaignInfluencer[]> {
    const { data: campaignInfluencers, error } = await supabase
      .from('campaign_influencers')
      .select('*')
      .eq('campaign_id', campaignId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return campaignInfluencers;
  }

  async getCampaignInfluencersWithDetailsById(campaignId: string, token?: string): Promise<any[]> {
    
    // Por ahora usar el cliente por defecto para diagnosticar el problema
    const client = supabase;

    // Primero verificar si hay registros en campaign_influencers para esta campaña
    const { data: campaignInfluencersBasic, error: basicError } = await client
      .from('campaign_influencers')
      .select('id, campaign_id, influencer_id, deleted_at')
      .eq('campaign_id', campaignId)
      .is('deleted_at', null);

   

    if (!campaignInfluencersBasic || campaignInfluencersBasic.length === 0) {
      return [];
    }

    // Verificar si existen los influencers referenciados (usando solo columnas que existen)
    const influencerIds = campaignInfluencersBasic.map(ci => ci.influencer_id);
    const { data: existingInfluencers, error: influencersError } = await client
      .from('influencers')
      .select('*')
      .in('id', influencerIds);

    // Get data without implicit relationship selects (avoid FK requirement)
    const { data: campaignInfluencers, error } = await client
      .from('campaign_influencers')
      .select('*')
      .eq('campaign_id', campaignId)
      .is('deleted_at', null)
      .order('created_at', { ascending: false });

  
    if (error) {
      console.error('❌ [SERVICE] Error getting campaign influencers:', error);
      throw error;
    }

    // Merge influencer details manually from existingInfluencers
    const influencerMap = new Map((existingInfluencers || []).map((inf: any) => [inf.id, inf]));
    const validCampaignInfluencers = (campaignInfluencers || [])
      .map(ci => ({
        ...ci,
        influencers: influencerMap.get(ci.influencer_id) || null
      }))
      .filter(ci => ci.influencers !== null);
    
    // Si no hay influencers válidos, mostrar información útil
    if (validCampaignInfluencers.length === 0 && campaignInfluencers && campaignInfluencers.length > 0) {
    }
    
    return validCampaignInfluencers;
  }

  async getCampaignInfluencersByInfluencer(influencerId: string): Promise<CampaignInfluencer[]> {
    const { data: campaignInfluencers, error } = await supabase
      .from('campaign_influencers')
      .select('*')
      .eq('influencer_id', influencerId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return campaignInfluencers;
  }

  async updateCampaignInfluencer(id: string, data: CampaignInfluencerUpdateDTO): Promise<CampaignInfluencer> {
    const { data: campaignInfluencer, error } = await supabase
      .from('campaign_influencers')
      .update({
        ...data,
        updated_at: new Date()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return campaignInfluencer;
  }

  async deleteCampaignInfluencer(id: string): Promise<void> {
    const { error } = await supabase
      .from('campaign_influencers')
      .update({
        deleted_at: new Date(),
        updated_at: new Date()
      })
      .eq('id', id);

    if (error) throw error;
  }

  async getCampaignInfluencersByStatus(status: CampaignInfluencer['status']): Promise<CampaignInfluencer[]> {
    const { data: campaignInfluencers, error } = await supabase
      .from('campaign_influencers')
      .select('*')
      .eq('status', status)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return campaignInfluencers;
  }

  async getCampaignInfluencersByPaymentStatus(paymentStatus: CampaignInfluencer['payment_status']): Promise<CampaignInfluencer[]> {
    const { data: campaignInfluencers, error } = await supabase
      .from('campaign_influencers')
      .select('*')
      .eq('payment_status', paymentStatus)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return campaignInfluencers;
  }

  async getActiveCampaignInfluencers(): Promise<CampaignInfluencer[]> {
    const { data: campaignInfluencers, error } = await supabase
      .from('campaign_influencers')
      .select('*')
      .in('status', ['pending', 'accepted'])
      .order('created_at', { ascending: false });

    if (error) throw error;
    return campaignInfluencers;
  }

  async getCampaignInfluencersByDateRange(startDate: Date, endDate: Date): Promise<CampaignInfluencer[]> {
    const { data: campaignInfluencers, error } = await supabase
      .from('campaign_influencers')
      .select('*')
      .gte('start_date', startDate)
      .lte('end_date', endDate)
      .order('start_date', { ascending: true });

    if (error) throw error;
    return campaignInfluencers;
  }

  /**
   * Verifica si un influencer ya está asignado a una campaña específica
   * @param campaignId ID de la campaña
   * @param influencerId ID del influencer
   * @returns true si ya está asignado, false en caso contrario
   */
  async isInfluencerAlreadyAssigned(campaignId: string, influencerId: string): Promise<boolean> {
    const { data, error } = await supabase
      .from('campaign_influencers')
      .select('id')
      .eq('campaign_id', campaignId)
      .eq('influencer_id', influencerId)
      .is('deleted_at', null);

    if (error) {
      console.error('❌ [SERVICE] Error verificando asignación:', error);
      throw error;
    }

    return data && data.length > 0;
  }

  /**
   * Verifica múltiples influencers de una vez
   * @param campaignId ID de la campaña
   * @param influencerIds Array de IDs de influencers
   * @returns Objeto con influencers ya asignados y no asignados
   */
  async checkMultipleInfluencerAssignments(campaignId: string, influencerIds: string[]): Promise<{
    alreadyAssigned: string[];
    notAssigned: string[];
  }> {
    const { data, error } = await supabase
      .from('campaign_influencers')
      .select('influencer_id')
      .eq('campaign_id', campaignId)
      .in('influencer_id', influencerIds)
      .is('deleted_at', null);

    if (error) {
      console.error('❌ [SERVICE] Error verificando múltiples asignaciones:', error);
      throw error;
    }

    const assignedIds = data?.map(ci => ci.influencer_id) || [];
    const notAssignedIds = influencerIds.filter(id => !assignedIds.includes(id));

    return {
      alreadyAssigned: assignedIds,
      notAssigned: notAssignedIds
    };
  }

  /**
   * Asigna un influencer a una campaña desde el Explorer, usando defaults para todos los campos requeridos.
   * @param campaign_id ID de la campaña
   * @param influencer_id ID del influencer
   * @param options Opcional: permite sobreescribir valores por defecto
   */
  async assignInfluencerFromExplorer(
    campaign_id: string,
    influencer_id: string,
    options?: Partial<CampaignInfluencerCreateDTO>
  ): Promise<any> {
    const payload = {
      campaign_id,
      influencer_id,
      status: 'pending',
      budget: 0,
      currency: '',
      deliverables: {},
      contract_details: {},
      notes: '',
      rating: null,
      performance_metrics: null,
      payment_status: 'pending',
      deleted_at: null
    };
    // Merge con opciones custom (solo si se proveen)
    if (options?.budget !== undefined) payload.budget = options.budget;
    if (options?.notes !== undefined) payload.notes = options.notes;
    if (options?.deliverables !== undefined) payload.deliverables = options.deliverables;
    if (options?.status !== undefined) payload.status = options.status;
    if (options?.payment_status !== undefined) payload.payment_status = options.payment_status;

    // Nueva verificación: evitar duplicados silenciosamente
    const { data: existing, error: existError } = await supabase
      .from('campaign_influencers')
      .select('*')
      .eq('campaign_id', campaign_id)
      .eq('influencer_id', influencer_id)
      .is('deleted_at', null);

    if (existError) {
      console.error('❌ [SERVICE] Error comprobando duplicados:', existError);
      throw existError;
    }

    if (existing && existing.length > 0) {
      // Ya existe: devolver el registro existente para que el flujo continúe sin error
      return existing[0];
    }

    // Insertar solo los campos válidos
    return this.createCampaignInfluencer(payload as any);
  }
} 