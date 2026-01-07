"use client";

import { useState, useEffect } from "react";
import {
  Search,
  Loader2,
  UserPlus,
  X,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { LazyInfluencerAvatar } from "@/components/explorer/LazyInfluencerAvatar";
import { useCampaigns } from "@/hooks/campaign/useCampaigns";
import { useCampaignContext } from "@/contexts/CampaignContext";
import { useInfluencers } from "@/hooks/influencer/useInfluencers";
import { influencerService } from "@/lib/services/influencer";
import { toast } from "sonner";

interface ExplorerInfluencer {
  creatorId: string;
  name: string;
  avatar: string;
  image?: string;
  isVerified?: boolean;
  verified?: boolean;
  followersCount?: number;
  averageEngagementRate?: number;
  socialPlatforms?: Array<{
    platform: string;
    username: string;
    followers?: number;
  }>;
  platformInfo?: Record<string, any>;
  contentNiches?: string[];
  country?: string;
}

interface AddInfluencerToCampaignModalProps {
  open: boolean;
  onClose: () => void;
  campaignId: string;
}

// Platform icon helper
const getPlatformIcon = (platform: string) => {
  const iconSrc = {
    instagram: "/icons/instagram.svg",
    tiktok: "/icons/tiktok.svg",
    youtube: "/icons/youtube.svg",
    facebook: "/icons/facebook.svg",
    threads: "/icons/threads.svg",
  }[platform.toLowerCase()];

  if (!iconSrc) return null;

  return (
    <img
      src={iconSrc}
      alt={`${platform} icon`}
      className={
        platform.toLowerCase() === "tiktok" ? "h-3.5 w-3.5" : "h-4 w-4"
      }
    />
  );
};

// Detect available platforms from influencer data
const detectAvailablePlatforms = (influencer: ExplorerInfluencer): string[] => {
  const platforms: string[] = [];

  if (influencer.platformInfo) {
    Object.keys(influencer.platformInfo).forEach((key) => {
      if (influencer.platformInfo?.[key]) {
        platforms.push(key);
      }
    });
  }

  if (influencer.socialPlatforms && influencer.socialPlatforms.length > 0) {
    influencer.socialPlatforms.forEach((sp) => {
      const platformName = sp.platform.toLowerCase();
      if (!platforms.includes(platformName)) {
        platforms.push(platformName);
      }
    });
  }

  return Array.from(new Set(platforms));
};

export const AddInfluencerToCampaignModal = ({
  open,
  onClose,
  campaignId,
}: AddInfluencerToCampaignModalProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<ExplorerInfluencer[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedInfluencer, setSelectedInfluencer] =
    useState<ExplorerInfluencer | null>(null);
  const [budget, setBudget] = useState<string>("0");
  const [isAdding, setIsAdding] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);

  const { addInfluencerToCampaign } = useCampaigns();
  const { influencers, refetch } = useCampaignContext();
  const { searchHypeAuditorSuggestion } = useInfluencers();

  // Get list of already assigned influencer IDs
  const assignedInfluencerIds = new Set(
    influencers
      .map((ci) => ci.influencers?.id)
      .filter((id): id is string => !!id)
  );

  // Debounced search
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    const timeoutId = setTimeout(async () => {
      setIsSearching(true);
      setAddError(null);

      try {
        // Use HypeAuditor suggestion endpoint for name-based queries (no filters, just name)
        // This is the same endpoint used by Explorer for name searches
        const response = await searchHypeAuditorSuggestion(
          searchQuery.trim(),
          "instagram" // Default platform for suggestions (can search across platforms)
        );

        // Handle response structure: { success: true, items: [...], ... }
        const items = response?.items || [];
        setSearchResults(items);
      } catch (error) {
        console.error("Error searching influencers:", error);
        toast.error("Error al buscar influencers");
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  // Reset state when modal opens/closes
  useEffect(() => {
    if (!open) {
      setSearchQuery("");
      setSearchResults([]);
      setSelectedInfluencer(null);
      setBudget("0");
      setAddError(null);
    }
  }, [open]);

  const handleSelectInfluencer = (influencer: ExplorerInfluencer) => {
    setSelectedInfluencer(influencer);
    setAddError(null);
  };

  // Helper to build payload for creating influencer (similar to Explorer)
  const buildCreatePayload = (influencer: ExplorerInfluencer) => {
    const socialPlatforms = Array.isArray(influencer?.socialPlatforms)
      ? Array.from(
          new Set(
            influencer.socialPlatforms.map((p: any) =>
              typeof p === "string" ? p : p.platform
            )
          )
        )
      : [];

    const platforms = detectAvailablePlatforms(influencer);
    const mainPlatform = platforms[0] || "instagram";

    return {
      creator_id: influencer.creatorId,
      name: influencer.name || influencer.creatorId,
      avatar: influencer.avatar || influencer.image || "",
      is_verified: !!(influencer.verified ?? influencer.isVerified),
      main_social_platform: mainPlatform,
      followers_count: influencer.followersCount || 0,
      average_engagement_rate: influencer.averageEngagementRate || 0,
      social_platforms: socialPlatforms,
    };
  };

  const handleAddInfluencer = async () => {
    if (!selectedInfluencer) {
      setAddError("Selecciona un influencer");
      return;
    }

    const budgetValue = parseFloat(budget) || 0;

    setIsAdding(true);
    setAddError(null);

    try {
      let influencerUuid: string;

      // 1) Try to get influencer by creatorId first
      try {
        const local = await influencerService.getInfluencerById(
          selectedInfluencer.creatorId
        );
        if (local && local.id) {
          influencerUuid = local.id;
        } else {
          throw new Error("Influencer not found");
        }
      } catch (_) {
        // 2) If not found, create influencer from Explorer data
        const payload = buildCreatePayload(selectedInfluencer);
        const created = await influencerService.createInfluencer(payload);

        if (created?.duplicate && created?.existingInfluencer?.id) {
          influencerUuid = created.existingInfluencer.id;
        } else if (created?.success && created?.influencer?.id) {
          influencerUuid = created.influencer.id;
        } else {
          throw new Error(created?.message || "No se pudo crear el influencer");
        }
      }

      // 3) Check if already assigned (by UUID)
      if (assignedInfluencerIds.has(influencerUuid)) {
        setAddError("Este influencer ya está asignado a la campaña");
        setIsAdding(false);
        return;
      }

      // 4) Now add to campaign using the UUID
      const success = await addInfluencerToCampaign(
        campaignId,
        influencerUuid,
        budgetValue
      );

      if (success) {
        toast.success(
          `Influencer "${selectedInfluencer.name}" agregado exitosamente`
        );

        // Refetch influencers to update the list
        await refetch();

        // Close modal after a short delay
        setTimeout(() => {
          onClose();
        }, 500);
      } else {
        setAddError("Error al agregar el influencer");
      }
    } catch (error: any) {
      console.error("Error adding influencer:", error);
      const errorMessage =
        error?.response?.data?.error ||
        error?.message ||
        "Error al agregar el influencer. Intenta nuevamente.";
      setAddError(errorMessage);
    } finally {
      setIsAdding(false);
    }
  };

  const formatFollowers = (count?: number): string => {
    if (!count) return "N/A";
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
    if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
    return count.toString();
  };

  const formatEngagement = (rate?: number): string => {
    if (!rate) return "N/A";
    return `${(rate * 100).toFixed(2)}%`;
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl flex flex-col p-0 overflow-hidden">
        <DialogHeader className="px-4 pt-2.5 pb-1.5 flex-shrink-0">
          <DialogTitle className="flex items-center gap-1.5 text-base leading-tight">
            <UserPlus className="h-4 w-4" />
            Agregar Influencer a la Campaña
          </DialogTitle>
          <DialogDescription className="text-xs mt-0 leading-tight">
            Busca influencers por nombre y agrégalos a esta campaña
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 min-h-0 overflow-hidden flex flex-col gap-2 px-4 pb-0">
          {/* Search Input */}
          <div className="relative flex-shrink-0">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Buscar por nombre..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
              disabled={isSearching || isAdding}
            />
          </div>

          {/* Error Message */}
          {addError && (
            <div className="flex items-center gap-2 p-2 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm flex-shrink-0">
              <AlertCircle className="h-4 w-4" />
              <span>{addError}</span>
            </div>
          )}

          {/* Selected Influencer Preview */}
          {selectedInfluencer && (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg flex-shrink-0 max-h-[200px] overflow-y-auto">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <LazyInfluencerAvatar
                    influencer={{
                      name: selectedInfluencer.name,
                      avatar:
                        selectedInfluencer.avatar ||
                        selectedInfluencer.image ||
                        "",
                      creatorId: selectedInfluencer.creatorId,
                    }}
                    className="h-12 w-12"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold text-gray-900">
                        {selectedInfluencer.name}
                      </h4>
                      {(selectedInfluencer.isVerified ||
                        selectedInfluencer.verified) && (
                        <span className="text-blue-600">✓</span>
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                      {selectedInfluencer.followersCount && (
                        <span>
                          {formatFollowers(selectedInfluencer.followersCount)}{" "}
                          seguidores
                        </span>
                      )}
                      {selectedInfluencer.averageEngagementRate && (
                        <span>
                          {formatEngagement(
                            selectedInfluencer.averageEngagementRate
                          )}{" "}
                          engagement
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      {detectAvailablePlatforms(selectedInfluencer).map(
                        (platform) => (
                          <span
                            key={platform}
                            className="inline-flex items-center"
                          >
                            {getPlatformIcon(platform)}
                          </span>
                        )
                      )}
                    </div>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedInfluencer(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {/* Search Results */}
          <div
            className="flex-1 overflow-y-auto border border-gray-200 rounded-lg p-3"
            style={{ minHeight: "400px", maxHeight: "45vh" }}
          >
            {isSearching ? (
              <div className="flex flex-col items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600 mb-4" />
                <p className="text-gray-500">Buscando influencers...</p>
              </div>
            ) : searchQuery.trim() && searchResults.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12">
                <Search className="h-12 w-12 text-gray-300 mb-4" />
                <p className="text-gray-500">No se encontraron influencers</p>
                <p className="text-sm text-gray-400 mt-1">
                  Intenta con otro nombre
                </p>
              </div>
            ) : !searchQuery.trim() ? (
              <div className="flex flex-col items-center h-full justify-center py-12">
                <UserPlus className="h-12 w-12 text-gray-300 mb-4" />
                <p className="text-gray-500">
                  Escribe un nombre para buscar influencers
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-2">
                {searchResults.map((influencer) => {
                  const isAlreadyAssigned = assignedInfluencerIds.has(
                    influencer.creatorId
                  );
                  const isSelected =
                    selectedInfluencer?.creatorId === influencer.creatorId;

                  return (
                    <div
                      key={influencer.creatorId}
                      onClick={() =>
                        !isAlreadyAssigned && handleSelectInfluencer(influencer)
                      }
                      className={`
                        p-4 rounded-lg border-2 cursor-pointer transition-all
                        ${
                          isSelected
                            ? "border-blue-500 bg-blue-50"
                            : isAlreadyAssigned
                            ? "border-gray-200 bg-gray-50 opacity-60 cursor-not-allowed"
                            : "border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm"
                        }
                      `}
                    >
                      <div className="flex items-center gap-2">
                        <LazyInfluencerAvatar
                          influencer={{
                            name: influencer.name,
                            avatar: influencer.avatar || influencer.image || "",
                            creatorId: influencer.creatorId,
                          }}
                          className="h-12 w-12 flex-shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h4 className="font-semibold text-gray-900 truncate">
                              {influencer.name}
                            </h4>
                            {(influencer.isVerified || influencer.verified) && (
                              <span className="text-blue-600 flex-shrink-0">
                                ✓
                              </span>
                            )}
                            {isAlreadyAssigned && (
                              <span className="text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded flex-shrink-0">
                                Ya asignado
                              </span>
                            )}
                            {isSelected && (
                              <CheckCircle2 className="h-5 w-5 text-blue-600 flex-shrink-0" />
                            )}
                          </div>
                          <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                            {influencer.followersCount && (
                              <span>
                                {formatFollowers(influencer.followersCount)}{" "}
                                seguidores
                              </span>
                            )}
                            {influencer.averageEngagementRate && (
                              <span>
                                {formatEngagement(
                                  influencer.averageEngagementRate
                                )}{" "}
                                engagement
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 mt-2">
                            {detectAvailablePlatforms(influencer).map(
                              (platform) => (
                                <span
                                  key={platform}
                                  className="inline-flex items-center"
                                >
                                  {getPlatformIcon(platform)}
                                </span>
                              )
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex justify-end gap-2 pt-1.5 px-4 border-t flex-shrink-0">
          <Button
            onClick={handleAddInfluencer}
            disabled={!selectedInfluencer || isAdding || isSearching}
            className="bg-blue-600 hover:bg-blue-700"
            size="sm"
          >
            {isAdding ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Agregando...
              </>
            ) : (
              <>
                <UserPlus className="h-4 w-4 mr-2" />
                Agregar Influencer
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
