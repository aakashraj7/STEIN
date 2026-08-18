import mongoose from 'mongoose';

const reportSchema = new mongoose.Schema({
  caseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Case', required: true },
  caseNumber: String,
  title: String,
  // Canonical JSON — the integrity source
  canonicalJson: { type: String, required: true },
  sha256Hash: { type: String, required: true },
  // Human-readable
  summary: String,
  sections: [{
    heading: String,
    content: String,
  }],
  generatedAt: { type: Date, default: Date.now },
  generatedBy: { type: String, default: 'system' },
  verified: { type: Boolean, default: false },
  lastVerifiedAt: Date,
}, { timestamps: true });

export default mongoose.model('Report', reportSchema);
