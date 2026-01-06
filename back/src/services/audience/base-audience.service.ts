import {
  InferenceOptions,
  InferenceResult,
} from "../../models/audience/openai-audience-inference.model";

/**
 * Abstract Base Audience Service
 * Defines the common interface for audience inference services
 */
export abstract class BaseAudienceService {
  /**
   * Main inference method - must be implemented by subclasses
   */
  abstract inferAudience(
    instagramUrl: string,
    options: InferenceOptions
  ): Promise<InferenceResult>;

  /**
   * Optional method for clearing cache - can be overridden
   */
  async clearCache(): Promise<void> {
    // Default implementation - no-op
    console.log("Cache clearing not implemented for this service");
  }

  /**
   * Optional method for getting cache stats - can be overridden
   */
  async getCacheStats(): Promise<any> {
    // Default implementation - return empty stats
    return {
      totalEntries: 0,
      totalCost: 0,
      averageCost: 0,
      expirationBreakdown: { valid: 0, expired: 0 },
    };
  }
}
