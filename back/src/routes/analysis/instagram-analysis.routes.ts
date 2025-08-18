import { Router } from 'express';
import { InstagramAnalysisController } from '../../controllers/analysis/instagram-analysis.controller';
import { authenticateToken } from '../../middleware/auth';

const router = Router();
const instagramAnalysisController = new InstagramAnalysisController();

// POST /analysis/instagram - Analizar un post de Instagram
router.post('/instagram', authenticateToken, instagramAnalysisController.analyzeInstagramPost.bind(instagramAnalysisController));

// GET /analysis/instagram/status - Verificar estado del servicio
router.get('/instagram/status', authenticateToken, instagramAnalysisController.getAnalysisStatus.bind(instagramAnalysisController));

export default router; 