import mongoose from 'mongoose';

const walletSchema = new mongoose.Schema({
  address: { type: String, required: true, unique: true, index: true },
  blockchain: { type: String, enum: ['ETH', 'XMR_MENTION'], default: 'ETH' },
  vendorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Vendor' },
  firstSeen: { type: Date, default: Date.now },
  lastActivity: Date,
  transactionCount: { type: Number, default: 0 },
  // Heuristic flags
  heuristics: {
    rapidFanOut: { type: Boolean, default: false },
    dormancySpike: { type: Boolean, default: false },
    labelledInteraction: { type: Boolean, default: false },
    suspiciousPatterns: [String],
  },
  riskScore: { type: Number, min: 0, max: 1, default: 0 },
  // Cached transaction data
  transactions: [{
    hash: String,
    from: String,
    to: String,
    value: String,
    timestamp: Date,
    tokenSymbol: String,
    type: { type: String, enum: ['NORMAL', 'ERC20'] },
  }],
  dataSource: { type: String, enum: ['LIVE', 'DEMO'], default: 'DEMO' },
}, { timestamps: true });

export default mongoose.model('Wallet', walletSchema);
