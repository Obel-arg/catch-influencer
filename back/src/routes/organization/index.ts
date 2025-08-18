import { Router } from 'express';
import { OrganizationController } from '../../controllers/organization';
import { authenticateToken } from '../../middleware/auth';

const router = Router();
const organizationController = new OrganizationController();

// Rutas protegidas que requieren autenticación
router.use(authenticateToken);

// Rutas de organizaciones
router.post('/', organizationController.createOrganization.bind(organizationController));
router.get('/', organizationController.getOrganizations.bind(organizationController));
router.get('/:id', organizationController.getOrganizationById.bind(organizationController));
router.put('/:id', organizationController.updateOrganization.bind(organizationController));
router.delete('/:id', organizationController.deleteOrganization.bind(organizationController));

// Rutas de miembros
router.get('/:id/members', organizationController.getOrganizationMembers.bind(organizationController));
router.post('/:id/members', organizationController.addMember.bind(organizationController));
router.delete('/:id/members/:userId', organizationController.removeMember.bind(organizationController));
router.put('/:id/members/:userId/role', organizationController.updateMemberRole.bind(organizationController));
router.put('/:id/members/:userId/name', organizationController.updateMemberName.bind(organizationController));

// Ruta de invitaciones
router.post('/:id/invite', organizationController.inviteUser.bind(organizationController));

export default router; 