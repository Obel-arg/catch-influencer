import { Router } from 'express';
import { authenticateToken } from '../../middleware/auth';
import { DatabaseController, applyMigration } from '../../controllers/database';

const router = Router();
const databaseController = new DatabaseController();

// Rutas protegidas
router.get('/tables', authenticateToken, databaseController.getTables.bind(databaseController));
router.get('/tables/:tableName', authenticateToken, databaseController.getTableData.bind(databaseController));
router.post('/tables/:tableName', authenticateToken, databaseController.createRecord.bind(databaseController));
router.put('/tables/:tableName/:id', authenticateToken, databaseController.updateRecord.bind(databaseController));
router.delete('/tables/:tableName/:id', authenticateToken, databaseController.deleteRecord.bind(databaseController));

router.post('/migrations/:migrationName', applyMigration);

export default router; 