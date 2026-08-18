import mongoose from 'mongoose';

const historicalEvidenceSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  sourceType: { type: String, enum: ['REPORT', 'TIP', 'OSINT', 'PRIOR_CASE', 'SEED'] },
  relatedVendorIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Vendor' }],
  relatedWallets: [String],
  content: String,
  dateRecorded: { type: Date, default: Date.now },
  dataSource: { type: String, enum: ['LIVE', 'DEMO'], default: 'DEMO' },
}, { timestamps: true });

export default mongoose.model('HistoricalEvidence', historicalEvidenceSchema);
