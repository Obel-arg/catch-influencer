import { Router } from 'express';
import { UserBrandController } from '../../controllers/user-brand';
import { authenticateToken } from '../../middleware/auth';

const router = Router();
const userBrandController = new UserBrandController();

// All routes require authentication
router.use(authenticateToken);

// Current user's brands
router.get('/me/brands/:organizationId', userBrandController.getMyBrands.bind(userBrandController));

// User brand management (admin only)
router.get('/organizations/:organizationId/users/:userId/brands', userBrandController.getUserBrands.bind(userBrandController));
router.put('/organizations/:organizationId/users/:userId/brands', userBrandController.updateUserBrands.bind(userBrandController));
router.post('/organizations/:organizationId/users/:userId/brands', userBrandController.assignBrandsToUser.bind(userBrandController));

// Brand users (admin only)
router.get('/organizations/:organizationId/brands/:brandId/users', userBrandController.getBrandUsers.bind(userBrandController));

export default router;
