import { Router } from 'express';
import { AuthController } from '../../controllers/auth/index';
import { UserController } from '../../controllers/user';
import { authenticateToken } from '../../middleware/auth';

const router = Router();
const authController = new AuthController();
const userController = new UserController();

// Rutas públicas
router.post('/register', authController.register.bind(authController));
router.post('/login', authController.login.bind(authController));
router.post('/refresh', authController.refresh.bind(authController));

// Rutas de Google OAuth
router.get('/google', authController.googleAuth.bind(authController));
router.get('/google/callback', authController.googleCallback.bind(authController));
router.get('/google/url', authController.googleAuthJson.bind(authController));

// Rutas protegidas
router.get('/me', authenticateToken, authController.me.bind(authController));
router.put('/profile', authenticateToken, userController.updateUser.bind(userController));
router.put('/users/profile', authenticateToken, userController.updateUser.bind(userController));

// Rutas de debug (solo para desarrollo)
if (process.env.NODE_ENV === 'development') {
  router.get('/debug/user/:userId', authController.debugUser.bind(authController));
  router.get('/debug/config', authController.debugConfig.bind(authController));
  router.get('/debug/consistency', authController.debugUserConsistency.bind(authController));
  router.get('/test', authenticateToken, authController.testAuth.bind(authController));
}

export default router; 