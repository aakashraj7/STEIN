import mongoose from 'mongoose';

const auditLogSchema = new mongoose.Schema({
  eventId: { type: String, required: true, unique: true },
  caseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Case' },
  eventType: { type: String, required: true },
  actor: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  payload: mongoose.Schema.Types.Mixed,
  previousHash: { type: String, required: true },
  currentHash: { type: String, required: true },
}, { timestamps: false });

// Ensure ordering
auditLogSchema.index({ timestamp: 1 });

export default mongoose.model('AuditLog', auditLogSchema);
