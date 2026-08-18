import { Router } from 'express';
import { asyncHandler } from '../middleware/errorHandler.js';
import * as telegramService from '../services/telegram.service.js';

const router = Router();

// Connection status
router.get('/status', asyncHandler(async (req, res) => {
  const status = telegramService.getConnectionStatus();
  res.json({ success: true, data: status });
}));

// Test bot token
router.post('/test', asyncHandler(async (req, res) => {
  const result = await telegramService.testConnection();
  res.json({ success: true, data: result });
}));

// Telegram Webhook Ingestion endpoint
router.post('/webhook', asyncHandler(async (req, res) => {
  const update = req.body;
  if (!update || typeof update !== 'object') {
    return res.status(400).json({ success: false, error: 'Invalid update payload' });
  }
  const result = await telegramService.handleWebhookUpdate(update);
  res.json({ success: true, processed: !!result, data: result || null });
}));

// Configure Webhook with required allowed_updates
router.post('/set-webhook', asyncHandler(async (req, res) => {
  const { url } = req.body;
  if (!url) {
    return res.status(400).json({ success: false, error: 'Webhook URL is required' });
  }
  const result = await telegramService.setupWebhook(url);
  res.json({ success: true, data: result });
}));

export default router;
