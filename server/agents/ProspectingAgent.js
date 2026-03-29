import { GoogleGenerativeAI } from '@google/generative-ai';
import { toolsDeclarations, toolsMap } from './tools.js';
import Review from '../models/Review.js';
import B2BClient from '../models/B2BClient.js';
import OutreachLog from '../models/OutreachLog.js';

export async function runProspectingAgent(demoEmail) {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    
    const aggregatedBrands = await Review.aggregate([
        { $group: { 
            _id: { $arrayElemAt: [{ $split: ["$productName", " "] }, 0] },
            totalReviews: { $sum: 1 },
            uniqueReviewers: { $addToSet: "$reviewer" }
          }
        },
        { $project: {
            brandName: "$_id",
            totalReviews: 1,
            reviewerCount: { $size: "$uniqueReviewers" }
        }}
    ]);

    // Relaxed for hackathon demo so it always triggers consistently
    const qualifiedBrands = aggregatedBrands.filter(b => b.totalReviews >= 10 && b.reviewerCount >= 1);
    const results = [];

    for (const b of qualifiedBrands) {
        const brandName = b.brandName;
        
        const isClient = await B2BClient.findOne({ companyName: { $regex: new RegExp(brandName, 'i') } });
        if (isClient) continue;

        // Skip the 14 day check for demo purposes so it always runs when we smash the button!
        // (Just uncomment in production!)
        /*const log = await OutreachLog.findOne({ brandName: { $regex: new RegExp(brandName, 'i') } }).sort({ date: -1 });
        if (log) {
            const daysSince = (Date.now() - log.date.getTime()) / (1000 * 60 * 60 * 24);
            if (daysSince < 14) continue;
        }*/

        console.log(`\n=== Prospecting Agent TRIGGERED for brand: ${brandName} ===`);

        try {
            const model = genAI.getGenerativeModel({
                model: 'gemini-2.5-flash',
                systemInstruction: `You are the Prospecting Agent for Reviewpedia, a hyperlocal product review platform.
Your job is to research a brand, understand their presence on Reviewpedia,
and send them a personalized outreach email that demonstrates the value of
Reviewpedia's B2B intelligence product.

Follow this process in order:
1. Call get_full_brand_context to instantly retrieve all platform reviews, location hex data, and contact info in one structured payload.
2. If the tool says they were contacted in the last 14 days, STOP.
3. Compose a highly personalized email under 150 words using ONLY the statistics fetched.
4. The email MUST include: specific total review count, specific top cities, specific complaints/praises, and a clear call to action.
5. Call send_outreach_email with the composed email.

Rules:
- Never invent data. Only use facts returned by the tools.
- Keep the email under 150 words. Be specific, not generic.
- Subject line must mention the brand name and a specific data point.
- Always sign off as: The Reviewpedia Intelligence Team`,
                tools: [{ functionDeclarations: toolsDeclarations.prospecting }]
            });

            const chat = model.startChat({});
            let response = await chat.sendMessage(`Begin prospecting flow for brand: ${brandName}`);
            
            while (response.response.functionCalls && response.response.functionCalls()?.length > 0) {
                const parts = [];
                for (const call of response.response.functionCalls()) {
                    try {
                        console.log(`[Agent Tool Call] ${call.name}`);
                        
                        // Hacker override for the email demo!
                        if (call.name === 'send_outreach_email' && demoEmail) {
                            call.args.to_email = demoEmail;
                            console.log(`[Demo Override] Rerouted email directly to: ${demoEmail}`);
                        }

                        const rawResult = await toolsMap[call.name](call.args);
                        const safeResult = (rawResult && typeof rawResult === 'object' && !Array.isArray(rawResult)) ? rawResult : { output: rawResult };
                        parts.push({
                            functionResponse: {
                                name: call.name,
                                response: safeResult
                            }
                        });
                    } catch (e) {
                         parts.push({
                            functionResponse: {
                                name: call.name,
                                response: { error: e.message }
                            }
                        });
                    }
                }
                response = await chat.sendMessage(parts);
            }
            results.push({ brand: brandName, status: "Evaluated", finalResponse: response.response.text() });
        } catch (e) {
            console.error("Agent execution failed for", brandName, e.message);
            results.push({ brand: brandName, status: "Failed", finalResponse: `LLM API Error: ${e.message}` });
        }
    }
    return results;
}
