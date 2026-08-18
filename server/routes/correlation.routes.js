import { Router } from 'express';
import { asyncHandler } from '../middleware/errorHandler.js';
import { calculateCorrelationScore } from '../services/correlation.service.js';

const router = Router();

router.post('/score', asyncHandler(async (req, res) => {
  const { listingSignal, stylometrySignal, walletSignal, behaviourOverlap } = req.body;

  const result = calculateCorrelationScore({
    listingSignal: Number(listingSignal) || 0,
    stylometrySignal: Number(stylometrySignal) || 0,
    walletSignal: Number(walletSignal) || 0,
    behaviourOverlap: Number(behaviourOverlap) || 0,
  });

  res.json({ success: true, data: result });
}));

export default router;
