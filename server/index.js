import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import neo4j from 'neo4j-driver';
import config from './config/index.js';
import { errorHandler } from './middleware/errorHandler.js';

// Routes
import messagesRoutes from './routes/messages.routes.js';
import vendorsRoutes from './routes/vendors.routes.js';
import stylometryRoutes from './routes/stylometry.routes.js';
import walletsRoutes from './routes/wallets.routes.js';
import graphRoutes from './routes/graph.routes.js';
import casesRoutes from './routes/cases.routes.js';
import reportsRoutes from './routes/reports.routes.js';
import auditRoutes from './routes/audit.routes.js';
import correlationRoutes from './routes/correlation.routes.js';
import telegramRoutes from './routes/telegram.routes.js';
import seedRoutes from './routes/seed.routes.js';

// Services
import * as neo4jService from './services/neo4j.service.js';
import * as telegramService from './services/telegram.service.js';
import { classifyMessage } from './services/gemini.service.js';
import { extractEthAddresses, detectXmrMentions } from './utils/ethereum.js';
import { resolveVendorForMessage, aggregateVendorRisk } from './services/vendorRisk.service.js';

const app = express();

// ── Middleware ──────────────────────────────────────────────
app.use(cors());
app.use(express.json({ limit: '5mb' }));

// ── Health / status ────────────────────────────────────────
app.get('/api/health', async (req, res) => {
  const teleStatus = telegramService.getConnectionStatus();
  const status = {
    server: 'ok',
    mongodb: 'disconnected',
    neo4j: 'disconnected',
    telegram: teleStatus.mode,
    gemini: config.gemini.apiKey ? 'configured' : 'not_configured',
    etherscan: config.etherscan.apiKey ? 'configured' : 'not_configured',
  };

  try {
    if (mongoose.connection.readyState === 1) status.mongodb = 'connected';
  } catch { /* keep disconnected */ }

  try {
    if (app.locals.neo4jDriver) {
      const serverInfo = await app.locals.neo4jDriver.getServerInfo();
      if (serverInfo) status.neo4j = 'connected';
    }
  } catch { /* keep disconnected */ }

  const allCritical = status.mongodb === 'connected' && status.neo4j === 'connected';
  res.json({ success: true, status, ready: allCritical });
});

// ── API Routes ─────────────────────────────────────────────
app.use('/api/messages', messagesRoutes);
app.use('/api/vendors', vendorsRoutes); 
app.use('/api/stylometry', stylometryRoutes);
app.use('/api/wallets', walletsRoutes);
app.use('/api/graph', graphRoutes);
app.use('/api/cases', casesRoutes);
app.use('/api/reports', reportsRoutes);
app.use('/api/audit', auditRoutes);
app.use('/api/correlation', correlationRoutes);
app.use('/api/telegram', telegramRoutes);
app.use('/api/seed', seedRoutes);

// ── Error handler (must be last) ───────────────────────────
app.use(errorHandler);

// ── Database connections & server start ────────────────────
async function start() {
  // MongoDB
  try {
    await mongoose.connect(config.mongodb.uri, {
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 5000,
    });
    console.log(`[MongoDB] Connected → ${config.mongodb.uri}`);
  } catch (err) {
    console.error('[MongoDB] Connection failed:', err.message);
    console.warn('[MongoDB] Server will start but database features are unavailable.');
  }

  // Neo4j
  try {
    const driver = neo4j.driver(
      config.neo4j.uri,
      neo4j.auth.basic(config.neo4j.user, config.neo4j.password),
      { connectionTimeout: 5000 }
    );
    await driver.getServerInfo();
    app.locals.neo4jDriver = driver;
    neo4jService.setDriver(driver);
    console.log(`[Neo4j] Connected → ${config.neo4j.uri}`);
  } catch (err) {
    console.error('[Neo4j] Connection failed:', err.message);
    console.warn('[Neo4j] Server will start but graph features are unavailable.');
  }

  // Telegram polling
  telegramService.setMessageHandler(async (msg) => {
    console.log(`[Telegram Handler] Live channel message ${msg._id} ingested & classified canonically.`);
  });
  await telegramService.startPolling();

  // Start HTTP server
  app.listen(config.port, () => {
    console.log(`\n[STEIN] Server running → http://localhost:${config.port}`);
    console.log(`[STEIN] Health check  → http://localhost:${config.port}/api/health\n`);
  });
}

start();

export default app;
