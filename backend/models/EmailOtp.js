import mongoose from 'mongoose';

const EmailOtpSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
    index: true
  },
  otp: {
    type: String,
    required: true
  },
  purpose: {
    type: String,
    enum: ['signup', 'email_update', 'forgot_password'],
    required: true
  },
  attempts: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 600 // Auto-deleted by MongoDB after 10 minutes (600 seconds)
  }
});

// Compound index for quick lookup
EmailOtpSchema.index({ email: 1, purpose: 1 });

export default mongoose.model('EmailOtp', EmailOtpSchema);
