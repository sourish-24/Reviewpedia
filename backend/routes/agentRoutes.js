import express from 'express';
import { triggerProspecting, triggerDealIntelligence, triggerHexagonSummary } from '../controllers/agentController.js';
import { requireAuth } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/prospecting', requireAuth, triggerProspecting);
router.post('/deal-intelligence', requireAuth, triggerDealIntelligence);
router.post('/hexagon-summary', triggerHexagonSummary);

export default router;
