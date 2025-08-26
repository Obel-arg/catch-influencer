import { Router } from 'express';
import { authenticateToken } from '../../middleware/auth';
import { HypeAuditorController } from '../../controllers/hypeauditor/hypeauditor.controller';

const router = Router();

// Búsqueda en producción (consume créditos por página)
router.post('/search', authenticateToken, HypeAuditorController.search);

// Búsqueda en sandbox (retorna muestra, no consume créditos)
router.post('/sandbox', authenticateToken, HypeAuditorController.sandbox);

// Reporte de Instagram por username
router.get('/report', HypeAuditorController.getInstagramReport);

// Info
router.get('/', (req, res) => {
	res.json({
		message: 'HypeAuditor API Routes',
		version: '1.0.0',
		endpoints: {
			search: 'POST /hypeauditor/search',
			sandbox: 'POST /hypeauditor/sandbox',
			report: 'GET /hypeauditor/report?username={username}&features={features}'
		},
		notes: [
			'20 resultados por página. Cada página usa 1 Discovery Call',
			'Parametro obligatorio: social_network (instagram|youtube|tiktok|twitter|twitch)'
		]
	});
});

export default router;
