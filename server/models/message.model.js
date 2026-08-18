import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  source: { type: String, enum: ['TELEGRAM', 'MANUAL', 'SEED'], default: 'TELEGRAM' },
  dataSource: { type: String, enum: ['LIVE', 'DEMO'], default: 'DEMO' },
  channelId: { type: String, index: true },
  channelTitle: String,
  telegramMessageId: Number, 
  text: { type: String, required: true },
  originalText: {
    type: String,
    get: function(v) { return v ?? this.text ?? ''; },
  },
  decodedText: {
    type: String,
    get: function(v) { return v ?? this.text ?? ''; },
  },
  encodingDetected: { type: String, default: null },
  timestamp: { type: Date, default: Date.now, index: true },
  rawUpdate: mongoose.Schema.Types.Mixed,
  metadata: {
    chatType: String,
    updateType: String,
    sourceType: String,
    senderId: String,
    senderName: String,
    username: String,
    discussionGroupId: String,
    isEdited: Boolean,
    editDate: Date,
    forwardOrigin: mongoose.Schema.Types.Mixed,
    senderChat: mongoose.Schema.Types.Mixed,
    authorSignature: String,
  },
  // Analysis results
  classification: {
    label: { type: String, enum: ['SUSPICIOUS', 'NEEDS_REVIEW', 'BENIGN', 'UNCLASSIFIED'], default: 'UNCLASSIFIED' },
    riskScore: { type: Number, min: 0, max: 100, default: 0 },
    confidence: { type: Number, min: 0, max: 1, default: 0 },
    signals: [String],
    reasons: [String],
    modelUsed: String,
    classifiedAt: Date,
  },
  vendorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Vendor', index: true },
  extractedAddresses: [{
    type: { type: String, enum: ['ETH', 'XMR_MENTION'] },
    address: String,
  }],
  // Investigation
  reviewStatus: { type: String, enum: ['PENDING', 'REVIEWED'], default: 'PENDING' },
}, { timestamps: true, toJSON: { getters: true }, toObject: { getters: true } });

messageSchema.index({ text: 'text' });
messageSchema.index({ channelId: 1, telegramMessageId: 1 }, { unique: true, sparse: true });

export default mongoose.model('Message', messageSchema);

