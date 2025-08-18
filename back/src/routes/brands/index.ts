import { Router } from 'express';
import { BrandController } from '../../controllers/brands';
import { authenticateToken } from '../../middleware/auth';

const router = Router();
const brandController = new BrandController();

// Rutas protegidas que requieren autenticación
router.use(authenticateToken);

// Rutas principales de marcas
router.post('/', brandController.createBrand.bind(brandController));
router.get('/', brandController.getBrands.bind(brandController));
router.get('/search', brandController.searchBrands.bind(brandController));
router.get('/industries', brandController.getIndustries.bind(brandController));
router.get('/countries', brandController.getCountries.bind(brandController));
router.get('/industry/:industry', brandController.getBrandsByIndustry.bind(brandController));
router.get('/country/:country', brandController.getBrandsByCountry.bind(brandController));
router.get('/size/:size', brandController.getBrandsBySize.bind(brandController));
router.get('/status/:status', brandController.getBrandsByStatus.bind(brandController));
router.get('/:id', brandController.getBrandById.bind(brandController));
router.put('/:id', brandController.updateBrand.bind(brandController));
router.patch('/:id/status', brandController.changeBrandStatus.bind(brandController));
router.delete('/:id', brandController.deleteBrand.bind(brandController));

// Rutas de estadísticas
router.get('/:id/stats', brandController.getBrandStats.bind(brandController));

// Rutas de campañas asociadas a marcas
router.get('/:id/campaigns', brandController.getBrandCampaigns.bind(brandController));
router.post('/campaigns', brandController.associateBrandWithCampaign.bind(brandController));
router.put('/campaigns/:brandCampaignId', brandController.updateBrandCampaign.bind(brandController));
router.delete('/campaigns/:brandCampaignId', brandController.dissociateBrandFromCampaign.bind(brandController));

export default router; 