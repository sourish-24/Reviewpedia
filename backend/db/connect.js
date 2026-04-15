import mongoose from 'mongoose';

export const connectToDb = async () => {
    const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/reviewpedia';
    await mongoose.connect(uri);
    console.log(`Connected to MongoDB at ${uri}`);
};
