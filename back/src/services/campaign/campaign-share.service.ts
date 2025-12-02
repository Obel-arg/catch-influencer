import { randomBytes } from 'crypto';
import supabase from '../../config/supabase';
import { CampaignShareToken, CampaignShareTokenCreateDTO } from '../../models/campaign/campaign-share-token.model';

export class CampaignShareService {
  /**
   * Generate cryptographically secure 64-character hex token
   */
  private generateShareToken(): string {
    return randomBytes(32).toString('hex');
  }

  /**
   * Create share token for campaign (returns existing if already created)
   */
  async createShareToken(campaignId: string, userId?: string): Promise<CampaignShareToken> {
    // Check if token already exists
    const { data: existingToken } = await supabase
      .from('campaign_share_tokens')
      .select('*')
      .eq('campaign_id', campaignId)
      .single();

    if (existingToken) {
      return existingToken;
    }

    // Create new token
    const shareToken = this.generateShareToken();
    const tokenData: CampaignShareTokenCreateDTO = {
      campaign_id: campaignId,
      share_token: shareToken,
      created_by: userId
    };

    const { data, error } = await supabase
      .from('campaign_share_tokens')
      .insert(tokenData)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Get campaign ID from share token
   */
  async getCampaignIdByToken(shareToken: string): Promise<string | null> {
    const { data, error } = await supabase
      .from('campaign_share_tokens')
      .select('campaign_id')
      .eq('share_token', shareToken)
      .single();

    if (error || !data) return null;
    return data.campaign_id;
  }

  /**
   * Validate share token
   */
  async isValidToken(shareToken: string): Promise<boolean> {
    const campaignId = await this.getCampaignIdByToken(shareToken);
    return campaignId !== null;
  }
}
