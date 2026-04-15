import { runProspectingAgent } from '../services/agents/ProspectingAgent.js';
import { runDealIntelligenceAgent } from '../services/agents/DealIntelligenceAgent.js';

export const triggerProspecting = async (req, res, next) => {
    if (!process.env.GEMINI_API_KEY) return res.status(400).json({ error: { message: "Missing GEMINI_API_KEY in .env" } });
    try {
        console.log("\n-> Executing Prospecting Agent via API...");
        const { demoEmail } = req.body;
        const result = await runProspectingAgent(demoEmail);
        res.json({ success: true, result });
    } catch (err) {
        next(err);
    }
};

export const triggerDealIntelligence = async (req, res, next) => {
    if (!process.env.GEMINI_API_KEY) return res.status(400).json({ error: { message: "Missing GEMINI_API_KEY in .env" } });
    try {
        console.log("\n-> Executing Deal Intelligence Agent via API...");
        const { demoEmail } = req.body;
        const result = await runDealIntelligenceAgent(demoEmail);
        res.json({ success: true, result });
    } catch (err) {
        next(err);
    }
};
