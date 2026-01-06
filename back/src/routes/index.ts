import { Router } from 'express';
import config from '../config/environment';
import authRoutes from './auth';
import userRoutes from './user';
import organizationRoutes from './organization';
import teamRoutes from './team';
import influencerRoutes from './influencer';
import influencerExtendedRoutes from './influencer/influencer-extended.routes';
import campaignRoutes from './campaign';
import campaignInfluencerRoutes from './campaign/campaign-influencer.routes';
import campaignScheduleRoutes from './campaign/campaign-schedule.routes';
import campaignInsightsRoutes from './campaign/campaign-insights.routes';
import influencerPostRoutes from './influencer/influencer-post.routes';
import contentRoutes from './content';
import metricsRoutes from './metrics/metrics.routes';
import engagementRoutes from './engagement/engagement.routes';
import notificationRoutes from './notification/notification.routes';
import reportRoutes from './report/report.routes';

import creatorRoutes from './creator/creator.routes';

import analysisRoutes from './analysis/youtube-analysis.routes';
import instagramAnalysisRoutes from './analysis/instagram-analysis.routes';
import socialRoutes from './social';
import postTopicsRoutes from './post-topics';
import brandsRoutes from './brands';
import imageProxyRoutes from './proxy/image-proxy.routes';
import webhooksRoutes from './webhooks';
import adminRoutes from './admin/admin.routes';
import youtubeMetricsRoutes from './youtube/youtube-metrics.routes';
import tiktokMetricsRoutes from './tiktok/tiktok-metrics.routes';
import twitterRoutes from './twitter/twitter.routes';
import feedbackRoutes from './feedback/feedback.routes';
import connectionTestRoutes from './debug/connection-test.routes';
import hypeAuditorRoutes from './hypeauditor/hypeauditor.routes';
import hypeAuditorDiscoveryRoutes from './hypeauditor/hypeauditor-discovery.routes';
import hypeAuditorCollectorRoutes from './hypeauditor/report-collector.routes';
import userBrandRoutes from './user-brand';
import agentAudienceRoutes from './audience/agent-audience.routes';
// import explorerRoutes from './explorer/explorer.routes';


// Crear router principal
const router = Router();

// Ruta de health check
router.get('/health', (_req, res) => {
  res.status(200).json({
    status: 'ok',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '0.1.0',
    environment: config.nodeEnv
  });
});

// Ruta raíz del API para mostrar información sobre endpoints disponibles
router.get('/', (req, res) => {
  res.json({
    message: 'Welcome to the API',
    version: '1.0.0',
    endpoints: {
      auth: `${config.apiPrefix}/auth`,
      users: `${config.apiPrefix}/users`,
      organizations: `${config.apiPrefix}/organizations`,
      teams: `${config.apiPrefix}/teams`,
      influencers: `${config.apiPrefix}/influencers`,
      campaigns: `${config.apiPrefix}/campaigns`,
      analytics: `${config.apiPrefix}/analytics`,
      content: `${config.apiPrefix}/content`,
      engagements: `${config.apiPrefix}/engagements`,
      metrics: `${config.apiPrefix}/metrics`,
      social: `${config.apiPrefix}/social`,
      brands: `${config.apiPrefix}/brands`,
      imageProxy: `${config.apiPrefix}/proxy/image`,
      youtubeMetrics: `${config.apiPrefix}/youtube-metrics`,
      tiktokMetrics: `${config.apiPrefix}/tiktok-metrics`,
      hypeAuditor: `${config.apiPrefix}/hypeauditor`,
      hypeAuditorDiscovery: `${config.apiPrefix}/hypeauditor/discovery`
      // explorer: `${config.apiPrefix}/explorer`
    }
  });
});

// Rutas públicas
router.use('/auth', authRoutes);

// Rutas protegidas
router.use('/users', userRoutes);
router.use('/organizations', organizationRoutes);
router.use('/teams', teamRoutes);
router.use('/influencers', influencerRoutes);
router.use('/influencer', influencerExtendedRoutes);
router.use('/campaigns', campaignRoutes);
router.use('/campaign-influencers', campaignInfluencerRoutes);
router.use('/campaign-schedules', campaignScheduleRoutes);
router.use('/campaign-insights', campaignInsightsRoutes);
router.use('/influencer-posts', influencerPostRoutes);
router.use('/content', contentRoutes);
router.use('/metrics', metricsRoutes);
router.use('/engagement', engagementRoutes);
router.use('/notifications', notificationRoutes);
router.use('/reports', reportRoutes);

router.use('/creator', creatorRoutes);
router.use('/analysis', analysisRoutes);
router.use('/analysis', instagramAnalysisRoutes);
router.use('/social', socialRoutes);
router.use('/post-topics', postTopicsRoutes);
router.use('/brands', brandsRoutes);
router.use('/proxy/image', imageProxyRoutes);
router.use('/webhooks', webhooksRoutes);
router.use('/adminWRK', adminRoutes);
router.use('/youtube-metrics', youtubeMetricsRoutes);
router.use('/tiktok-metrics', tiktokMetricsRoutes);
router.use('/twitter', twitterRoutes);
router.use('/feedback', feedbackRoutes);
router.use('/debug', connectionTestRoutes);
router.use('/hypeauditor', hypeAuditorRoutes);
router.use('/hypeauditor/discovery', hypeAuditorDiscoveryRoutes);
router.use('/hypeauditor/collector', hypeAuditorCollectorRoutes);
router.use('/user-brands', userBrandRoutes);
router.use('/', agentAudienceRoutes);
// router.use('/explorer', explorerRoutes);


export default router; 