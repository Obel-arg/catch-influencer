// Main view components organized by domain  
export { CampaignDashboard } from './dashboard/CampaignDashboard'
export { CampaignProgressSection } from './dashboard/CampaignProgressSection'
export { CampaignMetricsCards } from './dashboard/CampaignMetricsCards'
export { CampaignChartsSection } from './dashboard/CampaignChartsSection'
export { CampaignPlatformsSection } from './dashboard/CampaignPlatformsSection'
export { CampaignStatsSection } from './dashboard/CampaignStatsSection'
export { CampaignPosts, PostMetricsCard } from './posts'
export { CampaignInfluencers } from './influencers'
export { AnalysisSidebar, AnalysisResults } from './analysis'
export { CampaignProgramming } from './programming'

// Modals
export * from '../modals'

// Specific component exports (to avoid naming conflicts, import directly from subdirectories when needed)
// Example: import { PostCard } from '@/components/campaigns/campaign-views/posts/components'
// Example: import { InfluencerCard } from '@/components/campaigns/campaign-views/influencers/components' 