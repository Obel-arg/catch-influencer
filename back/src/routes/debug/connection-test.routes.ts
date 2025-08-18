import { Router } from 'express';
import { testAllConnections, testSpecificConnection } from '../../controllers/debug/connection-test.controller';

const router = Router();

/**
 * @route GET /api/debug/connections
 * @desc Test all connections (Supabase, Database, Redis, APIs, Environment)
 * @access Public (for development)
 */
router.get('/connections', testAllConnections);

/**
 * @route GET /api/debug/connections/:service
 * @desc Test specific connection
 * @access Public (for development)
 */
router.get('/connections/:service', testSpecificConnection);

export default router;
