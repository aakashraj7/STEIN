import mongoose from 'mongoose';

const vendorSchema = new mongoose.Schema({
  name: { type: String, required: true },
  aliases: [String],
  telegramUsername: String,
  channelId: String,
  firstSeen: { type: Date, default: Date.now },
  lastSeen: Date,
  messageCount: { type: Number, default: 0 },
  walletAddresses: [String],
  riskLevel: { type: String, enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'], default: 'LOW' },
  notes: String,
  dataSource: { type: String, enum: ['LIVE', 'DEMO'], default: 'DEMO' },
}, { timestamps: true });

export default mongoose.model('Vendor', vendorSchema);
