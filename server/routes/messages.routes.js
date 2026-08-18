import { Router } from 'express';
import { asyncHandler } from '../middleware/errorHandler.js';
import Message from '../models/message.model.js';
import { ingestMessage, reclassifyMessage } from '../services/messagePipeline.service.js';

const router = Router();

// List messages with optional filters
router.get('/', asyncHandler(async (req, res) => {
  const { classification, vendorId, dataSource, limit = 50, skip = 0 } = req.query;
  const filter = {};
  if (classification) filter['classification.label'] = classification;
  if (vendorId) filter.vendorId = vendorId;
  if (dataSource) filter.dataSource = dataSource;

  const [messages, total] = await Promise.all([
    Message.find(filter).sort({ timestamp: -1 }).skip(Number(skip)).limit(Number(limit)).populate('vendorId', 'name aliases riskLevel'),
    Message.countDocuments(filter),
  ]);

  res.json({ success: true, data: messages, total, limit: Number(limit), skip: Number(skip) });
}));

// Get single message
router.get('/:id', asyncHandler(async (req, res) => {
  const msg = await Message.findById(req.params.id).populate('vendorId', 'name aliases riskLevel');
  if (!msg) return res.status(404).json({ success: false, error: { message: 'Message not found' } });
  res.json({ success: true, data: msg });
}));

// Manually ingest and classify a message via canonical pipeline
router.post('/', asyncHandler(async (req, res) => {
  const { text, vendorId, channelId, authorSignature } = req.body;
  if (!text) return res.status(400).json({ success: false, error: { message: 'text is required' } });

  const msg = await ingestMessage({
    source: 'MANUAL',
    dataSource: 'LIVE',
    text,
    vendorId,
    channelId,
    metadata: authorSignature ? { authorSignature: authorSignature.trim() } : {},
    rawUpdate: authorSignature ? { author_signature: authorSignature } : undefined,
  });

  const populated = await Message.findById(msg._id).populate('vendorId', 'name aliases riskLevel');
  res.status(201).json({ success: true, data: populated });
}));

// Classify/re-classify a message via canonical pipeline
router.post('/:id/classify', asyncHandler(async (req, res) => {
  const existing = await Message.findById(req.params.id);
  if (!existing) return res.status(404).json({ success: false, error: { message: 'Message not found' } });

  const updated = await reclassifyMessage(req.params.id);
  const populated = await Message.findById(updated._id).populate('vendorId', 'name aliases riskLevel');
  res.json({ success: true, data: populated });
}));

export default router;
