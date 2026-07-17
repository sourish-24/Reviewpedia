import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import reviewRoutes from './routes/reviewRoutes.js';
import agentRoutes from './routes/agentRoutes.js';
import authRoutes from './routes/authRoutes.js';
import chatRoutes from './routes/chatRoutes.js';
import { errorHandler } from './middlewares/errorHandler.js';
import cookieParser from 'cookie-parser';

const app = express();

// Global Middlewares
app.use(cors({
    origin: ['http://localhost:5173', process.env.FRONTEND_URL],
    credentials: true
}));
app.use(express.json());
app.use(cookieParser());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/agents', agentRoutes);
app.use('/api/chat', chatRoutes);

// Centralized error handler
app.use(errorHandler);

export default app;
