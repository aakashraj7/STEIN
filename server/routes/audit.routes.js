import { Router } from 'express';
import { asyncHandler } from '../middleware/errorHandler.js';
import AuditLog from '../models/auditLog.model.js';
import { verifyAuditChain } from '../services/audit.service.js';

const router = Router();

// List audit entries
router.get('/', asyncHandler(async (req, res) => {
  const { caseId, limit = 100 } = req.query;
  const filter = caseId ? { caseId } : {};
  const entries = await AuditLog.find(filter).sort({ timestamp: 1 }).limit(Number(limit));
  res.json({ success: true, data: entries });
}));

// Verify the full audit chain
router.post('/verify', asyncHandler(async (req, res) => {
  const result = await verifyAuditChain();
  res.json({ success: true, data: result });
}));

// Tamper an entry for demo purposes (clearly labelled)
router.post('/tamper-demo', asyncHandler(async (req, res) => {
  const { eventId } = req.body;
  if (!eventId) return res.status(400).json({ success: false, error: { message: 'eventId is required' } });

  const entry = await AuditLog.findOne({ eventId });
  if (!entry) return res.status(404).json({ success: false, error: { message: 'Audit entry not found' } });

  // Tamper the payload
  entry.payload = { ...entry.payload, TAMPERED: true, tamperNote: 'This entry was intentionally tampered for demo purposes' };
  await entry.save();

  res.json({ success: true, message: 'Entry tampered for demo. Run /api/audit/verify to detect.' });
}));

export default router;
