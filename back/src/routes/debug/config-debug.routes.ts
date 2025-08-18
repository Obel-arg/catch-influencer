import { Router } from 'express';
import { ConfigDebugController } from '../../controllers/debug/config-debug.controller';

const router = Router();
const configDebugController = new ConfigDebugController();

// Endpoints de diagnóstico de configuración
router.get('/check', configDebugController.checkApiConfigurations.bind(configDebugController));
router.get('/test-creatordb', configDebugController.testCreatorDBConnection.bind(configDebugController));
router.get('/test-openai', configDebugController.testOpenAIConnection.bind(configDebugController));

export default router; 