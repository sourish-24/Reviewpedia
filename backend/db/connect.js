import mongoose from 'mongoose';

export const connectToDb = async () => {
    const uri = process.env.MONGODB_URI;
    if (!uri) {
        throw new Error('MONGODB_URI environment variable is missing.');
    }
    console.log('Connecting to MongoDB Atlas database...');
    await mongoose.connect(uri);
    console.log('Connected to MongoDB Atlas database successfully');
};
