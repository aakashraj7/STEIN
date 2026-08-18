import { Router } from 'express';
import { asyncHandler } from '../middleware/errorHandler.js';
import { seedAll } from '../seed/seedData.js';

const router = Router();

router.post('/', asyncHandler(async (req, res) => {
  console.log('[Seed] Starting full seed...');
  const result = await seedAll();
  console.log('[Seed] Complete.');
  res.json({ success: true, message: 'Seed complete', data: result });
}));

export default router;
