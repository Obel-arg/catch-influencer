import { Router } from "express";
import { AgentAudienceController } from "../../controllers/audience/agent-audience.controller";

const router = Router();
const agentAudienceController = new AgentAudienceController();

// GET /agent-audience?instagramUrl=<<url>>
router.get(
  "/agent-audience",
  agentAudienceController.analyzeAudience.bind(agentAudienceController)
);

export default router;
