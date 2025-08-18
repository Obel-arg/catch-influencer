import { Router } from 'express';
import { UserController } from '../../controllers/user';
import { authenticateToken } from '../../middleware/auth';

const router = Router();
const userController = new UserController();

// Rutas públicas
router.post('/', userController.createUser.bind(userController));

// Rutas protegidas que requieren autenticación
router.use(authenticateToken);

// Rutas de perfil de usuario
router.get('/profile', userController.getUserById.bind(userController));
router.put('/profile', userController.updateUser.bind(userController));
router.delete('/profile', userController.deleteUser.bind(userController));

// Rutas de preferencias
router.get('/preferences', userController.getUserPreferences.bind(userController));
router.put('/preferences', userController.updateUserPreferences.bind(userController));

// Rutas de configuración
router.get('/settings', userController.getUserSettings.bind(userController));
router.put('/settings', userController.updateUserSettings.bind(userController));

// Rutas de organizaciones y equipos
router.get('/organizations', userController.getUserOrganizations.bind(userController));
router.get('/teams', userController.getUserTeams.bind(userController));

export default router; 