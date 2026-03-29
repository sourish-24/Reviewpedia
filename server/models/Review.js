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
  date: { type: String, required: true },
  // Hackathon Agent Fields
  sentiment_score: { type: Number, default: 0.8 },
  demandSignals: { type: Number, default: 0 },
  h3Index: { type: String, default: "" },
  city: { type: String, default: "Unknown" }
});

// Create a text index on productName, summary, and category for full-text search
ReviewSchema.index({ productName: 'text', summary: 'text', category: 'text' });

export default mongoose.model('Review', ReviewSchema);
