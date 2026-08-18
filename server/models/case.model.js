import mongoose from 'mongoose';

const caseSchema = new mongoose.Schema({
  caseNumber: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  description: String,
  status: { type: String, enum: ['OPEN', 'CLOSED', 'ARCHIVED'], default: 'OPEN' },
  priority: { type: String, enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'], default: 'MEDIUM' },
  // Evidence
  leadIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Lead' }],
  vendorIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Vendor' }],
  messageIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Message' }],
  walletAddresses: [String],
  // Metadata
  createdBy: { type: String, default: 'investigator' },
  closedAt: Date,
  dataSource: { type: String, enum: ['LIVE', 'DEMO'], default: 'DEMO' },
}, { timestamps: true });

export default mongoose.model('Case', caseSchema);
