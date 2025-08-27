import { Router } from 'express';
import { authenticateToken } from '../../middleware/auth';
import { DebugController } from '../../controllers/debug';

const router = Router();

// 🔐 PROTECCIÓN: Solo usuarios autenticados pueden ver información de debug
router.use(authenticateToken);
const debugController = new DebugController();

// Endpoint de debug para verificar configuración
router.get('/config', debugController.getConfig.bind(debugController));

export default router; 