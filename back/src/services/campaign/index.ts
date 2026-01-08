import { createClient } from "@supabase/supabase-js";
import {
  Campaign,
  CampaignCreateDTO,
  CampaignUpdateDTO,
  CampaignInfluencer,
  CampaignInfluencerCreateDTO,
  CampaignInfluencerUpdateDTO,
  CampaignContent,
  CampaignContentCreateDTO,
  CampaignContentUpdateDTO,
} from "../../models/campaign/campaign.model";
import config from "../../config/environment";
import { UserBrandService } from "../user/user-brand.service";

// Usar el cliente admin para evitar restricciones RLS
const supabase = createClient(
  config.supabase.url || "",
  config.supabase.serviceKey || config.supabase.anonKey || "",
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

export class CampaignService {
  private userBrandService: UserBrandService;

  constructor() {
    this.userBrandService = new UserBrandService();
  }

  async createCampaign(
    data: CampaignCreateDTO,
    userId: string,
    token?: string
  ): Promise<Campaign> {
    // Crear un cliente autenticado con el token del usuario
    let client = supabase;
    if (token) {
      client = createClient(
        config.supabase.url || "",
        config.supabase.anonKey || ""
      );
      // Establecer el token de autorización
      await client.auth.setSession({
        access_token: token,
        refresh_token: "",
      } as any);
    }

    const { data: campaign, error } = await client
      .from("campaigns")
      .insert([
        {
          ...data,
          created_by: userId,
          created_at: new Date(),
          updated_at: new Date(),
        },
      ])
      .select()
      .single();

    if (error) {
      console.error("Error creating campaign:", error);
      throw error;
    }
    return campaign;
  }

  async getCampaignById(id: string): Promise<Campaign> {
    const { data: campaign, error } = await supabase
      .from("campaigns")
      .select("*")
      .eq("id", id)
      .single();

    if (error) throw error;
    return campaign;
  }

  async getCampaignsByOrganization(
    organizationId: string
  ): Promise<Campaign[]> {
    const { data: campaigns, error } = await supabase
      .from("campaigns")
      .select("*")
      .eq("organization_id", organizationId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return campaigns;
  }

  async getMyCampaigns(userId: string): Promise<Campaign[]> {
    // Primero obtenemos las organizaciones del usuario
    const { data: userOrgs, error: orgError } = await supabase
      .from("organization_members")
      .select("organization_id, role")
      .eq("user_id", userId);

    if (orgError) throw orgError;

    if (!userOrgs || userOrgs.length === 0) {
      return [];
    }

    const orgIds = userOrgs.map((org) => org.organization_id);

    // Obtener todas las campañas de todas las organizaciones del usuario
    const { data: campaigns, error: campaignsError } = await supabase
      .from("campaigns")
      .select("*")
      .in("organization_id", orgIds)
      .is("deleted_at", null)
      .order("created_at", { ascending: false });

    if (campaignsError) throw campaignsError;

    if (!campaigns || campaigns.length === 0) {
      return [];
    }

    // 🔐 ACCESS CONTROL
    // All users (admin, member, viewer) can see all campaigns in their organizations
    // No brand-based filtering - members can see all campaigns
    return campaigns;
  }

  async getMyCampaignsWithMetrics(userId: string): Promise<any[]> {
    // Primero obtenemos las organizaciones del usuario
    const { data: userOrgs, error: orgError } = await supabase
      .from("organization_members")
      .select("organization_id, role")
      .eq("user_id", userId);

    if (orgError) {
      console.error("❌ [SERVICE] Error getting user organizations:", orgError);
      throw orgError;
    }

    if (!userOrgs || userOrgs.length === 0) {
      return [];
    }

    const orgIds = userOrgs.map((org) => org.organization_id);

    let campaignsWithMetrics: any[] = [];

    try {
      // 🚀 OPTIMIZACIÓN CRÍTICA: Query única con todas las métricas pre-calculadas
      const { data: rpcData, error: rpcError } = await supabase.rpc(
        "get_campaigns_with_metrics",
        {
          org_ids: orgIds,
        }
      );

      if (rpcError) {
        console.warn(
          "⚠️ [SERVICE] RPC function not available, falling back to optimized manual query"
        );
        campaignsWithMetrics = await this.getMyCampaignsWithMetricsOptimized(
          orgIds
        );
      } else {
        campaignsWithMetrics = rpcData || [];
      }
    } catch (error) {
      console.warn("⚠️ [SERVICE] RPC failed, using optimized fallback:", error);
      campaignsWithMetrics = await this.getMyCampaignsWithMetricsOptimized(
        orgIds
      );
    }

    if (!campaignsWithMetrics || campaignsWithMetrics.length === 0) {
      return [];
    }

    // ⭐ ADD FAVORITED STATUS
    // Get user's favorited campaign IDs and add is_favorited flag to each campaign
    const favoritedIds = await this.getUserFavoriteCampaignIds(userId);
    const favoritedIdsSet = new Set(favoritedIds);

    // Add is_favorited flag to each campaign
    campaignsWithMetrics = campaignsWithMetrics.map((campaign) => ({
      ...campaign,
      is_favorited: favoritedIdsSet.has(campaign.id),
    }));

    // 🔐 ACCESS CONTROL
    // All users (admin, member, viewer) can see all campaigns in their organizations
    // No brand-based filtering - members can see all campaigns
    return campaignsWithMetrics;
  }

  // 🚀 NUEVO: Método optimizado con query manual más eficiente
  private async getMyCampaignsWithMetricsOptimized(
    organizationIds: string[]
  ): Promise<any[]> {
    try {
      // 🚀 STEP 1: Obtener campañas base
      const { data: baseCampaigns, error: campaignsError } = await supabase
        .from("campaigns")
        .select(
          `
          id, name, description, status, budget, currency,
          start_date, end_date, created_at, updated_at, organization_id
        `
        )
        .in("organization_id", organizationIds)
        .is("deleted_at", null)
        .order("created_at", { ascending: false });

      if (campaignsError) {
        console.error(
          "❌ [SERVICE] Error fetching base campaigns:",
          campaignsError
        );
        throw campaignsError;
      }

      if (!baseCampaigns || baseCampaigns.length === 0) {
        return [];
      }

      const campaignIds = baseCampaigns.map((c) => c.id);

      // 🚀 STEP 2: Obtener todas las métricas en paralelo con Promise.all
      const [influencersData, postsData, metricsData] = await Promise.all([
        // Influencers count por campaña
        supabase
          .from("campaign_influencers")
          .select("campaign_id")
          .in("campaign_id", campaignIds)
          .is("deleted_at", null),

        // Posts por campaña
        supabase
          .from("influencer_posts")
          .select("campaign_id, post_url")
          .in("campaign_id", campaignIds)
          .is("deleted_at", null),

        // Métricas de posts (para engagement)
        supabase
          .from("post_metrics")
          .select(
            "post_url, engagement_rate, likes_count, comments_count, views_count"
          )
          .not("post_url", "is", null),
      ]);

      // 🚀 STEP 3: Procesar errores de queries paralelas
      if (influencersData.error) {
        console.warn(
          "⚠️ [SERVICE] Influencers query failed:",
          influencersData.error
        );
      }
      if (postsData.error) {
        console.warn("⚠️ [SERVICE] Posts query failed:", postsData.error);
      }
      if (metricsData.error) {
        console.warn("⚠️ [SERVICE] Metrics query failed:", metricsData.error);
      }

      // 🚀 STEP 4: Crear maps optimizados para lookup O(1)
      const influencersMap = new Map<string, number>();
      const postsMap = new Map<string, Array<{ post_url: string }>>();
      const metricsMap = new Map<string, any>();

      // Procesar influencers
      (influencersData.data || []).forEach((item) => {
        const count = influencersMap.get(item.campaign_id) || 0;
        influencersMap.set(item.campaign_id, count + 1);
      });

      // Procesar posts
      (postsData.data || []).forEach((item) => {
        if (!postsMap.has(item.campaign_id)) {
          postsMap.set(item.campaign_id, []);
        }
        const posts = postsMap.get(item.campaign_id);
        if (posts) {
          posts.push({ post_url: item.post_url });
        }
      });

      // Procesar métricas
      (metricsData.data || []).forEach((metric) => {
        if (metric.post_url) {
          metricsMap.set(metric.post_url, metric);
        }
      });

      // 🚀 STEP 5: Combinar datos de manera eficiente
      const campaignsWithMetrics = baseCampaigns.map((campaign) => {
        const influencersCount = influencersMap.get(campaign.id) || 0;
        const campaignPosts = postsMap.get(campaign.id) || [];
        const postsCount = campaignPosts.length;

        // Calcular engagement promedio optimizado
        let avgEngagement = 0;
        if (campaignPosts.length > 0) {
          const validEngagementRates: number[] = [];

          campaignPosts.forEach((post) => {
            if (!post.post_url) return;

            const metric = metricsMap.get(post.post_url);
            if (!metric) return;

            // Priorizar engagement_rate si está disponible
            if (metric.engagement_rate && metric.engagement_rate > 0) {
              const percentage =
                metric.engagement_rate < 1
                  ? metric.engagement_rate * 100
                  : metric.engagement_rate;
              validEngagementRates.push(Math.min(percentage, 100)); // Cap at 100%
            } else if (
              metric.views_count > 0 &&
              (metric.likes_count > 0 || metric.comments_count > 0)
            ) {
              // Calcular engagement manualmente
              const calculatedRate =
                ((metric.likes_count + metric.comments_count) /
                  metric.views_count) *
                100;
              if (calculatedRate <= 100 && calculatedRate > 0) {
                validEngagementRates.push(calculatedRate);
              }
            }
          });

          if (validEngagementRates.length > 0) {
            avgEngagement =
              validEngagementRates.reduce((sum, rate) => sum + rate, 0) /
              validEngagementRates.length;
          }
        }

        return {
          ...campaign,
          influencers_count: influencersCount,
          posts_count: postsCount,
          avg_engagement_rate: Math.round(avgEngagement * 100) / 100,
        };
      });

      return campaignsWithMetrics;
    } catch (error) {
      console.error("❌ [SERVICE] Error in optimized campaigns query:", error);

      // 🚀 FALLBACK: Retornar campañas básicas sin métricas
      const { data: fallbackCampaigns } = await supabase
        .from("campaigns")
        .select("*")
        .in("organization_id", organizationIds)
        .is("deleted_at", null)
        .order("created_at", { ascending: false });

      return (fallbackCampaigns || []).map((campaign) => ({
        ...campaign,
        influencers_count: 0,
        posts_count: 0,
        avg_engagement_rate: 0,
      }));
    }
  }

  // 🚀 NUEVO: Método optimizado para campañas específicas por IDs
  private async getMyCampaignsWithMetricsOptimizedForIds(
    campaignIds: string[]
  ): Promise<any[]> {
    try {
      // 🚀 STEP 1: Obtener campañas base por IDs específicos
      const { data: baseCampaigns, error: campaignsError } = await supabase
        .from("campaigns")
        .select(
          `
          id, name, description, status, budget, currency,
          start_date, end_date, created_at, updated_at, organization_id
        `
        )
        .in("id", campaignIds)
        .is("deleted_at", null)
        .order("created_at", { ascending: false });

      if (campaignsError) {
        console.error(
          "❌ [SERVICE] Error fetching base campaigns by IDs:",
          campaignsError
        );
        throw campaignsError;
      }

      if (!baseCampaigns || baseCampaigns.length === 0) {
        return [];
      }

      // 🚀 STEP 2: Obtener todas las métricas en paralelo con Promise.all
      const [influencersData, postsData, metricsData] = await Promise.all([
        // Influencers count por campaña
        supabase
          .from("campaign_influencers")
          .select("campaign_id")
          .in("campaign_id", campaignIds)
          .is("deleted_at", null),

        // Posts por campaña
        supabase
          .from("influencer_posts")
          .select("campaign_id")
          .in("campaign_id", campaignIds)
          .is("deleted_at", null),

        // Métricas por campaña
        supabase
          .from("campaign_metrics")
          .select("campaign_id, engagement_rate, reach, impressions")
          .in("campaign_id", campaignIds),
      ]);

      // 🚀 STEP 3: Procesar métricas
      const influencersCount =
        influencersData.data?.reduce((acc: any, item: any) => {
          acc[item.campaign_id] = (acc[item.campaign_id] || 0) + 1;
          return acc;
        }, {}) || {};

      const postsCount =
        postsData.data?.reduce((acc: any, item: any) => {
          acc[item.campaign_id] = (acc[item.campaign_id] || 0) + 1;
          return acc;
        }, {}) || {};

      const metricsMap =
        metricsData.data?.reduce((acc: any, item: any) => {
          acc[item.campaign_id] = item;
          return acc;
        }, {}) || {};

      // 🚀 STEP 4: Combinar datos
      const campaignsWithMetrics = baseCampaigns.map((campaign) => ({
        ...campaign,
        influencers_count: influencersCount[campaign.id] || 0,
        posts_count: postsCount[campaign.id] || 0,
        avg_engagement_rate: metricsMap[campaign.id]?.engagement_rate || 0,
        total_reach: metricsMap[campaign.id]?.reach || 0,
        total_impressions: metricsMap[campaign.id]?.impressions || 0,
      }));

      return campaignsWithMetrics;
    } catch (error) {
      console.error(
        "❌ [SERVICE] Error in getMyCampaignsWithMetricsOptimizedForIds:",
        error
      );
      throw error;
    }
  }

  async getCampaignsByTeam(teamId: string): Promise<Campaign[]> {
    const { data, error } = await supabase
      .from("campaigns")
      .select()
      .eq("team_id", teamId)
      .is("deleted_at", null)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async updateCampaign(id: string, data: CampaignUpdateDTO): Promise<Campaign> {
    const { data: campaign, error } = await supabase
      .from("campaigns")
      .update({
        ...data,
        updated_at: new Date(),
      })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return campaign;
  }

  async deleteCampaign(id: string): Promise<void> {
    const { error } = await supabase
      .from("campaigns")
      .update({
        deleted_at: new Date(),
        updated_at: new Date(),
      })
      .eq("id", id);

    if (error) throw error;
  }

  async addInfluencer(
    data: CampaignInfluencerCreateDTO
  ): Promise<CampaignInfluencer> {
    const influencerData = {
      ...data,
      status: "pending",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const { data: influencer, error } = await supabase
      .from("campaign_influencers")
      .insert([influencerData])
      .select()
      .single();

    if (error) throw error;
    return influencer;
  }

  async updateInfluencerStatus(
    campaignId: string,
    influencerId: string,
    data: CampaignInfluencerUpdateDTO
  ): Promise<CampaignInfluencer> {
    const updateData = {
      ...data,
      updated_at: new Date().toISOString(),
    };

    const { data: influencer, error } = await supabase
      .from("campaign_influencers")
      .update(updateData)
      .eq("campaign_id", campaignId)
      .eq("influencer_id", influencerId)
      .select()
      .single();

    if (error) throw error;
    return influencer;
  }

  async removeInfluencer(
    campaignId: string,
    influencerId: string
  ): Promise<void> {
    try {
      // Primero verificar si el registro existe
      const { data: existingRecord, error: checkError } = await supabase
        .from("campaign_influencers")
        .select("id, campaign_id, influencer_id, status")
        .eq("campaign_id", campaignId)
        .eq("influencer_id", influencerId)
        .maybeSingle();

      if (checkError) {
        console.error(
          "❌ [CampaignService] Error verificando registro existente:",
          checkError
        );
        throw checkError;
      }

      if (!existingRecord) {
        console.warn(
          "⚠️ [CampaignService] No se encontró registro para eliminar (ya eliminado o no existe):",
          {
            campaignId,
            influencerId,
          }
        );
        // No es un error, simplemente no hay nada que eliminar
        return;
      }

      // Ejecutar la eliminación
      const { error } = await supabase
        .from("campaign_influencers")
        .delete()
        .eq("campaign_id", campaignId)
        .eq("influencer_id", influencerId);

      if (error) {
        console.error("❌ [CampaignService] Error eliminando registro:", error);
        throw error;
      }
    } catch (error) {
      console.error(
        "❌ [CampaignService] Error en proceso de eliminación:",
        error
      );
      throw error;
    }
  }

  async createContent(
    data: CampaignContentCreateDTO
  ): Promise<CampaignContent> {
    const contentData = {
      ...data,
      status: "draft",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const { data: content, error } = await supabase
      .from("campaign_content")
      .insert([contentData])
      .select()
      .single();

    if (error) throw error;
    return content;
  }

  async updateContent(
    id: string,
    data: CampaignContentUpdateDTO
  ): Promise<CampaignContent> {
    const updateData = {
      ...data,
      updated_at: new Date().toISOString(),
    };

    const { data: content, error } = await supabase
      .from("campaign_content")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return content;
  }

  async getCampaignContent(campaignId: string): Promise<CampaignContent[]> {
    const { data, error } = await supabase
      .from("campaign_content")
      .select()
      .eq("campaign_id", campaignId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async getInfluencerContent(
    campaignId: string,
    influencerId: string
  ): Promise<CampaignContent[]> {
    const { data, error } = await supabase
      .from("campaign_content")
      .select()
      .eq("campaign_id", campaignId)
      .eq("influencer_id", influencerId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async getCampaignsByStatus(status: Campaign["status"]): Promise<Campaign[]> {
    const { data: campaigns, error } = await supabase
      .from("campaigns")
      .select("*")
      .eq("status", status)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return campaigns;
  }

  async getCampaignsByType(type: Campaign["type"]): Promise<Campaign[]> {
    const { data: campaigns, error } = await supabase
      .from("campaigns")
      .select("*")
      .eq("type", type)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return campaigns;
  }

  async getActiveCampaigns(): Promise<Campaign[]> {
    const { data: campaigns, error } = await supabase
      .from("campaigns")
      .select("*")
      .in("status", ["active", "scheduled"])
      .order("created_at", { ascending: false });

    if (error) throw error;
    return campaigns;
  }

  async getCampaignsByDateRange(
    startDate: Date,
    endDate: Date
  ): Promise<Campaign[]> {
    const { data: campaigns, error } = await supabase
      .from("campaigns")
      .select("*")
      .gte("start_date", startDate)
      .lte("end_date", endDate)
      .order("start_date", { ascending: true });

    if (error) throw error;
    return campaigns;
  }

  async updateCampaignMetrics(
    id: string,
    metrics: Campaign["metrics"]
  ): Promise<Campaign> {
    const { data: campaign, error } = await supabase
      .from("campaigns")
      .update({
        metrics,
        updated_at: new Date(),
      })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return campaign;
  }

  // 🎯 MÉTODOS PARA ASIGNACIÓN DE USUARIOS A CAMPAÑAS
  async assignUsersToCampaign(
    campaignId: string,
    userIds: string[]
  ): Promise<void> {
    // Verificar que la campaña existe y pertenece a una organización válida
    const { data: campaign, error: campaignError } = await supabase
      .from("campaigns")
      .select("organization_id")
      .eq("id", campaignId)
      .single();

    if (campaignError || !campaign) {
      console.error(
        "❌ [CAMPAIGN_SERVICE] Error al obtener campaña:",
        campaignError
      );
      throw new Error("Campaña no encontrada");
    }

    // Verificar que todos los usuarios pertenecen a la misma organización
    const { data: userMemberships, error: membershipError } = await supabase
      .from("organization_members")
      .select("user_id")
      .eq("organization_id", campaign.organization_id)
      .in("user_id", userIds);

    if (membershipError) {
      throw new Error("Error al verificar membresías de usuarios");
    }

    const validUserIds = userMemberships?.map((m) => m.user_id) || [];
    const invalidUserIds = userIds.filter((id) => !validUserIds.includes(id));

    if (invalidUserIds.length > 0) {
      throw new Error(
        `Los siguientes usuarios no pertenecen a la organización: ${invalidUserIds.join(
          ", "
        )}`
      );
    }

    // Verificar asignaciones existentes para evitar duplicados
    const { data: existingAssignments, error: existingError } = await supabase
      .from("campaign_members")
      .select("user_id")
      .eq("campaign_id", campaignId)
      .in("user_id", userIds);

    if (existingError) {
      throw new Error("Error al verificar asignaciones existentes");
    }

    const existingUserIds = existingAssignments?.map((a) => a.user_id) || [];
    const newUserIds = userIds.filter((id) => !existingUserIds.includes(id));

    if (newUserIds.length === 0) {
      throw new Error("Todos los usuarios ya están asignados a esta campaña");
    }

    // Insertar nuevas asignaciones
    const assignmentsToInsert = newUserIds.map((userId) => ({
      campaign_id: campaignId,
      user_id: userId,
      created_at: new Date(),
    }));

    const { error: insertError } = await supabase
      .from("campaign_members")
      .insert(assignmentsToInsert);

    if (insertError) {
      console.error("❌ [CAMPAIGN_SERVICE] Error al insertar asignaciones:", {
        error: insertError,
        campaignId,
        userIds: newUserIds,
        timestamp: new Date().toISOString(),
      });
      throw new Error(
        `Error al asignar usuarios a la campaña: ${insertError.message}`
      );
    }
  }

  async removeUsersFromCampaign(
    campaignId: string,
    userIds: string[]
  ): Promise<void> {
    const { error } = await supabase
      .from("campaign_members")
      .delete()
      .eq("campaign_id", campaignId)
      .in("user_id", userIds);

    if (error) {
      throw new Error("Error al remover usuarios de la campaña");
    }
  }

  async getCampaignMembers(campaignId: string): Promise<any[]> {
    const { data: members, error } = await supabase
      .from("campaign_members")
      .select(
        `
        id,
        user_id,
        created_at,
        user_profiles:user_id (
          id,
          email,
          full_name,
          avatar_url,
          role,
          position,
          company
        )
      `
      )
      .eq("campaign_id", campaignId);

    if (error) {
      throw new Error("Error al obtener miembros de la campaña");
    }

    return members || [];
  }

  async getUserCampaigns(userId: string): Promise<any[]> {
    const { data: campaigns, error } = await supabase
      .from("campaign_members")
      .select(
        `
        campaign_id,
        created_at,
        campaigns:campaign_id (
          id,
          name,
          description,
          status,
          organization_id,
          created_at
        )
      `
      )
      .eq("user_id", userId);

    if (error) {
      throw new Error("Error al obtener campañas del usuario");
    }

    return campaigns || [];
  }

  // ==========================================
  // CAMPAIGN FAVORITES METHODS
  // ==========================================

  /**
   * Add a campaign to user's favorites
   */
  async addCampaignFavorite(userId: string, campaignId: string): Promise<void> {
    const { error } = await supabase.from("campaign_favorites").insert({
      user_id: userId,
      campaign_id: campaignId,
      created_at: new Date().toISOString(),
    });

    // Ignore duplicate errors (already favorited)
    if (error && error.code !== "23505") {
      console.error("Error adding campaign favorite:", error);
      throw error;
    }
  }

  /**
   * Remove a campaign from user's favorites
   */
  async removeCampaignFavorite(
    userId: string,
    campaignId: string
  ): Promise<void> {
    const { error } = await supabase
      .from("campaign_favorites")
      .delete()
      .eq("user_id", userId)
      .eq("campaign_id", campaignId);

    if (error) {
      console.error("Error removing campaign favorite:", error);
      throw error;
    }
  }

  /**
   * Get all favorited campaign IDs for a user
   */
  async getUserFavoriteCampaignIds(userId: string): Promise<string[]> {
    const { data, error } = await supabase
      .from("campaign_favorites")
      .select("campaign_id")
      .eq("user_id", userId);

    if (error) {
      console.error("Error getting user favorites:", error);
      return [];
    }

    return data?.map((f) => f.campaign_id) || [];
  }
}
