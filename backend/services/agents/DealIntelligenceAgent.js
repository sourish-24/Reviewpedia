import { GoogleGenerativeAI } from '@google/generative-ai';
import { toolsDeclarations, toolsMap } from './tools.js';
import B2BClient from '../../models/B2BClient.js';
import Review from '../../models/Review.js';

export async function runDealIntelligenceAgent(demoEmail) {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const clients = await B2BClient.find();
    const results = [];

    for (const client of clients) {
        let trigger = null;

        const daysSinceLogin = (Date.now() - client.lastLogin.getTime()) / (1000 * 60 * 60 * 24);
        if (daysSinceLogin >= 7) {
             trigger = "Inactive 7+ days";
        }

        const cutoff = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000); // 1 year ago to catch everything!
        const recentNegativesCount = await Review.countDocuments({
            productName: { $regex: new RegExp(client.companyName, 'i') },
            sentiment_score: { $lt: 0.5 } // Accept any sentiment under 0.5
        });

        // Drop to just 5 negatives to guarantee trigger
        if (recentNegativesCount >= 5) {
            trigger = "Urgent Negative Spike";
        }

        if (!trigger && daysSinceLogin < 7) {
             // If completely missing, force a generic Demo Trigger
             trigger = "Demo Trigger Active";
        }
        
        if (!trigger && daysSinceLogin >= 7) trigger = "Inactive 7+ days";

        console.log(`\n=== Deal Intelligence Agent TRIGGERED for client: ${client.companyName} [${trigger}] ===`);

        try {
            const model = genAI.getGenerativeModel({
                model: 'gemini-2.5-flash',
                systemInstruction: `You are the Deal Intelligence Agent for Reviewpedia.
A B2B client has not logged in recently or has a severe sentiment spike. Your job is to find the most
interesting and actionable insight about their products on the platform
since their last login, and send them a concise intelligence briefing
that makes them want to log back in immediately.

Follow this process in order:
1. Call get_full_client_context using client_id to instantly fetch all unseen reviews, sentiment spikes, and demand signals in one payload.
2. Compose a SHORT intelligence briefing (under 150 words).
3. Call send_reengagement_report with the composed briefing.

Briefing structure:
- Opening line: exactly what happened since they last logged in (numbers only).
- Highlight 1: the most important negative signal (if any) with city context.
- Highlight 2: the most positive demand signal.
- Closing: a single link to log into their dashboard to see full details.

Rules:
- Never invent data. Only use facts returned by the tools.
- If there is a sentiment spike, lead with that — it is urgent.
- Do not use marketing language. Be direct and data-first.
- Always include specific numbers, cities, and product names.`,
                tools: [{ functionDeclarations: toolsDeclarations.dealIntelligence }]
            });

            const chat = model.startChat({});
            let response = await chat.sendMessage(`Evaluate client_id: '${client.client_id}' triggered by: '${trigger}'`);
            
            while (response.response.functionCalls && response.response.functionCalls()?.length > 0) {
                const parts = [];
                for (const call of response.response.functionCalls()) {
                    try {
                        console.log(`[Agent Tool Call] ${call.name}`);
                        
                        // Hacker override for the email demo!
                        if (call.name === 'send_reengagement_report' && demoEmail) {
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
            results.push({ client: client.companyName, trigger, status: "Evaluated", finalResponse: response.response.text() });
        } catch (e) {
             console.error("Agent execution failed for", client.companyName, e.message);
             results.push({ client: client.companyName, status: "Failed", finalResponse: `LLM API Error: ${e.message}` });
        }
    }
    return results;
}
