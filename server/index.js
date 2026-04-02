import * as dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import Review from './models/Review.js';
import B2BClient from './models/B2BClient.js';
import OutreachLog from './models/OutreachLog.js';
import { generateMockReviews } from '../src/utils/mockData.js';
import { runProspectingAgent } from './agents/ProspectingAgent.js';
import { runDealIntelligenceAgent } from './agents/DealIntelligenceAgent.js';

const app = express();
app.use(cors());
app.use(express.json());

let mongoServer;

const startServer = async () => {
  try {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    
    await mongoose.connect(uri);
    console.log(`Connected to In-Memory MongoDB at ${uri}`);

    await Review.init();

    const count = await Review.countDocuments();
    if (count === 0) {
      console.log("Seeding database with initial platform data for AI Agents...");
      
      const generalData = generateMockReviews(28.7041, 77.1025, 30);
      let processed = generalData.map(({ id, ...rest }) => ({
          ...rest,
          sentiment_score: Math.random(),
          demandSignals: Math.floor(Math.random() * 5),
          h3Index: "883da164ebfffff",
          city: "Delhi"
      }));

      // Platform Target 1: "boAt" (Prospecting Agent Target: >50 reviews, not client)
      const boatReviews = generateMockReviews(18.5204, 73.8567, 15).map(({ id, ...rest }) => ({
        ...rest,
        productName: "boAt Airdopes 141",
        category: "Audio",
        platform: "Amazon",
        summary: "Sound quality is great but charging cable sucks.",
        reviewer: "LocalUserPune" + Math.floor(Math.random() * 99),
        sentiment_score: 0.6,
        demandSignals: 4,
        h3Index: "8860144005fffff", // Pune h3 simulated
        city: "Pune"
      }));

      // Platform Target 2: "Noise" (Deal Intelligence Target: Client inactive >7 days, sentiment spike)
      const noiseReviews = generateMockReviews(12.9716, 77.5946, 10).map(({ id, ...rest }) => ({
        ...rest,
        productName: "Noise ColorFit Pro 4",
        category: "Wearables",
        platform: "Flipkart",
        summary: "Strap breaking after 2 weeks, terrible quality.",
        reviewer: "LocalUserBlr" + Math.floor(Math.random() * 99),
        sentiment_score: 0.2, // Very negative
        demandSignals: 6,
        h3Index: "8861892589fffff", // Bangalore h3 simulated
        city: "Bengaluru",
        date: new Date().toISOString() // Marked as very recent
      }));

      const noiseClient = new B2BClient({
          client_id: "noise_123",
          companyName: "Noise",
          contactEmail: "founder@gonoise.com",
          primaryCategories: ["Wearables"],
          primaryCities: ["Bengaluru", "Delhi"],
          lastLogin: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000) // 9 days ago
      });
      await noiseClient.save();

      // Target 3: "Mamaearth" (Deal Intelligence Target: Client inactive > 10 days, dropping sentiment)
      const mamaearthReviews = generateMockReviews(19.0760, 72.8777, 12).map(({ id, ...rest }) => ({
        ...rest,
        productName: "Mamaearth Onion Shampoo",
        category: "Beauty",
        platform: "Nykaa",
        summary: "Caused more hairfall than before and smells like chemicals.",
        reviewer: "Mumbaikar" + Math.floor(Math.random() * 99),
        sentiment_score: 0.15,
        rating: Math.floor(Math.random() * 2) + 1,
        demandSignals: 5,
        h3Index: "8860144005fffff", // Mumbai simulated
        city: "Mumbai",
        date: new Date().toISOString()
      }));

      const mamaClient = new B2BClient({
          client_id: "mama_789",
          companyName: "Mamaearth",
          contactEmail: "retention@mamaearth.in",
          primaryCategories: ["Beauty", "Personal Care"],
          primaryCities: ["Mumbai", "Delhi"],
          lastLogin: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000) // 14 days ago
      });
      await mamaClient.save();

      // Target 4: "Mokobara" (Prospecting Target: High volume, high sentiment, not a client)
      const mokobaraReviews = generateMockReviews(12.9716, 77.5946, 18).map(({ id, ...rest }) => ({
        ...rest,
        productName: "Mokobara Transit Backpack",
        category: "Luggage",
        platform: "Myntra",
        summary: "Absolutely stunning design and so much space for my laptop. Best purchase.",
        reviewer: "TechBroBLR" + Math.floor(Math.random() * 99),
        sentiment_score: 0.9,
        rating: 5,
        demandSignals: 7,
        h3Index: "8861892589fffff",
        city: "Bengaluru"
      }));

      // Target 5: "Samsung" (Deal Intelligence Target: Client active, huge volume, looking good)
      const samsungReviews = generateMockReviews(28.7041, 77.1025, 20).map(({ id, ...rest }) => ({
        ...rest,
        productName: "Samsung Galaxy S24",
        category: "Electronics",
        platform: "Amazon",
        summary: "Display is amazing and AI features are actually useful.",
        reviewer: "DelhiGeek" + Math.floor(Math.random() * 99),
        sentiment_score: 0.85,
        rating: Math.floor(Math.random() * 2) + 4, // 4-5
        demandSignals: 9,
        h3Index: "883da164ebfffff",
        city: "Delhi"
      }));
      
      const samsungClient = new B2BClient({
          client_id: "sam_999",
          companyName: "Samsung India",
          contactEmail: "vp.sales@samsung.com",
          primaryCategories: ["Electronics"],
          primaryCities: ["Delhi", "Mumbai", "Bengaluru"],
          lastLogin: new Date() // Active today
      });
      await samsungClient.save();
      
      processed = processed.concat(boatReviews).concat(noiseReviews).concat(mamaearthReviews).concat(mokobaraReviews).concat(samsungReviews);
      await Review.insertMany(processed);
      console.log(`Successfully seeded DB: ${processed.length} reviews, 3 B2BClients.`);
    }

    // --- AI Sales Agent Endpoints ---
    app.post('/api/agents/run-prospecting', async (req, res) => {
        if (!process.env.GEMINI_API_KEY) return res.status(400).json({ error: "Missing GEMINI_API_KEY in .env" });
        try {
            console.log("\n-> Executing Prospecting Agent via API...");
            const { demoEmail } = req.body;
            const result = await runProspectingAgent(demoEmail);
            res.json({ success: true, result });
        } catch(e) {
            console.error(e);
            res.status(500).json({ error: e.message });
        }
    });

    app.post('/api/agents/run-deal-intelligence', async (req, res) => {
        if (!process.env.GEMINI_API_KEY) return res.status(400).json({ error: "Missing GEMINI_API_KEY in .env" });
        try {
            console.log("\n-> Executing Deal Intelligence Agent via API...");
            const { demoEmail } = req.body;
            const result = await runDealIntelligenceAgent(demoEmail);
            res.json({ success: true, result });
        } catch(e) {
            console.error(e);
            res.status(500).json({ error: e.message });
        }
    });

    // --- Standard Frontend Endpoints ---
    app.get('/api/reviews', async (req, res) => {
      try {
        const search = req.query.search;
        let filter = {};
        if (search && search.trim() !== '') {
          filter = { $text: { $search: search } };
        }
        const reviews = await Review.find(filter).limit(500);
        const normalized = reviews.map(r => ({ ...r.toObject(), id: r._id.toString() }));
        res.json(normalized);
      } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server Error" });
      }
    });

    app.post('/api/reviews', async (req, res) => {
      try {
        const newReview = new Review({
           ...req.body,
           reviewer: req.body.reviewer || 'LocalUser' + Math.floor(Math.random() * 999),
           trustScore: req.body.trustScore || Math.floor(Math.random() * 40) + 60,
           date: new Date().toISOString().split('T')[0]
        });
        await newReview.save();
        
        const rObj = newReview.toObject();
        rObj.id = rObj._id.toString();
        
        res.status(201).json(rObj);
      } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to create review", details: err.message });
      }
    });

    const PORT = process.env.PORT || 3001;
    app.listen(PORT, () => {
      console.log(`API Server running on port ${PORT}`);
    });
  } catch(e) {
      console.error(e);
      process.exit(1);
  }
};

process.on('SIGINT', async () => {
    if (mongoServer) {
        await mongoose.disconnect();
        await mongoServer.stop();
    }
    process.exit(0);
});

startServer().catch(console.error);
