import mongoose from 'mongoose';

const ConversationSchema = new mongoose.Schema({
  participants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }],
  lastMessage: {
    type: String,
    default: ""
  },
  lastMessageAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

// Ensure uniqueness of a conversation between participants (we don't want duplicates)
// Actually, simple sorting before saving could help, but we'll manage uniqueness in controller.

export default mongoose.model('Conversation', ConversationSchema);
