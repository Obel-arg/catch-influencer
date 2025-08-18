import { Router } from 'express';
import { imageProxyController } from '../../controllers/proxy/image-proxy.controller';

const router = Router();

// Manejar peticiones OPTIONS (preflight) para CORS
router.options('/', imageProxyController.handleOptions);
router.options('/info', imageProxyController.handleOptions);
router.options('/upload-brand-logo', imageProxyController.handleOptions);
router.options('/brand-logo/:brandName', imageProxyController.handleOptions);

// Ruta principal para obtener la imagen a través del proxy
router.get('/', imageProxyController.getImage);

// Ruta para obtener información de la imagen sin descargarla
router.get('/info', imageProxyController.getImageInfo);

// Rutas específicas para logos de marcas
router.post('/upload-brand-logo', imageProxyController.uploadBrandLogo);
router.get('/brand-logo/:brandName', imageProxyController.getBrandLogo);

export default router; 