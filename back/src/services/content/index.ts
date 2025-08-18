import supabase from '../../config/supabase';
import { Content, ContentCreateDTO, ContentUpdateDTO, ContentMetrics, ContentMetricsCreateDTO, ContentMetricsUpdateDTO } from '../../models/content/content.model';

export class ContentService {
  async createContent(data: ContentCreateDTO): Promise<Content> {
    const { data: content, error } = await supabase
      .from('content')
      .insert([{
        ...data,
        created_at: new Date(),
        updated_at: new Date()
      }])
      .select()
      .single();

    if (error) throw error;
    return content;
  }

  async getContentById(id: string): Promise<Content> {
    const { data: content, error } = await supabase
      .from('content')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return content;
  }

  async getContentByCampaign(campaignId: string): Promise<Content[]> {
    const { data: content, error } = await supabase
      .from('content')
      .select('*')
      .eq('campaign_id', campaignId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return content;
  }

  async getContentByInfluencer(influencerId: string): Promise<Content[]> {
    const { data: content, error } = await supabase
      .from('content')
      .select('*')
      .eq('influencer_id', influencerId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return content;
  }

  async updateContent(id: string, data: ContentUpdateDTO): Promise<Content> {
    const { data: content, error } = await supabase
      .from('content')
      .update({
        ...data,
        updated_at: new Date()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return content;
  }

  async deleteContent(id: string): Promise<void> {
    const { error } = await supabase
      .from('content')
      .update({
        status: 'deleted',
        deleted_at: new Date(),
        updated_at: new Date()
      })
      .eq('id', id);

    if (error) throw error;
  }

  // Métricas
  async createContentMetrics(data: ContentMetricsCreateDTO): Promise<ContentMetrics> {
    const { data: metrics, error } = await supabase
      .from('content_metrics')
      .insert([{
        ...data,
        created_at: new Date()
      }])
      .select()
      .single();

    if (error) throw error;
    return metrics;
  }

  async getContentMetrics(contentId: string): Promise<ContentMetrics[]> {
    const { data: metrics, error } = await supabase
      .from('content_metrics')
      .select('*')
      .eq('content_id', contentId)
      .order('date', { ascending: false });

    if (error) throw error;
    return metrics;
  }

  async updateContentMetrics(id: string, data: ContentMetricsUpdateDTO): Promise<ContentMetrics> {
    const { data: metrics, error } = await supabase
      .from('content_metrics')
      .update(data)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return metrics;
  }

  async getContentByStatus(status: Content['status']): Promise<Content[]> {
    const { data: content, error } = await supabase
      .from('content')
      .select('*')
      .eq('status', status)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return content;
  }

  async getContentByPlatform(platform: Content['platform']): Promise<Content[]> {
    const { data: content, error } = await supabase
      .from('content')
      .select('*')
      .eq('platform', platform)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return content;
  }

  async getContentByType(type: Content['type']): Promise<Content[]> {
    const { data: content, error } = await supabase
      .from('content')
      .select('*')
      .eq('type', type)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return content;
  }

  async getScheduledContent(): Promise<Content[]> {
    const { data: content, error } = await supabase
      .from('content')
      .select('*')
      .eq('status', 'scheduled')
      .gte('scheduled_date', new Date())
      .order('scheduled_date', { ascending: true });

    if (error) throw error;
    return content;
  }

  async getContentMetricsByDateRange(contentId: string, startDate: Date, endDate: Date): Promise<ContentMetrics[]> {
    const { data: metrics, error } = await supabase
      .from('content_metrics')
      .select('*')
      .eq('content_id', contentId)
      .gte('date', startDate)
      .lte('date', endDate)
      .order('date', { ascending: true });

    if (error) throw error;
    return metrics;
  }
} 