import * as dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import Review from './server/models/Review.js';
import B2BClient from './server/models/B2BClient.js';
import OutreachLog from './server/models/OutreachLog.js';
import { generateMockReviews } from './src/utils/mockData.js';

import { runDealIntelligenceAgent } from './server/agents/DealIntelligenceAgent.js';
import { runProspectingAgent } from './server/agents/ProspectingAgent.js';

let mongoServer;

async function run() {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    await mongoose.connect(uri);

    const boatReviews = generateMockReviews(18.5204, 73.8567, 55).map(({ id, ...rest }) => ({
        ...rest,
        productName: "boAt Airdopes 141",
        category: "Audio",
        platform: "Amazon",
        summary: "Sound quality is great but charging cable sucks.",
        reviewer: "LocalUserPune" + Math.floor(Math.random() * 99),
        sentiment_score: 0.6,
        demandSignals: 4,
        h3Index: "8860144005fffff",
        city: "Pune"
      }));

      const noiseReviews = generateMockReviews(12.9716, 77.5946, 25).map(({ id, ...rest }) => ({
        ...rest,
        productName: "Noise ColorFit Pro 4",
        category: "Wearables",
        platform: "Flipkart",
        summary: "Strap breaking after 2 weeks, terrible quality.",
        reviewer: "LocalUserBlr" + Math.floor(Math.random() * 99),
        sentiment_score: 0.2,
        demandSignals: 6,
        h3Index: "8861892589fffff",
        city: "Bengaluru",
        date: new Date().toISOString()
      }));

      const noiseClient = new B2BClient({
          client_id: "noise_123",
          companyName: "Noise",
          contactEmail: "founder@gonoise.com",
          primaryCategories: ["Wearables"],
          primaryCities: ["Bengaluru", "Delhi"],
          lastLogin: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000)
      });

      await noiseClient.save();
      await Review.insertMany(boatReviews.concat(noiseReviews));

      console.log("Data Seeded.");

      console.log("Testing Prospecting...");
      try {
        const prosResult = await runProspectingAgent("test@test.com");
        console.log("Prospecting result length:", prosResult.length);
      } catch (e) { console.error(e) }

      console.log("Testing Deal...");
      try {
        const dealResult = await runDealIntelligenceAgent("test@test.com");
        console.log("Deal result length:", dealResult.length);
      } catch (e) { console.error(e) }

    process.exit(0);
}

run();
