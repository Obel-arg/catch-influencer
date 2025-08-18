import { Router } from 'express';
import { YouTubeAnalysisController } from '../../controllers/analysis/youtube-analysis.controller';
import { authenticateToken } from '../../middleware/auth';

const router = Router();
const youtubeAnalysisController = new YouTubeAnalysisController();

// POST /analysis/post - Analizar un post (YouTube o TikTok) - ENDPOINT UNIFICADO
router.post('/post', authenticateToken, youtubeAnalysisController.analyzePost.bind(youtubeAnalysisController));

// POST /analysis/youtube - Analizar un video de YouTube (legacy)
router.post('/youtube', authenticateToken, youtubeAnalysisController.analyzeYouTubePost.bind(youtubeAnalysisController));

// GET /analysis/status - Verificar estado del servicio
router.get('/status', authenticateToken, youtubeAnalysisController.getAnalysisStatus.bind(youtubeAnalysisController));

export default router; 