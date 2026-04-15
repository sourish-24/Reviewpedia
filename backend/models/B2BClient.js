import mongoose from 'mongoose';

const B2BClientSchema = new mongoose.Schema({
  client_id: { type: String, required: true, unique: true },
  companyName: { type: String, required: true },
  contactEmail: { type: String, required: true },
  primaryCategories: [{ type: String }],
  primaryCities: [{ type: String }],
  subscriptionTier: { type: String, default: 'Standard' },
  lastLogin: { type: Date, default: Date.now },
  lastReportSent: { type: Date }
});

export default mongoose.model('B2BClient', B2BClientSchema);
