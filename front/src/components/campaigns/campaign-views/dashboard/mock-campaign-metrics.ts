import { Campaign } from "@/types/campaign";

export interface CampaignMetric {
  id: string;
  campaign_id: string;
  influencer_id: string;
  platform: string;
  metric_type: string;
  value: number;
  date: string;
  reach: number;
  engagement: number;
  clicks: number;
  conversions: number;
  revenue: number;
  cost: number;
  metrics: any;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface MetricEvolution {
  date: string;
  reach: number;
  engagement: number;
  clicks: number;
  conversions: number;
  revenue: number;
  cost: number;
}

// Datos mockeados consistentes para campaign_metrics
const mockCampaignMetrics: CampaignMetric[] = [
  {
    id: "cm-001",
    campaign_id: "campaign-1",
    influencer_id: "inf-001",
    platform: "instagram",
    metric_type: "reach",
    value: 125000,
    date: "2024-01-15",
    reach: 125000,
    engagement: 8500,
    clicks: 1200,
    conversions: 45,
    revenue: 2250.00,
    cost: 500.00,
    metrics: {
      impressions: 150000,
      shares: 320,
      saves: 180
    },
    created_at: "2024-01-15T10:00:00Z",
    updated_at: "2024-01-15T10:00:00Z",
    deleted_at: null
  },
  {
    id: "cm-002",
    campaign_id: "campaign-1",
    influencer_id: "inf-001",
    platform: "instagram",
    metric_type: "engagement",
    value: 8.5,
    date: "2024-01-15",
    reach: 125000,
    engagement: 8500,
    clicks: 1200,
    conversions: 45,
    revenue: 2250.00,
    cost: 500.00,
    metrics: {
      impressions: 150000,
      shares: 320,
      saves: 180
    },
    created_at: "2024-01-15T10:00:00Z",
    updated_at: "2024-01-15T10:00:00Z",
    deleted_at: null
  },
  {
    id: "cm-003",
    campaign_id: "campaign-1",
    influencer_id: "inf-002",
    platform: "tiktok",
    metric_type: "reach",
    value: 180000,
    date: "2024-01-16",
    reach: 180000,
    engagement: 12600,
    clicks: 2100,
    conversions: 78,
    revenue: 3900.00,
    cost: 750.00,
    metrics: {
      impressions: 220000,
      shares: 890,
      saves: 450
    },
    created_at: "2024-01-16T10:00:00Z",
    updated_at: "2024-01-16T10:00:00Z",
    deleted_at: null
  },
  {
    id: "cm-004",
    campaign_id: "campaign-1",
    influencer_id: "inf-002",
    platform: "tiktok",
    metric_type: "engagement",
    value: 7.0,
    date: "2024-01-16",
    reach: 180000,
    engagement: 12600,
    clicks: 2100,
    conversions: 78,
    revenue: 3900.00,
    cost: 750.00,
    metrics: {
      impressions: 220000,
      shares: 890,
      saves: 450
    },
    created_at: "2024-01-16T10:00:00Z",
    updated_at: "2024-01-16T10:00:00Z",
    deleted_at: null
  },
  {
    id: "cm-005",
    campaign_id: "campaign-1",
    influencer_id: "inf-003",
    platform: "youtube",
    metric_type: "reach",
    value: 95000,
    date: "2024-01-17",
    reach: 95000,
    engagement: 6650,
    clicks: 950,
    conversions: 32,
    revenue: 1600.00,
    cost: 400.00,
    metrics: {
      impressions: 110000,
      shares: 180,
      saves: 120
    },
    created_at: "2024-01-17T10:00:00Z",
    updated_at: "2024-01-17T10:00:00Z",
    deleted_at: null
  },
  {
    id: "cm-006",
    campaign_id: "campaign-1",
    influencer_id: "inf-003",
    platform: "youtube",
    metric_type: "engagement",
    value: 7.0,
    date: "2024-01-17",
    reach: 95000,
    engagement: 6650,
    clicks: 950,
    conversions: 32,
    revenue: 1600.00,
    cost: 400.00,
    metrics: {
      impressions: 110000,
      shares: 180,
      saves: 120
    },
    created_at: "2024-01-17T10:00:00Z",
    updated_at: "2024-01-17T10:00:00Z",
    deleted_at: null
  },
  {
    id: "cm-007",
    campaign_id: "campaign-1",
    influencer_id: "inf-001",
    platform: "instagram",
    metric_type: "reach",
    value: 135000,
    date: "2024-01-18",
    reach: 135000,
    engagement: 9450,
    clicks: 1350,
    conversions: 52,
    revenue: 2600.00,
    cost: 550.00,
    metrics: {
      impressions: 160000,
      shares: 380,
      saves: 200
    },
    created_at: "2024-01-18T10:00:00Z",
    updated_at: "2024-01-18T10:00:00Z",
    deleted_at: null
  },
  {
    id: "cm-008",
    campaign_id: "campaign-1",
    influencer_id: "inf-001",
    platform: "instagram",
    metric_type: "engagement",
    value: 7.0,
    date: "2024-01-18",
    reach: 135000,
    engagement: 9450,
    clicks: 1350,
    conversions: 52,
    revenue: 2600.00,
    cost: 550.00,
    metrics: {
      impressions: 160000,
      shares: 380,
      saves: 200
    },
    created_at: "2024-01-18T10:00:00Z",
    updated_at: "2024-01-18T10:00:00Z",
    deleted_at: null
  },
  {
    id: "cm-009",
    campaign_id: "campaign-1",
    influencer_id: "inf-002",
    platform: "tiktok",
    metric_type: "reach",
    value: 195000,
    date: "2024-01-19",
    reach: 195000,
    engagement: 13650,
    clicks: 2300,
    conversions: 85,
    revenue: 4250.00,
    cost: 800.00,
    metrics: {
      impressions: 240000,
      shares: 950,
      saves: 480
    },
    created_at: "2024-01-19T10:00:00Z",
    updated_at: "2024-01-19T10:00:00Z",
    deleted_at: null
  },
  {
    id: "cm-010",
    campaign_id: "campaign-1",
    influencer_id: "inf-002",
    platform: "tiktok",
    metric_type: "engagement",
    value: 7.0,
    date: "2024-01-19",
    reach: 195000,
    engagement: 13650,
    clicks: 2300,
    conversions: 85,
    revenue: 4250.00,
    cost: 800.00,
    metrics: {
      impressions: 240000,
      shares: 950,
      saves: 480
    },
    created_at: "2024-01-19T10:00:00Z",
    updated_at: "2024-01-19T10:00:00Z",
    deleted_at: null
  },
  {
    id: "cm-011",
    campaign_id: "campaign-1",
    influencer_id: "inf-003",
    platform: "youtube",
    metric_type: "reach",
    value: 105000,
    date: "2024-01-20",
    reach: 105000,
    engagement: 7350,
    clicks: 1100,
    conversions: 38,
    revenue: 1900.00,
    cost: 450.00,
    metrics: {
      impressions: 125000,
      shares: 220,
      saves: 140
    },
    created_at: "2024-01-20T10:00:00Z",
    updated_at: "2024-01-20T10:00:00Z",
    deleted_at: null
  },
  {
    id: "cm-012",
    campaign_id: "campaign-1",
    influencer_id: "inf-003",
    platform: "youtube",
    metric_type: "engagement",
    value: 7.0,
    date: "2024-01-20",
    reach: 105000,
    engagement: 7350,
    clicks: 1100,
    conversions: 38,
    revenue: 1900.00,
    cost: 450.00,
    metrics: {
      impressions: 125000,
      shares: 220,
      saves: 140
    },
    created_at: "2024-01-20T10:00:00Z",
    updated_at: "2024-01-20T10:00:00Z",
    deleted_at: null
  },
  {
    id: "cm-013",
    campaign_id: "campaign-1",
    influencer_id: "inf-001",
    platform: "instagram",
    metric_type: "reach",
    value: 145000,
    date: "2024-01-21",
    reach: 145000,
    engagement: 10150,
    clicks: 1500,
    conversions: 58,
    revenue: 2900.00,
    cost: 600.00,
    metrics: {
      impressions: 170000,
      shares: 420,
      saves: 220
    },
    created_at: "2024-01-21T10:00:00Z",
    updated_at: "2024-01-21T10:00:00Z",
    deleted_at: null
  },
  {
    id: "cm-014",
    campaign_id: "campaign-1",
    influencer_id: "inf-001",
    platform: "instagram",
    metric_type: "engagement",
    value: 7.0,
    date: "2024-01-21",
    reach: 145000,
    engagement: 10150,
    clicks: 1500,
    conversions: 58,
    revenue: 2900.00,
    cost: 600.00,
    metrics: {
      impressions: 170000,
      shares: 420,
      saves: 220
    },
    created_at: "2024-01-21T10:00:00Z",
    updated_at: "2024-01-21T10:00:00Z",
    deleted_at: null
  },
  {
    id: "cm-015",
    campaign_id: "campaign-1",
    influencer_id: "inf-002",
    platform: "tiktok",
    metric_type: "reach",
    value: 210000,
    date: "2024-01-22",
    reach: 210000,
    engagement: 14700,
    clicks: 2500,
    conversions: 92,
    revenue: 4600.00,
    cost: 850.00,
    metrics: {
      impressions: 260000,
      shares: 1020,
      saves: 520
    },
    created_at: "2024-01-22T10:00:00Z",
    updated_at: "2024-01-22T10:00:00Z",
    deleted_at: null
  },
  {
    id: "cm-016",
    campaign_id: "campaign-1",
    influencer_id: "inf-002",
    platform: "tiktok",
    metric_type: "engagement",
    value: 7.0,
    date: "2024-01-22",
    reach: 210000,
    engagement: 14700,
    clicks: 2500,
    conversions: 92,
    revenue: 4600.00,
    cost: 850.00,
    metrics: {
      impressions: 260000,
      shares: 1020,
      saves: 520
    },
    created_at: "2024-01-22T10:00:00Z",
    updated_at: "2024-01-22T10:00:00Z",
    deleted_at: null
  }
];

// Función para obtener datos de evolución por campaña
export const getEvolutionData = (campaign: Campaign): MetricEvolution[] => {
  // Para todas las campañas, usar los mismos datos mockeados
  // Esto asegura que siempre tengamos datos consistentes
  
  const evolutionData: MetricEvolution[] = [
    {
      date: "2024-01-14",
      reach: 110000,
      engagement: 8.7,
      clicks: 1000,
      conversions: 40,
      revenue: 2000.00,
      cost: 450.00
    },
    {
      date: "2024-01-15",
      reach: 125000,
      engagement: 8.5,
      clicks: 1200,
      conversions: 45,
      revenue: 2250.00,
      cost: 500.00
    },
    {
      date: "2024-01-16",
      reach: 180000,
      engagement: 6.9,
      clicks: 2100,
      conversions: 78,
      revenue: 3900.00,
      cost: 750.00
    },
    {
      date: "2024-01-17",
      reach: 95000,
      engagement: 7.2,
      clicks: 950,
      conversions: 32,
      revenue: 1600.00,
      cost: 400.00
    },
    {
      date: "2024-01-18",
      reach: 135000,
      engagement: 6.8,
      clicks: 1350,
      conversions: 52,
      revenue: 2600.00,
      cost: 550.00
    },
    {
      date: "2024-01-19",
      reach: 195000,
      engagement: 7.5,
      clicks: 2300,
      conversions: 85,
      revenue: 4250.00,
      cost: 800.00
    },
    {
      date: "2024-01-20",
      reach: 105000,
      engagement: 7.1,
      clicks: 1100,
      conversions: 38,
      revenue: 1900.00,
      cost: 450.00
    },
    {
      date: "2024-01-21",
      reach: 145000,
      engagement: 7.8,
      clicks: 1500,
      conversions: 58,
      revenue: 2900.00,
      cost: 600.00
    }
  ];

  return evolutionData;
};

// Función para obtener métricas por plataforma
export const getMetricsByPlatform = (campaign: Campaign) => {
  // Para todas las campañas, usar los mismos datos mockeados
  return [
    {
      platform: "instagram",
      totalReach: 405000,
      totalEngagement: 28100,
      totalClicks: 4050,
      totalConversions: 155,
      totalRevenue: 7750.00,
      totalCost: 1650.00,
      posts: 3,
      avgEngagement: 7.0,
      avgReach: 135000,
      roi: 370
    },
    {
      platform: "tiktok",
      totalReach: 585000,
      totalEngagement: 40950,
      totalClicks: 6900,
      totalConversions: 255,
      totalRevenue: 12750.00,
      totalCost: 2400.00,
      posts: 3,
      avgEngagement: 7.0,
      avgReach: 195000,
      roi: 431
    },
    {
      platform: "youtube",
      totalReach: 200000,
      totalEngagement: 14000,
      totalClicks: 2050,
      totalConversions: 70,
      totalRevenue: 3500.00,
      totalCost: 850.00,
      posts: 2,
      avgEngagement: 7.0,
      avgReach: 100000,
      roi: 312
    }
  ];
};

// Función para obtener métricas por influencer
export const getMetricsByInfluencer = (campaign: Campaign) => {
  // Para todas las campañas, usar los mismos datos mockeados
  return [
    {
      influencerId: "inf-001",
      totalReach: 405000,
      totalEngagement: 28100,
      totalClicks: 4050,
      totalConversions: 155,
      totalRevenue: 7750.00,
      totalCost: 1650.00,
      posts: 3,
      platforms: ["instagram"],
      avgEngagement: 7.0,
      avgReach: 135000,
      roi: 370
    },
    {
      influencerId: "inf-002",
      totalReach: 585000,
      totalEngagement: 40950,
      totalClicks: 6900,
      totalConversions: 255,
      totalRevenue: 12750.00,
      totalCost: 2400.00,
      posts: 3,
      platforms: ["tiktok"],
      avgEngagement: 7.0,
      avgReach: 195000,
      roi: 431
    },
    {
      influencerId: "inf-003",
      totalReach: 200000,
      totalEngagement: 14000,
      totalClicks: 2050,
      totalConversions: 70,
      totalRevenue: 3500.00,
      totalCost: 850.00,
      posts: 2,
      platforms: ["youtube"],
      avgEngagement: 7.0,
      avgReach: 100000,
      roi: 312
    }
  ];
};

// Exportar datos mockeados para uso directo
export { mockCampaignMetrics }; 