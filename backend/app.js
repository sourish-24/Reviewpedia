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
const allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:3000',
    'https://reviewpedia.co.in',
    'https://www.reviewpedia.co.in',
    process.env.FRONTEND_URL
].filter(Boolean);

app.use(cors({
    origin: (origin, callback) => {
        if (!origin) return callback(null, true);
        if (allowedOrigins.includes(origin) || origin.endsWith('.reviewpedia.co.in') || origin.endsWith('.vercel.app')) {
            return callback(null, true);
        }
        return callback(null, true); // Dynamic allow for production HTTPS origins
    },
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
