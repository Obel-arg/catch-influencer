import { Router } from 'express';
import { authenticateToken } from '../../middleware/auth';
import { ConfigDebugController } from '../../controllers/debug/config-debug.controller';

const router = Router();

// 🔐 PROTECCIÓN: Solo usuarios autenticados pueden acceder a debug de configuración
router.use(authenticateToken);
const configDebugController = new ConfigDebugController();

// Endpoints de diagnóstico de configuración
router.get('/check', configDebugController.checkApiConfigurations.bind(configDebugController));
router.get('/test-creatordb', configDebugController.testCreatorDBConnection.bind(configDebugController));
router.get('/test-openai', configDebugController.testOpenAIConnection.bind(configDebugController));

export default router; 