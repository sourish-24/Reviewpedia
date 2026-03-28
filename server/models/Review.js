import mongoose from 'mongoose';

const ReviewSchema = new mongoose.Schema({
  lat: { type: Number, required: true },
  lng: { type: Number, required: true },
  productName: { type: String, required: true },
  category: { type: String, required: true },
  platform: { type: String, required: true },
  rating: { type: Number, required: true },
  summary: { type: String, required: true },
  reviewer: { type: String, required: true },
  trustScore: { type: Number, required: true },
  date: { type: String, required: true }
});

// Create a text index on productName, summary, and category for full-text search
ReviewSchema.index({ productName: 'text', summary: 'text', category: 'text' });

export default mongoose.model('Review', ReviewSchema);
