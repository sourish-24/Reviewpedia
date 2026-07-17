import { GoogleGenerativeAI } from '@google/generative-ai';

export const runHexagonSummaryAgent = async (reviews) => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) throw new Error("GEMINI_API_KEY is missing");

    const genAI = new GoogleGenerativeAI(apiKey);

    // Prepare the data payload
    const reviewsText = reviews.map(r => `[Rating: ${r.rating}/5] ${r.text}`).join('\n');

    const prompt = `You are an expert geospatial market researcher analyzing a specific geographic cluster of consumer reviews.
Your goal is to provide a concise, high-impact summary of the consumer sentiment in this area.

Raw Review Data:
${reviewsText}

Instructions:
1. Read through the reviews and identify the primary praises and the primary complaints.
2. Provide a 2-3 sentence summary that captures the overall sentiment and key takeaways.
3. Do not mention individual review ratings, just summarize the themes.
4. Keep the tone professional, objective, and analytical.`;

    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    const result = await model.generateContent(prompt);
    return result.response.text();
};
