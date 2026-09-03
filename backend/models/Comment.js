import mongoose from 'mongoose';

const CommentSchema = new mongoose.Schema({
  reviewId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Review',
    required: true,
    index: true
  },
  parentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Comment',
    default: null,
    index: true
  },
  user: {
    id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    name: { type: String, required: true },
    profilePic: { type: String }
  },
  text: {
    type: String,
    required: true,
    trim: true
  },
  likes: {
    type: [String],
    default: []
  }
}, {
  timestamps: true
});

const Comment = mongoose.model('Comment', CommentSchema);
export default Comment;
