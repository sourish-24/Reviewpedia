import mongoose from 'mongoose';

const CommentSchema = new mongoose.Schema({
  user: {
    id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    name: { type: String, required: true },
    profilePic: { type: String, default: '' }
  },
  text: { type: String, required: true, trim: true },
  parentId: { type: String, default: null },
  likes: { type: [String], default: [] },
  createdAt: { type: Date, default: Date.now }
});

const SnippetSchema = new mongoose.Schema({
  videoUrl: {
    type: String,
    required: true
  },
  thumbnailUrl: {
    type: String,
    default: ''
  },
  duration: {
    type: Number,
    default: 0
  },
  product: {
    name: { type: String, required: true, trim: true },
    brand: { type: String, default: '', trim: true },
    category: { type: String, default: 'General' },
    rating: { type: Number, required: true, min: 1, max: 5 },
    purchaseLink: { type: String, default: '', trim: true }
  },
  caption: {
    type: String,
    default: '',
    trim: true
  },
  user: {
    id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true },
    profilePic: { type: String, default: '' }
  },
  likes: {
    type: [String],
    default: []
  },
  views: {
    type: Number,
    default: 0
  },
  comments: [CommentSchema]
}, { timestamps: true });

SnippetSchema.index({ "product.name": "text", "product.brand": "text", "caption": "text" });

const Snippet = mongoose.model('Snippet', SnippetSchema);
export default Snippet;
