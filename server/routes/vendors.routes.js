import { Router } from 'express';
import { asyncHandler } from '../middleware/errorHandler.js';
import Vendor from '../models/vendor.model.js';
import Message from '../models/message.model.js';

const router = Router();

router.get('/', asyncHandler(async (req, res) => {
  const vendors = await Vendor.find().sort({ riskLevel: -1, lastSeen: -1 });
  res.json({ success: true, data: vendors });
}));

router.get('/:id', asyncHandler(async (req, res) => {
  const vendor = await Vendor.findById(req.params.id);
  if (!vendor) return res.status(404).json({ success: false, error: { message: 'Vendor not found' } });

  const messages = await Message.find({ vendorId: vendor._id }).sort({ timestamp: -1 }).limit(50);

  res.json({ success: true, data: { vendor, messages } });
}));

export default router;
