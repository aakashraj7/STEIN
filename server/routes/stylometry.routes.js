import { Router } from 'express';
import { asyncHandler } from '../middleware/errorHandler.js';
import { extractFeatures, compareFingerprints } from '../services/stylometry.service.js';
import Vendor from '../models/vendor.model.js';
import Message from '../models/message.model.js';

const router = Router();

// POST /api/stylometry/compare
router.post('/compare', asyncHandler(async (req, res) => {
  const { vendorAId, vendorBId } = req.body;
  if (!vendorAId || !vendorBId) {
    return res.status(400).json({ success: false, error: { message: 'vendorAId and vendorBId are required' } });
  }

  const [vendorA, vendorB] = await Promise.all([
    Vendor.findById(vendorAId),
    Vendor.findById(vendorBId),
  ]);

  if (!vendorA || !vendorB) {
    return res.status(404).json({ success: false, error: { message: 'One or both vendors not found' } });
  }

  const [msgsA, msgsB] = await Promise.all([
    Message.find({ vendorId: vendorAId }).select('text').lean(),
    Message.find({ vendorId: vendorBId }).select('text').lean(),
  ]);

  const fpA = extractFeatures(msgsA);
  const fpB = extractFeatures(msgsB);
  const result = compareFingerprints(fpA, fpB);

  res.json({
    success: true,
    data: {
      vendorA: { id: vendorA._id, name: vendorA.name },
      vendorB: { id: vendorB._id, name: vendorB.name },
      ...result,
    },
  });
}));

export default router;
