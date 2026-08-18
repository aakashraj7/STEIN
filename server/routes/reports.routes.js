import { Router } from 'express';
import { asyncHandler } from '../middleware/errorHandler.js';
import Report from '../models/report.model.js';
import { generateReport, verifyReport } from '../services/report.service.js';
import { appendAuditEntry } from '../services/audit.service.js';

const router = Router();

// List reports
router.get('/', asyncHandler(async (req, res) => {
  const reports = await Report.find().sort({ generatedAt: -1 }).select('-canonicalJson');
  res.json({ success: true, data: reports });
}));

// Get report
router.get('/:id', asyncHandler(async (req, res) => {
  const report = await Report.findById(req.params.id);
  if (!report) return res.status(404).json({ success: false, error: { message: 'Report not found' } });
  res.json({ success: true, data: report });
}));

// Generate report for case
router.post('/generate', asyncHandler(async (req, res) => {
  const { caseId } = req.body;
  if (!caseId) return res.status(400).json({ success: false, error: { message: 'caseId is required' } });

  const report = await generateReport(caseId);

  await appendAuditEntry({ caseId, eventType: 'REPORT_GENERATED', actor: 'system', payload: { reportId: report._id.toString(), sha256: report.sha256Hash } });

  res.status(201).json({ success: true, data: report });
}));

// Verify report integrity
router.post('/:id/verify', asyncHandler(async (req, res) => {
  const report = await Report.findById(req.params.id);
  if (!report) return res.status(404).json({ success: false, error: { message: 'Report not found' } });

  const result = verifyReport(report);

  report.verified = result.valid;
  report.lastVerifiedAt = new Date();
  await report.save();

  res.json({ success: true, data: result });
}));

export default router;
