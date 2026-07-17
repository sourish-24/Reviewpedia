import 'dotenv/config';
import http from 'http';
import { Server } from 'socket.io';
import app from './app.js';
import { connectToDb } from './db/connect.js';
import mongoose from 'mongoose';

const PORT = process.env.PORT || 3001;

const start = async () => {
    try {
        await connectToDb();
        
        const server = http.createServer(app);
        
        // Initialize Socket.io
        const io = new Server(server, {
            cors: {
                origin: ['http://localhost:5173', process.env.FRONTEND_URL],
                methods: ['GET', 'POST'],
                credentials: true
            }
        });

        // Store io instance in app so controllers can access it
        app.set('io', io);

        // Socket connection logic
        io.on('connection', (socket) => {
            console.log('New client connected:', socket.id);

            // User joins a room named after their User ID
            socket.on('join', (userId) => {
                socket.join(userId);
                console.log(`User ${userId} joined their personal room`);
            });

            socket.on('disconnect', () => {
                console.log('Client disconnected:', socket.id);
            });
        });
        
        server.listen(PORT, () => {
            console.log(`API Server running on port ${PORT}`);
        });

        // Graceful shutdown
        process.on('SIGINT', async () => {
            await mongoose.disconnect();
            console.log('MongoDB disconnected on app termination');
            process.exit(0);
        });

    } catch (error) {
        console.error("Failed to start the server:", error);
        process.exit(1);
    }
};

start();
