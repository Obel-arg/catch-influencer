import { Router } from 'express';
import { TeamController } from '../../controllers/team';
import { authenticateToken } from '../../middleware/auth';

const router = Router();
const teamController = new TeamController();

// Todas las rutas requieren autenticación
router.use(authenticateToken);

// Rutas principales de equipos
router.post('/', teamController.createTeam.bind(teamController));
router.get('/:id', teamController.getTeamById.bind(teamController));
router.get('/organization/:organizationId', teamController.getTeamsByOrganization.bind(teamController));
router.put('/:id', teamController.updateTeam.bind(teamController));
router.delete('/:id', teamController.deleteTeam.bind(teamController));

// Rutas de miembros
router.get('/:teamId/members', teamController.getTeamMembers.bind(teamController));
router.post('/:teamId/members', teamController.addMember.bind(teamController));
router.put('/:teamId/members/:userId', teamController.updateMember.bind(teamController));
router.delete('/:teamId/members/:userId', teamController.removeMember.bind(teamController));

// Rutas de influencers y campañas
router.get('/:teamId/influencers', teamController.getTeamInfluencers.bind(teamController));
router.get('/:teamId/campaigns', teamController.getTeamCampaigns.bind(teamController));

export default router; 