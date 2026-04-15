import * as dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import reviewRoutes from './routes/reviewRoutes.js';
import agentRoutes from './routes/agentRoutes.js';
import { errorHandler } from './middlewares/errorHandler.js';

const app = express();

// Global Middlewares
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/reviews', reviewRoutes);
app.use('/api/agents', agentRoutes);

// Centralized error handler
app.use(errorHandler);

export default app;
