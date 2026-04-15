import express from 'express';
import { triggerProspecting, triggerDealIntelligence } from '../controllers/agentController.js';

const router = express.Router();

router.post('/run-prospecting', triggerProspecting);
router.post('/run-deal-intelligence', triggerDealIntelligence);

export default router;
