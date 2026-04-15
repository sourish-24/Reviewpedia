import http from 'http';
import app from './app.js';
import { connectToDb } from './db/connect.js';
import mongoose from 'mongoose';

const PORT = process.env.PORT || 3001;

const start = async () => {
    try {
        await connectToDb();
        
        const server = http.createServer(app);
        
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
