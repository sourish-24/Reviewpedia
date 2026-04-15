import mongoose from 'mongoose';

const MediaSchema = new mongoose.Schema({
  type: { type: String, default: 'image' },
  url: { type: String }
}, { _id: false });

const ReviewSchema = new mongoose.Schema({
  product: {
    name: { type: String, required: true },
    category: { type: String }
  },
  review: {
    title: { type: String },
    text: { type: String },
    rating: { type: Number, required: true },
    media: [MediaSchema]
  },
  user: {
    name: { type: String }
  },
  source: {
    platform: { type: String },
    isScraped: { type: Boolean, default: false }
  },
  location: {
    city: { type: String },
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
    h3Index: { type: String, required: true }
  },
  metadata: {
    date: { type: String }
  },
  analytics: {
    sentimentScore: { type: Number, default: 0 },
    trustScore: { type: Number, default: 0 },
    demandSignals: { type: Number, default: 0 }
  }
});

ReviewSchema.index({ "product.name": "text", "review.text": "text", "review.title": "text", "location.city": "text" });

const Review = mongoose.model('Review', ReviewSchema);
export default Review;
