import mongoose from 'mongoose';

const leadSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  type: { type: String, enum: ['STYLOMETRY', 'WALLET', 'LISTING', 'CORRELATION', 'BEHAVIOURAL'] },
  status: { type: String, enum: ['PENDING', 'ACCEPTED', 'REJECTED'], default: 'PENDING' },
  priority: { type: Number, min: 0, max: 1, default: 0.5 },
  // References
  vendorIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Vendor' }],
  messageIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Message' }],
  walletAddresses: [String],
  // Evidence
  signals: [{
    type: { type: String },
    score: Number,
    detail: String,
  }],
  correlationScore: Number,
  // Review
  reviewedBy: String,
  reviewedAt: Date,
  rejectionReason: String,
  acceptedIntoCaseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Case' },
  dataSource: { type: String, enum: ['LIVE', 'DEMO'], default: 'DEMO' },
}, { timestamps: true });

export default mongoose.model('Lead', leadSchema);
