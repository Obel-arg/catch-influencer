import { Router } from 'express';
import { PaymentController } from '../../controllers/payment/payment.controller';
import { authenticateToken } from '../../middleware/auth';

const router = Router();
const paymentController = new PaymentController();

// Rutas protegidas que requieren autenticación
router.use(authenticateToken);

// Rutas básicas CRUD
router.post('/', paymentController.createPayment.bind(paymentController));
router.get('/:id', paymentController.getPaymentById.bind(paymentController));
router.put('/:id', paymentController.updatePayment.bind(paymentController));
router.delete('/:id', paymentController.deletePayment.bind(paymentController));

// Rutas de consulta
router.get('/user', paymentController.getPaymentsByUser.bind(paymentController));
router.get('/organization/:organizationId', paymentController.getPaymentsByOrganization.bind(paymentController));
router.get('/campaign/:campaignId', paymentController.getPaymentsByCampaign.bind(paymentController));
router.get('/status/:status', paymentController.getPaymentsByStatus.bind(paymentController));
router.get('/type/:type', paymentController.getPaymentsByType.bind(paymentController));
router.get('/method/:method', paymentController.getPaymentsByMethod.bind(paymentController));
router.get('/date-range', paymentController.getPaymentsByDateRange.bind(paymentController));

// Rutas de resumen
router.get('/summary/:organizationId', paymentController.getPaymentSummary.bind(paymentController));

export default router; 