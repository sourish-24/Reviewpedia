import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import Review from './models/Review.js';
import { generateMockReviews } from '../src/utils/mockData.js';

const app = express();
app.use(cors());
app.use(express.json());

let mongoServer;

const startServer = async () => {
  try {
    // 1. Spin up MongoDB Memory Server
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    
    // 2. Connect Mongoose
    await mongoose.connect(uri);
    console.log(`Connected to In-Memory MongoDB at ${uri}`);

    // Wait for indexes to build
    await Review.init();

    // 3. Seed Database with Initial Dummy Data
    const count = await Review.countDocuments();
    if (count === 0) {
      console.log("Seeding database with initial dummy reviews...");
      const mockData = generateMockReviews(28.7041, 77.1025, 300);
      let processed = mockData.map(({ id, ...rest }) => rest);

      // Explicitly inject a cluster of 5 reviews right at the default map center
      const forcedCluster = [];
      for (let i = 1; i <= 5; i++) {
        forcedCluster.push({
          lat: 28.7041, lng: 77.1025,
          productName: `Test Product ${i}`,
          category: `Electronics`,
          platform: `Local Shop`,
          rating: 4 + (i % 2),
          summary: `This is explicitly clustered review #${i} at exactly the map center.`,
          reviewer: `DemoUser${i}`,
          trustScore: 80 + i,
          date: new Date().toISOString().split('T')[0]
        });
      }
      
      processed = processed.concat(forcedCluster);
      await Review.insertMany(processed);
      console.log(`Inserted ${processed.length} dummy reviews.`);

      // Give it extra reviews specifically tailored to "cars" so the search behaves well.
      const carReviews = generateMockReviews(28.72, 77.12, 10).map(({ id, ...rest }) => ({
        ...rest,
        productName: "Honda City Cover",
        category: "Automotive",
        summary: "These cars accessories are phenomenal, specifically for the swift and city models."
      }));
       await Review.insertMany(carReviews);
    }

    // Routes
    app.get('/api/reviews', async (req, res) => {
      try {
        const search = req.query.search;
        let filter = {};

        if (search && search.trim() !== '') {
          // MongoDB Native Text Search
          filter = { $text: { $search: search } };
        }

        const reviews = await Review.find(filter).limit(500);
        // Map _id strictly to string for frontend compatibility since mock data used 'id'
        const normalized = reviews.map(r => ({
          ...r.toObject(),
          id: r._id.toString()
        }));
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
