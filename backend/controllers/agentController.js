import { runProspectingAgent } from '../services/agents/ProspectingAgent.js';
import { runDealIntelligenceAgent } from '../services/agents/DealIntelligenceAgent.js';
import { runHexagonSummaryAgent } from '../services/agents/HexagonSummaryAgent.js';

export const triggerProspecting = async (req, res, next) => {
    if (!process.env.GEMINI_API_KEY) return res.status(400).json({ error: { message: "Missing GEMINI_API_KEY in .env" } });
    try {
        console.log("\n-> Executing Prospecting Agent via API...");
        const { demoEmail } = req.body;
        
        // --- DUMMY EMAIL OVERRIDE REQUESTED BY USER ---
        if (process.env.RESEND_API_KEY) {
            console.log("Firing explicit dummy mail as requested...");
            try {
                await fetch('https://api.resend.com/emails', {
                    method: 'POST',
                    headers: { 'Authorization': `Bearer ${process.env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        from: 'onboarding@resend.dev',
                        to: 'sourishmusib@gmail.com', // Forced due to Resend Sandbox
                        subject: 'Reviewpedia Intelligence: Surge in boAt Consumer Reviews (New Delhi)',
                        html: `
                            <div style="font-family: sans-serif; color: #333; line-height: 1.6;">
                                <p>Hi boAt Team,</p>
                                <p>The Reviewpedia AI Prospecting Agent has detected a significant surge of <strong>2,000+ new verified reviews</strong> for boAt products clustered across the New Delhi metropolitan area over the past 30 days.</p>
                                <p><strong>Key Geospatial Insights:</strong></p>
                                <ul>
                                    <li><strong>Sentiment Shift:</strong> Average rating in Hexagon Cluster 893da164ebfffff has dropped to 3.2/5.</li>
                                    <li><strong>Primary Complaint:</strong> 64% of negative sentiment is directly tied to "charging cable durability" and "syncing issues".</li>
                                    <li><strong>Primary Praise:</strong> "Bass quality" and "battery life" remain dominant positive drivers.</li>
                                </ul>
                                <p>Reviewpedia can help you instantly map these localized complaints to specific vendor batches and prevent churn before it happens.</p>
                                <p>Let us know if you'd like access to the raw data.</p>
                                <p>Best,<br><strong>The Reviewpedia Intelligence Team</strong></p>
                            </div>
                        `
                    })
                });
            } catch (e) {
                console.error("Dummy mail failed:", e);
            }
        }
        // ----------------------------------------------

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

export const triggerHexagonSummary = async (req, res, next) => {
    if (!process.env.GEMINI_API_KEY) return res.status(400).json({ error: { message: "Missing GEMINI_API_KEY in .env" } });
    try {
        console.log("\n-> Executing Hexagon Summary Agent via API...");
        const { reviews } = req.body;
        if (!reviews || !Array.isArray(reviews)) {
            return res.status(400).json({ error: { message: "Invalid reviews array" } });
        }
        
        // Truncate to prevent hitting token limits (max 50 reviews should be enough for a sample)
        const sampleReviews = reviews.slice(0, 50);
        
        const result = await runHexagonSummaryAgent(sampleReviews);
        res.json({ success: true, result });
    } catch (err) {
        next(err);
    }
};
