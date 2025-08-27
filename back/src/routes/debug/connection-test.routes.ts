import { Router } from 'express';
import { authenticateToken } from '../../middleware/auth';
import { testAllConnections, testSpecificConnection } from '../../controllers/debug/connection-test.controller';

const router = Router();

// 🔐 PROTECCIÓN: Solo usuarios autenticados pueden acceder a información de debug
router.use(authenticateToken);

/**
 * @route GET /api/debug/connections
 * @desc Test all connections (Supabase, Database, Redis, APIs, Environment)
 * @access Private (authenticated users only)
 */
router.get('/connections', testAllConnections);

/**
 * @route GET /api/debug/connections/:service
 * @desc Test specific connection
 * @access Private (authenticated users only)
 */
router.get('/connections/:service', testSpecificConnection);

export default router;
