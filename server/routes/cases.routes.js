import { Router } from 'express';
import { asyncHandler } from '../middleware/errorHandler.js';
import Lead from '../models/lead.model.js';
import Case from '../models/case.model.js';
import { appendAuditEntry } from '../services/audit.service.js';

const router = Router();

// List cases
router.get('/', asyncHandler(async (req, res) => {
  const cases = await Case.find().sort({ createdAt: -1 });
  res.json({ success: true, data: cases });
}));

// Get case detail
router.get('/:id', asyncHandler(async (req, res) => {
  const caseDoc = await Case.findById(req.params.id)
    .populate('leadIds')
    .populate('vendorIds', 'name aliases riskLevel')
    .populate('messageIds', 'text classification timestamp');
  if (!caseDoc) return res.status(404).json({ success: false, error: { message: 'Case not found' } });
  res.json({ success: true, data: caseDoc });
}));

// Create case from accepted leads
router.post('/', asyncHandler(async (req, res) => {
  const { title, description, leadIds = [], priority = 'MEDIUM' } = req.body;
  if (!title) return res.status(400).json({ success: false, error: { message: 'title is required' } });

  const leads = await Lead.find({ _id: { $in: leadIds }, status: 'ACCEPTED' });
  const vendorIds = [...new Set(leads.flatMap(l => l.vendorIds.map(v => v.toString())))];
  const messageIds = [...new Set(leads.flatMap(l => l.messageIds.map(m => m.toString())))];
  const walletAddresses = [...new Set(leads.flatMap(l => l.walletAddresses))];

  const count = await Case.countDocuments();
  const caseNumber = `STEIN-${new Date().getFullYear()}-${String(count + 1).padStart(3, '0')}`;

  const caseDoc = await Case.create({
    caseNumber, title, description, priority,
    leadIds: leads.map(l => l._id),
    vendorIds, messageIds, walletAddresses,
  });

  for (const lead of leads) {
    await Lead.updateOne({ _id: lead._id }, { acceptedIntoCaseId: caseDoc._id });
  }

  await appendAuditEntry({ caseId: caseDoc._id, eventType: 'CASE_CREATED', actor: 'investigator', payload: { caseNumber, title } });

  res.status(201).json({ success: true, data: caseDoc });
}));

// ── Leads ─────────────────────────────────────
// List leads
router.get('/leads/all', asyncHandler(async (req, res) => {
  const { status } = req.query;
  const filter = status ? { status } : {};
  const leads = await Lead.find(filter).populate('vendorIds', 'name aliases').sort({ priority: -1 });
  res.json({ success: true, data: leads });
}));

// Accept lead
router.post('/leads/:id/accept', asyncHandler(async (req, res) => {
  const lead = await Lead.findById(req.params.id);
  if (!lead) return res.status(404).json({ success: false, error: { message: 'Lead not found' } });

  lead.status = 'ACCEPTED';
  lead.reviewedBy = req.body.reviewedBy || 'investigator';
  lead.reviewedAt = new Date();
  await lead.save();

  await appendAuditEntry({ eventType: 'LEAD_ACCEPTED', actor: lead.reviewedBy, payload: { leadId: lead._id.toString(), leadTitle: lead.title } });

  res.json({ success: true, data: lead });
}));

// Reject lead
router.post('/leads/:id/reject', asyncHandler(async (req, res) => {
  const lead = await Lead.findById(req.params.id);
  if (!lead) return res.status(404).json({ success: false, error: { message: 'Lead not found' } });

  if (!req.body.rejectionReason) {
    return res.status(400).json({ success: false, error: { message: 'rejectionReason is required' } });
  }

  lead.status = 'REJECTED';
  lead.reviewedBy = req.body.reviewedBy || 'investigator';
  lead.reviewedAt = new Date();
  lead.rejectionReason = req.body.rejectionReason;
  await lead.save();

  await appendAuditEntry({ eventType: 'LEAD_REJECTED', actor: lead.reviewedBy, payload: { leadId: lead._id.toString(), reason: lead.rejectionReason } });

  res.json({ success: true, data: lead });
}));

export default router;
