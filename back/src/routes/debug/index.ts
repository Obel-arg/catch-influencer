import { Router } from 'express';
import { DebugController } from '../../controllers/debug';

const router = Router();
const debugController = new DebugController();

// Endpoint de debug para verificar configuración
router.get('/config', debugController.getConfig.bind(debugController));

export default router; 