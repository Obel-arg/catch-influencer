import supabase from '../../config/supabase';
import { 
  Metric, 
  MetricCreateDTO, 
  MetricUpdateDTO,
  MetricSummary,
  CampaignMetrics,
  MetricType,
  MetricPeriod
} from '../../models/metrics/metrics.model';

export class MetricsService {
  async createMetric(data: MetricCreateDTO): Promise<Metric> {
    const { data: metric, error } = await supabase
      .from('metrics')
      .insert([{
        ...data,
        created_at: new Date(),
        updated_at: new Date()
      }])
      .select()
      .single();

    if (error) throw error;
    return metric;
  }

  async getMetricById(id: string): Promise<Metric> {
    const { data: metric, error } = await supabase
      .from('metrics')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return metric;
  }

  async getMetricsByCampaign(campaignId: string): Promise<Metric[]> {
    const { data: metrics, error } = await supabase
      .from('metrics')
      .select('*')
      .eq('campaign_id', campaignId)
      .order('date', { ascending: false });

    if (error) throw error;
    return metrics;
  }

  async getMetricsByContent(contentId: string): Promise<Metric[]> {
    const { data: metrics, error } = await supabase
      .from('metrics')
      .select('*')
      .eq('content_id', contentId)
      .order('date', { ascending: false });

    if (error) throw error;
    return metrics;
  }

  async getMetricsByInfluencer(influencerId: string): Promise<Metric[]> {
    const { data: metrics, error } = await supabase
      .from('metrics')
      .select('*')
      .eq('influencer_id', influencerId)
      .order('date', { ascending: false });

    if (error) throw error;
    return metrics;
  }

  async updateMetric(id: string, data: MetricUpdateDTO): Promise<Metric> {
    const { data: metric, error } = await supabase
      .from('metrics')
      .update({
        ...data,
        updated_at: new Date()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return metric;
  }

  async deleteMetric(id: string): Promise<void> {
    const { error } = await supabase
      .from('metrics')
      .update({
        deleted_at: new Date(),
        updated_at: new Date()
      })
      .eq('id', id);

    if (error) throw error;
  }

  async getMetricsByType(type: MetricType): Promise<Metric[]> {
    const { data: metrics, error } = await supabase
      .from('metrics')
      .select('*')
      .eq('type', type)
      .order('date', { ascending: false });

    if (error) throw error;
    return metrics;
  }

  async getMetricsByPeriod(period: MetricPeriod): Promise<Metric[]> {
    const { data: metrics, error } = await supabase
      .from('metrics')
      .select('*')
      .eq('period', period)
      .order('date', { ascending: false });

    if (error) throw error;
    return metrics;
  }

  async getMetricsByDateRange(startDate: Date, endDate: Date): Promise<Metric[]> {
    const { data: metrics, error } = await supabase
      .from('metrics')
      .select('*')
      .gte('date', startDate)
      .lte('date', endDate)
      .order('date', { ascending: true });

    if (error) throw error;
    return metrics;
  }

  async calculateMetricSummary(metrics: Metric[]): Promise<MetricSummary> {
    const summary: MetricSummary = {
      total_value: 0,
      average_value: 0,
      min_value: Infinity,
      max_value: -Infinity,
      trend: [],
      breakdown: {}
    };

    metrics.forEach(metric => {
      // Valores básicos
      summary.total_value += metric.value;
      summary.min_value = Math.min(summary.min_value, metric.value);
      summary.max_value = Math.max(summary.max_value, metric.value);

      // Tendencia
      summary.trend.push({
        date: new Date(metric.date),
        value: metric.value
      });

      // Desglose por metadata si existe
      if (metric.metadata?.breakdown) {
        Object.entries(metric.metadata.breakdown).forEach(([key, value]) => {
          if (!summary.breakdown![key]) {
            summary.breakdown![key] = {
              total: 0,
              average: 0,
              percentage: 0
            };
          }
          summary.breakdown![key].total += value;
        });
      }
    });

    // Calcular promedios y porcentajes
    const count = metrics.length;
    summary.average_value = summary.total_value / count;

    if (summary.breakdown) {
      Object.keys(summary.breakdown).forEach(key => {
        summary.breakdown![key].average = summary.breakdown![key].total / count;
        summary.breakdown![key].percentage = (summary.breakdown![key].total / summary.total_value) * 100;
      });
    }

    // Ordenar tendencia por fecha
    summary.trend.sort((a, b) => a.date.getTime() - b.date.getTime());

    return summary;
  }

  async calculateCampaignMetrics(campaignId: string): Promise<CampaignMetrics> {
    const { data: metrics, error } = await supabase
      .from('metrics')
      .select('*')
      .eq('campaign_id', campaignId)
      .order('date', { ascending: true });

    if (error) throw error;

    // Asegurarnos de que metrics es del tipo correcto
    const typedMetrics = metrics as Metric[];

    const campaignMetrics: CampaignMetrics = {
      campaign_id: campaignId,
      metrics: {},
      overall_performance: {
        total_reach: 0,
        total_engagement: 0,
        average_engagement_rate: 0,
        total_conversions: 0,
        total_cost: 0,
        roi: 0
      },
      influencer_performance: {},
      content_performance: {},
      period_comparison: {
        current: {
          start_date: new Date(),
          end_date: new Date(),
          metrics: {}
        },
        previous: {
          start_date: new Date(),
          end_date: new Date(),
          metrics: {}
        },
        change_percentage: {}
      }
    };

    // Agrupar métricas por tipo
    const metricsByType = typedMetrics.reduce((acc, metric) => {
      const type = metric.type;
      if (!acc[type]) {
        acc[type] = [];
      }
      const metricsArray = acc[type];
      if (metricsArray) {
        metricsArray.push(metric);
      }
      return acc;
    }, {} as { [key in MetricType]?: Metric[] });

    // Calcular resumen para cada tipo de métrica
    for (const [type, typeMetrics] of Object.entries(metricsByType)) {
      campaignMetrics.metrics[type as MetricType] = await this.calculateMetricSummary(typeMetrics);
    }

    // Calcular métricas generales
    typedMetrics.forEach(metric => {
      if (metric.type === 'reach') {
        campaignMetrics.overall_performance.total_reach += metric.value;
      } else if (metric.type === 'engagement_rate') {
        campaignMetrics.overall_performance.total_engagement += metric.value;
      } else if (metric.type === 'conversion_rate') {
        campaignMetrics.overall_performance.total_conversions += metric.value;
      }
    });

    // Calcular ROI
    const costMetrics = typedMetrics.filter(m => m.type === 'cost_per_engagement' || m.type === 'cost_per_click');
    campaignMetrics.overall_performance.total_cost = costMetrics.reduce((sum, m) => sum + m.value, 0);
    campaignMetrics.overall_performance.roi = campaignMetrics.overall_performance.total_conversions / campaignMetrics.overall_performance.total_cost;

    // Calcular métricas por influencer
    const influencerMetrics = typedMetrics.filter(m => m.influencer_id);
    influencerMetrics.forEach(metric => {
      const influencerId = metric.influencer_id!;
      if (!campaignMetrics.influencer_performance[influencerId]) {
        campaignMetrics.influencer_performance[influencerId] = {
          total_reach: 0,
          total_engagement: 0,
          engagement_rate: 0,
          total_conversions: 0,
          cost_performance: 0
        };
      }

      if (metric.type === 'reach') {
        campaignMetrics.influencer_performance[influencerId].total_reach += metric.value;
      } else if (metric.type === 'engagement_rate') {
        campaignMetrics.influencer_performance[influencerId].total_engagement += metric.value;
        campaignMetrics.influencer_performance[influencerId].engagement_rate = 
          campaignMetrics.influencer_performance[influencerId].total_reach > 0
            ? campaignMetrics.influencer_performance[influencerId].total_engagement / 
              campaignMetrics.influencer_performance[influencerId].total_reach
            : 0;
      } else if (metric.type === 'conversion_rate') {
        campaignMetrics.influencer_performance[influencerId].total_conversions += metric.value;
      }
    });

    // Calcular métricas por contenido
    const contentMetrics = typedMetrics.filter(m => m.content_id);
    contentMetrics.forEach(metric => {
      const contentId = metric.content_id!;
      if (!campaignMetrics.content_performance[contentId]) {
        campaignMetrics.content_performance[contentId] = {
          reach: 0,
          engagement: 0,
          engagement_rate: 0,
          conversions: 0,
          cost_performance: 0
        };
      }

      if (metric.type === 'reach') {
        campaignMetrics.content_performance[contentId].reach += metric.value;
      } else if (metric.type === 'engagement_rate') {
        campaignMetrics.content_performance[contentId].engagement += metric.value;
        campaignMetrics.content_performance[contentId].engagement_rate = 
          campaignMetrics.content_performance[contentId].reach > 0
            ? campaignMetrics.content_performance[contentId].engagement / 
              campaignMetrics.content_performance[contentId].reach
            : 0;
      } else if (metric.type === 'conversion_rate') {
        campaignMetrics.content_performance[contentId].conversions += metric.value;
      }
    });

    return campaignMetrics;
  }
} 