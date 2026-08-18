import mongoose from 'mongoose';

const channelSchema = new mongoose.Schema({
  channelId: { type: String, required: true, unique: true },
  title: String,
  type: { type: String, default: 'channel' },
  messageCount: { type: Number, default: 0 },
  firstSeen: { type: Date, default: Date.now },
  lastActivity: Date,
  dataSource: { type: String, enum: ['LIVE', 'DEMO'], default: 'DEMO' },
}, { timestamps: true });

export default mongoose.model('Channel', channelSchema);
