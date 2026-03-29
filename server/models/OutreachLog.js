import mongoose from 'mongoose';

const OutreachLogSchema = new mongoose.Schema({
  brandName: { type: String, required: true },
  email: { type: String, required: true },
  subject: { type: String, required: true },
  body: { type: String, required: true },
  status: { type: String, required: true },
  date: { type: Date, default: Date.now }
});

export default mongoose.model('OutreachLog', OutreachLogSchema);
